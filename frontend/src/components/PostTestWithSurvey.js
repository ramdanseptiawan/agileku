import React, { useState, useEffect } from 'react';
import PostTestEnhanced from './PostTestEnhanced';
import { submitSurveyFeedback } from '../services/api';

const PostTestWithSurvey = ({ course, onComplete }) => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [postTestResult, setPostTestResult] = useState(null);
  const [surveyData, setSurveyData] = useState({
    rating: 0,
    feedback: '',
    difficulty: 0,
    clarity: 0,
    usefulness: 0
  });
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const handlePostTestComplete = (result) => {
    setPostTestResult(result);
    setShowSurvey(true);
  };

  const handleSurveySubmit = async () => {
    if (surveyData.rating === 0) {
      alert('Mohon berikan rating untuk kursus ini');
      return;
    }

    setIsSubmittingSurvey(true);
    try {
      await submitSurveyFeedback({
        courseId: course.id,
        rating: surveyData.rating,
        feedback: surveyData.feedback,
        difficulty: surveyData.difficulty,
        clarity: surveyData.clarity,
        usefulness: surveyData.usefulness,
        postTestScore: postTestResult?.score || 0,
        postTestPassed: postTestResult?.passed || false
      });
      
      setSurveySubmitted(true);
      
      // Complete the post-test step after survey submission
      setTimeout(() => {
        onComplete(postTestResult);
      }, 2000);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Gagal mengirim survei. Silakan coba lagi.');
    } finally {
      setIsSubmittingSurvey(false);
    }
  };

  const renderStarRating = (value, onChange, label) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`text-2xl ${
                star <= value ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (surveySubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
          <p className="text-gray-600">
            Survei feedback Anda telah berhasil dikirim. Masukan Anda sangat berharga untuk meningkatkan kualitas kursus.
          </p>
        </div>
      </div>
    );
  }

  if (showSurvey) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survei Feedback Kursus</h2>
          <p className="text-gray-600">
            Mohon berikan feedback Anda tentang kursus "{course.title}" untuk membantu kami meningkatkan kualitas pembelajaran.
          </p>
        </div>

        <div className="space-y-6">
          {renderStarRating(
            surveyData.rating,
            (rating) => setSurveyData(prev => ({ ...prev, rating })),
            'Rating Keseluruhan Kursus *'
          )}

          {renderStarRating(
            surveyData.difficulty,
            (difficulty) => setSurveyData(prev => ({ ...prev, difficulty })),
            'Tingkat Kesulitan Materi'
          )}

          {renderStarRating(
            surveyData.clarity,
            (clarity) => setSurveyData(prev => ({ ...prev, clarity })),
            'Kejelasan Penjelasan Materi'
          )}

          {renderStarRating(
            surveyData.usefulness,
            (usefulness) => setSurveyData(prev => ({ ...prev, usefulness })),
            'Kegunaan Materi untuk Pekerjaan'
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saran dan Masukan
            </label>
            <textarea
              value={surveyData.feedback}
              onChange={(e) => setSurveyData(prev => ({ ...prev, feedback: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Berikan saran atau masukan untuk perbaikan kursus ini..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSurveySubmit}
              disabled={isSubmittingSurvey || surveyData.rating === 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmittingSurvey ? 'Mengirim...' : 'Kirim Survei'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PostTestEnhanced
      course={course}
      onComplete={handlePostTestComplete}
    />
  );
};

export default PostTestWithSurvey;