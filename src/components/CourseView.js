'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Award, Upload, Target, Trophy, ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useCertificate } from '../hooks/useCertificate';
import { courseAPI } from '../services/api';
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
  const [stageAccess, setStageAccess] = useState({});
  const [loadingStageAccess, setLoadingStageAccess] = useState(false);
  const [courseConfig, setCourseConfig] = useState(null);
  const [loadingCourseConfig, setLoadingCourseConfig] = useState(false);
  
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

  // Load course configuration from backend
  useEffect(() => {
    const loadCourseConfig = async () => {
      if (!course?.id || !currentUser) return;
      
      setLoadingCourseConfig(true);
      try {
        const backendUrl = process.env.NODE_ENV === 'production' 
          ? 'https://api.mindshiftlearning.id' 
          : 'https://api.mindshiftlearning.id';
        
        const response = await fetch(`${backendUrl}/api/protected/admin/courses/${course.id}/config`, {
          headers: {
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCourseConfig({
            hasPostWork: data.hasPostWork || false,
            hasFinalProject: data.hasFinalProject || false,
            certificateDelay: data.certificateDelay || 0,
            stepWeights: data.stepWeights || {}
          });
        } else {
          console.warn('Failed to load course config, using defaults');
          setCourseConfig({
            hasPostWork: false,
            hasFinalProject: false,
            certificateDelay: 0,
            stepWeights: {}
          });
        }
      } catch (error) {
        console.error('Error loading course config:', error);
        setCourseConfig({
          hasPostWork: false,
          hasFinalProject: false,
          certificateDelay: 0,
          stepWeights: {}
        });
      } finally {
        setLoadingCourseConfig(false);
      }
    };
    
    loadCourseConfig();
  }, [course?.id, currentUser]);

  // Check stage access for all stages
  useEffect(() => {
    const checkStageAccess = async () => {
      if (!course?.id || !currentUser) return;
      
      setLoadingStageAccess(true);
      const stages = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
      const accessResults = {};
      
      try {
        for (const stage of stages) {
          try {
            const response = await courseAPI.checkStageAccess(course.id, stage);
            // Backend returns 'canAccess' in response.data, not 'hasAccess'
            const stageData = response.data || response;
            accessResults[stage] = {
              canAccess: stageData.canAccess,
              lockMessage: stageData.lockMessage || 'Tahap ini masih dikunci oleh admin.'
            };
          } catch (error) {
            console.warn(`Failed to check access for stage ${stage}:`, error);
            // Default to allowing access if API fails
            accessResults[stage] = {
              canAccess: true,
              lockMessage: null
            };
          }
        }
        setStageAccess(accessResults);
      } catch (error) {
        console.error('Error checking stage access:', error);
      } finally {
        setLoadingStageAccess(false);
      }
    };
    
    checkStageAccess();
  }, [course?.id, currentUser]);
  

  
  // Use custom hooks for progress and certificate management
  
  const {
    progress,
    isLoading: progressLoading,
    setCurrentStep,
    markStepCompleted,
    updateLessonProgress,
    saveQuizScore,
    saveSubmission,
    markCourseCompleted,
    getCompletionPercentage,
    isCourseCompleted
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
  
  if (!course || isLoadingCourse || progressLoading || loadingCourseConfig) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!course ? 'Loading course...' : 
             isLoadingCourse ? 'Loading course details...' : 
             loadingCourseConfig ? 'Loading course configuration...' :
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
    const getActiveSteps = () => {
      const baseSteps = ['intro', 'pretest', 'lessons', 'posttest'];
      if (courseConfig?.hasPostWork) baseSteps.push('postwork');
      if (courseConfig?.hasFinalProject) baseSteps.push('finalproject');
      return baseSteps;
    };
    
    const steps = getActiveSteps();
    const currentIndex = steps.indexOf(stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      
      // Check if next stage is locked before navigating
      const nextStageAccessInfo = stageAccess[nextStep];
      if (nextStageAccessInfo && !nextStageAccessInfo.canAccess) {
        alert(nextStageAccessInfo.lockMessage || 'Tahap selanjutnya telah dikunci oleh admin. Silakan hubungi admin untuk membuka akses.');
        return;
      }
      
      setCurrentStep(nextStep);
    }
  };

  // Handle step navigation
  const handleStepClick = (stepId) => {
    const getActiveSteps = () => {
      const baseSteps = ['intro', 'pretest', 'lessons', 'posttest'];
      if (courseConfig?.hasPostWork) baseSteps.push('postwork');
      if (courseConfig?.hasFinalProject) baseSteps.push('finalproject');
      return baseSteps;
    };
    
    const steps = getActiveSteps();
    const stepIndex = steps.indexOf(stepId);
    const currentStepIndex = steps.indexOf(progress.currentStep);
    
    // Check if stage is locked
    const stageAccessInfo = stageAccess[stepId];
    if (stageAccessInfo && !stageAccessInfo.canAccess) {
      alert(stageAccessInfo.lockMessage || 'Tahap ini masih dikunci oleh admin.');
      return;
    }
    
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
              <span className="font-medium">{progress.completedSteps.length}/{(() => {
                const baseSteps = ['intro', 'pretest', 'lessons', 'posttest'];
                if (courseConfig?.hasPostWork) baseSteps.push('postwork');
                if (courseConfig?.hasFinalProject) baseSteps.push('finalproject');
                return baseSteps.length;
              })()}</span> Tahap Selesai
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="font-medium">{getCompletionPercentage()}%</span> Progress
            </div>
          </div>
        </div>
        
        {/* Course Completion Banner - Moved to top for better visibility */}
        {(progress.isCompleted || isCourseCompleted()) && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 sm:p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy size={48} className="text-yellow-300" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Selamat! 🎉</h2>
                <p className="text-green-100 text-lg">Anda telah menyelesaikan course ini!</p>
              </div>
              <Trophy size={48} className="text-yellow-300" />
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 sm:p-6 text-center">
              <p className="text-lg mb-2">Course <strong>{course.title}</strong> telah selesai!</p>
              <p className="text-green-100">Untuk sertifikat, silakan cek menu Achievement.</p>
            </div>
          </div>
        )}
        
        {/* Progress Tracker */}
        <div className="p-4 sm:p-6 bg-gray-50">
          <ProgressTracker 
          currentStep={progress.currentStep}
          completedSteps={progress.completedSteps}
          onStepClick={handleStepClick}
          isCourseCompleted={isCourseCompleted()}
          backendProgress={getCompletionPercentage()}
          stageAccess={stageAccess}
          courseConfig={courseConfig}
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
          
          {progress.currentStep === 'postwork' && courseConfig?.hasPostWork && (
            <PostWork 
              courseId={course.id}
              onSubmit={handlePostWorkSubmit}
              stageAccess={stageAccess}
            />
          )}
          
          {progress.currentStep === 'finalproject' && courseConfig?.hasFinalProject && (
            <FinalProject 
              courseId={course.id}
              onSubmit={handleFinalProjectSubmit}
              stageAccess={stageAccess}
            />
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