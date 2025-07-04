'use client';
import React, { useMemo } from 'react';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from './CourseCard';

const Dashboard = ({ onStartLearning }) => {
  const { courses, enrollments, currentUser } = useAuth();
  
  // Calculate user statistics
  const userStats = useMemo(() => {
    const coursesArray = Array.isArray(courses) ? courses : [];
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    
    if (!currentUser || !enrollmentsArray.length) {
      return {
        totalCourses: coursesArray.length,
        enrolledCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageProgress: 0
      };
    }
    
    const completed = enrollmentsArray.filter(e => e.progress >= 100).length;
    const inProgress = enrollmentsArray.filter(e => e.progress > 0 && e.progress < 100).length;
    const totalProgress = enrollmentsArray.reduce((sum, e) => sum + (e.progress || 0), 0);
    const averageProgress = enrollmentsArray.length > 0 ? Math.round(totalProgress / enrollmentsArray.length) : 0;
    
    return {
      totalCourses: coursesArray.length,
      enrolledCourses: enrollmentsArray.length,
      completedCourses: completed,
      inProgressCourses: inProgress,
      averageProgress
    };
  }, [courses, enrollments, currentUser]);
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {currentUser ? `Welcome back, ${currentUser.full_name || currentUser.username}!` : 'Welcome to Modern LMS'}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          {currentUser 
            ? 'Continue your learning journey and achieve your goals'
            : 'Tingkatkan skill programming Anda dengan pembelajaran yang terstruktur'
          }
        </p>
      </div>
      
      {/* Courses Grid */}
      <div className="px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.isArray(courses) && courses.length > 0 ? (
            courses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onStartLearning={onStartLearning}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            {currentUser ? 'Your Learning Progress' : 'Platform Statistics'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {currentUser ? userStats.enrolledCourses : userStats.totalCourses}
              </div>
              <div className="text-sm text-gray-600">
                {currentUser ? 'Enrolled Courses' : 'Available Courses'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {userStats.completedCourses}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                {userStats.inProgressCourses}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {currentUser ? `${userStats.averageProgress}%` : userStats.totalCourses}
              </div>
              <div className="text-sm text-gray-600">
                {currentUser ? 'Avg Progress' : 'Total Courses'}
              </div>
            </div>
          </div>
          
          {/* Progress Bar for logged in users */}
          {currentUser && userStats.enrolledCourses > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{userStats.averageProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${userStats.averageProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;