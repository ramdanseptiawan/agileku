import React, { useMemo } from 'react';
import { BookOpen, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from './CourseCard';

const MyCourses = ({ onStartLearning }) => {
  const { courses, enrollments, currentUser } = useAuth();
  
  // Filter enrolled courses
  const enrolledCourses = useMemo(() => {
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    
    // Backend returns full course data with enrollment info, not just enrollment IDs
    // So we can use enrollments directly as they contain complete course information
    return enrollmentsArray.map(enrollment => ({
      ...enrollment,
      id: enrollment.id || enrollment.course_id, // Ensure we have an id field
      isEnrolled: true
    }));
  }, [enrollments]);
  
  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(course => course.progress === 100).length;
    const inProgressCourses = enrolledCourses.filter(course => course.progress > 0 && course.progress < 100).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / totalCourses)
      : 0;
    
    return {
      total: totalCourses,
      completed: completedCourses,
      inProgress: inProgressCourses,
      average: averageProgress
    };
  }, [enrolledCourses]);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h2>
        <p className="text-gray-600">You need to login to view your enrolled courses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          My Courses
        </h1>
        <p className="text-gray-600">
          Track your learning progress and continue your courses
        </p>
      </div>

      {/* Progress Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{progressStats.total}</p>
              <p className="text-sm text-gray-600">Enrolled</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{progressStats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{progressStats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{progressStats.average}%</p>
              <p className="text-sm text-gray-600">Avg Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Enrolled Courses</h2>
        
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrolled Courses</h3>
            <p className="text-gray-600 mb-4">
              You haven't enrolled in any courses yet. Browse available courses to start learning!
            </p>
            <button
              onClick={() => window.location.reload()} // Simple way to go back to dashboard
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onStartLearning={onStartLearning}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;