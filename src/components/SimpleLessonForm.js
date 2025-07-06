import React, { useState } from 'react';
import { Plus, Trash2, FileText, Video, Globe, BookOpen, Save, X } from 'lucide-react';

const SimpleLessonForm = ({ lesson, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: lesson?.id || Date.now().toString(),
    title: lesson?.title || '',
    type: lesson?.type || 'mixed',
    content: lesson?.content || []
  });

  const addContentItem = (type) => {
    const newItem = {
      id: Date.now().toString(),
      type: type
    };

    switch (type) {
      case 'text':
        newItem.content = '';
        break;
      case 'pdf':
        newItem.title = '';
        newItem.description = '';
        newItem.filename = '';
        newItem.embedUrl = '';
        newItem.downloadUrl = '';
        break;
      case 'video':
        newItem.title = '';
        newItem.description = '';
        newItem.src = '';
        newItem.duration = '';
        break;
      case 'external_link':
        newItem.title = '';
        newItem.description = '';
        newItem.url = '';
        break;
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      content: [...prev.content, newItem]
    }));
  };

  const updateContentItem = (index, field, value) => {
    const updatedContent = [...formData.content];
    updatedContent[index] = {
      ...updatedContent[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      content: updatedContent
    }));
  };

  const removeContentItem = (index) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderContentForm = (item, index) => {
    switch (item.type) {
      case 'text':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 text-gray-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-purple-600" size={20} />
                <h4 className="font-medium text-gray-900">Teks</h4>
              </div>
              <button
                type="button"
                onClick={() => removeContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <textarea
              value={item.content || ''}
              onChange={(e) => updateContentItem(index, 'content', e.target.value)}
              placeholder="Masukkan konten teks (mendukung Markdown)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="text-red-600" size={20} />
                <h4 className="font-medium text-gray-900">PDF Document</h4>
              </div>
              <button
                type="button"
                onClick={() => removeContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateContentItem(index, 'title', e.target.value)}
                placeholder="Judul PDF"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={item.filename || ''}
                onChange={(e) => updateContentItem(index, 'filename', e.target.value)}
                placeholder="Nama file (contoh: document.pdf)"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              value={item.description || ''}
              onChange={(e) => updateContentItem(index, 'description', e.target.value)}
              placeholder="Deskripsi PDF"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-4"
              rows={2}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="url"
                value={item.embedUrl || ''}
                onChange={(e) => updateContentItem(index, 'embedUrl', e.target.value)}
                placeholder="URL untuk embed PDF (opsional)"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="url"
                value={item.downloadUrl || ''}
                onChange={(e) => updateContentItem(index, 'downloadUrl', e.target.value)}
                placeholder="URL untuk download PDF"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Video className="text-blue-600" size={20} />
                <h4 className="font-medium text-gray-900">Video</h4>
              </div>
              <button
                type="button"
                onClick={() => removeContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateContentItem(index, 'title', e.target.value)}
                placeholder="Judul Video"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={item.duration || ''}
                onChange={(e) => updateContentItem(index, 'duration', e.target.value)}
                placeholder="Durasi (contoh: 10:30)"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <textarea
              value={item.description || ''}
              onChange={(e) => updateContentItem(index, 'description', e.target.value)}
              placeholder="Deskripsi Video"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-4"
              rows={2}
            />
            <input
              type="url"
              value={item.src || ''}
              onChange={(e) => updateContentItem(index, 'src', e.target.value)}
              placeholder="URL Video (YouTube embed, Vimeo, dll)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-4"
            />
          </div>
        );

      case 'external_link':
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Globe className="text-green-600" size={20} />
                <h4 className="font-medium text-gray-900">Link Eksternal</h4>
              </div>
              <button
                type="button"
                onClick={() => removeContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) => updateContentItem(index, 'title', e.target.value)}
              placeholder="Judul Link"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <textarea
              value={item.description || ''}
              onChange={(e) => updateContentItem(index, 'description', e.target.value)}
              placeholder="Deskripsi Link"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={2}
            />
            <input
              type="url"
              value={item.url || ''}
              onChange={(e) => updateContentItem(index, 'url', e.target.value)}
              placeholder="URL Link Eksternal"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {lesson ? 'Edit Lesson' : 'Tambah Lesson Baru'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Lesson
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Masukkan judul lesson"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Lesson
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mixed">Mixed Content (Rekomendasi)</option>
              <option value="reading">Reading Only</option>
              <option value="video">Video Only</option>
            </select>
          </div>

          {/* Content Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Konten Lesson</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => addContentItem('text')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Teks
                </button>
                <button
                  type="button"
                  onClick={() => addContentItem('pdf')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => addContentItem('video')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => addContentItem('external_link')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Link
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {formData.content.map((item, index) => (
                <div key={item.id || `content-${index}`}>
                  {renderContentForm(item, index)}
                </div>
              ))}
              {formData.content.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada konten. Klik tombol di atas untuk menambah konten.
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="mr-2 h-4 w-4" />
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleLessonForm;