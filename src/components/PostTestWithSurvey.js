import React, { useState } from 'react';
import QuizEnhanced from './QuizEnhanced';
import { CheckCircle, Star, MessageSquare } from 'lucide-react';
import { submitSurveyFeedback } from '../services/api';

const PostTestWithSurvey = ({ courseId, onComplete, onBack }) => {
  const [showSurvey, setShowSurvey] = useState(false);
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
    
    // If passed, show survey
    if (result.passed) {
      setShowSurvey(true);
    } else {
      // If failed, allow retake or skip to survey
      setShowSurvey(true);
    }
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
        post_test_passed: postTestResult?.passed || false
      };
      
      // Submit to backend API
      await submitSurveyFeedback(surveyPayload);
      console.log('Survey successfully submitted to backend');
      
      setSurveySubmitted(true);
      
      // Complete the post-test step after survey
      if (onComplete) {
        onComplete({
          type: 'posttest',
          passed: postTestResult?.passed || false,
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
          passed: postTestResult?.passed || false,
          score: postTestResult?.result?.score || 0,
          canRetake: postTestResult?.result?.canRetake || true,
          result: postTestResult?.result || {},
          surveyCompleted: true
        });
      }
    }
  };

  const renderStarRating = (value, onChange, label) => {
    return (
      <div className="mb-6 text-gray-900">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`p-1 transition-colors ${
                star <= value ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`}
            >
              <Star size={24} fill={star <= value ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {value === 0 ? 'Belum dinilai' : 
           value === 1 ? 'Sangat Buruk' :
           value === 2 ? 'Buruk' :
           value === 3 ? 'Cukup' :
           value === 4 ? 'Baik' : 'Sangat Baik'}
        </p>
      </div>
    );
  };

  // Survey completed view
  if (surveySubmitted) {
    return (
      <div className="text-center space-y-6 px-4">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto">
          <CheckCircle className="text-white" size={32} />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Terima Kasih!</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Post-test dan survei telah selesai. Anda dapat melanjutkan ke tahap berikutnya.
        </p>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-800 font-medium">Skor Post-Test: {postTestResult?.result?.score || 0}%</p>
          <p className="text-blue-600 text-sm mt-1">
            Status: {postTestResult?.passed ? 'Lulus' : 'Belum Lulus'}
          </p>
        </div>
      </div>
    );
  }

  // Survey view
  if (showSurvey && postTestResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 text-gray-900">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Survei Pengalaman Belajar</h3>
          <p className="text-gray-600">Bantu kami meningkatkan kualitas pembelajaran</p>
          
          {/* Show post-test result */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <p className="text-blue-800 font-medium">Skor Post-Test: {postTestResult.result?.score || 0}%</p>
            <p className="text-blue-600 text-sm">
              Status: {postTestResult.passed ? 'Lulus ✅' : 'Belum Lulus ❌'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {renderStarRating(
            surveyData.satisfaction,
            (value) => setSurveyData(prev => ({ ...prev, satisfaction: value })),
            "Seberapa puas Anda dengan materi pembelajaran ini?"
          )}

          {renderStarRating(
            surveyData.difficulty,
            (value) => setSurveyData(prev => ({ ...prev, difficulty: value })),
            "Seberapa mudah materi ini dipahami? (1=Sangat Sulit, 5=Sangat Mudah)"
          )}

          {renderStarRating(
            surveyData.usefulness,
            (value) => setSurveyData(prev => ({ ...prev, usefulness: value })),
            "Seberapa berguna materi ini untuk Anda?"
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saran atau masukan tambahan (opsional)
            </label>
            <textarea
              value={surveyData.feedback}
              onChange={(e) => setSurveyData(prev => ({ ...prev, feedback: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Bagikan pengalaman belajar Anda..."
            />
          </div>

          <button
            onClick={handleSurveySubmit}
            disabled={surveyData.satisfaction === 0 || surveyData.difficulty === 0 || surveyData.usefulness === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kirim Survei
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