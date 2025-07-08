'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Book, Users, BarChart3, HelpCircle, MessageSquare, UserCog, Bell, Award, FileText, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI, adminAPI } from '../services/api';
import CourseForm from './CourseForm';
import CourseList from './CourseList';
import QuizManager from './QuizManager';
import SurveyManager from './SurveyManager';
import UserManagement from './UserManagement';
import AnnouncementManager from './AnnouncementManager';
import CertificateManager from './CertificateManager';
import ProjectInstructionManager from './ProjectInstructionManager';
import CourseInstructionManager from './CourseInstructionManager';
import GradingSystem from './GradingSystem';
import SubmissionReview from './SubmissionReview';
import CourseStageManager from './CourseStageManager';

const AdminDashboard = ({ activeTab = 'overview' }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourseForStageManagement, setSelectedCourseForStageManagement] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalLessons: 0,
    totalStudents: 0,
    completionRate: 0,
    activeStudents: 0,
    totalEnrollments: 0
  });

  // Load courses and dashboard stats on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load courses
        const coursesResponse = await adminAPI.getAllCourses();
        console.log('Courses API Response:', coursesResponse); // Debug log
        
        // Handle backend response format: {success: true, data: courses}
        if (coursesResponse && coursesResponse.success && Array.isArray(coursesResponse.data)) {
          setCourses(coursesResponse.data);
        } else if (Array.isArray(coursesResponse)) {
          // Fallback for direct array response
          setCourses(coursesResponse);
        } else if (coursesResponse && Array.isArray(coursesResponse.courses)) {
          // Fallback for {courses: []} format
          setCourses(coursesResponse.courses);
        } else {
          console.warn('Unexpected courses response format:', coursesResponse);
          setCourses([]);
        }

        // Load dashboard statistics
        const statsResponse = await adminAPI.getDashboardStats();
        console.log('Dashboard Stats API Response:', statsResponse); // Debug log
        
        if (statsResponse && statsResponse.success && statsResponse.stats) {
          setDashboardStats(statsResponse.stats);
        } else {
          console.warn('Unexpected stats response format:', statsResponse);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setCourses([]); // Ensure courses is set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus course ini?')) {
      try {
        await adminAPI.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        alert('Course berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Gagal menghapus course. Silakan coba lagi.');
      }
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (editingCourse) {
        // Update existing course
        const response = await adminAPI.updateCourse(editingCourse.id, courseData);
        if (response.success) {
          setCourses(courses.map(course => 
            course.id === editingCourse.id ? response.course : course
          ));
          alert('Course berhasil diperbarui!');
        }
      } else {
        // Create new course
        const response = await adminAPI.createCourse(courseData);
        if (response.success) {
          setCourses([...courses, response.course]);
          alert('Course berhasil dibuat!');
        }
      }
      setShowCourseForm(false);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Gagal menyimpan course. Silakan coba lagi.');
    }
  };

  const stats = {
    totalCourses: Array.isArray(courses) ? courses.length : 0,
    totalLessons: Array.isArray(courses) ? courses.reduce((total, course) => {
      if (course && course.lessons && Array.isArray(course.lessons)) {
        return total + course.lessons.length;
      }
      return total;
    }, 0) : 0,
    totalStudents: 156, // Mock data
    completionRate: 78 // Mock data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Removed tabs array - now using sidebar navigation

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
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCourses}</p>
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
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalLessons}</p>
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
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStudents}</p>
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
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation removed - now using sidebar */}

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

        {activeTab === 'stage-management' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kelola Akses Tahap Course</h3>
              <p className="text-gray-600 mb-4">Pilih course untuk mengelola akses tahap-tahapnya:</p>
              
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Courses Array: {Array.isArray(courses) ? 'Yes' : 'No'}</p>
                <p>Courses Length: {Array.isArray(courses) ? courses.length : 'N/A'}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Courses Data: {JSON.stringify(courses, null, 2)}</p>
              </div>
              
              <div className="grid gap-4">
                {Array.isArray(courses) && courses.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-500">{course.description}</p>
                      </div>
                      <button
                        onClick={() => setSelectedCourseForStageManagement(course)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Kelola Tahap
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {Array.isArray(courses) && courses.length === 0 && (
                <p className="text-gray-500 text-center py-8">Belum ada course yang tersedia.</p>
              )}
            </div>
            
            {selectedCourseForStageManagement && (
              <CourseStageManager 
                courseId={selectedCourseForStageManagement.id}
                courseName={selectedCourseForStageManagement.title}
              />
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <AnnouncementManager />
        )}

        {activeTab === 'certificates' && (
          <CertificateManager />
        )}

        {activeTab === 'project-instructions' && (
          <ProjectInstructionManager />
        )}

        {activeTab === 'course-instructions' && (
          <CourseInstructionManager />
        )}

        {activeTab === 'users' && (
          <UserManagement />
        )}

        {activeTab === 'grading' && (
          <GradingSystem />
        )}

        {activeTab === 'submissions' && (
          <SubmissionReview />
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