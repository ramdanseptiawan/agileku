'use client';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import AdminDashboard from '../components/AdminDashboard';
import CourseView from '../components/CourseView';
import Profile from '../components/Profile';

const LMS = () => {
  const { currentUser, isLoading, courses, updateCourses } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [progress, setProgress] = useState({
    reading: {},
    video: {},
    preTest: {},
    postTest: {}
  });
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [currentQuizScore, setCurrentQuizScore] = useState(0);

  const handleQuizSubmit = (quizId, isPreTest, quizAnswers) => {
    const currentCourse = courses.find(c => 
      (isPreTest ? c.preTest.id === quizId : c.postTest.id === quizId)
    );
    const quiz = isPreTest ? currentCourse.preTest : currentCourse.postTest;
    
    let score = 0;
    quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) score++;
    });
    
    const percentage = Math.round((score / quiz.questions.length) * 100);
    setCurrentQuizScore(percentage);
    setShowQuizResult(true);
    
    // Update progress
    const progressKey = isPreTest ? 'preTest' : 'postTest';
    setProgress(prev => ({
      ...prev,
      [progressKey]: { ...prev[progressKey], [quizId]: percentage }
    }));
  };

  const handleRetakeQuiz = () => {
    setShowQuizResult(false);
  };

  const handleStartLearning = (course) => {
    setCurrentLesson(course);
    setCurrentView('course');
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentLesson(null);
  };

  const handleMarkComplete = (lessonId) => {
    setProgress(prev => ({
      ...prev,
      reading: { ...prev.reading, [lessonId]: 100 }
    }));
  };

  const handleUpdateCourses = (updatedCourses) => {
    updateCourses(updatedCourses);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login if user is not authenticated
  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Header for mobile */}
      <Header 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />
      
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userRole={currentUser.role}
      />
      
      {/* Main Content */}
      <div className="w-full lg:flex-1 pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && currentUser.role === 'user' && (
            <Dashboard 
              onStartLearning={handleStartLearning}
            />
          )}
          
          {currentView === 'dashboard' && currentUser.role === 'admin' && (
            <AdminDashboard />
          )}
          
          {currentView === 'course' && (
            <CourseView 
              currentLesson={currentLesson}
              onBack={handleBackToDashboard}
              progress={progress}
              onQuizSubmit={handleQuizSubmit}
              showQuizResult={showQuizResult}
              currentQuizScore={currentQuizScore}
              onRetakeQuiz={handleRetakeQuiz}
              onMarkComplete={handleMarkComplete}
            />
          )}
          
          {currentView === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default LMS;