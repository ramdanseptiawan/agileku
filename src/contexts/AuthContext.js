'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, courseAPI, apiUtils } from '../services/api';

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
            const userData = userProfile.user || userProfile;
            setCurrentUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Load user enrollments
            const userEnrollments = await courseAPI.getUserEnrollments();
            
            // Ensure enrollments is always an array and add course_id field
            let enrollmentsData = [];
            if (userEnrollments && userEnrollments.success && Array.isArray(userEnrollments.data)) {
              enrollmentsData = userEnrollments.data.map(enrollment => ({
                ...enrollment,
                course_id: enrollment.id // Map course id to course_id for consistency
              }));
            } else if (Array.isArray(userEnrollments)) {
              enrollmentsData = userEnrollments.map(enrollment => ({
                ...enrollment,
                course_id: enrollment.id
              }));
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
      if (response && response.user && response.token) {
        setCurrentUser(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        
        // Load user enrollments after login
        try {
          const userEnrollments = await courseAPI.getUserEnrollments();
          
          // Ensure enrollments is always an array and add course_id field
          let enrollmentsData = [];
          if (userEnrollments && userEnrollments.success && Array.isArray(userEnrollments.data)) {
            enrollmentsData = userEnrollments.data.map(enrollment => ({
              ...enrollment,
              course_id: enrollment.id // Map course id to course_id for consistency
            }));
          } else if (Array.isArray(userEnrollments)) {
            enrollmentsData = userEnrollments.map(enrollment => ({
              ...enrollment,
              course_id: enrollment.id
            }));
          }
          setEnrollments(enrollmentsData);
        } catch (error) {
          console.error('Failed to load enrollments:', error);
          setEnrollments([]);
        }
        
        return { success: true, user: response.user };
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
      
      // Refresh enrollments after successful enrollment
      const userEnrollments = await courseAPI.getUserEnrollments();
      
      // Ensure enrollments is always an array and add course_id field
      let enrollmentsData = [];
      if (userEnrollments && userEnrollments.success && Array.isArray(userEnrollments.data)) {
        enrollmentsData = userEnrollments.data.map(enrollment => ({
          ...enrollment,
          course_id: enrollment.id // Map course id to course_id for consistency
        }));
      } else if (Array.isArray(userEnrollments)) {
        enrollmentsData = userEnrollments.map(enrollment => ({
          ...enrollment,
          course_id: enrollment.id
        }));
      }
      setEnrollments(enrollmentsData);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Enrollment error:', error);
      
      // Handle "Already enrolled" error gracefully
      if (error.message && error.message.includes('Already enrolled')) {
        // Refresh enrollments to sync state
        const userEnrollments = await courseAPI.getUserEnrollments();
        
        // Ensure enrollments is always an array and add course_id field
        let enrollmentsData = [];
        if (userEnrollments && userEnrollments.success && Array.isArray(userEnrollments.data)) {
          enrollmentsData = userEnrollments.data.map(enrollment => ({
            ...enrollment,
            course_id: enrollment.id // Map course id to course_id for consistency
          }));
        } else if (Array.isArray(userEnrollments)) {
          enrollmentsData = userEnrollments.map(enrollment => ({
            ...enrollment,
            course_id: enrollment.id
          }));
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
    return enrollments.some(enrollment => enrollment.course_id === parseInt(courseId));
  };

  const getUserProgress = (courseId) => {
    if (!Array.isArray(enrollments)) return 0;
    const enrollment = enrollments.find(e => e.course_id === parseInt(courseId));
    return enrollment ? enrollment.progress : 0;
  };

  // Get pre-test for a course
  const getCoursePreTest = async (courseId) => {
    try {
      const response = await courseAPI.getCoursePreTest(courseId);
      return response.quiz || response;
    } catch (error) {
      console.error('Failed to get pre-test:', error);
      return null;
    }
  };

  // Get post-test for a course
  const getCoursePostTest = async (courseId) => {
    try {
      const response = await courseAPI.getCoursePostTest(courseId);
      return response.quiz || response;
    } catch (error) {
      console.error('Failed to get post-test:', error);
      return null;
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
    getCoursePreTest,
    getCoursePostTest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};