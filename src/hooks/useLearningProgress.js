import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { syncProgress, getCourseProgress, updateLessonProgress as apiUpdateLessonProgress } from '../services/api';

/**
 * Custom hook untuk mengelola progress pembelajaran
 * Menyimpan progress per user per course dengan auto-save
 */
export const useLearningProgress = (courseId) => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({
    currentStep: 'intro',
    completedSteps: [],
    lessonProgress: {},
    quizScores: {},
    submissions: {},
    lastAccessed: null,
    totalTimeSpent: 0,
    startedAt: null,
    completedAt: null,
    isCompleted: false
  });
  const [courseConfig, setCourseConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Save progress to backend only
  const saveProgress = useCallback(async (newProgress) => {
    if (!courseId || !currentUser) return;

    try {
      setAutoSaveStatus('saving');
      const progressToSave = {
        ...newProgress,
        lastAccessed: new Date().toISOString()
      };
      
      // Sync to backend only
      await syncProgress({
        courseId: parseInt(courseId),
        currentStep: newProgress.currentStep,
        completedSteps: newProgress.completedSteps,
        lessonProgress: newProgress.lessonProgress,
        quizScores: newProgress.quizScores,
        submissions: newProgress.submissions,
        totalTimeSpent: newProgress.totalTimeSpent,
        completedAt: newProgress.completedAt
      });
      
      setAutoSaveStatus('saved');
      
      // Reset status setelah 2 detik
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving progress to backend:', error);
      setAutoSaveStatus('error');
    }
  }, [courseId, currentUser]);

  // Update progress dengan auto-save
  const updateProgress = useCallback((updates) => {
    setProgress(prev => {
      const newProgress = { ...prev, ...updates };
      setAutoSaveStatus('pending');
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  // Mark step sebagai completed
  const markStepCompleted = useCallback((stepId) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, stepId])]
      };
      setAutoSaveStatus('pending');
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  // Set current step
  const setCurrentStep = useCallback((stepId) => {
    updateProgress({ currentStep: stepId });
  }, [updateProgress]);

  // Update lesson progress
  const updateLessonProgress = useCallback(async (lessonId, progressData) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: {
            ...prev.lessonProgress[lessonId],
            ...progressData,
            lastAccessed: new Date().toISOString()
          }
        }
      };
      setAutoSaveStatus('pending');
      saveProgress(newProgress);
      return newProgress;
    });
    
    // Note: Backend sync is handled by saveProgress via syncProgress endpoint
    // Individual lesson progress updates should not call separate API endpoints
    // to avoid inconsistent progress calculations
   }, [saveProgress]);

  // Save quiz score
  const saveQuizScore = useCallback((quizId, score, isPreTest = false) => {
    const quizKey = isPreTest ? `pretest_${quizId}` : `posttest_${quizId}`;
    console.log('Saving quiz score:', {
      quizId,
      score,
      isPreTest,
      quizKey,
      currentQuizScores: progress.quizScores
    });
    updateProgress({
      quizScores: {
        ...progress.quizScores,
        [quizKey]: {
          score,
          completedAt: new Date().toISOString(),
          attempts: (progress.quizScores[quizKey]?.attempts || 0) + 1
        }
      }
    });
  }, [progress.quizScores, updateProgress]);

  // Save submission (postwork/final project)
  const saveSubmission = useCallback((type, submissionData) => {
    updateProgress({
      submissions: {
        ...progress.submissions,
        [type]: {
          ...submissionData,
          submittedAt: new Date().toISOString()
        }
      }
    });
  }, [progress.submissions, updateProgress]);

  // Mark course as completed - only when all steps are actually completed
  const markCourseCompleted = useCallback(() => {
    const allSteps = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
    const allStepsCompleted = allSteps.every(step => progress.completedSteps.includes(step));
    
    if (allStepsCompleted) {
      updateProgress({
        completedAt: new Date().toISOString(),
        isCompleted: true
      });
    } else {
      console.warn('Cannot mark course as completed - not all steps are finished:', {
        completedSteps: progress.completedSteps,
        missingSteps: allSteps.filter(step => !progress.completedSteps.includes(step))
      });
    }
  }, [updateProgress, progress.completedSteps]);

  // Calculate completion percentage with dynamic weighted steps
  const getCompletionPercentage = useCallback(() => {
    // Use dynamic step weights from course configuration or default weights
    let stepWeights = {
      'intro': 5,
      'pretest': 10,
      'lessons': 50,
      'posttest': 15,
      'postwork': 10,
      'finalproject': 10
    };
    
    // Override with course-specific weights if available
    if (courseConfig && courseConfig.stepWeights) {
      stepWeights = { ...stepWeights, ...courseConfig.stepWeights };
    }
    
    let totalProgress = 0;
    progress.completedSteps.forEach(step => {
      if (stepWeights[step]) {
        totalProgress += stepWeights[step];
      }
    });
    
    return Math.min(totalProgress, 100);
  }, [progress.completedSteps, courseConfig]);

  // Check if course is completed based on course configuration
  const isCourseCompleted = useCallback(() => {
    // Get required steps based on course configuration
    let requiredSteps = ['intro', 'pretest', 'lessons', 'posttest'];
    
    // Add optional steps if enabled in course configuration
    if (courseConfig?.hasPostWork) {
      requiredSteps.push('postwork');
    }
    if (courseConfig?.hasFinalProject) {
      requiredSteps.push('finalproject');
    }
    
    return requiredSteps.every(step => progress.completedSteps.includes(step));
  }, [progress.completedSteps, courseConfig]);

  // Get time spent in course (in minutes)
  const getTimeSpent = useCallback(() => {
    if (!progress.startedAt) return 0;
    const start = new Date(progress.startedAt);
    const end = progress.completedAt ? new Date(progress.completedAt) : new Date();
    return Math.round((end - start) / (1000 * 60)); // minutes
  }, [progress.startedAt, progress.completedAt]);

  // Reset progress (untuk testing atau restart course)
  const resetProgress = useCallback(async () => {
    const initialProgress = {
      currentStep: 'intro',
      completedSteps: [],
      lessonProgress: {},
      quizScores: {},
      submissions: {},
      lastAccessed: new Date().toISOString(),
      totalTimeSpent: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      isCompleted: false
    };
    
    setProgress(initialProgress);
    
    // No localStorage to clear, only sync reset to backend
    if (courseId && currentUser) {
      try {
        await syncProgress({
          courseId: parseInt(courseId),
          currentStep: initialProgress.currentStep,
          completedSteps: initialProgress.completedSteps,
          lessonProgress: initialProgress.lessonProgress,
          quizScores: initialProgress.quizScores,
          submissions: initialProgress.submissions,
          totalTimeSpent: initialProgress.totalTimeSpent,
          completedAt: initialProgress.completedAt
        });
      } catch (error) {
        console.error('Failed to reset progress in backend:', error);
      }
    }
  }, [courseId, currentUser]);

  // Load course configuration and progress from backend
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId || !currentUser?.id) return;
      
      try {
        setIsLoading(true);
          const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev' 
        : 'http://localhost:8080';
        // Load course configuration and progress in parallel
        const [progressResponse, courseResponse] = await Promise.all([
          getCourseProgress(courseId),
          fetch(`${backendUrl}/api/public/courses/${courseId}`).then(res => res.json())
        ]);
        
        // Set course configuration
        if (courseResponse && courseResponse.success && courseResponse.data) {
          const course = courseResponse.data;
          setCourseConfig({
            hasPostWork: course.hasPostWork,
            hasFinalProject: course.hasFinalProject,
            certificateDelay: course.certificateDelay,
            stepWeights: course.stepWeights
          });
        }
        
        // Set progress data
        if (progressResponse && progressResponse.success && progressResponse.data) {
          const backendProgress = progressResponse.data;
          const progressData = {
            currentStep: backendProgress.currentStep || 'intro',
            completedSteps: backendProgress.completedSteps || [],
            lessonProgress: backendProgress.lessonProgress || {},
            quizScores: backendProgress.quizScores || {},
            submissions: backendProgress.submissions || {},
            lastAccessed: new Date().toISOString(),
            totalTimeSpent: backendProgress.totalTimeSpent || 0,
            startedAt: backendProgress.startedAt || new Date().toISOString(),
            completedAt: backendProgress.completedAt || null,
            isCompleted: backendProgress.completedAt ? true : false
          };
          setProgress(progressData);
        } else {
          // No existing progress found, initialize new progress
          const initialProgress = {
            currentStep: 'intro',
            completedSteps: [],
            lessonProgress: {},
            quizScores: {},
            submissions: {},
            lastAccessed: new Date().toISOString(),
            totalTimeSpent: 0,
            startedAt: new Date().toISOString(),
            completedAt: null,
            isCompleted: false
          };
          setProgress(initialProgress);
        }
      } catch (error) {
        console.error('Failed to load course data from backend:', error);
        // Fallback to default progress if backend fails
        setProgress({
          currentStep: 'intro',
          completedSteps: [],
          lessonProgress: {},
          quizScores: {},
          submissions: {},
          lastAccessed: new Date().toISOString(),
          totalTimeSpent: 0,
          startedAt: new Date().toISOString(),
          completedAt: null,
          isCompleted: false
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourseData();
  }, [courseId, currentUser?.id]);

  // Auto-save progress to backend only, no localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSaveStatus === 'pending') {
        setProgress(currentProgress => {
          if (currentProgress.lastAccessed) {
            // Only sync to backend, no localStorage
            saveProgress(currentProgress);
          }
          return currentProgress;
        });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [saveProgress, autoSaveStatus]);

  return {
    progress,
    courseConfig,
    isLoading,
    autoSaveStatus,
    updateProgress,
    markStepCompleted,
    setCurrentStep,
    updateLessonProgress,
    saveQuizScore,
    saveSubmission,
    markCourseCompleted,
    getCompletionPercentage,
    isCourseCompleted,
    getTimeSpent,
    resetProgress
  };
};

export default useLearningProgress;