// API service untuk berkomunikasi dengan backend

// API Base URLs for different environments
const PRODUCTION_API_URL = 'https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev';
const DEVELOPMENT_API_URL = 'http://localhost:8080';

// Determine current environment and set API base URL
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : `${isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL}/api`;

// Helper function untuk membuat request dengan error handling
const apiRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const config = {
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('Making API request to:', `${API_BASE_URL}${url}`);
    console.log('Request config:', config);
    
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response data:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    return responseData;
  } catch (error) {
    console.error('API Request Error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (username, password) => {
    const response = await apiRequest('/public/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Handle response structure: {success: true, data: {user, token}}
    if (response.success && response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      return response; // Return full response with success flag
    }
    
    return response;
  },

  // Register user
  register: async (userData) => {
    return await apiRequest('/public/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/protected/user/profile');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return await apiRequest('/protected/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Logout (clear token)
  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// Submission API
export const submissionAPI = {
  // Upload file - implementasi baru yang sederhana
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/protected/uploads/file`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }
    
    return await response.json();
  },

  // Get file by ID
  getFile: async (fileId) => {
    return await apiRequest(`/protected/uploads/file/${fileId}`);
  },

  // Create postwork submission
  createPostWorkSubmission: async (submissionData) => {
    return await apiRequest('/protected/submissions/postwork', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  // Get postwork submissions
  getPostWorkSubmissions: async (courseId = null) => {
    const url = courseId 
      ? `/protected/submissions/postwork?courseId=${courseId}`
      : '/protected/submissions/postwork';
    return await apiRequest(url);
  },

  // Create final project submission
  createFinalProjectSubmission: async (submissionData) => {
    return await apiRequest('/protected/submissions/finalproject', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  // Get final project submission
  getFinalProjectSubmission: async (courseId) => {
    return await apiRequest(`/protected/submissions/finalproject/${courseId}`);
  },
};

// Course API
export const courseAPI = {
  // Get all courses (public)
  getAllCourses: async () => {
    return await apiRequest('/public/courses');
  },

  // Get course by ID (public)
  getCourseById: async (courseId) => {
    return await apiRequest(`/public/courses/${courseId}`);
  },

  // Search courses (public)
  searchCourses: async (query) => {
    return await apiRequest(`/public/courses/search?q=${encodeURIComponent(query)}`);
  },

  // Get courses with enrollment status (protected)
  getCoursesWithEnrollment: async () => {
    return await apiRequest('/protected/courses');
  },

  // Enroll in course (protected)
  enrollInCourse: async (courseId) => {
    try {
      return await apiRequest('/protected/courses/enroll', {
        method: 'POST',
        body: JSON.stringify({ courseId: parseInt(courseId) }),
      });
    } catch (error) {
      // Handle "Already enrolled" case gracefully
      if (error.message && error.message.includes('Already enrolled')) {
        return { success: true, message: 'Already enrolled' };
      }
      throw error;
    }
  },

  // Get user enrollments (protected) - updated to use the fixed endpoint
  getUserEnrollments: async () => {
    return await apiRequest('/protected/courses/enrollments');
  },
  
  // Get pre-test for a course (protected)
  getCoursePreTest: async (courseId) => {
    return await apiRequest(`/protected/courses/${courseId}/pretest`);
  },
  
  // Get post-test for a course (protected)
  getCoursePostTest: async (courseId) => {
    return await apiRequest(`/protected/courses/${courseId}/posttest`);
  },

  // Check stage access (protected)
  checkStageAccess: async (courseId, stageName) => {
    return await apiRequest(`/protected/courses/${courseId}/stages/${stageName}/access`);
  },
};

// Quiz API
export const quizAPI = {
  // Get quiz by ID
  getQuiz: async (quizId) => {
    return await apiRequest(`/protected/quizzes/${quizId}`);
  },

  // Get quizzes by course
  getQuizzesByCourse: async (courseId) => {
    return await apiRequest(`/protected/courses/${courseId}/quizzes`);
  },

  // Start quiz attempt
  startQuizAttempt: async (quizId) => {
    return await apiRequest(`/protected/quizzes/${quizId}/start`, {
      method: 'POST',
    });
  },

  // Submit quiz
  submitQuiz: async (submissionData) => {
    return await apiRequest('/protected/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  // Get quiz attempts
  getQuizAttempts: async (quizId) => {
    return await apiRequest(`/protected/quizzes/${quizId}/attempts`);
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // Test backend connectivity
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend connectivity test failed:', error);
      return false;
    }
  },
};

// Certificate API
export const certificateAPI = {
  // Request certificate for course completion
  requestCertificate: async (courseId) => {
    return await apiRequest(`/protected/courses/${courseId}/certificate`, {
      method: 'POST',
    });
  },

  // Get user certificates
  getUserCertificates: async () => {
    return await apiRequest('/protected/user/certificates');
  },

  // Verify certificate by certificate number
  verifyCertificate: async (certNumber) => {
    return await apiRequest(`/public/certificates/verify/${certNumber}`);
  },
};

// Admin API
export const adminAPI = {
  // Course Management
  getAllCourses: async () => {
    return await apiRequest('/protected/admin/courses');
  },

  createCourse: async (courseData) => {
    return await apiRequest('/protected/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  updateCourse: async (courseId, courseData) => {
    return await apiRequest(`/protected/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  deleteCourse: async (courseId) => {
    return await apiRequest(`/protected/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  // Grading System
  createGrade: async (gradeData) => {
    return await apiRequest('/protected/admin/grading', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  },

  getGrades: async () => {
    return await apiRequest('/protected/admin/grading');
  },

  // Submissions Review
  getCourseSubmissions: async (courseId) => {
    return await apiRequest(`/protected/admin/courses/${courseId}/submissions`);
  },

  // Certificate Management
  getAllCertificates: async () => {
    return await apiRequest('/protected/admin/certificates');
  },
  
  // Get pending certificates (admin only)
  getPendingCertificates: async () => {
    return await apiRequest('/protected/admin/certificates/pending');
  },
  
  // Approve certificate (admin only)
  approveCertificate: async (certificateId) => {
    return await apiRequest(`/protected/admin/certificates/${certificateId}/approve`, {
      method: 'POST'
    });
  },
  
  // Reject certificate (admin only)
  rejectCertificate: async (certificateId, reason) => {
    return await apiRequest(`/protected/admin/certificates/${certificateId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // User Management
  getAllUsers: async () => {
    return await apiRequest('/protected/admin/users');
  },
  
  createUser: async (userData) => {
    return await apiRequest('/protected/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  updateUser: async (userId, userData) => {
    return await apiRequest(`/protected/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  deleteUser: async (userId) => {
    return await apiRequest(`/protected/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Announcement Management
  createAnnouncement: async (announcementData) => {
    return await apiRequest('/protected/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  },

  getAllAnnouncements: async () => {
    return await apiRequest('/protected/admin/announcements');
  },

  getAnnouncementById: async (announcementId) => {
    return await apiRequest(`/protected/admin/announcements/${announcementId}`);
  },

  // Quiz Management (Admin - no enrollment check)
  getCoursePreTestAdmin: async (courseId) => {
    return await apiRequest(`/protected/admin/courses/${courseId}/pretest`);
  },

  getCoursePostTestAdmin: async (courseId) => {
    return await apiRequest(`/protected/admin/courses/${courseId}/posttest`);
  },

  // Quiz CRUD operations
  createQuiz: async (quizData) => {
    return await apiRequest('/protected/admin/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  updateQuiz: async (quizId, quizData) => {
    return await apiRequest(`/protected/admin/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  },

  deleteQuiz: async (quizId) => {
    return await apiRequest(`/protected/admin/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  },

  getAllQuizzes: async () => {
    return await apiRequest('/protected/admin/quizzes');
  },

  updateAnnouncement: async (announcementId, announcementData) => {
    return await apiRequest(`/protected/admin/announcements/${announcementId}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  },

  deleteAnnouncement: async (announcementId) => {
    return await apiRequest(`/protected/admin/announcements/${announcementId}`, {
      method: 'DELETE',
    });
  },

  // Dashboard Statistics
  getDashboardStats: async () => {
    return await apiRequest('/protected/admin/dashboard/stats');
  },

  // Stage Lock Management
  getStageLocks: async (courseId) => {
    return await apiRequest(`/protected/admin/courses/${courseId}/stage-locks`);
  },

  updateStageLock: async (courseId, stageLockData) => {
    return await apiRequest(`/protected/admin/courses/${courseId}/stage-locks`, {
      method: 'PUT',
      body: JSON.stringify(stageLockData),
    });
  },
};

// Announcement API for regular users
export const announcementAPI = {
  // Get announcements for current user based on their role
  getUserAnnouncements: async () => {
    return await apiRequest('/protected/announcements');
  },
};

// Survey Feedback API
export const surveyAPI = {
  // Submit survey feedback
  submitSurveyFeedback: async (surveyData) => {
    return await apiRequest('/protected/surveys/feedback', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  },

  // Get survey feedback for a course
  getSurveyFeedback: async (courseId) => {
    return await apiRequest(`/protected/surveys/feedback/${courseId}`);
  },
};

// Export the submitSurveyFeedback function directly for easier import
export const submitSurveyFeedback = surveyAPI.submitSurveyFeedback;

// Progress API
export const progressAPI = {
  // Sync progress data to backend
  syncProgress: async (progressData) => {
    return await apiRequest('/protected/progress/sync', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  },

  // Get course progress for a user
  getCourseProgress: async (courseId) => {
    return await apiRequest(`/protected/courses/${courseId}/progress`);
  },

  // Update lesson progress
  updateLessonProgress: async (progressData) => {
    return await apiRequest('/protected/progress/lesson', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  },

  // Get lesson progress
  getLessonProgress: async (courseId, lessonId) => {
    return await apiRequest(`/protected/courses/${courseId}/lessons/${lessonId}/progress`);
  },

  // Get user progress list
  getUserProgressList: async () => {
    return await apiRequest('/protected/progress');
  },
};

// Export progress functions directly for easier import
export const syncProgress = progressAPI.syncProgress;
export const getCourseProgress = progressAPI.getCourseProgress;
export const updateLessonProgress = progressAPI.updateLessonProgress;
export const getLessonProgress = progressAPI.getLessonProgress;
export const getUserProgressList = progressAPI.getUserProgressList;

// Export getUserEnrollments function directly for easier import
export const getUserEnrollments = courseAPI.getUserEnrollments;

// Export certificate functions directly for easier import
export const getUserCertificates = certificateAPI.getUserCertificates;
export const requestCertificate = certificateAPI.requestCertificate;

export default {
  auth: authAPI,
  course: courseAPI,
  submission: submissionAPI,
  quiz: quizAPI,
  certificate: certificateAPI,
  admin: adminAPI,
  announcement: announcementAPI,
  survey: surveyAPI,
  progress: progressAPI,
  utils: apiUtils,
};