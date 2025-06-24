import React, { useState } from 'react';
import { User, Mail, Save, Camera } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Profile updated:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 text-gray-700">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Profile Settings</h2>
          <p className="text-blue-100">Manage your account information and preferences</p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-900">Profile Picture</h3>
              <p className="text-gray-600 text-sm">Upload a new profile picture</p>
              <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Change Photo
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="Your Full Name" 
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="your@email.com" 
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About You
              </label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Learning Preferences */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Learning Style
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select your preference</option>
                    <option value="visual">Visual Learning</option>
                    <option value="auditory">Auditory Learning</option>
                    <option value="kinesthetic">Hands-on Learning</option>
                    <option value="reading">Reading/Writing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Level
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select your level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-3 text-sm text-gray-700">Email notifications for new courses</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-3 text-sm text-gray-700">Push notifications for course reminders</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-3 text-sm text-gray-700">Weekly progress reports</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t">
              <button 
                type="button"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>Update Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;