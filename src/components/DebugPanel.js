'use client';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useCertificate } from '../hooks/useCertificate';

const DebugPanel = ({ courseId }) => {
  const { currentUser } = useAuth();
  const { progress } = useLearningProgress(courseId);
  const { certificates, isEligible, isGenerating } = useCertificate(courseId, progress);

  if (!courseId) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md text-xs z-50">
      <h3 className="font-bold mb-2">Debug Panel - Course {courseId}</h3>
      
      <div className="mb-2">
        <strong>User:</strong> {currentUser?.email || 'None'}
      </div>
      
      <div className="mb-2">
        <strong>Completed Steps:</strong> {progress?.completedSteps?.join(', ') || 'None'}
      </div>
      
      <div className="mb-2">
        <strong>Quiz Scores:</strong>
        <div className="ml-2">
          {Object.entries(progress?.quizScores || {}).map(([key, value]) => (
            <div key={key}>{key}: {value.score}%</div>
          ))}
        </div>
      </div>
      
      <div className="mb-2">
        <strong>Submissions:</strong>
        <div className="ml-2">
          {Object.keys(progress?.submissions || {}).map(key => (
            <div key={key}>{key}: ✓</div>
          ))}
        </div>
      </div>
      
      <div className="mb-2">
        <strong>Certificate Eligible:</strong> {isEligible ? '✓' : '✗'}
      </div>
      
      <div className="mb-2">
        <strong>Generating:</strong> {isGenerating ? '✓' : '✗'}
      </div>
      
      <div className="mb-2">
        <strong>Certificates:</strong> {certificates?.length || 0}
      </div>
      
      <button 
        onClick={() => {
          // Force mark all steps as completed for testing
          const steps = ['intro', 'pretest', 'lessons', 'posttest'];
          steps.forEach(step => {
            if (!progress?.completedSteps?.includes(step)) {
              console.log('Debug: Force completing step', step);
            }
          });
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs mt-2"
      >
        Debug: Force Complete Steps
      </button>
    </div>
  );
};

export default DebugPanel;