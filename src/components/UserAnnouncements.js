import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Info, CheckCircle, Users, User } from 'lucide-react';
import api from '../services/api';

const UserAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.announcement.getUserAnnouncements();
      if (response.success) {
        setAnnouncements(response.data || []);
      } else {
        setError('Gagal memuat pengumuman: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      setError('Terjadi kesalahan saat memuat pengumuman');
    } finally {
      setLoading(false);
    }
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
      case 'high': return <AlertCircle className="text-red-600" size={20} />;
      case 'medium': return <Info className="text-yellow-600" size={20} />;
      default: return <CheckCircle className="text-blue-600" size={20} />;
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
      case 'all': return 'Semua';
      default: return 'Semua';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Memuat pengumuman...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-2" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={loadAnnouncements}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pengumuman</h2>
        <p className="text-gray-600 mt-1">Informasi terbaru untuk Anda</p>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Tidak ada pengumuman saat ini</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow-md border-l-4 ${getPriorityColor(announcement.priority)} p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getPriorityIcon(announcement.priority)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {announcement.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {getPriorityText(announcement.priority)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                        {getAudienceText(announcement.target_audience || announcement.targetAudience)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {announcement.content}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{announcement.author || 'Admin'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(announcement.created_at || announcement.createdAt)}</span>
                  </div>
                </div>
                {(announcement.updated_at || announcement.updatedAt) !== (announcement.created_at || announcement.createdAt) && (
                  <span className="text-xs text-gray-400">
                    Diperbarui: {formatDate(announcement.updated_at || announcement.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserAnnouncements;