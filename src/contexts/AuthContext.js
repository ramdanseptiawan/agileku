'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { coursesData as initialCourses } from '../data/coursesData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const users = {
  admin: { username: 'admin', password: '123', role: 'admin' },
  user: { username: 'user', password: '123', role: 'user' }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    // Load courses from localStorage or use initial data
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(initialCourses);
      localStorage.setItem('courses', JSON.stringify(initialCourses));
    }
    
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    const user = Object.values(users).find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      const userInfo = { username: user.username, role: user.role };
      setCurrentUser(userInfo);
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      return { success: true };
    }
    
    return { success: false, error: 'Username atau password salah' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Course management functions
  const updateCourses = (updatedCourses) => {
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
  };

  const addCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: Date.now().toString() // Simple ID generation
    };
    const updatedCourses = [...courses, newCourse];
    updateCourses(updatedCourses);
    return newCourse;
  };

  const updateCourse = (courseId, courseData) => {
    const updatedCourses = courses.map(course => 
      course.id === courseId ? { ...courseData, id: courseId } : course
    );
    updateCourses(updatedCourses);
  };

  const deleteCourse = (courseId) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    updateCourses(updatedCourses);
  };

  const getCourseById = (courseId) => {
    return courses.find(course => course.id === courseId);
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading,
    courses,
    updateCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseById
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};