import React, { useState, useEffect } from 'react';
import { User, Mail, Save, Camera, Phone, MapPin, Briefcase, GraduationCap, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    occupation: '',
    education: '',
    avatar: null
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  useEffect(() => {
    // Populate form with user data if available
    if (currentUser) {
      setFormData({
        name: currentUser.fullName || currentUser.username || '',
        email: currentUser.email || '',
        bio: currentUser.bio || 'Saya adalah peserta kursus yang bersemangat untuk belajar dan mengembangkan keterampilan baru.',
        phone: currentUser.phone || '+62 812-3456-7890',
        location: currentUser.location || 'Jakarta, Indonesia',
        occupation: currentUser.occupation || 'Software Developer',
        education: currentUser.education || 'S1 Teknik Informatika',
        avatar: currentUser.avatar || null
      });
    }
  }, [currentUser]);

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
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
    if (passwordSuccess) {
      setPasswordSuccess('');
    }
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Password saat ini harus diisi');
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('Password baru harus diisi');
      return;
    }
    
    if (passwordData.newPassword.length < 3) {
      setPasswordError('Password baru minimal 3 karakter');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('Password baru harus berbeda dari password saat ini');
      return;
    }
    
    try {
      const response = await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (response.success) {
        setPasswordSuccess(response.message || 'Password berhasil diubah!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      } else {
        setPasswordError(response.error || 'Gagal mengubah password');
      }
    } catch (error) {
      setPasswordError(error.message || 'Gagal mengubah password. Pastikan password saat ini benar.');
    }
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
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="+62 812-3456-7890" 
                />
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Location
                </label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="Jakarta, Indonesia" 
                />
              </div>
              
              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase size={16} className="inline mr-2" />
                  Occupation
                </label>
                <input 
                  type="text" 
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="Software Developer" 
                />
              </div>
              
              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap size={16} className="inline mr-2" />
                  Education
                </label>
                <input 
                  type="text" 
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="S1 Teknik Informatika" 
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

            {/* Change Password */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} className="inline mr-2" />
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input 
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="Masukkan password saat ini" 
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} className="inline mr-2" />
                      Password Baru
                    </label>
                    <div className="relative">
                      <input 
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="Masukkan password baru (minimal 6 karakter)" 
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} className="inline mr-2" />
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="Konfirmasi password baru" 
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Error Message */}
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {passwordError}
                  </div>
                )}
                
                {/* Success Message */}
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {passwordSuccess}
                  </div>
                )}
                
                {/* Password Change Button */}
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={handlePasswordSubmit}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Lock size={16} />
                    <span>Ubah Password</span>
                  </button>
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