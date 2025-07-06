'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import AdminDashboard from '../components/AdminDashboard';
import CourseView from '../components/CourseView';
import Profile from '../components/Profile';
import AnnouncementList from '../components/AnnouncementList';
import Achievements from '../components/Achievements';
import MyCourses from '../components/MyCourses';
import ContactAdminButton from '../components/ContactAdminButton';

const LMS = () => {
  const { currentUser, isLoading, courses, updateCourses } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [progress, setProgress] = useState({
    reading: {},
    video: {},
    preTest: {},
    postTest: {}
  });
  // Separate states for pretest and posttest
  const [preTestState, setPreTestState] = useState({
    showResult: false,
    score: 0
  });
  const [postTestState, setPostTestState] = useState({
    showResult: false,
    score: 0
  });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Update currentView when user role changes
  useEffect(() => {
    console.log('User changed:', currentUser);
    if (currentUser) {
      const newView = currentUser.role === 'admin' ? 'overview' : 'dashboard';
      console.log('Setting view to:', newView);
      setCurrentView(newView);
    }
  }, [currentUser]);



  const handleQuizSubmit = async (quizId, isPreTest, quizAnswers, courseId = null) => {
    try {
      // Try to find course by quiz ID first, then by courseId if provided
      let currentCourse = courses.find(c => 
        (isPreTest ? c.preTest?.id === quizId : c.postTest?.id === quizId)
      );
      
      // If not found and courseId is provided, find by courseId
      if (!currentCourse && courseId) {
        currentCourse = courses.find(c => c.id === courseId);
      }
      
      if (!currentCourse) {
        console.warn('Course not found for quiz:', quizId, 'courseId:', courseId);
        return;
      }
      
      const quiz = isPreTest ? currentCourse.preTest : currentCourse.postTest;
      
      if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
        console.warn('Quiz data is invalid or missing:', quiz);
        return;
      }
      
      let score = 0;
      quiz.questions.forEach(q => {
        if (quizAnswers[q.id] === q.correct) score++;
      });
      
      const percentage = Math.round((score / quiz.questions.length) * 100);
      
      // Submit quiz to backend
      console.log('Starting quiz submission process for quiz:', quizId);
      
      // Import quizAPI dynamically to avoid circular imports
      const { quizAPI, apiUtils } = await import('../services/api');
      
      // Test backend connectivity first
      const isConnected = await apiUtils.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to backend server. Please check if the server is running.');
      }
      
      // First, start a quiz attempt
      const attemptResult = await quizAPI.startQuizAttempt(quizId);
      
      if (!attemptResult.success) {
        console.error('Failed to start quiz attempt:', attemptResult.error);
        throw new Error('Failed to start quiz attempt');
      }
      
      console.log('Quiz attempt started:', attemptResult.data);
      
      // Convert answers to the format expected by backend
      const formattedAnswers = {};
      Object.keys(quizAnswers).forEach(questionId => {
        formattedAnswers[questionId.toString()] = quizAnswers[questionId];
      });
      
      // Then submit the quiz with the attempt ID
      const submissionData = {
        attemptId: attemptResult.data.id,
        answers: formattedAnswers,
        timeSpent: 300 // Default 5 minutes, you can track actual time
      };
      
      console.log('Submitting quiz to backend:', submissionData);
      console.log('Formatted answers:', JSON.stringify(formattedAnswers, null, 2));
      
      const result = await quizAPI.submitQuiz(submissionData);
      
      console.log('Quiz submission result:', result);
      
      // Handle different response formats
      if (result.success === false || (result.error && !result.success)) {
        console.error('Quiz submission failed:', result.error || result.message);
        throw new Error(result.error || result.message || 'Quiz submission failed');
      }
      
      // Check if result contains the expected data
      if (!result.data && !result.score && result.success !== true) {
        console.warn('Unexpected response format:', result);
      }
      
      // Update appropriate state based on quiz type
      if (isPreTest) {
        setPreTestState({
          showResult: true,
          score: percentage
        });
      } else {
        setPostTestState({
          showResult: true,
          score: percentage
        });
      }
      
      // Update progress
      const progressKey = isPreTest ? 'preTest' : 'postTest';
      setProgress(prev => ({
        ...prev,
        [progressKey]: { ...prev[progressKey], [quizId]: percentage }
      }));
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still update UI state even if backend submission fails
      if (isPreTest) {
        setPreTestState({
          showResult: true,
          score: 0
        });
      } else {
        setPostTestState({
          showResult: true,
          score: 0
        });
      }
    }
  };

  const handleRetakeQuiz = (isPreTest = false) => {
    if (isPreTest) {
      setPreTestState(prev => ({ ...prev, showResult: false }));
    } else {
      setPostTestState(prev => ({ ...prev, showResult: false }));
    }
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
        onAnnouncementClick={() => setShowAnnouncementModal(true)}
      />
      
      {/* Main Content */}
      <div className="w-full lg:flex-1 pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && currentUser && currentUser.role !== 'admin' && (
            <Dashboard 
              onStartLearning={handleStartLearning}
            />
          )}
          
          {currentView === 'courses' && currentUser && currentUser.role !== 'admin' && (
            <MyCourses 
              onStartLearning={handleStartLearning}
            />
          )}
          
          {(currentView === 'overview' || currentView === 'courses' || currentView === 'quizzes' || 
            currentView === 'surveys' || currentView === 'announcements' || currentView === 'certificates' || 
            currentView === 'project-instructions' || currentView === 'course-instructions' || 
            currentView === 'users' || currentView === 'students') && currentUser.role === 'admin' && (
            <AdminDashboard activeTab={currentView} />
          )}
          
          {currentView === 'course' && (
            <CourseView 
              currentLesson={currentLesson}
              onBack={handleBackToDashboard}
              preTestState={preTestState}
              postTestState={postTestState}
              onRetakeQuiz={handleRetakeQuiz}
              onMarkComplete={handleMarkComplete}
            />
          )}
          
          {currentView === 'profile' && <Profile />}
          
          {currentView === 'achievements' && <Achievements />}
          
          {currentView === 'announcements' && (
            <AnnouncementList 
              isModal={false} 
              onClose={() => setCurrentView('dashboard')}
            />
          )}
        </div>
      </div>
      
      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <AnnouncementList 
          isModal={true} 
          onClose={() => setShowAnnouncementModal(false)}
        />
      )}
      
      {/* Contact Admin Button - only show for logged in users */}
      {currentUser && <ContactAdminButton />}
    </div>
  );
};

export default LMS;