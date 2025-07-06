import { useState, useEffect, useCallback } from 'react';
import { syncProgress, getCourseProgress, updateLessonProgress, getUserEnrollments } from '../services/api';

export const useProgress = (courseId = null) => {
  const [progress, setProgress] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Load course progress
  const loadCourseProgress = useCallback(async (targetCourseId) => {
    const courseIdToLoad = targetCourseId || courseId;
    if (!courseIdToLoad) return;

    setLoading(true);
    setError(null);
    try {
      const progressData = await getCourseProgress(courseIdToLoad);
      setProgress(progressData);
      return progressData;
    } catch (err) {
      setError('Failed to load course progress');
      console.error('Error loading course progress:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Load user enrollments with progress
  const loadEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const enrollmentData = await getUserEnrollments();
      // Process the response from the updated backend
      let enrollmentsData = [];
      if (enrollmentData && enrollmentData.data && Array.isArray(enrollmentData.data)) {
        enrollmentsData = enrollmentData.data;
      } else if (enrollmentData && Array.isArray(enrollmentData)) {
        enrollmentsData = enrollmentData;
      }
      setEnrollments(enrollmentsData);
      return enrollmentsData;
    } catch (err) {
      setError('Failed to load enrollments');
      console.error('Error loading enrollments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update lesson progress
  const updateLesson = useCallback(async (lessonData) => {
    try {
      const response = await updateLessonProgress(lessonData);
      
      // Reload course progress after lesson update
      if (courseId) {
        await loadCourseProgress(courseId);
      }
      
      return response;
    } catch (err) {
      setError('Failed to update lesson progress');
      console.error('Error updating lesson progress:', err);
      throw err;
    }
  }, [courseId, loadCourseProgress]);

  // Sync progress from frontend to backend
  const syncProgressData = useCallback(async (progressData) => {
    setSyncing(true);
    setError(null);
    try {
      const response = await syncProgress(progressData);
      
      // Reload progress after sync
      if (progressData.courseId) {
        await loadCourseProgress(progressData.courseId);
      }
      
      // Reload enrollments to get updated progress
      await loadEnrollments();
      
      return response;
    } catch (err) {
      setError('Failed to sync progress');
      console.error('Error syncing progress:', err);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [loadCourseProgress, loadEnrollments]);

  // Calculate overall progress based on completed steps
  const calculateProgress = useCallback((completedSteps, totalSteps) => {
    if (!totalSteps || totalSteps === 0) return 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }, []);

  // Get progress for specific enrollment
  const getEnrollmentProgress = useCallback((targetCourseId) => {
    const courseIdToFind = targetCourseId || courseId;
    if (!courseIdToFind) return null;
    
    return enrollments.find(enrollment => 
      enrollment.id === parseInt(courseIdToFind) || enrollment.course_id === parseInt(courseIdToFind)
    ) || null;
  }, [enrollments, courseId]);

  // Check if course is completed
  const isCourseCompleted = useCallback((targetCourseId) => {
    const courseIdToCheck = targetCourseId || courseId;
    if (!courseIdToCheck) return false;
    
    const enrollment = getEnrollmentProgress(courseIdToCheck);
    return enrollment ? enrollment.overall_progress >= 100 : false;
  }, [courseId, getEnrollmentProgress]);

  // Auto-sync progress when course data changes
  const autoSyncProgress = useCallback(async (courseData) => {
    if (!courseData || !courseData.courseId) return;

    const progressPayload = {
      courseId: courseData.courseId,
      currentStep: courseData.currentStep || 0,
      completedSteps: courseData.completedSteps || 0,
      lessonProgress: courseData.lessonProgress || {},
      quizScores: courseData.quizScores || {},
      submissions: courseData.submissions || {},
      totalTimeSpent: courseData.totalTimeSpent || 0,
      completedAt: courseData.completedAt || null
    };

    try {
      await syncProgressData(progressPayload);
    } catch (err) {
      console.error('Auto-sync failed:', err);
    }
  }, [syncProgressData]);

  // Load initial data on mount
  useEffect(() => {
    loadEnrollments();
    if (courseId) {
      loadCourseProgress(courseId);
    }
  }, [courseId, loadEnrollments, loadCourseProgress]);

  return {
    progress,
    enrollments,
    loading,
    error,
    syncing,
    loadCourseProgress,
    loadEnrollments,
    updateLesson,
    syncProgressData,
    autoSyncProgress,
    calculateProgress,
    getEnrollmentProgress,
    isCourseCompleted,
    clearError: () => setError(null)
  };
};

export default useProgress;