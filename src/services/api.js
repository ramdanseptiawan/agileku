// API service untuk berkomunikasi dengan backend
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function untuk membuat request dengan error handling
const apiRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
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
      return response.data; // Return {user, token}
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

  // Get user enrollments (protected)
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
};

export default {
  auth: authAPI,
  course: courseAPI,
  submission: submissionAPI,
  quiz: quizAPI,
  utils: apiUtils,
};