'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LessonContent from './LessonContent';
import Quiz from './Quiz';
import FinalProject from './FinalProject';

const CourseView = ({ 
  currentLesson, 
  onBack, 
  progress, 
  onQuizSubmit, 
  showQuizResult, 
  currentQuizScore, 
  onRetakeQuiz,
  onMarkComplete 
}) => {
  const { getCourseById } = useAuth();
  const [activeTab, setActiveTab] = useState('pretest');
  
  // Get the latest course data from context
  const course = currentLesson ? getCourseById(currentLesson.id) || currentLesson : null;
  
  if (!course) return null;

  const tabs = [
    { id: 'pretest', label: 'Pre-Test', icon: FileText },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'posttest', label: 'Post-Test', icon: Award },
    { id: 'finalproject', label: 'Final Project', icon: FileText }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 px-4 lg:px-0"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-blue-100 text-sm sm:text-base">{course.description}</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className="sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Tab Content */}
        <div className="p-4 sm:p-8">
          {activeTab === 'pretest' && (
            <Quiz 
              quiz={course.preTest} 
              isPreTest={true}
              onQuizSubmit={onQuizSubmit}
              showQuizResult={showQuizResult}
              currentQuizScore={currentQuizScore}
              onRetakeQuiz={onRetakeQuiz}
            />
          )}
          {activeTab === 'lessons' && (
            <LessonContent 
              lessons={course.lessons}
              onMarkComplete={onMarkComplete}
            />
          )}
          {activeTab === 'posttest' && (
            <Quiz 
              quiz={course.postTest} 
              isPreTest={false}
              onQuizSubmit={onQuizSubmit}
              showQuizResult={showQuizResult}
              currentQuizScore={currentQuizScore}
              onRetakeQuiz={onRetakeQuiz}
            />
          )}
          {activeTab === 'finalproject' && (
            <FinalProject courseId={course.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseView;