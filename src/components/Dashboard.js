'use client';
import React from 'react';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from './CourseCard';

const Dashboard = ({ onStartLearning }) => {
  const { courses } = useAuth();
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Welcome to Modern LMS
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          Tingkatkan skill programming Anda dengan pembelajaran yang terstruktur
        </p>
      </div>
      
      {/* Courses Grid */}
      <div className="px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onStartLearning={onStartLearning}
            />
          ))}
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Certificates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;