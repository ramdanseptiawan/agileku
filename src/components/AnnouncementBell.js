'use client';
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementList from './AnnouncementList';

const AnnouncementBell = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    updateUnreadCount();
    
    // Listen for storage changes to update count in real-time
    const handleStorageChange = () => {
      updateUnreadCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for updates
    const interval = setInterval(updateUnreadCount, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  const updateUnreadCount = () => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    // Get all announcements
    const saved = localStorage.getItem('announcements');
    if (!saved) {
      setUnreadCount(0);
      return;
    }

    const allAnnouncements = JSON.parse(saved);
    
    // Filter announcements based on target audience
    const filteredAnnouncements = allAnnouncements.filter(announcement => {
      if (announcement.targetAudience === 'all') return true;
      if (announcement.targetAudience === 'students' && currentUser?.role === 'user') return true;
      if (announcement.targetAudience === 'instructors' && currentUser?.role === 'admin') return true;
      return false;
    });

    // Get read announcements for current user
    const userId = currentUser.id || 'guest';
    const readSaved = localStorage.getItem(`readAnnouncements_${userId}`);
    const readAnnouncements = readSaved ? new Set(JSON.parse(readSaved)) : new Set();

    // Count unread announcements
    const unread = filteredAnnouncements.filter(a => !readAnnouncements.has(a.id)).length;
    setUnreadCount(unread);
  };

  const handleBellClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Update count after modal closes (user might have read some announcements)
    setTimeout(updateUnreadCount, 100);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Pengumuman"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {showModal && (
        <AnnouncementList 
          isModal={true} 
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default AnnouncementBell;