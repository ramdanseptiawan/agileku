import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

const PostTest = ({ quiz, onQuizSubmit, showQuizResult, currentQuizScore, onRetakeQuiz, onCompleteCourse }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  
  // Handle case when quiz is undefined or doesn't have questions
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Post-test tidak tersedia</p>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleSubmit = () => {
    onQuizSubmit(quiz.id, false, quizAnswers);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setQuizAnswers({});
    onRetakeQuiz();
  };

  const handleComplete = () => {
    onCompleteCourse();
  };

  if (showQuizResult) {
    return (
      <div className="text-center space-y-6 px-4">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto">
          <span className="text-xl sm:text-2xl font-bold text-white">{currentQuizScore}%</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Post-Test Selesai!</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Skor Anda: {currentQuizScore}% 
          {currentQuizScore >= 70 ? ' - Selamat! Anda telah menguasai materi dengan baik! 🎉' : ' - Terus belajar dan berlatih! 💪'}
        </p>
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-800 mb-2">Informasi Post-Test</h4>
          <p className="text-green-700 text-sm">
            Post-test mengukur pemahaman Anda setelah mempelajari materi. Hasil ini menunjukkan kemajuan pembelajaran Anda dari pre-test.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetake}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ulangi Post-Test
          </button>
          <button
            onClick={handleComplete}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-semibold"
          >
            Selesaikan Kursus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header Info */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-2">Post-Test: Evaluasi Pemahaman Akhir</h2>
        <p className="text-green-700 text-sm">
          Post-test ini bertujuan untuk mengukur pemahaman Anda setelah mempelajari seluruh materi. 
          Hasil post-test akan dibandingkan dengan pre-test untuk melihat kemajuan pembelajaran Anda.
        </p>
      </div>

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
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  quizAnswers[currentQuestion.id] === index
                    ? 'border-green-600 bg-green-600'
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
      <div className="flex justify-between items-center mt-6 sm:mt-8">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <ArrowLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!quiz.questions.every(q => quizAnswers[q.id] !== undefined)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm sm:text-base font-semibold"
          >
            <CheckCircle size={16} />
            <span>Selesai Post-Test</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            disabled={quizAnswers[currentQuestion.id] === undefined}
            className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <span>Selanjutnya</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PostTest;