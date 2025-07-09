import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Star, MessageSquare } from 'lucide-react';

const PostTestSurvey = ({ quiz, onQuizSubmit, showQuizResult, currentQuizScore, onRetakeQuiz, onSurveySubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showSurvey, setShowSurvey] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [surveyData, setSurveyData] = useState({
    satisfaction: 0,
    difficulty: 0,
    usefulness: 0,
    feedback: ''
  });
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  
  // Handle case when quiz is undefined or doesn't have questions
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Post-test tidak tersedia</p>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleQuizSubmit = () => {
    onQuizSubmit(quiz.id, false, quizAnswers);
    // Show result first after quiz submission
    setShowResult(true);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    setShowSurvey(false);
    setShowResult(false);
    setSurveySubmitted(false);
    onRetakeQuiz();
  };

  const handleContinueToSurvey = () => {
    setShowResult(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = () => {
    console.log('PostTestSurvey - Submitting with score:', currentQuizScore);
    onSurveySubmit({
      ...surveyData,
      score: currentQuizScore
    });
    setSurveySubmitted(true);
  };

  const renderStarRating = (value, onChange, label) => {
    const getEmojiAndText = (rating) => {
      switch(rating) {
        case 0: return { emoji: '❓', text: 'Belum dinilai', color: 'text-gray-500' };
        case 1: return { emoji: '😞', text: 'Sangat Buruk', color: 'text-red-500' };
        case 2: return { emoji: '😕', text: 'Buruk', color: 'text-orange-500' };
        case 3: return { emoji: '😐', text: 'Cukup', color: 'text-yellow-500' };
        case 4: return { emoji: '😊', text: 'Baik', color: 'text-green-500' };
        case 5: return { emoji: '😍', text: 'Sangat Baik', color: 'text-green-600' };
        default: return { emoji: '❓', text: 'Belum dinilai', color: 'text-gray-500' };
      }
    };

    const { emoji, text, color } = getEmojiAndText(value);

    return (
      <div className="mb-6 text-gray-900">
        <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
        <div className="flex items-center justify-center space-x-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`p-2 transition-all duration-200 transform hover:scale-110 rounded-full ${
                star <= value ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:text-yellow-300 hover:bg-gray-50'
              }`}
            >
              <Star size={28} fill={star <= value ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="text-2xl">{emoji}</span>
            <span className={`text-sm font-medium ${color}`}>{text}</span>
          </div>
          {value > 0 && (
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-yellow-800">{value}/5 ⭐</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Survey completed view
  if (surveySubmitted) {
    return (
      <div className="text-center space-y-6 px-4">
        <div className="relative">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle className="text-white" size={32} />
          </div>
          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Terima Kasih! 🙏</h3>
          <div className="flex justify-center space-x-1 text-2xl">
            <span className="animate-bounce" style={{animationDelay: '0s'}}>🌟</span>
            <span className="animate-bounce" style={{animationDelay: '0.1s'}}>✨</span>
            <span className="animate-bounce" style={{animationDelay: '0.2s'}}>🌟</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Post-test dan survei telah selesai. Anda dapat melanjutkan ke tahap berikutnya.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">📊</span>
            <p className="text-blue-800 font-medium">Skor Post-Test: {currentQuizScore}%</p>
          </div>
        </div>
      </div>
    );
  }

  // Survey view
  if (showSurvey) {
    return (
      <div className="max-w-2xl mx-auto px-4 text-gray-900">
        <div className="text-center mb-8">
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <MessageSquare className="text-white" size={32} />
            </div>
            <div className="absolute -top-1 -right-1 text-lg animate-spin">💫</div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Survei Pengalaman Belajar 📝</h3>
            <div className="flex justify-center space-x-2 text-lg">
              <span>💭</span>
              <p className="text-gray-600">Bantu kami meningkatkan kualitas pembelajaran</p>
              <span>🚀</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-purple-100">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">😊</span>
                <h4 className="font-semibold text-purple-800">Kepuasan Pembelajaran</h4>
              </div>
              {renderStarRating(
                surveyData.satisfaction,
                (value) => setSurveyData(prev => ({ ...prev, satisfaction: value })),
                "Seberapa puas Anda dengan materi pembelajaran ini?"
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">🧠</span>
                <h4 className="font-semibold text-blue-800">Tingkat Kesulitan</h4>
              </div>
              {renderStarRating(
                surveyData.difficulty,
                (value) => setSurveyData(prev => ({ ...prev, difficulty: value })),
                "Seberapa mudah materi ini dipahami? (1=Sangat Sulit, 5=Sangat Mudah)"
              )}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">💡</span>
                <h4 className="font-semibold text-green-800">Kegunaan Materi</h4>
              </div>
              {renderStarRating(
                surveyData.usefulness,
                (value) => setSurveyData(prev => ({ ...prev, usefulness: value })),
                "Seberapa berguna materi ini untuk Anda?"
              )}
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">💬</span>
                <label className="block text-sm font-medium text-orange-800">
                  Saran atau masukan tambahan <span className="text-red-500">*</span>
                </label>
              </div>
              <textarea
                value={surveyData.feedback}
                onChange={(e) => setSurveyData(prev => ({ ...prev, feedback: e.target.value }))}
                className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                rows={4}
                placeholder="💭 Bagikan pengalaman belajar Anda... Apa yang paling berkesan? Apa yang bisa diperbaiki?"
                required
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-orange-600">📝 Masukan Anda sangat berharga untuk kami</span>
                <span className="text-xs text-gray-500">{surveyData.feedback.length}/500</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSurveySubmit}
            disabled={surveyData.satisfaction === 0 || surveyData.difficulty === 0 || surveyData.usefulness === 0 || !surveyData.feedback.trim()}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>Kirim Survei</span>
            <span>✨</span>
          </button>
        </div>
      </div>
    );
  }

  // Post-test result view (new dedicated view)
  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 text-gray-900">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="text-white" size={40} />
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎯</div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Post-Test Selesai! 🎉</h3>
            <div className="flex justify-center space-x-1 text-2xl">
              <span className="animate-bounce" style={{animationDelay: '0s'}}>⭐</span>
              <span className="animate-bounce" style={{animationDelay: '0.1s'}}>✨</span>
              <span className="animate-bounce" style={{animationDelay: '0.2s'}}>⭐</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-3xl">📊</span>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">Skor Anda</p>
                  <p className="text-4xl font-extrabold text-blue-600">{currentQuizScore}%</p>
                </div>
                <span className="text-3xl">🎯</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">✅</span>
                <p className="text-blue-600 font-medium">
                  Status: Telah Disubmit
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">💡</span>
              <p className="text-green-700 text-sm sm:text-base">
                Sekarang mari bantu kami meningkatkan kualitas pembelajaran dengan mengisi survei singkat
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetake}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
            >
              <span>🔄</span>
              <span>Ulangi Post-Test</span>
            </button>
            <button
              onClick={handleContinueToSurvey}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2"
            >
              <span>📝</span>
              <span>Lanjut ke Survei</span>
              <span>🚀</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz result view (original, now hidden)
  if (showQuizResult && !showResult) {
    return (
      <div className="text-center space-y-6 px-4">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto">
          <span className="text-xl sm:text-2xl font-bold text-white">{currentQuizScore}%</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Post-Test Telah Disubmit!</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Skor Anda: {currentQuizScore}%
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetake}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ulangi Post-Test
          </button>
          <button
            onClick={handleContinueToSurvey}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Lanjut ke Survei
          </button>
        </div>
      </div>
    );
  }

  // Quiz view
  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{quiz.title}</h3>
          <span className="text-xs sm:text-sm text-gray-500">
            Soal {currentQuestionIndex + 1} dari {quiz.questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-8">
        <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h4>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: index }))}
              className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
                quizAnswers[currentQuestion.id] === index
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  quizAnswers[currentQuestion.id] === index
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 text-gray-600'
                }`}>
                  {quizAnswers[currentQuestion.id] === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-sm sm:text-base">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          <span>Sebelumnya</span>
        </button>
        
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleQuizSubmit}
            disabled={!quizAnswers[currentQuestion.id] && quizAnswers[currentQuestion.id] !== 0}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <span>Selesai</span>
            <CheckCircle size={16} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
            disabled={!quizAnswers[currentQuestion.id] && quizAnswers[currentQuestion.id] !== 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Selanjutnya</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PostTestSurvey;