import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, User, Calendar, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI, courseAPI } from '../services/api';

const SubmissionReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewingSubmission, setViewingSubmission] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadSubmissions();
    }
  }, [selectedCourse, selectedType]);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      if (response.success) {
        setCourses(response.courses || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const response = await adminAPI.getCourseSubmissions(selectedCourse);
      if (response.success) {
        let filteredSubmissions = response.submissions || [];
        
        if (selectedType !== 'all') {
          filteredSubmissions = filteredSubmissions.filter(
            submission => submission.type === selectedType
          );
        }
        
        setSubmissions(filteredSubmissions);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission) => {
    setViewingSubmission(submission);
  };

  const handleDownloadFile = async (submission) => {
    if (!submission.fileName) {
      alert('No file available for download');
      return;
    }

    try {
      // This would need to be implemented in the API
      // For now, we'll show an alert
      alert(`Downloading: ${submission.fileName}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;
    const pending = total - graded;
    
    return { total, graded, pending };
  };

  const stats = getSubmissionStats();

  if (loading && !selectedCourse) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Review</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="postwork">Postwork</option>
              <option value="final_project">Final Project</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        {selectedCourse && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Graded</p>
                  <p className="text-2xl font-bold text-green-900">{stats.graded}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        {selectedCourse && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions found for the selected criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-900">{submission.userName}</span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full
                            {submission.type === 'postwork' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                            }">
                            {submission.type === 'postwork' ? 'Postwork' : 'Final Project'}
                          </span>
                          {submission.grade !== null && submission.grade !== undefined && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Graded: {submission.grade}/100
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-2">{submission.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                          </div>
                          {submission.fileName && (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{submission.fileName}</span>
                            </div>
                          )}
                        </div>
                        
                        {submission.feedback && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-center space-x-1 mb-1">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-700">Feedback:</span>
                            </div>
                            <p className="text-gray-600">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {submission.fileName && (
                          <button
                            onClick={() => handleDownloadFile(submission)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Download File"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
              <button
                onClick={() => setViewingSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student</label>
                  <p className="text-gray-900">{viewingSubmission.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">
                    {viewingSubmission.type === 'postwork' ? 'Postwork' : 'Final Project'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted</label>
                  <p className="text-gray-900">
                    {new Date(viewingSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>
                {viewingSubmission.grade !== null && viewingSubmission.grade !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Grade</label>
                    <p className="text-gray-900">{viewingSubmission.grade}/100</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-gray-900">{viewingSubmission.description}</p>
                </div>
              </div>
              
              {viewingSubmission.fileName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded border">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-900">{viewingSubmission.fileName}</span>
                    <button
                      onClick={() => handleDownloadFile(viewingSubmission)}
                      className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
              
              {viewingSubmission.feedback && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-gray-900">{viewingSubmission.feedback}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionReview;