import React, { useState, useEffect } from 'react';
import { Star, FileText, User, Calendar, MessageSquare, Save, Eye } from 'lucide-react';
import { adminAPI } from '../services/api';

const GradingSystem = () => {
  const [grades, setGrades] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    loadGrades();
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadSubmissions(selectedCourse);
    }
  }, [selectedCourse]);

  const loadGrades = async () => {
    try {
      const response = await adminAPI.getGrades();
      if (response.success) {
        setGrades(response.grades || []);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const loadCourses = async () => {
    try {
      // This would need to be implemented in courseAPI
      // For now, we'll use mock data
      setCourses([
        { id: 1, title: 'JavaScript Fundamentals' },
        { id: 2, title: 'React Development' },
        { id: 3, title: 'Node.js Backend' }
      ]);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (courseId) => {
    try {
      const response = await adminAPI.getCourseSubmissions(courseId);
      if (response.success) {
        setSubmissions(response.submissions || []);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleGradeSubmission = async (submission) => {
    setGradingSubmission(submission);
    setGradeForm({ grade: '', feedback: '' });
  };

  const submitGrade = async () => {
    if (!gradeForm.grade || gradeForm.grade < 0 || gradeForm.grade > 100) {
      alert('Please enter a valid grade (0-100)');
      return;
    }

    try {
      const gradeData = {
        userId: gradingSubmission.userId,
        courseId: gradingSubmission.courseId,
        submissionId: gradingSubmission.id,
        grade: parseFloat(gradeForm.grade),
        feedback: gradeForm.feedback
      };

      const response = await adminAPI.createGrade(gradeData);
      if (response.success) {
        alert('Grade submitted successfully!');
        setGradingSubmission(null);
        setGradeForm({ grade: '', feedback: '' });
        loadGrades();
        if (selectedCourse) {
          loadSubmissions(selectedCourse);
        }
      }
    } catch (error) {
      console.error('Error submitting grade:', error);
      alert('Failed to submit grade. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Grading System</h2>
        
        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course to Review Submissions
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

        {/* Submissions List */}
        {selectedCourse && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submissions to Grade</h3>
            {submissions.length === 0 ? (
              <p className="text-gray-500">No submissions found for this course.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{submission.userName}</span>
                          <span className="text-sm text-gray-500">({submission.type})</span>
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
                        {submission.grade && (
                          <div className="mt-2 text-sm">
                            <span className="text-green-600 font-medium">Grade: {submission.grade}/100</span>
                            {submission.feedback && (
                              <p className="text-gray-600 mt-1">Feedback: {submission.feedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {!submission.grade && (
                          <button
                            onClick={() => handleGradeSubmission(submission)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Grade
                          </button>
                        )}
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Grades */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Grades</h3>
          {grades.length === 0 ? (
            <p className="text-gray-500">No grades submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {grades.slice(0, 10).map(grade => (
                <div key={grade.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{grade.userName}</span>
                        <span className="text-sm text-gray-500">- {grade.courseTitle}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span className="font-medium text-green-600">{grade.grade}/100</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(grade.gradedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {grade.feedback && (
                        <p className="text-gray-600 text-sm mt-2">{grade.feedback}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Submission</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Student:</strong> {gradingSubmission.userName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Type:</strong> {gradingSubmission.type}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Description:</strong> {gradingSubmission.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter grade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter feedback for the student"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={submitGrade}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Submit Grade</span>
              </button>
              <button
                onClick={() => setGradingSubmission(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingSystem;