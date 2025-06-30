import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
        setProgress(prev => ({
          ...prev,
          ...parsedProgress,
          lastAccessed: new Date().toISOString()
        }));
      } else {
        // Initialize new progress
        const newProgress = {
          ...progress,
          startedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        };
        setProgress(newProgress);
        localStorage.setItem(storageKey, JSON.stringify(newProgress));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  // Save progress ke localStorage
  const saveProgress = useCallback((newProgress) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      setAutoSaveStatus('saving');
      const progressToSave = {
        ...newProgress,
        lastAccessed: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(progressToSave));
      setAutoSaveStatus('saved');
      
      // Reset status setelah 2 detik
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setAutoSaveStatus('error');
    }
  }, [getStorageKey]);

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
    updateProgress({
      completedSteps: [...new Set([...progress.completedSteps, stepId])]
    });
  }, [progress.completedSteps, updateProgress]);

  // Set current step
  const setCurrentStep = useCallback((stepId) => {
    updateProgress({ currentStep: stepId });
  }, [updateProgress]);

  // Update lesson progress
  const updateLessonProgress = useCallback((lessonId, progressData) => {
    updateProgress({
      lessonProgress: {
        ...progress.lessonProgress,
        [lessonId]: {
          ...progress.lessonProgress[lessonId],
          ...progressData,
          lastAccessed: new Date().toISOString()
        }
      }
    });
  }, [progress.lessonProgress, updateProgress]);

  // Save quiz score
  const saveQuizScore = useCallback((quizId, score, isPreTest = false) => {
    const quizKey = isPreTest ? `pretest_${quizId}` : `posttest_${quizId}`;
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
  }, [loadProgress]);

  // Auto-save setiap 30 detik jika ada perubahan
  useEffect(() => {
    const interval = setInterval(() => {
      if (progress.lastAccessed) {
        saveProgress(progress);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [progress, saveProgress]);

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