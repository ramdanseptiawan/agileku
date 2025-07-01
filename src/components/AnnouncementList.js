import React, { useState, useEffect } from 'react';
import { Bell, Calendar, User, X, AlertCircle, Info, CheckCircle, Megaphone, Clock, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AnnouncementList = ({ isModal = false, onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState(new Set());
  const { currentUser } = useAuth();

  useEffect(() => {
    loadAnnouncements();
    loadReadStatus();
  }, [currentUser, loadAnnouncements, loadReadStatus]);

  const loadAnnouncements = () => {
    const saved = localStorage.getItem('announcements');
    if (saved) {
      const allAnnouncements = JSON.parse(saved);
      // Filter announcements based on target audience
      const filteredAnnouncements = allAnnouncements.filter(announcement => {
        if (announcement.targetAudience === 'all') return true;
        if (announcement.targetAudience === 'students' && currentUser?.role === 'user') return true;
        if (announcement.targetAudience === 'instructors' && currentUser?.role === 'admin') return true;
        return false;
      });
      setAnnouncements(filteredAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  };

  const loadReadStatus = () => {
    const userId = currentUser?.id || 'guest';
    const saved = localStorage.getItem(`readAnnouncements_${userId}`);
    if (saved) {
      setReadAnnouncements(new Set(JSON.parse(saved)));
    }
  };

  const markAsRead = (announcementId) => {
    const userId = currentUser?.id || 'guest';
    const newReadAnnouncements = new Set([...readAnnouncements, announcementId]);
    setReadAnnouncements(newReadAnnouncements);
    localStorage.setItem(`readAnnouncements_${userId}`, JSON.stringify([...newReadAnnouncements]));
  };

  const markAllAsRead = () => {
    const userId = currentUser?.id || 'guest';
    const allIds = announcements.map(a => a.id);
    const newReadAnnouncements = new Set(allIds);
    setReadAnnouncements(newReadAnnouncements);
    localStorage.setItem(`readAnnouncements_${userId}`, JSON.stringify(allIds));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle size={16} className="text-red-500" />;
      case 'medium': return <Info size={16} className="text-yellow-500" />;
      default: return <CheckCircle size={16} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Tinggi';
      case 'medium': return 'Sedang';
      default: return 'Normal';
    }
  };

  const getAudienceText = (audience) => {
    switch (audience) {
      case 'students': return 'Siswa';
      case 'instructors': return 'Instruktur';
      default: return 'Semua';
    }
  };

  const unreadCount = announcements.filter(a => !readAnnouncements.has(a.id)).length;

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-opacity-20 p-3 rounded-full">
                  <Megaphone className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Pusat Pengumuman</h2>
                  <p className="text-blue-100 text-sm">Informasi terbaru untuk Anda</p>
                </div>
                {unreadCount > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold">{unreadCount} baru</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Tandai Semua Dibaca
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)] bg-gray-50">
            <AnnouncementContent 
              announcements={announcements}
              readAnnouncements={readAnnouncements}
              markAsRead={markAsRead}
              formatDate={formatDate}
              getPriorityIcon={getPriorityIcon}
              getPriorityColor={getPriorityColor}
              getPriorityText={getPriorityText}
              getAudienceText={getAudienceText}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-opacity-20 p-4 rounded-full">
                  <Megaphone className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Pusat Pengumuman</h1>
                  <p className="text-blue-100 text-lg">Informasi terbaru dan penting untuk Anda</p>
                </div>
                {unreadCount > 0 && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold text-lg">{unreadCount} baru</span>
                  </div>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold"
                >
                  <Eye size={20} />
                  Tandai Semua Dibaca
                </button>
              )}
            </div>
          </div>
          <div className="p-8 bg-gray-50">
            <AnnouncementContent 
              announcements={announcements}
              readAnnouncements={readAnnouncements}
              markAsRead={markAsRead}
              formatDate={formatDate}
              getPriorityIcon={getPriorityIcon}
              getPriorityColor={getPriorityColor}
              getPriorityText={getPriorityText}
              getAudienceText={getAudienceText}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AnnouncementContent = ({ 
  announcements, 
  readAnnouncements, 
  markAsRead, 
  formatDate, 
  getPriorityIcon, 
  getPriorityColor, 
  getPriorityText, 
  getAudienceText 
}) => {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Bell size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">Belum ada pengumuman</p>
        <p className="text-sm">Pengumuman terbaru akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((announcement) => {
        const isRead = readAnnouncements.has(announcement.id);
        return (
          <div 
            key={announcement.id} 
            className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
              isRead ? 'opacity-75' : 'border-l-4'
            } ${
              !isRead && announcement.priority === 'high' ? 'border-l-red-500' :
              !isRead && announcement.priority === 'medium' ? 'border-l-yellow-500' :
              !isRead ? 'border-l-blue-500' : ''
            }`}
            onClick={() => !isRead && markAsRead(announcement.id)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    announcement.priority === 'high' ? 'bg-red-100' :
                    announcement.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {getPriorityIcon(announcement.priority)}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      isRead ? 'text-gray-600' : 'text-gray-800'
                    }`}>
                      {announcement.title}
                    </h3>
                    {!isRead && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          ✨ Baru
                        </span>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    announcement.priority === 'high' ? 'text-red-700 bg-red-100 border border-red-200' :
                    announcement.priority === 'medium' ? 'text-yellow-700 bg-yellow-100 border border-yellow-200' :
                    'text-blue-700 bg-blue-100 border border-blue-200'
                  }`}>
                    {getPriorityText(announcement.priority)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {getAudienceText(announcement.targetAudience)}
                  </span>
                </div>
              </div>
              
              <div className={`mb-6 p-4 rounded-lg ${
                isRead ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-gray-800'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-base">
                  {announcement.content}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    <span className="font-medium">{announcement.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-green-500" />
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
                {announcement.updatedAt !== announcement.createdAt && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    Diperbarui: {formatDate(announcement.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementList;