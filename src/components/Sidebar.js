import React from 'react';
import { 
  Home, 
  User, 
  X, 
  BookOpen, 
  Award, 
  Settings, 
  HelpCircle, 
  LogOut,
  Bell,
  Calendar,
  BarChart3,
  FileText,
  Users,
  Star,
  Menu,
  GraduationCap,
  Shield,
  MessageSquare,
  UserCog,
  Edit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementBell from './AnnouncementBell';

const Sidebar = ({ currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen, userRole, onAnnouncementClick }) => {
  const { currentUser, logout } = useAuth();
  // Bottom navigation items for mobile
  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home, badge: null },
    { id: 'courses', label: 'Courses', icon: BookOpen, badge: null },
    { id: 'profile', label: 'Profile', icon: User, badge: null },
    { id: 'menu', label: 'Menu', icon: Menu, badge: null }
  ];

  // Desktop sidebar menu items based on user role
  const getUserMenuItems = () => {
    const commonItems = [
      { id: 'profile', label: 'Profile', icon: User, badge: null },
      { id: 'settings', label: 'Settings', icon: Settings, badge: null },
      { id: 'help', label: 'Help Center', icon: HelpCircle, badge: null }
    ];

    if (userRole === 'admin') {
      return [
        { id: 'overview', label: 'Overview', icon: BarChart3, badge: null },
        { id: 'courses', label: 'Courses', icon: BookOpen, badge: null },
        { id: 'quizzes', label: 'Quiz Manager', icon: HelpCircle, badge: null },
        { id: 'surveys', label: 'Survey Manager', icon: MessageSquare, badge: null },
        { id: 'stage-management', label: 'Stage Management', icon: Shield, badge: null },
        { id: 'announcements', label: 'Announcements', icon: Bell, badge: null },
        { id: 'certificates', label: 'Certificates', icon: Award, badge: null },
        { id: 'project-instructions', label: 'Project Instructions', icon: FileText, badge: null },
        { id: 'course-instructions', label: 'Course Instructions', icon: Settings, badge: null },
        { id: 'users', label: 'User Management', icon: UserCog, badge: null },
        { id: 'test-results', label: 'Test Results', icon: BarChart3, badge: null },
        { id: 'students', label: 'Students', icon: Users, badge: null },
        ...commonItems
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
        { id: 'courses', label: 'My Courses', icon: BookOpen, badge: null },
        { id: 'announcements', label: 'Announcements', icon: Bell, badge: null },
        { id: 'achievements', label: 'Achievements', icon: Award, badge: null },
        ...commonItems
      ];
    }
  };

  const sidebarMenuItems = getUserMenuItems();

  const handleMenuClick = (viewId) => {
    console.log('Sidebar: Menu clicked, viewId =', viewId); // Debug log
    if (viewId === 'menu') {
      setIsSidebarOpen(true);
      return;
    }
    console.log('Sidebar: Setting currentView to', viewId); // Debug log
    setCurrentView(viewId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleAnnouncementBellClick = () => {
    onAnnouncementClick && onAnnouncementClick();
  };

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
        <div className="flex items-center justify-around py-1">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 relative touch-manipulation transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <Icon size={22} className={`transition-all duration-200 ${
                    isActive ? 'text-blue-600 scale-110' : 'text-gray-500'
                  }`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium truncate transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className={`
        fixed left-0 top-0 min-h-screen w-72 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-10 lg:flex-shrink-0 lg:min-h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Modern LMS</h2>
              <p className="text-xs text-gray-500">Learning Platform</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors lg:hidden touch-manipulation"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-base">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 font-semibold text-sm">{currentUser?.username || 'User'}</h3>
              <p className="text-gray-500 text-xs capitalize">{userRole || 'Student'}</p>
            </div>
            <AnnouncementBell onClick={handleAnnouncementBellClick} />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {sidebarMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group touch-manipulation ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} className={`transition-all duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    <span className={`font-medium text-sm ${
                      isActive ? 'text-blue-600' : 'text-gray-700'
                    }`}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors touch-manipulation"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;