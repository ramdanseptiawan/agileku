'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Award, Upload, Target, Trophy, ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useCertificate } from '../hooks/useCertificate';
import IntroductoryMaterial from './IntroductoryMaterial';
import PreTest from './PreTest';
import LessonContent from './LessonContent';
import PostTestSurvey from './PostTestSurvey';
import PostWork from './PostWork';
import FinalProject from './FinalProject';
import Certificate from './Certificate';
import ProgressTracker from './ProgressTracker';

const CourseView = ({ 
  currentLesson, 
  onBack, 
  onQuizSubmit, 
  preTestState,
  postTestState,
  onRetakeQuiz,
  onMarkComplete 
}) => {
  const { getCourseById } = useAuth();
  const [surveyData, setSurveyData] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Use custom hooks for progress and certificate management
  const {
    progress,
    setCurrentStep,
    markStepCompleted,
    updateLessonProgress,
    saveQuizScore,
    saveSubmission,
    markCourseCompleted
  } = useLearningProgress(currentLesson?.id);
  
  const {
    certificates,
    isEligible,
    isGenerating,
    generateCertificate,
    getCertificateForCourse
  } = useCertificate(currentLesson?.id, progress);
  
  // Get the latest course data from context
  const course = currentLesson ? getCourseById(currentLesson.id) || currentLesson : null;
  
  // Auto-resume to last saved progress
  useEffect(() => {
    if (progress.currentStep && progress.currentStep !== 'intro') {
      // Resume to the last saved step
      console.log('Resuming to step:', progress.currentStep);
    }
  }, [progress.currentStep]);
  
  if (!course) return null;

  // Handle step completion
  const handleStepComplete = (stepId) => {
    markStepCompleted(stepId);
    
    // Auto-navigate to next step
    const steps = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
    const currentIndex = steps.indexOf(stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
    }
  };

  // Handle step navigation
  const handleStepClick = (stepId) => {
    const steps = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
    const stepIndex = steps.indexOf(stepId);
    
    // Check if step is accessible
    if (stepIndex === 0 || progress.completedSteps.includes(steps[stepIndex - 1])) {
      setCurrentStep(stepId);
    }
  };

  // Handle survey submission
  const handleSurveySubmit = (data) => {
    setSurveyData(data);
    saveQuizScore(`posttest_${currentLesson?.id}`, data.score || 0, data);
    handleStepComplete('posttest');
  };

  // Handle post work submission
  const handlePostWorkSubmit = (data) => {
    // Here you would typically save the submission data
    console.log('Post work submitted:', data);
    saveSubmission('postwork', data);
    handleStepComplete('postwork');
  };

  // Handle final project submission
  const handleFinalProjectSubmit = (data) => {
    // Here you would typically save the submission data
    console.log('Final project submitted:', data);
    saveSubmission('finalproject', data);
    handleStepComplete('finalproject');
    markCourseCompleted();
  };

  // Enhanced quiz submit handler
  const handleQuizSubmit = (quizId, isPreTest, answers) => {
    onQuizSubmit(quizId, isPreTest, answers);
    
    // Update quiz score in progress
    const quizType = isPreTest ? 'pretest' : 'posttest';
    saveQuizScore(`${quizType}_${currentLesson?.id}`, answers.score || 0, answers);
    
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
              <span className="font-medium">{progress.completedSteps.length}/6</span> Tahap Selesai
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="font-medium">{Math.round((progress.completedSteps.length / 6) * 100)}%</span> Progress
            </div>
          </div>
        </div>
        
        {/* Progress Tracker */}
        <div className="p-4 sm:p-6 bg-gray-50">
          <ProgressTracker 
            currentStep={progress.currentStep}
            completedSteps={progress.completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
        
        {/* Step Content */}
        <div className="p-4 sm:p-8">
          {progress.currentStep === 'intro' && (
            <IntroductoryMaterial 
              material={course.introMaterial || { content: course.description }}
              onComplete={() => handleStepComplete('intro')}
            />
          )}
          
          {progress.currentStep === 'pretest' && (
            <PreTest 
              quiz={course.preTest} 
              onQuizSubmit={handleQuizSubmit}
              showQuizResult={preTestState.showResult}
              currentQuizScore={preTestState.score}
              onRetakeQuiz={() => onRetakeQuiz(true)}
              onContinueToLessons={handleContinueToLessons}
            />
          )}
          
          {progress.currentStep === 'lessons' && (
            <LessonContent 
              lessons={course.lessons}
              onMarkComplete={handleLessonComplete}
            />
          )}
          
          {progress.currentStep === 'posttest' && (
            <PostTestSurvey 
              quiz={course.postTest} 
              onQuizSubmit={handleQuizSubmit}
              showQuizResult={postTestState.showResult}
              currentQuizScore={postTestState.score}
              onRetakeQuiz={() => onRetakeQuiz(false)}
              onSurveySubmit={handleSurveySubmit}
            />
          )}
          
          {progress.currentStep === 'postwork' && (
            <PostWork 
              courseId={course.id}
              onSubmit={handlePostWorkSubmit}
            />
          )}
          
          {progress.currentStep === 'finalproject' && (
            <FinalProject 
              courseId={course.id}
              onSubmit={handleFinalProjectSubmit}
            />
          )}
          
          {/* Course Completion Banner */}
          {progress.isCompleted && (
            <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy size={48} className="text-yellow-300" />
                <div>
                  <h2 className="text-3xl font-bold">Selamat! 🎉</h2>
                  <p className="text-green-100 text-lg">Anda telah menyelesaikan kursus ini dengan sempurna!</p>
                </div>
                <Trophy size={48} className="text-yellow-300" />
              </div>
              
              <div className="bg-white bg-opacity-20 p-6 rounded-xl mb-6">
                <p className="text-lg mb-4">Kursus <strong>{course.title}</strong> telah selesai!</p>
                <p className="text-green-100">Dapatkan sertifikat resmi sebagai bukti pencapaian Anda</p>
              </div>
              
              {/* Certificate Status */}
              {isEligible ? (
                <div className="space-y-4">
                  {getCertificateForCourse(currentLesson?.id) ? (
                    <div className="bg-white/20 rounded-lg p-4 mb-4">
                      <p className="text-sm opacity-90 mb-2">✅ Sertifikat sudah tersedia!</p>
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                      >
                        <Award size={20} />
                        Lihat Sertifikat
                      </button>
                    </div>
                  ) : isGenerating ? (
                    <div className="bg-white/20 rounded-lg p-4 mb-4">
                      <p className="text-sm opacity-90">🔄 Sedang memproses sertifikat...</p>
                    </div>
                  ) : (
                    <button
                      onClick={generateCertificate}
                      className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-3 mx-auto text-lg"
                    >
                      <Award size={24} />
                      Generate Sertifikat
                      <Award size={24} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm opacity-90">⚠️ Belum memenuhi syarat untuk sertifikat</p>
                  <p className="text-xs opacity-75 mt-1">
                    Pastikan semua tahap selesai dan nilai post-test minimal 70%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Certificate Modal */}
      {showCertificate && (
        <Certificate 
          courseId={course.id}
          courseName={course.title}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default CourseView;