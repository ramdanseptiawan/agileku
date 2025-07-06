import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Calendar, Send, Save, X, AlertCircle, Info, CheckCircle, Users, User, Shield } from 'lucide-react';
import api from '../services/api';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    targetAudience: 'all'
  });

  const loadAnnouncements = useCallback(async () => {
    try {
      const response = await api.admin.getAllAnnouncements();
      if (response.success) {
        setAnnouncements(response.data || []);
      } else {
        console.error('Failed to load announcements:', response.message);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Judul dan konten pengumuman harus diisi!');
      return;
    }

    const announcementData = {
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      target_audience: formData.targetAudience
    };

    try {
      let response;
      if (editingId) {
        response = await api.admin.updateAnnouncement(editingId, announcementData);
      } else {
        response = await api.admin.createAnnouncement(announcementData);
      }

      if (response.success) {
        await loadAnnouncements(); // Reload announcements
        resetForm();
        alert(editingId ? 'Pengumuman berhasil diperbarui!' : 'Pengumuman berhasil dibuat!');
      } else {
        alert('Gagal menyimpan pengumuman: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Terjadi kesalahan saat menyimpan pengumuman');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetAudience: announcement.target_audience || announcement.targetAudience
    });
    setEditingId(announcement.id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      try {
        const response = await api.admin.deleteAnnouncement(id);
        if (response.success) {
          await loadAnnouncements(); // Reload announcements
          alert('Pengumuman berhasil dihapus!');
        } else {
          alert('Gagal menghapus pengumuman: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Terjadi kesalahan saat menghapus pengumuman');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      targetAudience: 'all'
    });
    setIsCreating(false);
    setEditingId(null);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
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

  return (
    <div className="p-6 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Pengumuman</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Buat Pengumuman
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul pengumuman"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritas
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audiens
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Pengguna</option>
                <option value="students">Siswa</option>
                <option value="instructors">Instruktur</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Pengumuman
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan konten pengumuman"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send size={16} />
                {editingId ? 'Update' : 'Publikasikan'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Belum ada pengumuman yang dibuat</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {announcement.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {getPriorityText(announcement.priority)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {getAudienceText(announcement.target_audience || announcement.targetAudience)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{announcement.author || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(announcement.created_at || announcement.createdAt)}</span>
                      </div>
                      {(announcement.updated_at || announcement.updatedAt) !== (announcement.created_at || announcement.createdAt) && (
                        <span className="text-xs text-gray-400">
                          (Diperbarui: {formatDate(announcement.updated_at || announcement.updatedAt)})
                        </span>
                      )}
                    </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementManager;