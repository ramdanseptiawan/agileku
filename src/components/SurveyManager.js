import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';
import {
  getSurveyQuestions,
  saveSurveyQuestions,
  addSurveyQuestion,
  updateSurveyQuestion,
  deleteSurveyQuestion
} from '../utils/quizData';
import { useAuth } from '../contexts/AuthContext';

const SurveyManager = () => {
  const { courses, updateCourse } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Default survey questions
  const defaultQuestions = [
    {
      id: 1,
      type: 'rating',
      text: 'Bagaimana penilaian Anda terhadap kualitas materi pembelajaran?',
      required: true
    },
    {
      id: 2,
      type: 'rating',
      text: 'Seberapa mudah materi ini dipahami?',
      required: true
    },
    {
      id: 3,
      type: 'rating',
      text: 'Apakah materi ini relevan dengan kebutuhan Anda?',
      required: true
    },
    {
      id: 4,
      type: 'text',
      text: 'Apa yang paling Anda sukai dari kursus ini?',
      required: false
    },
    {
      id: 5,
      type: 'text',
      text: 'Saran untuk perbaikan kursus ini:',
      required: false
    }
  ];

  // Load survey questions when course changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course && course.survey && course.survey.questions) {
        setSurveyQuestions(course.survey.questions);
      } else {
        setSurveyQuestions(defaultQuestions);
      }
    } else {
      setSurveyQuestions([]);
    }
  }, [selectedCourse, courses]);

  const handleCourseChange = (e) => {
    setSelectedCourse(Number(e.target.value));
    setEditingQuestion(null);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'rating',
      text: '',
      required: false
    };
    setSurveyQuestions([...surveyQuestions, newQuestion]);
    setEditingQuestion(newQuestion.id);
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      setSurveyQuestions(surveyQuestions.filter(q => q.id !== questionId));
      if (editingQuestion === questionId) {
        setEditingQuestion(null);
      }
    }
  };

  const handleQuestionChange = (questionId, field, value) => {
    setSurveyQuestions(surveyQuestions.map(q => {
      if (q.id === questionId) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleSaveSurvey = () => {
    if (!selectedCourse) return;
    
    const courseToUpdate = courses.find(c => c.id === selectedCourse);
    if (!courseToUpdate) return;
    
    const updatedCourse = {
      ...courseToUpdate,
      survey: {
        title: 'Survei Pengalaman Belajar',
        description: 'Berikan penilaian Anda terhadap kursus ini',
        questions: surveyQuestions
      }
    };
    
    updateCourse(selectedCourse, updatedCourse);
    alert('Survei berhasil disimpan!');
  };

  const moveQuestion = (questionId, direction) => {
    const index = surveyQuestions.findIndex(q => q.id === questionId);
    if (index === -1) return;
    
    const newQuestions = [...surveyQuestions];
    if (direction === 'up' && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else if (direction === 'down' && index < surveyQuestions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    
    setSurveyQuestions(newQuestions);
  };

  const resetToDefault = () => {
    if (window.confirm('Reset ke pertanyaan default? Semua perubahan akan hilang.')) {
      setSurveyQuestions(defaultQuestions);
      setEditingQuestion(null);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Survey Manager</h2>
          <p className="text-gray-600 mt-1">Kelola survei pengalaman belajar untuk setiap kursus</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Kursus
          </label>
          <select
            value={selectedCourse || ''}
            onChange={handleCourseChange}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Pilih Kursus --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Survey Questions</h3>
              <div className="flex space-x-2">
                <button
                  onClick={resetToDefault}
                  className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  Add Question
                </button>
                <button
                  onClick={handleSaveSurvey}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} className="mr-1" />
                  Save Survey
                </button>
              </div>
            </div>

            {surveyQuestions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No survey questions yet. Click &quot;Add Question&quot; to create one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {surveyQuestions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-gray-50 p-4">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Question {index + 1}</span>
                        <span className={`px-2 py-1 text-xs rounded-full mr-2 ${
                          question.type === 'rating' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {question.type === 'rating' ? 'Rating' : 'Text'}
                        </span>
                        {question.required && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mr-2">
                            Required
                          </span>
                        )}
                        {editingQuestion !== question.id && (
                          <span className="text-gray-600 truncate max-w-md">{question.text || 'No question text'}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingQuestion(editingQuestion === question.id ? null : question.id)}
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

                    {editingQuestion === question.id && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                            placeholder="Enter your survey question here"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question Type
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="rating">Rating (1-5 stars)</option>
                              <option value="text">Text Response</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Required
                            </label>
                            <div className="flex items-center space-x-4 mt-2">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  checked={question.required === true}
                                  onChange={() => handleQuestionChange(question.id, 'required', true)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm">Yes</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  checked={question.required === false}
                                  onChange={() => handleQuestionChange(question.id, 'required', false)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm">No</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {question.type === 'rating' && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={20} className="text-yellow-400 fill-current" />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">(1-5 rating scale)</span>
                            </div>
                          </div>
                        )}
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

export default SurveyManager;