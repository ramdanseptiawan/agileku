import React from 'react';
import QuizEnhanced from './QuizEnhanced';

const PostTestEnhanced = ({ courseId, onComplete, onBack }) => {
  const handlePostTestComplete = (result) => {
    // Handle post-test completion
    console.log('Post-test completed:', result);
    
    // Call the parent completion handler
    if (onComplete) {
      onComplete({
        type: 'posttest',
        passed: result.passed,
        score: result.result.score,
        canRetake: result.result.canRetake,
        result: result.result
      });
    }
  };

  return (
    <div className="posttest-enhanced">
      <QuizEnhanced 
        courseId={courseId}
        quizType="posttest"
        onComplete={handlePostTestComplete}
        onBack={onBack}
      />
    </div>
  );
};

export default PostTestEnhanced;