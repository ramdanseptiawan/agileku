const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Survey API
export const submitSurveyFeedback = async (surveyData) => {
  return makeRequest('/surveys/feedback', {
    method: 'POST',
    body: JSON.stringify(surveyData),
  });
};

// Progress API
export const syncProgress = async (progressData) => {
  return makeRequest('/progress/sync', {
    method: 'POST',
    body: JSON.stringify(progressData),
  });
};

export const getUserEnrollments = async () => {
  return makeRequest('/courses/enrollments');
};

export const getCourseProgress = async (courseId) => {
  return makeRequest(`/progress/course/${courseId}`);
};

export const updateLessonProgress = async (progressData) => {
  return makeRequest('/progress/lesson', {
    method: 'POST',
    body: JSON.stringify(progressData),
  });
};

// Certificate API
export const generateCertificate = async (courseId) => {
  return makeRequest('/certificates/generate', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
};

export const getUserCertificates = async () => {
  return makeRequest('/certificates/user');
};

export const verifyCertificate = async (certNumber) => {
  return makeRequest(`/certificates/verify/${certNumber}`);
};

// Course API
export const getCourses = async () => {
  return makeRequest('/courses');
};

export const getCourseById = async (courseId) => {
  return makeRequest(`/courses/${courseId}`);
};

export const enrollCourse = async (courseId) => {
  return makeRequest('/courses/enroll', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
};

// Auth API
export const login = async (credentials) => {
  return makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const register = async (userData) => {
  return makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const logout = async () => {
  return makeRequest('/auth/logout', {
    method: 'POST',
  });
};

// User API
export const getUserProfile = async () => {
  return makeRequest('/user/profile');
};

export const updateUserProfile = async (userData) => {
  return makeRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// Quiz API
export const getQuiz = async (quizId) => {
  return makeRequest(`/quizzes/${quizId}`);
};

export const submitQuizAttempt = async (quizData) => {
  return makeRequest('/quizzes/attempt', {
    method: 'POST',
    body: JSON.stringify(quizData),
  });
};

// Submission API
export const submitPostwork = async (submissionData) => {
  return makeRequest('/submissions/postwork', {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
};

export const submitFinalProject = async (submissionData) => {
  return makeRequest('/submissions/final-project', {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
};

export const getSubmissions = async (courseId) => {
  return makeRequest(`/submissions/course/${courseId}`);
};