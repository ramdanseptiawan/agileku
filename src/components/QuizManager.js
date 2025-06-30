import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getQuizQuestions,
  saveQuizQuestions,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion
} from '../utils/quizData';

const QuizManager = () => {
  const { courses, updateCourse } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizType, setQuizType] = useState('pretest'); // pretest or posttest
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Load questions when course or quiz type changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        if (quizType === 'pretest' && course.preTest) {
          setQuestions(course.preTest.questions || []);
        } else if (quizType === 'posttest' && course.postTest) {
          setQuestions(course.postTest.questions || []);
        } else {
          setQuestions([]);
        }
      }
    } else {
      setQuestions([]);
    }
  }, [selectedCourse, quizType, courses]);

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
    if (window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
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

  const handleSaveQuiz = () => {
    if (!selectedCourse) return;
    
    const courseToUpdate = courses.find(c => c.id === selectedCourse);
    if (!courseToUpdate) return;
    
    const updatedCourse = { ...courseToUpdate };
    
    if (quizType === 'pretest') {
      updatedCourse.preTest = {
        ...updatedCourse.preTest,
        questions: questions
      };
    } else if (quizType === 'posttest') {
      updatedCourse.postTest = {
        ...updatedCourse.postTest,
        questions: questions
      };
    }
    
    updateCourse(selectedCourse, updatedCourse);
    alert(`${quizType === 'pretest' ? 'Pre-test' : 'Post-test'} berhasil disimpan!`);
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
                <p className="text-gray-500">No questions yet. Click "Add Question" to create one.</p>
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