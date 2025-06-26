// localStorage utility functions for course management

const STORAGE_KEYS = {
  COURSES: 'courses', // Changed to match AuthContext
  COURSE_PROGRESS: 'agileku_course_progress',
  USER_SUBMISSIONS: 'agileku_user_submissions'
};

// Generic localStorage functions
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key ${key}:`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key ${key}:`, error);
    return false;
  }
};

// Course-specific functions
export const getAllCourses = () => {
  const courses = getFromStorage(STORAGE_KEYS.COURSES, []);
  // If no courses in localStorage, try to get from coursesData
  if (courses.length === 0) {
    try {
      const { coursesData } = require('../data/coursesData');
      if (coursesData && coursesData.length > 0) {
        setToStorage(STORAGE_KEYS.COURSES, coursesData);
        return coursesData;
      }
    } catch (error) {
      console.log('No coursesData found, using empty array');
    }
  }
  return courses;
};

export const getCourseById = (courseId) => {
  const courses = getAllCourses();
  return courses.find(course => course.id === courseId) || null;
};

export const saveCourse = (courseData) => {
  const courses = getAllCourses();
  const existingIndex = courses.findIndex(course => course.id === courseData.id);
  
  if (existingIndex >= 0) {
    // Update existing course
    courses[existingIndex] = { ...courses[existingIndex], ...courseData };
  } else {
    // Add new course
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    courses.push({ ...courseData, id: newId });
  }
  
  return setToStorage(STORAGE_KEYS.COURSES, courses);
};

export const deleteCourse = (courseId) => {
  const courses = getAllCourses();
  const filteredCourses = courses.filter(course => course.id !== courseId);
  return setToStorage(STORAGE_KEYS.COURSES, filteredCourses);
};

// Course progress functions
export const getCourseProgress = (courseId) => {
  const progress = getFromStorage(STORAGE_KEYS.COURSE_PROGRESS, {});
  return progress[courseId] || {
    currentStep: 'intro',
    completedSteps: [],
    preTestScore: null,
    postTestScore: null,
    isCompleted: false
  };
};

export const saveCourseProgress = (courseId, progressData) => {
  const allProgress = getFromStorage(STORAGE_KEYS.COURSE_PROGRESS, {});
  allProgress[courseId] = { ...allProgress[courseId], ...progressData };
  return setToStorage(STORAGE_KEYS.COURSE_PROGRESS, allProgress);
};

// User submissions functions
export const getUserSubmissions = (courseId) => {
  const submissions = getFromStorage(STORAGE_KEYS.USER_SUBMISSIONS, {});
  return submissions[courseId] || {
    postWork: null,
    finalProject: null
  };
};

export const saveUserSubmission = (courseId, submissionType, submissionData) => {
  const allSubmissions = getFromStorage(STORAGE_KEYS.USER_SUBMISSIONS, {});
  if (!allSubmissions[courseId]) {
    allSubmissions[courseId] = {};
  }
  
  allSubmissions[courseId][submissionType] = {
    ...submissionData,
    submittedAt: new Date().toISOString()
  };
  
  return setToStorage(STORAGE_KEYS.USER_SUBMISSIONS, allSubmissions);
};

// Initialize default data if not exists
export const initializeDefaultData = (defaultCourses = []) => {
  const existingCourses = getAllCourses();
  if (existingCourses.length === 0 && defaultCourses.length > 0) {
    setToStorage(STORAGE_KEYS.COURSES, defaultCourses);
  }
};

// Export storage keys for external use
export { STORAGE_KEYS };