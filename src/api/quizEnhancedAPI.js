// Enhanced Quiz API for improved pretest and posttest functionality

const API_BASE_URL = 'http://localhost:8080/api/protected';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create headers with authentication
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Enhanced Quiz API functions
export const quizEnhancedAPI = {
  // Get quiz by course and type (pretest/posttest)
  getQuiz: async (courseId, type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/quiz/${type}`, {
        method: 'GET',
        headers: createHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting quiz:', error);
      throw error;
    }
  },

  // Start a new quiz attempt
  startQuizAttempt: async (courseId, type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/quiz/${type}/start`, {
        method: 'POST',
        headers: createHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  },

  // Submit quiz attempt
  submitQuizAttempt: async (attemptId, answers, timeSpent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          answers: answers,
          timeSpent: timeSpent
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Get quiz attempts for a course and type
  getQuizAttempts: async (courseId, type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/quiz/${type}/attempts`, {
        method: 'GET',
        headers: createHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting quiz attempts:', error);
      throw error;
    }
  },

  // Get detailed quiz result
  getQuizResult: async (attemptId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/attempts/${attemptId}/result`, {
        method: 'GET',
        headers: createHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error getting quiz result:', error);
      throw error;
    }
  }
};

export default quizEnhancedAPI;