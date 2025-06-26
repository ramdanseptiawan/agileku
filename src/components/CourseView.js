'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Award, Upload, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import IntroductoryMaterial from './IntroductoryMaterial';
import LessonContent from './LessonContent';
import Quiz from './Quiz';
import PreTest from './PreTest';
import PostTestSurvey from './PostTestSurvey';
import PostWork from './PostWork';
import FinalProject from './FinalProject';
import ProgressTracker from './ProgressTracker';

const CourseView = ({ 
  currentLesson, 
  onBack, 
  progress, 
  onQuizSubmit, 
  preTestState,
  postTestState,
  onRetakeQuiz,
  onMarkComplete 
}) => {
  const { getCourseById } = useAuth();
  const [activeStep, setActiveStep] = useState('intro');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [surveyData, setSurveyData] = useState(null);
  
  // Get the latest course data from context
  const course = currentLesson ? getCourseById(currentLesson.id) || currentLesson : null;
  
  if (!course) return null;

  // Handle step completion
  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    
    // Auto-navigate to next step
    const steps = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
    const currentIndex = steps.indexOf(stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setActiveStep(nextStep);
    }
  };

  // Handle step navigation
  const handleStepClick = (stepId) => {
    const steps = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
    const stepIndex = steps.indexOf(stepId);
    
    // Check if step is accessible
    if (stepIndex === 0 || completedSteps.includes(steps[stepIndex - 1])) {
      setActiveStep(stepId);
    }
  };

  // Handle survey submission
  const handleSurveySubmit = (data) => {
    setSurveyData(data);
    handleStepComplete('posttest');
  };

  // Handle post work submission
  const handlePostWorkSubmit = (data) => {
    // Here you would typically save the submission data
    console.log('Post work submitted:', data);
    handleStepComplete('postwork');
  };

  // Handle final project submission
  const handleFinalProjectSubmit = (data) => {
    // Here you would typically save the submission data
    console.log('Final project submitted:', data);
    handleStepComplete('finalproject');
  };

  // Enhanced quiz submit handler
  const handleQuizSubmit = (quizId, isPreTest, answers) => {
    onQuizSubmit(quizId, isPreTest, answers);
    
    // For pretest, don't auto-complete step - wait for user to continue
    // For posttest, mark as complete when quiz is submitted
    if (!isPreTest) {
      // This is posttest, but completion is handled in PostTestSurvey component
    }
  };

  // Handle continue to lessons after pretest
  const handleContinueToLessons = () => {
    handleStepComplete('pretest');
  };

  // Enhanced lesson complete handler
  const handleLessonComplete = () => {
    onMarkComplete();
    handleStepComplete('lessons');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 px-4 lg:px-0"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-blue-100 text-sm sm:text-base">{course.description}</p>
          
          {/* Quick Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="font-medium">{completedSteps.length}/6</span> Tahap Selesai
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="font-medium">{Math.round((completedSteps.length / 6) * 100)}%</span> Progress
            </div>
          </div>
        </div>
        
        {/* Progress Tracker */}
        <div className="p-4 sm:p-6 bg-gray-50">
          <ProgressTracker 
            currentStep={activeStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
        
        {/* Step Content */}
        <div className="p-4 sm:p-8">
          {activeStep === 'intro' && (
            <IntroductoryMaterial 
              material={course.introMaterial || { content: course.description }}
              onComplete={() => handleStepComplete('intro')}
            />
          )}
          
          {activeStep === 'pretest' && (
            <PreTest 
              quiz={course.preTest} 
              onQuizSubmit={handleQuizSubmit}
              showQuizResult={preTestState.showResult}
              currentQuizScore={preTestState.score}
              onRetakeQuiz={() => onRetakeQuiz(true)}
              onContinueToLessons={handleContinueToLessons}
            />
          )}
          
          {activeStep === 'lessons' && (
            <LessonContent 
              lessons={course.lessons}
              onMarkComplete={handleLessonComplete}
            />
          )}
          
          {activeStep === 'posttest' && (
            <PostTestSurvey 
              quiz={course.postTest} 
              onQuizSubmit={handleQuizSubmit}
              showQuizResult={postTestState.showResult}
              currentQuizScore={postTestState.score}
              onRetakeQuiz={() => onRetakeQuiz(false)}
              onSurveySubmit={handleSurveySubmit}
            />
          )}
          
          {activeStep === 'postwork' && (
            <PostWork 
              courseId={course.id}
              onSubmit={handlePostWorkSubmit}
            />
          )}
          
          {activeStep === 'finalproject' && (
            <FinalProject 
              courseId={course.id}
              onSubmit={handleFinalProjectSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseView;