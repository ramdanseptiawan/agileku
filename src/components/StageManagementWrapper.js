'use client';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CourseStageManager from './CourseStageManager';

const StageManagementWrapper = () => {
  const { currentUser, courses, isLoading } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState('');

  // Clear any previous errors when courses are loaded
  useEffect(() => {
    if (courses && courses.length > 0) {
      setError('');
    }
  }, [courses]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToCourseList = () => {
    setSelectedCourse(null);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <Settings size={20} />
          <span className="font-medium">Akses Ditolak</span>
        </div>
        <p className="text-red-600 mt-1">Hanya admin yang dapat mengakses fitur ini.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat daftar courses...</span>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div>
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToCourseList}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Daftar Courses</span>
          </button>
        </div>
        
        {/* Course Stage Manager */}
        <CourseStageManager 
          courseId={selectedCourse.id} 
          courseName={selectedCourse.title} 
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">Stage Management</h2>
        <p className="text-gray-600 mt-1">
          Kelola akses tahap pembelajaran untuk setiap course
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <Settings size={20} />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-8">
            <Settings size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Courses</h3>
            <p className="text-gray-600">Belum ada courses yang tersedia untuk dikelola.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Pilih course untuk mengelola akses tahap pembelajaran:
            </p>
            
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>ID: {course.id}</span>
                      <span>Dibuat: {new Date(course.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StageManagementWrapper;