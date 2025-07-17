import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

const FeedbackManager = () => {
  const { currentUser, courses } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    averageDifficulty: 0,
    averageClarity: 0,
    averageUsefulness: 0,
    passRate: 0
  });

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Fetch users on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Fetch feedbacks when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchFeedback(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchUsers = async () => {
    try {
      const backendUrl = API_BASE_URL.replace('/api', '');
      const response = await fetch(`${backendUrl}/api/protected/admin/users`, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const usersData = data.users || [];
        setUsers(usersData);
        
        // Create user mapping for quick lookup
        const mapping = {};
        usersData.forEach(user => {
          mapping[user.id] = user.fullName || user.username;
        });
        setUserMap(mapping);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchFeedback = async (courseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const backendUrl = API_BASE_URL.replace('/api', '');
      const response = await fetch(`${backendUrl}/api/protected/admin/surveys/feedback/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const feedbackData = data.data || [];
        setFeedbacks(feedbackData);
        calculateStats(feedbackData);
      } else {
        throw new Error('Failed to fetch feedbacks');
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedback data');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbackData) => {
    if (feedbackData.length === 0) {
      setStats({
        totalFeedbacks: 0,
        averageRating: 0,
        averageDifficulty: 0,
        averageClarity: 0,
        averageUsefulness: 0,
        passRate: 0
      });
      return;
    }

    const total = feedbackData.length;
    const totalRating = feedbackData.reduce((sum, f) => sum + f.rating, 0);
    const totalDifficulty = feedbackData.reduce((sum, f) => sum + f.difficulty, 0);
    const totalClarity = feedbackData.reduce((sum, f) => sum + f.clarity, 0);
    const totalUsefulness = feedbackData.reduce((sum, f) => sum + f.usefulness, 0);
    const passedCount = feedbackData.filter(f => f.post_test_passed).length;

    setStats({
      totalFeedbacks: total,
      averageRating: (totalRating / total).toFixed(1),
      averageDifficulty: (totalDifficulty / total).toFixed(1),
      averageClarity: (totalClarity / total).toFixed(1),
      averageUsefulness: (totalUsefulness / total).toFixed(1),
      passRate: ((passedCount / total) * 100).toFixed(1)
    });
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Akses Ditolak
          </h3>
          <p className="text-red-600">
            Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  const exportToCSV = () => {
    if (feedbacks.length === 0) {
      toast.error('No feedback data to export');
      return;
    }

    const selectedCourseName = courses.find(c => c.id == selectedCourse)?.title || 'Unknown Course';
    
    // CSV headers
    const headers = [
      'ID',
      'User ID',
      'User Name',
      'Course',
      'Rating',
      'Difficulty',
      'Clarity',
      'Usefulness',
      'Feedback',
      'Post Test Score',
      'Post Test Passed',
      'Created At',
      'Updated At'
    ];

    // Convert feedback data to CSV format
    const csvData = feedbacks.map(feedback => [
      feedback.id,
      feedback.user_id,
      userMap[feedback.user_id] || 'Unknown User',
      selectedCourseName,
      feedback.rating,
      feedback.difficulty,
      feedback.clarity,
      feedback.usefulness,
      `"${feedback.feedback.replace(/"/g, '""')}"`, // Escape quotes in feedback text
      feedback.post_test_score,
      feedback.post_test_passed ? 'Yes' : 'No',
      new Date(feedback.created_at).toLocaleString(),
      new Date(feedback.updated_at).toLocaleString()
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_${selectedCourseName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Feedback data exported successfully!');
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    return labels[difficulty - 1] || 'Unknown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Feedback Management</h1>
          <p className="text-gray-600">Kelola dan analisis feedback survey dari peserta kursus</p>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-gray-900">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kursus
              </label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Pilih Kursus --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedCourse && (
              <button
                onClick={exportToCSV}
                disabled={loading || feedbacks.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                📥 Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {selectedCourse && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalFeedbacks}</div>
              <div className="text-sm text-gray-600">Total Feedback</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-green-600">{stats.averageRating}/5</div>
              <div className="text-sm text-gray-600">Rata-rata Rating</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.averageDifficulty}/5</div>
              <div className="text-sm text-gray-600">Rata-rata Kesulitan</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.averageClarity}/5</div>
              <div className="text-sm text-gray-600">Rata-rata Kejelasan</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.averageUsefulness}/5</div>
              <div className="text-sm text-gray-600">Rata-rata Kegunaan</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-500 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Table */}
        {selectedCourse && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Feedback Data</h2>
              <p className="text-sm text-gray-600 mt-1">
                {feedbacks.length} feedback ditemukan
              </p>
            </div>
            
            {feedbacks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Feedback</h3>
                <p className="text-gray-600">Belum ada feedback yang tersedia untuk kursus ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kesulitan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kejelasan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kegunaan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post Test</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedbacks.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div>
                            <div className="font-medium">{userMap[feedback.user_id] || 'Unknown User'}</div>
                            <div className="text-xs text-gray-500">ID: {feedback.user_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(feedback.rating)}`}>
                            ⭐ {feedback.rating}/5
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getDifficultyLabel(feedback.difficulty)} ({feedback.difficulty}/5)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {feedback.clarity}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {feedback.usefulness}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="text-xs text-gray-500 mt-1">
                              Score: {feedback.post_test_score}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={feedback.feedback}>
                            {feedback.feedback || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(feedback.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManager;