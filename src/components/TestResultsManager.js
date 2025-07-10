import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Filter, BarChart3, Users, Award, TrendingUp } from 'lucide-react';
import { adminAPI } from '../services/api';

const TestResultsManager = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, pretest, posttest
  const [filterCourse, setFilterCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averagePreTestScore: 0,
    averagePostTestScore: 0,
    passRate: 0
  });

  useEffect(() => {
    console.log('TestResultsManager: Component mounted, loading data...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('TestResultsManager: Starting to load data...');
      setLoading(true);
      setError('');
      
      // Load test results
      console.log('TestResultsManager: Calling adminAPI.getTestResults()...');
      const resultsResponse = await adminAPI.getTestResults();
      console.log('TestResultsManager: getTestResults response:', resultsResponse);
      
      if (resultsResponse && resultsResponse.success) {
        console.log('TestResultsManager: Test results data:', resultsResponse.data);
        setTestResults(resultsResponse.data || []);
        calculateStats(resultsResponse.data || []);
      } else {
        console.warn('TestResultsManager: getTestResults failed or returned no success flag:', resultsResponse);
        setTestResults([]);
        setError('Gagal memuat data hasil test dari server');
      }
      
      // Load courses for filter
      console.log('TestResultsManager: Calling adminAPI.getAllCourses()...');
      const coursesResponse = await adminAPI.getAllCourses();
      console.log('TestResultsManager: getAllCourses response:', coursesResponse);
      
      if (coursesResponse && coursesResponse.success) {
        console.log('TestResultsManager: Courses data:', coursesResponse.data);
        setCourses(coursesResponse.data || []);
      } else {
        console.warn('TestResultsManager: getAllCourses failed or returned no success flag:', coursesResponse);
        setCourses([]);
      }
    } catch (error) {
      console.error('TestResultsManager: Error loading test results:', error);
      console.error('TestResultsManager: Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setError(error.message || 'Gagal memuat data hasil test. Silakan coba lagi.');
    } finally {
      console.log('TestResultsManager: Data loading completed');
      setLoading(false);
    }
  };

  const calculateStats = (results) => {
    console.log('TestResultsManager: Calculating stats for results:', results);
    
    if (!results || results.length === 0) {
      console.log('TestResultsManager: No results found, setting empty stats');
      setStats({
        totalAttempts: 0,
        averagePreTestScore: 0,
        averagePostTestScore: 0,
        passRate: 0
      });
      return;
    }

    const preTestResults = results.filter(r => r.quiz_type === 'pretest');
    const postTestResults = results.filter(r => r.quiz_type === 'posttest');
    
    console.log('TestResultsManager: PreTest results:', preTestResults.length);
    console.log('TestResultsManager: PostTest results:', postTestResults.length);
    
    const avgPreTest = preTestResults.length > 0 
      ? preTestResults.reduce((sum, r) => sum + r.score, 0) / preTestResults.length 
      : 0;
    
    const avgPostTest = postTestResults.length > 0 
      ? postTestResults.reduce((sum, r) => sum + r.score, 0) / postTestResults.length 
      : 0;
    
    const passedResults = results.filter(r => r.passed);
    const passRate = results.length > 0 ? (passedResults.length / results.length) * 100 : 0;

    const calculatedStats = {
      totalAttempts: results.length,
      averagePreTestScore: Math.round(avgPreTest),
      averagePostTestScore: Math.round(avgPostTest),
      passRate: Math.round(passRate)
    };
    
    console.log('TestResultsManager: Calculated stats:', calculatedStats);
    setStats(calculatedStats);
  };

  const filteredResults = testResults.filter(result => {
    const matchesSearch = 
      (result.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.course_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.quiz_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || result.quiz_type === filterType;
    const matchesCourse = filterCourse === 'all' || result.course_id.toString() === filterCourse;
    
    return matchesSearch && matchesType && matchesCourse;
  });
  
  const exportToCSV = () => {
    const headers = ['Nama Pengguna', 'Course', 'Jenis Test', 'Skor', 'Status', 'Waktu Pengerjaan', 'Tanggal'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(result => [
        result.user_name || 'N/A',
        result.course_title || 'N/A',
        result.quiz_type === 'pretest' ? 'Pre Test' : 'Post Test',
        result.score,
        result.passed ? 'Lulus' : 'Tidak Lulus',
        `${Math.floor(result.time_spent / 60)}:${(result.time_spent % 60).toString().padStart(2, '0')}`,
        new Date(result.submitted_at).toLocaleDateString('id-ID')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hasil_test_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remove the full-screen loading since we now have inline loading indicator

  console.log('TestResultsManager: About to render JSX'); // Debug log
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hasil Pre Test & Post Test</h1>
          <p className="text-gray-600 mt-1">Monitor dan analisis hasil test pengguna</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Pre Test</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averagePreTestScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Post Test</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averagePostTestScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.passRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Cari
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nama pengguna, course, atau quiz..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Jenis Test
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua</option>
              <option value="pretest">Pre Test</option>
              <option value="posttest">Post Test</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Course
            </label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id.toString()}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || filterType !== 'all' || filterCourse !== 'all' 
                      ? 'Tidak ada hasil yang sesuai dengan filter.' 
                      : 'Belum ada hasil test yang tersedia.'}
                  </td>
                </tr>
              ) : (
                filteredResults.map((result, index) => (
                  <tr key={`${result.user_id}-${result.quiz_id}-${result.attempt_number}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.user_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {result.user_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.course_title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.quiz_type === 'pretest' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.quiz_type === 'pretest' ? 'Pre Test' : 'Post Test'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.score}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.correct_count}/{result.total_count} benar
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.passed ? 'Lulus' : 'Tidak Lulus'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.floor(result.time_spent / 60)}:{(result.time_spent % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(result.submitted_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          // TODO: Implement view details modal
                          alert('Detail akan ditampilkan di modal');
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {filteredResults.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">
            Menampilkan {filteredResults.length} dari {testResults.length} hasil test
          </p>
        </div>
      )}
    </div>
  );
};

export default TestResultsManager;