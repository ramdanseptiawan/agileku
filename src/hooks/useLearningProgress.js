import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { syncProgress, updateLessonProgress as apiUpdateLessonProgress } from '../services/api';

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
    completedAt: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Generate storage key untuk user dan course tertentu
  const getStorageKey = useCallback(() => {
    if (!currentUser || !courseId) return null;
    return `learning_progress_${currentUser.id}_${courseId}`;
  }, [currentUser, courseId]);

  // Load progress dari localStorage
  const loadProgress = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setIsLoading(false);
      return;
    }

    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        console.log('Loading progress for course:', courseId, parsedProgress);
        setProgress(prev => ({
          ...prev,
          ...parsedProgress,
          lastAccessed: new Date().toISOString()
        }));
      } else {
        console.log('No saved progress found for course:', courseId);
        // Initialize new progress
        const newProgress = {
          currentStep: 'intro',
          completedSteps: [],
          lessonProgress: {},
          quizScores: {},
          submissions: {},
          lastAccessed: new Date().toISOString(),
          totalTimeSpent: 0,
          startedAt: new Date().toISOString(),
          completedAt: null
        };
        setProgress(newProgress);
        localStorage.setItem(storageKey, JSON.stringify(newProgress));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey, courseId]);

  // Save progress ke localStorage dan sync ke backend
  const saveProgress = useCallback(async (newProgress) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      setAutoSaveStatus('saving');
      const progressToSave = {
        ...newProgress,
        lastAccessed: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(progressToSave));
      
      // Sync to backend if courseId is available
      if (courseId && currentUser) {
        try {
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
        } catch (syncError) {
          console.warn('Failed to sync progress to backend:', syncError);
          // Continue with local save even if backend sync fails
        }
      }
      
      setAutoSaveStatus('saved');
      
      // Reset status setelah 2 detik
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setAutoSaveStatus('error');
    }
  }, [getStorageKey, courseId, currentUser]);

  // Update progress dengan auto-save
  const updateProgress = useCallback((updates) => {
    setProgress(prev => {
      const newProgress = { ...prev, ...updates };
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
      saveProgress(newProgress);
      return newProgress;
    });
    
    // Also update lesson progress in backend
    if (courseId && currentUser && progressData.progress !== undefined) {
      try {
        await apiUpdateLessonProgress({
          courseId: parseInt(courseId),
          lessonId: parseInt(lessonId),
          progress: progressData.progress || 0,
          completed: progressData.completed || false,
          timeSpent: progressData.timeSpent || 0
        });
      } catch (error) {
        console.warn('Failed to update lesson progress in backend:', error);
      }
    }
   }, [saveProgress, courseId, currentUser]);

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

  // Mark course as completed
  const markCourseCompleted = useCallback(() => {
    updateProgress({
      completedAt: new Date().toISOString()
    });
  }, [updateProgress]);

  // Calculate completion percentage
  const getCompletionPercentage = useCallback(() => {
    const totalSteps = 6; // intro, pretest, lessons, posttest, postwork, finalproject
    return Math.round((progress.completedSteps.length / totalSteps) * 100);
  }, [progress.completedSteps]);

  // Check if course is completed
  const isCourseCompleted = useCallback(() => {
    const requiredSteps = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
    return requiredSteps.every(step => progress.completedSteps.includes(step));
  }, [progress.completedSteps]);

  // Get time spent in course (in minutes)
  const getTimeSpent = useCallback(() => {
    if (!progress.startedAt) return 0;
    const start = new Date(progress.startedAt);
    const end = progress.completedAt ? new Date(progress.completedAt) : new Date();
    return Math.round((end - start) / (1000 * 60)); // minutes
  }, [progress.startedAt, progress.completedAt]);

  // Reset progress (untuk testing atau restart course)
  const resetProgress = useCallback(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
      setProgress({
        currentStep: 'intro',
        completedSteps: [],
        lessonProgress: {},
        quizScores: {},
        submissions: {},
        lastAccessed: null,
        totalTimeSpent: 0,
        startedAt: null,
        completedAt: null
      });
    }
  }, [getStorageKey]);

  // Load progress saat component mount
  useEffect(() => {
    loadProgress();
  }, [courseId, currentUser]); // Only depend on courseId and currentUser to prevent infinite loop

  // Auto-save setiap 30 detik jika ada perubahan dan status bukan 'saved'
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSaveStatus === 'pending') {
        setProgress(currentProgress => {
          if (currentProgress.lastAccessed) {
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