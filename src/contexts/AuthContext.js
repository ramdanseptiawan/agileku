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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First, try to restore user from localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser && apiUtils.isAuthenticated()) {
          try {
            const userData = JSON.parse(storedUser);
            setCurrentUser(userData);
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            localStorage.removeItem('currentUser');
          }
        }

        // Load courses from API
        try {
          const response = await courseAPI.getAllCourses();
          
          // Handle different response formats
          let coursesData;
          if (response && response.success && Array.isArray(response.data)) {
            coursesData = response.data;
          } else if (response && Array.isArray(response.courses)) {
            coursesData = response.courses;
          } else if (Array.isArray(response)) {
            coursesData = response;
          } else {
            console.warn('Unexpected courses data format:', response);
            coursesData = [];
          }
          
          setCourses(coursesData);
        } catch (error) {
          console.error('Failed to fetch courses:', error);
          setCourses([]);
        }

        // Check if user is authenticated and verify with API
        if (apiUtils.isAuthenticated()) {
          try {
            const userProfile = await authAPI.getProfile();
            const userData = userProfile.data || userProfile.user || userProfile;
            setCurrentUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
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
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

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

  // Course management functions
  const refreshCourses = async () => {
    try {
      const coursesData = await courseAPI.getAllCourses();
      setCourses(coursesData.courses || []);
    } catch (error) {
      console.error('Failed to refresh courses:', error);
    }
  };

  const getCourseById = async (courseId) => {
    try {
      const response = await courseAPI.getCourseById(courseId);
      return response.course;
    } catch (error) {
      console.error('Failed to get course:', error);
      // Fallback to local data
      return courses.find(course => course.id === parseInt(courseId));
    }
  };

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
      return response.courses || [];
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
    updateCourse
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};