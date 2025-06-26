'use client';
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Book, Users, BarChart3, HelpCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CourseForm from './CourseForm';
import CourseList from './CourseList';
import QuizManager from './QuizManager';
import SurveyManager from './SurveyManager';

const AdminDashboard = () => {
  const { courses, addCourse, updateCourse, deleteCourse } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus course ini?')) {
      deleteCourse(courseId);
    }
  };

  const handleSaveCourse = (courseData) => {
    if (editingCourse) {
      // Update existing course
      updateCourse(editingCourse.id, courseData);
    } else {
      // Create new course
      addCourse(courseData);
    }
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const stats = {
    totalCourses: courses.length,
    totalLessons: courses.reduce((total, course) => total + course.lessons.length, 0),
    totalStudents: 156, // Mock data
    completionRate: 78 // Mock data
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: Book },
    { id: 'quizzes', label: 'Quiz Manager', icon: HelpCircle },
    { id: 'surveys', label: 'Survey Manager', icon: MessageSquare },
    { id: 'students', label: 'Students', icon: Users }
  ];

  if (showCourseForm) {
    return (
      <CourseForm
        course={editingCourse}
        onSave={handleSaveCourse}
        onCancel={() => {
          setShowCourseForm(false);
          setEditingCourse(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your courses and monitor progress</p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Book className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Course &quot;JavaScript Fundamentals&quot; was updated
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  New student enrolled in &quot;React Development&quot;
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Quiz completed by 5 students
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <CourseList
            courses={courses}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizManager courses={courses} />
        )}

        {activeTab === 'surveys' && (
          <SurveyManager courses={courses} />
        )}

        {activeTab === 'students' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Student Management</h3>
            <p className="text-gray-600">Student management features will be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;