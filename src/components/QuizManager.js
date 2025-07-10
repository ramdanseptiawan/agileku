import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';

const QuizManager = () => {
  const { courses, user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizType, setQuizType] = useState('pretest'); // pretest or posttest
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Load questions when course or quiz type changes
  useEffect(() => {
    const loadExistingQuiz = async () => {
      // Get user from context or localStorage as fallback
      let currentUser = user;
      if (!currentUser) {
        try {
          const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      
      if (selectedCourse && quizType && currentUser && currentUser.role === 'admin') {
        try {
          let existingQuiz = null;
          if (quizType === 'pretest') {
            existingQuiz = await adminAPI.getCoursePreTestAdmin(selectedCourse);
          } else {
            existingQuiz = await adminAPI.getCoursePostTestAdmin(selectedCourse);
          }
          
          if (existingQuiz && existingQuiz.success && existingQuiz.data && existingQuiz.data.questions) {
            // Parse questions from JSON string
            const parsedQuestions = typeof existingQuiz.data.questions === 'string' 
              ? JSON.parse(existingQuiz.data.questions) 
              : existingQuiz.data.questions;
            setQuestions(parsedQuestions);
          } else {
            // No quiz found or quiz has no questions
            setQuestions([]);
          }
        } catch (error) {
          console.error('Error loading quiz:', error);
          setQuestions([]);
        }
      } else if (selectedCourse && quizType) {
        // User is not admin, clear questions
        setQuestions([]);
      }
    };
    
    loadExistingQuiz();
  }, [selectedCourse, quizType, user]);

  const handleCourseChange = (e) => {
    setSelectedCourse(Number(e.target.value));
    setEditingQuiz(null);
  };

  const handleQuizTypeChange = (type) => {
    setQuizType(type);
    setEditingQuiz(null);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correct: 0
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuiz(newQuestion.id);
  };

  const handleDeleteQuestion = (questionId) => {
    if (typeof window !== 'undefined' && window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      setQuestions(questions.filter(q => q.id !== questionId));
      if (editingQuiz === questionId) {
        setEditingQuiz(null);
      }
    }
  };

  const handleQuestionChange = (questionId, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  // handleOptionChange function removed - now handled inline in the component

  const handleSaveQuiz = async () => {
    if (!selectedCourse || questions.length === 0) {
      alert('Please select a course and add at least one question.');
      return;
    }

    // Get user from context or localStorage as fallback
    let currentUser = user;
    if (!currentUser) {
      try {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    if (!currentUser || currentUser.role !== 'admin') {
      alert('Only administrators can save quizzes.');
      return;
    }

    const course = courses.find(c => c.id === selectedCourse);
    if (!course) {
      alert('Course not found.');
      return;
    }

    const quizData = {
      title: `${course.title} ${quizType === 'pretest' ? 'Pre-Test' : 'Post-Test'}`,
      description: `${quizType === 'pretest' ? 'Pre-test' : 'Post-test'} for ${course.title}`,
      courseId: selectedCourse,
      quizType: quizType,
      questions: JSON.stringify(questions),
      timeLimit: 30, // Default 30 minutes
      maxAttempts: 3, // Default 3 attempts
      passingScore: 70, // Default 70%
      isActive: true
    };

    try {
      // Check if quiz already exists for this course and type
       let existingQuiz = null;
       try {
         if (quizType === 'pretest') {
           existingQuiz = await adminAPI.getCoursePreTestAdmin(selectedCourse);
         } else {
           existingQuiz = await adminAPI.getCoursePostTestAdmin(selectedCourse);
         }
       } catch (error) {
         // Quiz doesn't exist, we'll create a new one
         console.log('No existing quiz found, creating new one');
       }

       // Handle backend response format
        let quizId = null;
        if (existingQuiz && existingQuiz.success && existingQuiz.data && existingQuiz.data.id) {
          quizId = existingQuiz.data.id;
        }

        if (quizId) {
          // Update existing quiz
          await adminAPI.updateQuiz(quizId, quizData);
          alert('Quiz updated successfully!');
        } else {
          // Create new quiz
          await adminAPI.createQuiz(quizData);
          alert('Quiz created successfully!');
        }
      
      setQuestions([]);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    }
  };

  const moveQuestion = (questionId, direction) => {
    const index = questions.findIndex(q => q.id === questionId);
    if (index === -1) return;
    
    const newQuestions = [...questions];
    if (direction === 'up' && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else if (direction === 'down' && index < questions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    
    setQuestions(newQuestions);
  };

  // Get current user for UI display
  let currentUser = user;
  if (!currentUser) {
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
  }

  // Show access denied message if user is not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="space-y-6 text-gray-900">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">
            {!currentUser 
              ? 'Please login to access Quiz Manager.' 
              : 'Only administrators can access Quiz Manager.'}
          </p>
          <p className="text-sm text-red-500 mt-2">
            Current user role: {currentUser?.role || 'Not logged in'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quiz Manager</h2>
          <p className="text-gray-600 mt-1">Kelola pre-test dan post-test untuk setiap kursus</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Kursus
            </label>
            <select
              value={selectedCourse || ''}
              onChange={handleCourseChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Pilih Kursus --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          {/* Quiz Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Quiz
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleQuizTypeChange('pretest')}
                className={`px-4 py-2 rounded-md ${quizType === 'pretest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pre-Test
              </button>
              <button
                onClick={() => handleQuizTypeChange('posttest')}
                className={`px-4 py-2 rounded-md ${quizType === 'posttest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Post-Test
              </button>
            </div>
          </div>
        </div>

        {selectedCourse && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {quizType === 'pretest' ? 'Pre-Test' : 'Post-Test'} Questions
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  Add Question
                </button>
                <button
                  onClick={handleSaveQuiz}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} className="mr-1" />
                  Save Quiz
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No questions yet. Click &quot;Add Question&quot; to create one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-gray-50 p-4">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Question {index + 1}</span>
                        {editingQuiz !== question.id && (
                          <span className="text-gray-600 truncate max-w-md">{question.question || 'No question text'}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveQuestion(question.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveQuestion(question.id, 'down')}
                          disabled={index === questions.length - 1}
                          className={`p-1 rounded ${index === questions.length - 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={() => setEditingQuiz(editingQuiz === question.id ? null : question.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingQuiz === question.id && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text
                          </label>
                          <textarea
                            value={question.question}
                            onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                            placeholder="Enter your question here"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options (select one correct answer)
                          </label>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  checked={question.correct === optionIndex}
                                  onChange={() => handleQuestionChange(question.id, 'correct', optionIndex)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optionIndex] = e.target.value;
                                    handleQuestionChange(question.id, 'options', newOptions);
                                  }}
                                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManager;