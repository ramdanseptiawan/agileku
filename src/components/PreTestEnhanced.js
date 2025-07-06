import React from 'react';
import QuizEnhanced from './QuizEnhanced';

const PreTestEnhanced = ({ courseId, onComplete, onBack }) => {
  const handlePreTestComplete = (result) => {
    // Handle pre-test completion
    console.log('Pre-test completed:', result);
    
    // Call the parent completion handler
    if (onComplete) {
      onComplete({
        type: 'pretest',
        passed: result.passed,
        score: result.result.score,
        canRetake: result.result.canRetake,
        result: result.result
      });
    }
  };

  return (
    <div className="pretest-enhanced">
      <QuizEnhanced 
        courseId={courseId}
        quizType="pretest"
        onComplete={handlePreTestComplete}
        onBack={onBack}
      />
    </div>
  );
};

export default PreTestEnhanced;