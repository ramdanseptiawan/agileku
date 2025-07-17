import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CourseAccessManager = () => {
  const { courses } = useAuth();
  const [courseAccess, setCourseAccess] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Multi-select state for users
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserDropdownOpen]);





  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [accessResponse, usersResponse] = await Promise.all([
        adminAPI.getCourseAccess(),
        adminAPI.getAllUsers()
      ]);
      
      // Handle course access response structure
      if (accessResponse && accessResponse.success && accessResponse.data) {
        setCourseAccess(accessResponse.data);
      } else {
        setCourseAccess([]);
      }
      
      // Handle users response consistently with UserManagement pattern
      if (usersResponse && usersResponse.users) {
        setUsers(usersResponse.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccess = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0 || !selectedCourse) {
      setError('Please select at least one user and a course');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Process multiple users with proper API structure
      const promises = selectedUsers.map(userId => 
        adminAPI.updateCourseAccess({
          userId: parseInt(userId),
          courseId: parseInt(selectedCourse),
          hasAccess: hasAccess
        })
      );
      
      await Promise.all(promises);

      setSuccess(`Course access updated successfully for ${selectedUsers.length} user(s)!`);
      setSelectedUsers([]);
      setSelectedCourse('');
      setHasAccess(true);
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating course access:', error);
      setError(error.message || 'Failed to update course access');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (userId, courseId, currentAccess) => {
    try {
      setError('');
      setSuccess('');
      
      await adminAPI.updateCourseAccess({
        userId: userId,
        courseId: courseId,
        hasAccess: !currentAccess
      });

      setSuccess(`Course access updated successfully`);
      
      // Refresh data
      await fetchData();
    } catch (err) {
      setError('Failed to update course access: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Access Management</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Add New Access Control */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Set Course Access</h3>
          <form onSubmit={handleUpdateAccess} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Users (Multiple Selection)
              </label>
              <div className="relative user-dropdown-container">
                <div 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white min-h-[40px] flex flex-wrap items-center gap-1"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  {selectedUsers.length === 0 ? (
                    <span className="text-gray-500">
                      {loading ? 'Loading users...' : 
                       users.length === 0 ? 'No users available' : 'Select users'}
                    </span>
                  ) : (
                    selectedUsers.map(userId => {
                      const user = users.find(u => u.id.toString() === userId);
                      return (
                        <span 
                          key={userId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {user?.fullName || user?.name || user?.username}
                          <button
                            type="button"
                            className="ml-1 text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUsers(prev => prev.filter(id => id !== userId));
                            }}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })
                  )}
                  <svg className="ml-auto w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {isUserDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map((user) => {
                        const isSelected = selectedUsers.includes(user.id.toString());
                        return (
                          <div
                            key={user.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                              isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                            }`}
                            onClick={() => {
                              const userId = user.id.toString();
                              if (isSelected) {
                                setSelectedUsers(prev => prev.filter(id => id !== userId));
                              } else {
                                setSelectedUsers(prev => [...prev, userId]);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by parent div onClick
                              className="mr-2"
                            />
                            <span>
                              {user.fullName || user.name || user.username}
                              {user.email && (
                                <span className="text-gray-500 text-sm ml-1">({user.email})</span>
                              )}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-gray-500">
                        {loading ? 'Loading users...' : 'No users available'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Pilih Course --</option>
                {Array.isArray(courses) && courses.length > 0 ? (
                  courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No courses available</option>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Access
              </label>
              <select
                value={hasAccess}
                onChange={(e) => setHasAccess(e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={true}>Allow Access (Enrolled)</option>
                <option value={false}>Restrict Access (Not Enrolled)</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update Access
              </button>
            </div>
          </form>
        </div>

        {/* Current Access Settings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Access Settings</h3>
          {courseAccess.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No access restrictions found. All users have access to all courses by default.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Access Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courseAccess.map((access) => (
                    <tr key={`${access.userId}-${access.courseId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{access.userName}</div>
                          <div className="text-sm text-gray-500">{access.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{access.courseTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          access.hasAccess 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {access.hasAccess ? 'Enrolled (Access Allowed)' : 'Not Enrolled (Access Restricted)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {access.updatedByName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(access.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleAccess(access.userId, access.courseId, access.hasAccess)}
                          className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          {access.hasAccess ? 'Restrict Access' : 'Allow Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseAccessManager;