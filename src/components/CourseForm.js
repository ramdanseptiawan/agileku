import React from 'react';
import CourseFormManager from './CourseFormManager';

const CourseForm = ({ course, onSave, onCancel }) => {
  return (
    <CourseFormManager
      courseId={course?.id}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
};

// Legacy CourseForm - keeping for reference but using new CourseFormManager
export const LegacyCourseForm = ({ course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    imageFile: null,
    lessons: [],
    preTest: {
      id: '',
      title: '',
      questions: []
    },
    postTest: {
      id: '',
      title: '',
      questions: []
    }
  });

  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        image: course.image || '',
        imageFile: null,
        lessons: course.lessons || [],
        preTest: course.preTest || {
          id: '',
          title: '',
          questions: []
        },
        postTest: course.postTest || {
          id: '',
          title: '',
          questions: []
        }
      });
    }
  }, [course]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      lessons: updatedLessons
    }));
  };

  const addLesson = () => {
    const newLesson = {
      id: Date.now().toString(),
      title: '',
      type: 'reading',
      content: '',
      files: []
    };
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson]
    }));
  };

  const handleFileUpload = (e, type, lessonIndex = null) => {
    const files = Array.from(e.target.files);
    
    if (type === 'courseImage') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          image: URL.createObjectURL(file)
        }));
      }
    } else if (type === 'lesson' && lessonIndex !== null) {
      const updatedLessons = [...formData.lessons];
      const existingFiles = updatedLessons[lessonIndex].files || [];
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        files: [...existingFiles, ...files]
      };
      setFormData(prev => ({
        ...prev,
        lessons: updatedLessons
      }));
    }
  };

  const removeFile = (lessonIndex, fileIndex) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex].files = updatedLessons[lessonIndex].files.filter((_, i) => i !== fileIndex);
    setFormData(prev => ({
      ...prev,
      lessons: updatedLessons
    }));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return '🖼️';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
      return '🎥';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    } else if (['ppt', 'pptx'].includes(extension)) {
      return '📊';
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return '🎵';
    }
    return '📁';
  };

  const removeLesson = (index) => {
    const updatedLessons = formData.lessons.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      lessons: updatedLessons
    }));
  };

  const handleQuizChange = (quizType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [quizType]: {
        ...prev[quizType],
        [field]: value
      }
    }));
  };

  const addQuizQuestion = (quizType) => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correct: 0
    };
    setFormData(prev => ({
      ...prev,
      [quizType]: {
        ...prev[quizType],
        questions: [...prev[quizType].questions, newQuestion]
      }
    }));
  };

  const removeQuizQuestion = (quizType, index) => {
    setFormData(prev => ({
      ...prev,
      [quizType]: {
        ...prev[quizType],
        questions: prev[quizType].questions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleQuestionChange = (quizType, questionIndex, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev[quizType].questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
      return {
        ...prev,
        [quizType]: {
          ...prev[quizType],
          questions: updatedQuestions
        }
      };
    });
  };

  const handleOptionChange = (quizType, questionIndex, optionIndex, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev[quizType].questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions
      };
      return {
        ...prev,
        [quizType]: {
          ...prev[quizType],
          questions: updatedQuestions
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure quiz IDs are set
    const courseData = {
      ...formData,
      preTest: {
        ...formData.preTest,
        id: formData.preTest.id || `pre${Date.now()}`
      },
      postTest: {
        ...formData.postTest,
        id: formData.postTest.id || `post${Date.now()}`
      }
    };
    
    onSave(courseData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {course ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-gray-600">Fill in the course details and lessons</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Course Information</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Image
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.imageFile ? '' : formData.image}
                    onChange={handleInputChange}
                    disabled={formData.imageFile}
                    className="flex-1 px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="https://example.com/image.jpg"
                  />
                  <span className="text-gray-500">or</span>
                  <label className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'courseImage')}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.imageFile && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <span className="text-blue-600">🖼️</span>
                    <span className="text-sm text-blue-800 flex-1">{formData.imageFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageFile: null, image: '' }))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Course preview"
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Lessons</h2>
            <button
              type="button"
              onClick={addLesson}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Lesson
            </button>
          </div>

          <div className="space-y-4 text-gray-900">
            {formData.lessons.map((lesson, index) => (
              <div key={lesson.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Lesson {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      value={lesson.title || ''}
                      onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter lesson title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Type
                    </label>
                    <select
                      value={lesson.type || 'reading'}
                      onChange={(e) => handleLessonChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="reading">Reading</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF Document</option>
                      <option value="presentation">Presentation</option>
                      <option value="audio">Audio</option>
                      <option value="mixed">Mixed Content</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 space-y-4">
                  {/* Content based on lesson type */}
                  {lesson.type === 'reading' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content (Markdown supported)
                      </label>
                      <textarea
                        value={lesson.content || ''}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter lesson content..."
                      />
                    </div>
                  )}

                  {lesson.type === 'video' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={lesson.videoUrl || ''}
                          onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="https://youtube.com/embed/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={lesson.duration || ''}
                          onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="e.g., 10 minutes"
                        />
                      </div>
                    </div>
                  )}

                  {(lesson.type === 'pdf' || lesson.type === 'presentation' || lesson.type === 'audio') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={lesson.content || ''}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter lesson description..."
                      />
                    </div>
                  )}

                  {lesson.type === 'mixed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content & Instructions
                      </label>
                      <textarea
                        value={lesson.content || ''}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter lesson content and instructions for the attached files..."
                      />
                    </div>
                  )}

                  {/* File Upload Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Lesson Files
                      </label>
                      <label className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4 mr-1" />
                        Add Files
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif"
                          onChange={(e) => handleFileUpload(e, 'lesson', index)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {/* Display uploaded files */}
                    {lesson.files && lesson.files.length > 0 && (
                      <div className="space-y-2">
                        {lesson.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <span className="text-lg">{getFileIcon(file.name)}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index, fileIndex)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!lesson.files || lesson.files.length === 0) && (
                      <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                        <File className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No files uploaded yet</p>
                        <p className="text-xs">Supported: PDF, DOC, PPT, Video, Audio, Images</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {formData.lessons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No lessons added yet. Click &quot;Add Lesson&quot; to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pre-Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Pre-Test</h2>
            <button
              type="button"
              onClick={() => addQuizQuestion('preTest')}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>

          <div className="mb-4 text-gray-900">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              value={formData.preTest.title}
              onChange={(e) => handleQuizChange('preTest', 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter pre-test title"
            />
          </div>

          <div className="space-y-4">
            {formData.preTest.questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Question {qIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeQuizQuestion('preTest', qIndex)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-gray-900">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleQuestionChange('preTest', qIndex, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center mb-2">
                        <input
                          type="radio"
                          checked={question.correct === oIndex}
                          onChange={() => handleQuestionChange('preTest', qIndex, 'correct', oIndex)}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange('preTest', qIndex, oIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-1">Select the radio button for the correct answer</p>
                  </div>
                </div>
              </div>
            ))}

            {formData.preTest.questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet. Click &quot;Add Question&quot; to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Post-Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Post-Test</h2>
            <button
              type="button"
              onClick={() => addQuizQuestion('postTest')}
              className="inline-flex items-center text-gray-900 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              value={formData.postTest.title}
              onChange={(e) => handleQuizChange('postTest', 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter post-test title"
            />
          </div>

          <div className="space-y-4">
            {formData.postTest.questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Question {qIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeQuizQuestion('postTest', qIndex)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleQuestionChange('postTest', qIndex, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center mb-2">
                        <input
                          type="radio"
                          checked={question.correct === oIndex}
                          onChange={() => handleQuestionChange('postTest', qIndex, 'correct', oIndex)}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange('postTest', qIndex, oIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-1">Select the radio button for the correct answer</p>
                  </div>
                </div>
              </div>
            ))}

            {formData.postTest.questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet. Click &quot;Add Question&quot; to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {course ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;