'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Award, Upload, Target, Trophy, ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useCertificate } from '../hooks/useCertificate';
import IntroductoryMaterial from './IntroductoryMaterial';
import PreTestEnhanced from './PreTestEnhanced';
import LessonContent from './LessonContent';
import PostTestWithSurvey from './PostTestWithSurvey';
import PostWork from './PostWork';
import FinalProject from './FinalProject';
import Certificate from './Certificate';
import ProgressTracker from './ProgressTracker';
import DebugPanel from './DebugPanel';

const CourseView = ({ 
  currentLesson, 
  onBack, 
  preTestState,
  postTestState,
  onRetakeQuiz,
  onMarkComplete 
}) => {
  const { getCourseById, currentUser, getUserProgress, getUserProgressSync, refreshUserProgress } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [course, setCourse] = useState(currentLesson);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  
  // Load course data from API - always from backend, no fallback
  useEffect(() => {
    const loadCourse = async () => {
      if (currentLesson?.id) {
        setIsLoadingCourse(true);
        try {
          const courseData = await getCourseById(currentLesson.id);
          if (courseData && (courseData.id || courseData.title)) {
            setCourse(courseData);
          } else {
            console.error('Course data incomplete from backend:', courseData);
            // Use fallback to currentLesson if backend data is incomplete
            setCourse(currentLesson);
          }
        } catch (error) {
          console.error('Failed to load course from backend:', error);
          // Don't set fallback data, keep loading state
          setCourse(null);
        } finally {
          setIsLoadingCourse(false);
        }
      }
    };
    
    loadCourse();
  }, [currentLesson?.id, getCourseById]);
  

  
  // Use custom hooks for progress and certificate management
  
  const {
    progress,
    isLoading: progressLoading,
    setCurrentStep,
    markStepCompleted,
    updateLessonProgress,
    saveQuizScore,
    saveSubmission,
    markCourseCompleted
  } = useLearningProgress(course?.id);
  
  // Get user progress from backend (AuthContext) - this is the source of truth for display
  const backendProgress = getUserProgressSync(course?.id) || 0;
  
  const {
    certificates,
    isEligible,
    isGenerating,
    generateCertificate,
    getCertificateForCourse
  } = useCertificate(course?.id, backendProgress);
  
  // Auto-resume to last saved progress
  useEffect(() => {
    // Only resume if we have valid progress data and it's not the default 'intro' step
    if (progress.currentStep && progress.currentStep !== 'intro' && !progressLoading) {
      // Resume to the last saved step
      console.log('Resuming to step:', progress.currentStep);
      // The progress.currentStep is already the source of truth from backend
    }
  }, [progress.currentStep, progressLoading]);
  
  // Sync currentLessonIndex with saved progress
  useEffect(() => {
    if (progress.lessonProgress?.currentLessonIndex !== undefined) {
      setCurrentLessonIndex(progress.lessonProgress.currentLessonIndex);
    }
  }, [progress.lessonProgress?.currentLessonIndex]);
  
  // Handle lesson change and save to progress
  const handleLessonChange = (newIndex) => {
    setCurrentLessonIndex(newIndex);
    updateLessonProgress(course.id, {
      currentLessonIndex: newIndex,
      completedLessons: progress.lessonProgress?.completedLessons || [],
      timeSpent: (progress.lessonProgress?.timeSpent || 0) + 1
    });
  };
  
  if (!course || isLoadingCourse || progressLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!course ? 'Loading course...' : 
             isLoadingCourse ? 'Loading course details...' : 
             'Loading progress...'}
          </p>
        </div>
      </div>
    );
  }

  // Handle step completion
  const handleStepComplete = async (stepId) => {
    markStepCompleted(stepId);
    
    // Refresh user progress in AuthContext to sync with backend
    try {
      await refreshUserProgress();
    } catch (error) {
      console.warn('Failed to refresh user progress:', error);
    }
    
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
    const currentStepIndex = steps.indexOf(progress.currentStep);
    
    // Check if course is completed (all steps completed)
    const allStepsCompleted = steps.every(step => progress.completedSteps.includes(step));
    
    // Check if step is accessible
    // Allow access to:
    // 1. First step (intro)
    // 2. Any completed step (for review)
    // 3. Current step
    // 4. Next step if previous step is completed
    // 5. Any step if course is completed
    // 6. Any step that comes before or at the current step (for going back)
    if (stepIndex === 0 || 
        progress.completedSteps.includes(stepId) || 
        stepId === progress.currentStep ||
        progress.completedSteps.includes(steps[stepIndex - 1]) || 
        allStepsCompleted || 
        progress.isCompleted ||
        stepIndex <= currentStepIndex) {
      setCurrentStep(stepId);
    }
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



  // Handle continue to lessons after pretest
  const handleContinueToLessons = () => {
    handleStepComplete('pretest');
  };

  // Enhanced lesson complete handler
  const handleLessonComplete = async (lessonId) => {
    console.log('handleLessonComplete called with:', { lessonId, currentLessonIndex, courseId: course.id });
    
    // Mark current lesson as completed
    const existingCompleted = progress.lessonProgress?.completedLessons || [];
    const completedLessons = [...new Set([...existingCompleted, currentLessonIndex])];
    
    console.log('Updating lesson progress:', {
      currentLessonIndex,
      completedLessons,
      totalLessons: course.lessons.length
    });
    
    // Update lesson progress with completion
    await updateLessonProgress(currentLessonIndex, {
      currentLessonIndex,
      completedLessons,
      timeSpent: (progress.lessonProgress?.timeSpent || 0) + 1,
      lastCompletedLesson: currentLessonIndex,
      lastCompletedAt: new Date().toISOString()
    });
    
    // Check if all lessons are completed OR if this is the last lesson
    const allLessonsCompleted = completedLessons.length >= course.lessons.length;
    const isLastLesson = currentLessonIndex === course.lessons.length - 1;
    
    if (allLessonsCompleted || isLastLesson) {
      // Mark lessons step as completed and navigate to post test when all lessons are done OR when completing the last lesson
      console.log('Lessons completed! Marking lessons step as complete and navigating to post test.');
      await handleStepComplete('lessons');
    } else {
      console.log(`Lesson ${currentLessonIndex + 1} completed. ${completedLessons.length}/${course.lessons.length} lessons done.`);
      // Move to next lesson if available
      if (currentLessonIndex < course.lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      }
    }
    
    // Call parent onMarkComplete if provided
    if (onMarkComplete) {
      console.log('Calling parent onMarkComplete');
      onMarkComplete();
    }
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
          
          {/* Quick Stats - Use backend progress for consistency */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="font-medium">{progress.completedSteps.length}/6</span> Tahap Selesai
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="font-medium">{backendProgress}%</span> Progress
            </div>
          </div>
        </div>
        
        {/* Progress Tracker */}
        <div className="p-4 sm:p-6 bg-gray-50">
          <ProgressTracker 
            currentStep={progress.currentStep}
            completedSteps={progress.completedSteps}
            onStepClick={handleStepClick}
            isCourseCompleted={backendProgress === 100}
            backendProgress={backendProgress}
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
            <PreTestEnhanced 
              courseId={course?.id}
              onComplete={(result) => {
                console.log('Pre-test completed:', result);
                // Don't auto-navigate, let user see the score first
                // The QuizEnhanced component will handle showing the score
                // and provide a button to continue to lessons
                if (result.shouldProceed && result.passed) {
                  handleContinueToLessons();
                }
              }}
              onBack={onBack}
            />
          )}
          
          {progress.currentStep === 'lessons' && (
            <LessonContent 
              lessons={course.lessons}
              onMarkComplete={handleLessonComplete}
              courseId={course.id}
              currentLessonIndex={currentLessonIndex}
              onLessonChange={handleLessonChange}
            />
          )}
          
          {progress.currentStep === 'posttest' && (
            <PostTestWithSurvey 
              courseId={course?.id}
              onComplete={(result) => {
                console.log('Post-test with survey completed:', result);
                // Complete the post-test step
                handleStepComplete('posttest');
              }}
              onBack={onBack}
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
          
          {/* Course Completion Banner - Use backend progress for consistency */}
          {(progress.isCompleted || backendProgress === 100) && (
            <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy size={48} className="text-yellow-300" />
                <div>
                  <h2 className="text-3xl font-bold">Selamat! 🎉</h2>
                  <p className="text-green-100 text-lg">Anda telah menyelesaikan kursus ini dengan sempurna!</p>
                </div>
                <Trophy size={48} className="text-yellow-300" />
              </div>
              
              <div className="bg-opacity-20 p-6 rounded-xl mb-6">
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
      
      {/* Debug Panel */}
    </div>
  );
};

export default CourseView;