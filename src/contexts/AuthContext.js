'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, courseAPI, apiUtils, getUserEnrollments, getCourseProgress } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function untuk handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  return { success: false, error: error.message || 'Terjadi kesalahan pada server' };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Course management functions - defined before useEffect
  const refreshCourses = useCallback(async () => {
    try {
      const coursesData = await courseAPI.getAllCourses();
      console.log('Courses data received:', coursesData);
      setCourses(coursesData.data || coursesData.courses || []);
      // Remove localStorage caching
    } catch (error) {
      console.error('Failed to refresh courses:', error);
    }
  }, []);

  const getCourseById = useCallback(async (courseId) => {
    try {
      // Always fetch fresh data from backend, no memory cache
      const response = await courseAPI.getCourseById(courseId);
      // Handle different response formats from backend
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.course) {
        return response.course;
      } else if (response && (response.id || response.title)) {
        return response;
      }
      console.warn('Unexpected course response format:', response);
      return null;
    } catch (error) {
      console.error('Failed to get course by ID:', error);
      return null;
    }
  }, []);

  // Load user data and courses on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated and verify with API
        if (apiUtils.isAuthenticated()) {
          try {
            const userProfile = await authAPI.getProfile();
            const userData = userProfile.data || userProfile.user || userProfile;
            setCurrentUser(userData);
            
            // Always fetch fresh data from backend, no cache
            await refreshCourses();
            
            // Load user enrollments using the updated API
            const userEnrollments = await getUserEnrollments();
            
            // Process the response from the updated backend
            let enrollmentsData = [];
            if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
              enrollmentsData = userEnrollments.data;
            } else if (userEnrollments && Array.isArray(userEnrollments)) {
              enrollmentsData = userEnrollments;
            }
            setEnrollments(enrollmentsData);
          } catch (error) {
            console.error('Failed to load user profile:', error);
            // Clear invalid token and user data
            apiUtils.clearAuthData();
            setCurrentUser(null);
            setEnrollments([]);
          }
        } else {
          // No valid token, clear any stored user data
          setCurrentUser(null);
          setEnrollments([]);
        }
        
        // Always load courses from API
        await refreshCourses();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [refreshCourses]);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      
      // Check if login was successful and we have user data
      if (response && response.success && response.data && response.data.user && response.data.token) {
        setCurrentUser(response.data.user);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        
        // Load user enrollments after login using the updated API
        try {
          const userEnrollments = await getUserEnrollments();
          
          // Process the response from the updated backend
          let enrollmentsData = [];
          if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
            enrollmentsData = userEnrollments.data;
          } else if (userEnrollments && Array.isArray(userEnrollments)) {
            enrollmentsData = userEnrollments;
          }
          setEnrollments(enrollmentsData);
        } catch (error) {
          console.error('Failed to load enrollments:', error);
          setEnrollments([]);
        }
        
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Login gagal' };
    } catch (error) {
      return handleApiError(error);
    }
  };

  const logout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setEnrollments([]);
    localStorage.removeItem('currentUser');
  };

  // Functions moved above useEffect to fix initialization order

  const enrollInCourse = async (courseId) => {
    if (!currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    // Check if already enrolled
    if (isEnrolledInCourse(courseId)) {
      return { success: true, message: 'Already enrolled' };
    }

    try {
      const result = await courseAPI.enrollInCourse(courseId);
      
      // Refresh enrollments after successful enrollment using the updated API
      const userEnrollments = await getUserEnrollments();
      
      // Process the response from the updated backend
      let enrollmentsData = [];
      if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
        enrollmentsData = userEnrollments.data;
      } else if (userEnrollments && Array.isArray(userEnrollments)) {
        enrollmentsData = userEnrollments;
      }
      setEnrollments(enrollmentsData);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Enrollment error:', error);
      
      // Handle "Already enrolled" error gracefully
      if (error.message && error.message.includes('Already enrolled')) {
        // Refresh enrollments to sync state using the updated API
        const userEnrollments = await getUserEnrollments();
        
        // Process the response from the updated backend
        let enrollmentsData = [];
        if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
          enrollmentsData = userEnrollments.data;
        } else if (userEnrollments && Array.isArray(userEnrollments)) {
          enrollmentsData = userEnrollments;
        }
        setEnrollments(enrollmentsData);
        
        return { success: true, message: 'Already enrolled' };
      }
      
      return { success: false, error: error.message };
    }
  };

  const searchCourses = async (query) => {
    try {
      const response = await courseAPI.searchCourses(query);
      return response.data || response.courses || [];
    } catch (error) {
      console.error('Failed to search courses:', error);
      // Fallback to local search
      return courses.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  };

  const isEnrolledInCourse = (courseId) => {
    if (!Array.isArray(enrollments)) return false;
    return enrollments.some(enrollment => 
      enrollment.id === parseInt(courseId) || enrollment.course_id === parseInt(courseId)
    );
  };

  const getUserProgress = async (courseId) => {
    if (!Array.isArray(enrollments)) return 0;
    
    // First check if user is enrolled
    const enrollment = enrollments.find(e => 
      e.id === parseInt(courseId) || e.course_id === parseInt(courseId)
    );
    
    if (!enrollment) return 0;
    
    // Try to get real-time progress from backend
    try {
      const progressData = await getCourseProgress(courseId);
      if (progressData && progressData.data) {
        return progressData.data.overallProgress || 0;
      }
    } catch (error) {
      console.warn('Failed to get real-time progress, using cached:', error);
    }
    
    // Fallback to cached progress from enrollment
    return enrollment.progress || 0;
  };
  
  // Synchronous version for immediate UI updates
  const getUserProgressSync = (courseId) => {
    if (!Array.isArray(enrollments)) return 0;
    const enrollment = enrollments.find(e => 
      e.id === parseInt(courseId) || e.course_id === parseInt(courseId)
    );
    return enrollment ? (enrollment.progress || 0) : 0;
  };
  
  // Refresh user enrollments and progress
  const refreshUserProgress = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const userEnrollments = await getUserEnrollments();
      
      let enrollmentsData = [];
      if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
        enrollmentsData = userEnrollments.data;
      } else if (userEnrollments && Array.isArray(userEnrollments)) {
        enrollmentsData = userEnrollments;
      }
      
      // Just set enrollments without fetching individual progress to prevent infinite loops
      // Individual progress will be fetched on-demand when needed
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Failed to refresh user progress:', error);
    }
  }, [currentUser]); // Only depend on currentUser to prevent infinite loops

  // Get pre-test for a course
  const getCoursePreTest = async (courseId) => {
    try {
      // Use admin endpoint if user is admin
      if (currentUser && currentUser.role === 'admin') {
        const { adminAPI } = await import('../services/api');
        const response = await adminAPI.getCoursePreTestAdmin(courseId);
        return response.data || response;
      } else {
        // Check if user is enrolled, if not, try to enroll first
        if (!isEnrolledInCourse(courseId)) {
          console.log('User not enrolled in course, attempting auto-enrollment...');
          await enrollInCourse(courseId);
        }
        const response = await courseAPI.getCoursePreTest(courseId);
        return response.quiz || response;
      }
    } catch (error) {
      console.error('Failed to get pre-test:', error);
      // If still failing and user is not admin, try admin endpoint as fallback
      if (currentUser && currentUser.role !== 'admin') {
        try {
          const { adminAPI } = await import('../services/api');
          const response = await adminAPI.getCoursePreTestAdmin(courseId);
          return response.data || response;
        } catch (adminError) {
          console.error('Admin fallback also failed:', adminError);
        }
      }
      return null;
    }
  };

  // Get post-test for a course
  const getCoursePostTest = async (courseId) => {
    try {
      // Use admin endpoint if user is admin
      if (currentUser && currentUser.role === 'admin') {
        const { adminAPI } = await import('../services/api');
        const response = await adminAPI.getCoursePostTestAdmin(courseId);
        return response.data || response;
      } else {
        // Check if user is enrolled, if not, try to enroll first
        if (!isEnrolledInCourse(courseId)) {
          console.log('User not enrolled in course, attempting auto-enrollment...');
          await enrollInCourse(courseId);
        }
        const response = await courseAPI.getCoursePostTest(courseId);
        return response.quiz || response;
      }
    } catch (error) {
      console.error('Failed to get post-test:', error);
      // If still failing and user is not admin, try admin endpoint as fallback
      if (currentUser && currentUser.role !== 'admin') {
        try {
          const { adminAPI } = await import('../services/api');
          const response = await adminAPI.getCoursePostTestAdmin(courseId);
          return response.data || response;
        } catch (adminError) {
          console.error('Admin fallback also failed:', adminError);
        }
      }
      return null;
    }
  };

  // Update course function for admin operations
  const updateCourse = async (courseId, updatedCourse) => {
    try {
      // Update local state immediately for better UX
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId ? { ...course, ...updatedCourse } : course
        )
      );
      
      // If user is admin, try to update via API
      if (currentUser && currentUser.role === 'admin') {
        const { adminAPI } = await import('../services/api');
        await adminAPI.updateCourse(courseId, updatedCourse);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update course:', error);
      // Revert local state on error
      await refreshCourses();
      return { success: false, error: error.message };
    }
  };

  // Stage Lock Management Functions
  const getStageLocks = async (courseId) => {
    try {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Only admin can access stage locks');
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use backend URL directly to avoid routing issues
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev' 
        : 'http://localhost:8080';
      
      const response = await fetch(`${backendUrl}/api/protected/admin/courses/${courseId}/stage-locks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to fetch stage locks');
      }
    } catch (error) {
      console.error('Error fetching stage locks:', error);
      return { success: false, error: error.message };
    }
  };

  const updateStageLock = async (courseId, stageName, isLocked, lockMessage = '') => {
    try {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Only admin can update stage locks');
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestBody = {
        courseId: parseInt(courseId),
        stageName: stageName,
        isLocked: isLocked,
        lockMessage: lockMessage
      };

      // Use backend URL directly to avoid routing issues
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev' 
        : 'http://localhost:8080';

      const response = await fetch(`${backendUrl}/api/protected/admin/courses/${courseId}/stage-locks`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to update stage lock');
      }
    } catch (error) {
      console.error('Error updating stage lock:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading,
    courses,
    enrollments,
    refreshCourses,
    getCourseById,
    enrollInCourse,
    searchCourses,
    isEnrolledInCourse,
    getUserProgress,
    getUserProgressSync,
    refreshUserProgress,
    getCoursePreTest,
    getCoursePostTest,
    updateCourse,
    getStageLocks,
    updateStageLock
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};