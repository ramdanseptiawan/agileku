import React, { useState } from 'react';
import QuizEnhanced from './QuizEnhanced';
import { CheckCircle, Star, MessageSquare } from 'lucide-react';
import { submitSurveyFeedback } from '../services/api';

const PostTestWithSurvey = ({ courseId, onComplete, onBack }) => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [postTestResult, setPostTestResult] = useState(null);
  const [surveyData, setSurveyData] = useState({
    satisfaction: 0,
    difficulty: 0,
    usefulness: 0,
    feedback: ''
  });
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const handlePostTestComplete = (result) => {
    console.log('Post-test completed:', result);
    setPostTestResult(result);
    
    // Show result first, then survey
    setShowResult(true);
  };

  const handleContinueToSurvey = () => {
    setShowResult(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = async () => {
    console.log('Survey submitted:', surveyData);
    
    try {
      // Prepare survey data for backend
      const surveyPayload = {
        course_id: courseId,
        rating: surveyData.satisfaction,
        difficulty: surveyData.difficulty,
        clarity: surveyData.usefulness, // Map usefulness to clarity
        usefulness: surveyData.usefulness,
        feedback: surveyData.feedback || '',
        post_test_score: postTestResult?.result?.score || 0,
        post_test_completed: true
      };
      
      // Submit to backend API
      await submitSurveyFeedback(surveyPayload);
      console.log('Survey successfully submitted to backend');
      
      setSurveySubmitted(true);
      
      // Complete the post-test step after survey
      if (onComplete) {
        onComplete({
          type: 'posttest',
          score: postTestResult?.result?.score || 0,
          canRetake: postTestResult?.result?.canRetake || true,
          result: postTestResult?.result || {},
          surveyCompleted: true
        });
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      // Still mark as submitted to allow user to continue
      setSurveySubmitted(true);
      
      if (onComplete) {
        onComplete({
          type: 'posttest',
          score: postTestResult?.result?.score || 0,
          canRetake: postTestResult?.result?.canRetake || true,
          result: postTestResult?.result || {},
          surveyCompleted: true
        });
      }
    }
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
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">📊</span>
            <p className="text-blue-800 font-medium">Skor Post-Test: {postTestResult?.result?.score || 0}%</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">✅</span>
            <p className="text-blue-600 text-sm">
              Status: Telah Disubmit
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Post-test result view
  if (showResult && postTestResult) {
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
                  <p className="text-4xl font-extrabold text-blue-600">{postTestResult.result?.score || 0}%</p>
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

          <button
            onClick={handleContinueToSurvey}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>📝</span>
            <span>Lanjut ke Survei</span>
            <span>🚀</span>
          </button>
        </div>
      </div>
    );
  }

  // Survey view
  if (showSurvey && postTestResult) {
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

  // Post-test quiz view
  return (
    <div className="posttest-with-survey">
      <QuizEnhanced 
        courseId={courseId}
        quizType="posttest"
        onComplete={handlePostTestComplete}
        onBack={onBack}
      />
    </div>
  );
};

export default PostTestWithSurvey;