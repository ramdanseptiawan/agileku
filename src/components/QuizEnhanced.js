import React, { useState, useEffect, useCallback } from 'react';
import { quizEnhancedAPI } from '../api/quizEnhancedAPI';

const QuizEnhanced = ({ courseId, quizType, onComplete, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Load quiz and check for existing attempts
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get quiz data
        const quizResponse = await quizEnhancedAPI.getQuiz(courseId, quizType);
        if (quizResponse.success) {
          setQuiz(quizResponse.data);
          
          // Check for existing attempts
          const attemptsResponse = await quizEnhancedAPI.getQuizAttempts(courseId, quizType);
          if (attemptsResponse.success && attemptsResponse.data && attemptsResponse.data.length > 0) {
            const lastAttempt = attemptsResponse.data[0];
            if (lastAttempt.completed) {
              // Show last completed result
              const resultResponse = await quizEnhancedAPI.getQuizResult(lastAttempt.id);
              if (resultResponse.success) {
                setResult(resultResponse.data);
                setShowResult(true);
              }
            } else {
              // Resume incomplete attempt
              setCurrentAttempt(lastAttempt);
              setAnswers(lastAttempt.answers || {});
              setStartTime(new Date(lastAttempt.startedAt));
              
              // Calculate time left
              const elapsed = Math.floor((Date.now() - new Date(lastAttempt.startedAt)) / 1000);
              const remaining = Math.max(0, (quizResponse.data.timeLimit * 60) - elapsed);
              setTimeLeft(remaining);
              setTimeSpent(elapsed);
            }
          }
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && quizType) {
      loadQuiz();
    }
  }, [courseId, quizType]);

  // Timer effect - disabled for pretest and posttest
  useEffect(() => {
    if (currentAttempt && !showResult && quizType !== 'pretest' && quizType !== 'posttest') {
      if (timeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleSubmit(); // Auto-submit when time runs out
              return 0;
            }
            return prev - 1;
          });
          setTimeSpent(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
      }
    } else if (currentAttempt && !showResult) {
      // For pretest and posttest, just track time spent without countdown
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAttempt, timeLeft, showResult, quizType]);

  // Start new quiz attempt
  const startQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quizEnhancedAPI.startQuizAttempt(courseId, quizType);
      if (response.success) {
        setCurrentAttempt(response.data);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setTimeLeft(quiz.timeLimit * 60);
        setTimeSpent(0);
        setStartTime(new Date());
        setShowResult(false);
      }
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError(err.message || 'Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (quiz && quiz.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !currentAttempt) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await quizEnhancedAPI.submitQuizAttempt(
        currentAttempt.id,
        answers,
        timeSpent
      );
      
      if (response.success) {
        setResult(response.data);
        setShowResult(true);
        setCurrentAttempt(null);
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete({
            type: quizType,
            result: response.data,
            passed: response.data.passed
          });
        }
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentAttempt, answers, timeSpent, isSubmitting, quizType, onComplete]);

  // Retry quiz
  const retryQuiz = () => {
    setResult(null);
    setShowResult(false);
    startQuiz();
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = () => {
    if (!quiz || !quiz.questions || !currentAttempt) return 0;
    return Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => typeof window !== 'undefined' && window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Quiz Not Found</h3>
          <p className="text-gray-600 mb-6">The {quizType} for this course is not available.</p>
          <button 
            onClick={onBack} 
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show result screen
  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{quiz.title} - Results</h2>
            {quizType !== 'pretest' && quizType !== 'posttest' && (
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                result.passed 
                  ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                  : 'bg-red-100 text-red-800 border-2 border-red-200'
              }`}>
                {result.passed ? '✅ Passed' : '❌ Failed'}
              </div>
            )}
            {(quizType === 'pretest' || quizType === 'posttest') && (
              <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold bg-blue-100 text-blue-800 border-2 border-blue-200">
                ✅ Completed
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{result.score}%</div>
              <div className="text-gray-600 font-medium">Score</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{result.correctCount}/{result.totalCount}</div>
              <div className="text-gray-600 font-medium">Correct Answers</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatTime(result.timeSpent)}</div>
              <div className="text-gray-600 font-medium">Time Spent</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{result.attemptNumber}</div>
              <div className="text-gray-600 font-medium">Attempt</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {result.canRetake && quizType !== 'pretest' && quizType !== 'posttest' && (
              <button 
                onClick={retryQuiz} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                🔄 Retake Quiz
              </button>
            )}
            <button 
              onClick={() => {
                if (onComplete) {
                  // For pretest/posttest, when user clicks continue, set shouldProceed to true
                  if (quizType === 'pretest' || quizType === 'posttest') {
                    onComplete({
                      type: quizType,
                      result: result,
                      passed: true,
                      shouldProceed: true // Now proceed to next step
                    });
                  } else {
                    onComplete({
                      type: quizType,
                      result: result,
                      passed: result.passed,
                      shouldProceed: result.passed
                    });
                  }
                } else {
                  onBack();
                }
              }} 
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition duration-200 transform hover:scale-105 flex items-center justify-center shadow-lg"
            >
              {(quizType === 'pretest' || quizType === 'posttest') || result.passed ? '🚀 Lanjut ke Materi Selanjutnya' : '📚 Kembali ke Course'}
            </button>
            <button 
              onClick={onBack} 
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show start screen
  if (!currentAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{quizType === 'pretest' ? '📝' : '🎯'}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{quiz.title}</h2>
            <p className="text-gray-600 text-lg leading-relaxed">{quiz.description}</p>
          </div>
          
          <div className={`grid ${quizType === 'pretest' || quizType === 'posttest' ? 'grid-cols-2' : 'grid-cols-2'} gap-4 mb-8`}>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{quiz.questions ? quiz.questions.length : 0}</div>
              <div className="text-gray-600 font-medium">Questions</div>
            </div>
            {quizType !== 'pretest' && quizType !== 'posttest' && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{quiz.timeLimit}</div>
                <div className="text-gray-600 font-medium">Minutes</div>
              </div>
            )}
            {quizType !== 'pretest' && quizType !== 'posttest' && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{quiz.passingScore}%</div>
                <div className="text-gray-600 font-medium">Passing Score</div>
              </div>
            )}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">{quiz.maxAttempts}</div>
              <div className="text-gray-600 font-medium">Max Attempts</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={startQuiz} 
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition duration-200 transform hover:scale-105 flex items-center justify-center text-lg shadow-lg"
            >
              🚀 Start {quizType === 'pretest' ? 'Pre-test' : 'Post-test'}
            </button>
            <button 
              onClick={onBack} 
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-xl transition duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-yellow-500 text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h3>
          <p className="text-gray-600 mb-6">This quiz has no questions available.</p>
          <button 
            onClick={onBack} 
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="bg-white bg-opacity-20 rounded-full h-3 mb-2">
                  <div 
                    className="bg-white rounded-full h-3 transition-all duration-300 ease-out" 
                    style={{ width: `${getProgress()}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {quiz.questions ? quiz.questions.length : 0}
                </span>
              </div>
              {quizType !== 'pretest' && quizType !== 'posttest' && (
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${
                    timeLeft < 300 
                      ? 'bg-red-100 text-red-800 animate-pulse' 
                      : 'bg-opacity-20 text-white'
                  }`}>
                    ⏱️ {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 leading-relaxed mb-6">{currentQuestion.question}</h3>
              
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`group cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      answers[currentQuestion.id] === index 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.02]' 
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-25'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                        answers[currentQuestion.id] === index
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-300 text-gray-700 group-hover:bg-indigo-400 group-hover:text-white'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-700 font-medium flex-1">{option}</span>
                      {answers[currentQuestion.id] === index && (
                        <span className="text-indigo-500 text-xl">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <button 
                onClick={prevQuestion} 
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white transform hover:scale-105'
                }`}
              >
                ← Previous
              </button>
              
              <div className="flex flex-wrap justify-center gap-2">
                {quiz.questions && quiz.questions.map((_, index) => (
                  <button 
                    key={index}
                    className={`w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
                      index === currentQuestionIndex 
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 transform scale-110' 
                        : answers[quiz.questions[index].id] !== undefined
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {quiz.questions && currentQuestionIndex === quiz.questions.length - 1 ? (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-bold transition duration-200 ${
                    isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white transform hover:scale-105 shadow-lg'
                  }`}
                >
                  {isSubmitting ? '⏳ Submitting...' : '🎯 Submit Quiz'}
                </button>
              ) : (
                <button 
                  onClick={nextQuestion} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEnhanced;