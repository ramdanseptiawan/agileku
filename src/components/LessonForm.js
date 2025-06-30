import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Upload, File, ExternalLink, ListOrdered, ListChecks, Play } from 'lucide-react';
import WysiwygEditor from './WysiwygEditor';

const LessonForm = ({ lessons = [], onChange, errors }) => {
  const [editingLesson, setEditingLesson] = useState(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'reading',
    content: [],  // Changed from string to array for structured content
    videoUrl: '',
    duration: '',
    files: [],
    externalLinks: []
  });

  const lessonTypes = [
    { value: 'reading', label: 'Reading Material' },
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'audio', label: 'Audio' },
    { value: 'mixed', label: 'Mixed Content' }
  ];

  const addLesson = () => {
    if (!newLesson.title.trim()) {
      alert('Judul pelajaran wajib diisi');
      return;
    }

    // Convert string content to structured content if needed
    let processedLesson = { ...newLesson };
    
    // If content is a string and not an array, convert it to a structured format
    if (typeof processedLesson.content === 'string' && processedLesson.content.trim() !== '') {
      processedLesson.content = [{ type: 'text', content: processedLesson.content }];
    }
    
    // For video type, ensure we have a structured content format
    if (processedLesson.type === 'video' && processedLesson.videoUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: 'video',
            src: processedLesson.videoUrl,
            title: processedLesson.title || 'Video',
            duration: processedLesson.duration || '',
            description: processedLesson.description || ''
          }
        ]
      };
    }
    
    // For PDF type, ensure we have a structured content format
    if (processedLesson.type === 'pdf' && processedLesson.fileUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: 'pdf',
            src: processedLesson.fileUrl,
            title: processedLesson.title || 'PDF Document',
            description: processedLesson.description || '',
            filename: processedLesson.filename || 'document.pdf',
            embed: processedLesson.embed || false
          }
        ]
      };
    }
    
    // For presentation and audio types, ensure we have a structured content format
    if ((processedLesson.type === 'presentation' || processedLesson.type === 'audio') && processedLesson.fileUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: processedLesson.type,
            src: processedLesson.fileUrl,
            title: processedLesson.title || `${processedLesson.type.charAt(0).toUpperCase() + processedLesson.type.slice(1)}`,
            description: processedLesson.description || ''
          }
        ]
      };
    }
    
    // For presentation and audio types, ensure we have a structured content format
    if ((processedLesson.type === 'presentation' || processedLesson.type === 'audio') && processedLesson.fileUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: processedLesson.type,
            src: processedLesson.fileUrl,
            title: processedLesson.title || `${processedLesson.type.charAt(0).toUpperCase() + processedLesson.type.slice(1)}`,
            description: processedLesson.description || ''
          }
        ]
      };
    }
    
    // For presentation and audio types, ensure we have a structured content format
    if ((processedLesson.type === 'presentation' || processedLesson.type === 'audio') && processedLesson.fileUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: processedLesson.type,
            src: processedLesson.fileUrl,
            title: processedLesson.title || `${processedLesson.type.charAt(0).toUpperCase() + processedLesson.type.slice(1)}`,
            description: processedLesson.description || ''
          }
        ]
      };
    }
    
    // For presentation and audio types, ensure we have a structured content format
    if ((processedLesson.type === 'presentation' || processedLesson.type === 'audio') && processedLesson.fileUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: processedLesson.type,
            src: processedLesson.fileUrl,
            title: processedLesson.title || `${processedLesson.type.charAt(0).toUpperCase() + processedLesson.type.slice(1)}`,
            description: processedLesson.description || ''
          }
        ]
      };
    }

    const lessonToAdd = {
      ...processedLesson,
      id: Date.now(), // Simple ID generation
    };

    onChange([...(lessons || []), lessonToAdd]);
    setNewLesson({
      title: '',
      type: 'reading',
      content: [],
      videoUrl: '',
      duration: '',
      description: '',
      fileUrl: '',
      filename: '',
      embed: false,
      files: [],
      externalLinks: []
    });
  };

  const updateLesson = (index, updatedLesson) => {
    // Convert string content to structured content if needed
    let processedLesson = { ...updatedLesson };
    
    // If content is a string and not an array, convert it to a structured format
    if (typeof processedLesson.content === 'string' && processedLesson.content.trim() !== '') {
      processedLesson.content = [{ type: 'text', content: processedLesson.content }];
    }
    
    // For video type, ensure we have a structured content format
    if (processedLesson.type === 'video' && processedLesson.videoUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: 'video',
            src: processedLesson.videoUrl,
            title: processedLesson.title || 'Video',
            duration: processedLesson.duration || '',
            description: processedLesson.description || ''
          }
        ]
      };
    }
    
    // For PDF type, ensure we have a structured content format
    if (processedLesson.type === 'pdf' && processedLesson.fileUrl) {
      processedLesson = {
        ...processedLesson,
        content: [
          {
            type: 'pdf',
            src: processedLesson.fileUrl,
            title: processedLesson.title || 'PDF Document',
            description: processedLesson.description || '',
            filename: processedLesson.filename || 'document.pdf',
            embed: processedLesson.embed || false
          }
        ]
      };
    }
    
    const updatedLessons = (lessons || []).map((lesson, i) => 
      i === index ? processedLesson : lesson
    );
    onChange(updatedLessons);
    setEditingLesson(null);
  };

  const deleteLesson = (index) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelajaran ini?')) {
      const updatedLessons = (lessons || []).filter((_, i) => i !== index);
      onChange(updatedLessons);
    }
  };

  const addExternalLink = (lesson, setLesson) => {
    const url = prompt('Masukkan URL:');
    const title = prompt('Masukkan judul link:');
    
    if (url && title) {
      setLesson({
        ...lesson,
        externalLinks: [...(lesson.externalLinks || []), { url, title, id: Date.now() }]
      });
    }
  };

  const removeExternalLink = (lesson, setLesson, linkId) => {
    setLesson({
      ...lesson,
      externalLinks: (lesson.externalLinks || []).filter(link => link.id !== linkId)
    });
  };

  const LessonEditor = ({ lesson, onSave, onCancel, isNew = false }) => {
    const [editLesson, setEditLesson] = useState(lesson);

    const renderMixedContentEditor = (item, index) => {
      const updateItem = (field, value) => {
        const newContent = [...(Array.isArray(editLesson.content) ? editLesson.content : [])]; 
        newContent[index] = { ...item, [field]: value };
        setEditLesson({ ...editLesson, content: newContent });
      };

      switch (item.type) {
        case 'text':
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konten Text</label>
              <WysiwygEditor
                value={item.content || ''}
                onChange={(content) => updateItem('content', content)}
                placeholder="Tulis konten text di sini..."
                height="200px"
              />
            </div>
          );
        case 'image':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Gambar</label>
                <input
                  type="url"
                  value={item.src || ''}
                  onChange={(e) => updateItem('src', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={item.alt || ''}
                  onChange={(e) => updateItem('alt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Deskripsi gambar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption (opsional)</label>
                <input
                  type="text"
                  value={item.caption || ''}
                  onChange={(e) => updateItem('caption', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Caption gambar"
                />
              </div>
            </div>
          );
        case 'ordered_list':
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <ListOrdered size={18} className="text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">Daftar Berurutan</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item (satu per baris)</label>
                <textarea
                  value={(item.items || []).join('\n')}
                  onChange={(e) => updateItem('items', e.target.value.split('\n').filter(line => line.trim()))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="5"
                  placeholder="Item 1\nItem 2\nItem 3"
                />
              </div>
            </div>
          );
        case 'unordered_list':
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks size={18} className="text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">Daftar Tidak Berurutan</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item (satu per baris)</label>
                <textarea
                  value={(item.items || []).join('\n')}
                  onChange={(e) => updateItem('items', e.target.value.split('\n').filter(line => line.trim()))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="5"
                  placeholder="Item 1\nItem 2\nItem 3"
                />
              </div>
            </div>
          );
        case 'code':
          return (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bahasa Pemrograman</label>
                <input
                  type="text"
                  value={item.language || ''}
                  onChange={(e) => updateItem('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="javascript, python, html, css, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kode</label>
                <textarea
                  value={item.content || ''}
                  onChange={(e) => updateItem('content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  rows="8"
                  placeholder="Tulis kode di sini..."
                />
              </div>
            </div>
          );
        case 'video':
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Play size={18} className="text-red-600" />
                <label className="block text-sm font-medium text-gray-700">Video</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Video</label>
                <input
                  type="url"
                  value={item.src || ''}
                  onChange={(e) => updateItem('src', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul Video</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateItem('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Judul video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durasi</label>
                <input
                  type="text"
                  value={item.duration || ''}
                  onChange={(e) => updateItem('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 15:30"
                />
              </div>
            </div>
          );
        case 'pdf':
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <File size={18} className="text-orange-600" />
                <label className="block text-sm font-medium text-gray-700">PDF</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL PDF</label>
                <input
                  type="url"
                  value={item.src || ''}
                  onChange={(e) => updateItem('src', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateItem('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Judul dokumen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateItem('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Deskripsi dokumen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama File</label>
                <input
                  type="text"
                  value={item.filename || ''}
                  onChange={(e) => updateItem('filename', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="nama-file.pdf"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`embed-pdf-${index}`}
                  checked={item.embed || false}
                  onChange={(e) => updateItem('embed', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor={`embed-pdf-${index}`} className="text-sm text-gray-700">
                  Tampilkan PDF langsung di halaman
                </label>
              </div>
            </div>
          );
        case 'external_link':
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink size={18} className="text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">Link Eksternal</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={item.url || ''}
                  onChange={(e) => updateItem('url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateItem('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Judul link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateItem('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Deskripsi link"
                />
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    const handleSave = () => {
      if (!editLesson.title.trim()) {
        alert('Judul pelajaran wajib diisi');
        return;
      }
      onSave(editLesson);
    };

    const renderContentEditor = () => {
      switch (editLesson.type) {
        case 'reading':
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Terstruktur
              </label>
              <div className="space-y-4">
                {(Array.isArray(editLesson.content) ? editLesson.content : []).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <select
                        value={item.type || 'text'}
                        onChange={(e) => {
                          const newContent = [...(Array.isArray(editLesson.content) ? editLesson.content : [])];
                          newContent[index] = { ...item, type: e.target.value };
                          setEditLesson({ ...editLesson, content: newContent });
                        }}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="image">Image</option>
                        <option value="ordered_list">Daftar Berurutan</option>
                        <option value="unordered_list">Daftar Tidak Berurutan</option>
                        <option value="code">Code</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="external_link">Link Eksternal</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const newContent = [...(Array.isArray(editLesson.content) ? editLesson.content : [])];
                          newContent.splice(index, 1);
                          setEditLesson({ ...editLesson, content: newContent });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {renderMixedContentEditor(item, index)}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newContent = Array.isArray(editLesson.content) ? [...editLesson.content] : [];
                    newContent.push({ type: 'text', content: '' });
                    setEditLesson({ ...editLesson, content: newContent });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Tambah Konten
                </button>
              </div>
            </div>
          );
          
        case 'mixed':
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Campuran
              </label>
              <div className="space-y-4">
                {(Array.isArray(editLesson.content) ? editLesson.content : []).map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <select
                        value={item.type || 'text'}
                        onChange={(e) => {
                          const newContent = [...(Array.isArray(editLesson.content) ? editLesson.content : [])];
                          newContent[index] = { ...item, type: e.target.value };
                          setEditLesson({ ...editLesson, content: newContent });
                        }}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="image">Image</option>
                        <option value="ordered_list">Daftar Berurutan</option>
                        <option value="unordered_list">Daftar Tidak Berurutan</option>
                        <option value="code">Code</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="external_link">Link Eksternal</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const newContent = [...(Array.isArray(editLesson.content) ? editLesson.content : [])];
                          newContent.splice(index, 1);
                          setEditLesson({ ...editLesson, content: newContent });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {renderMixedContentEditor(item, index)}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newContent = Array.isArray(editLesson.content) ? [...editLesson.content] : [];
                    newContent.push({ type: 'text', content: '' });
                    setEditLesson({ ...editLesson, content: newContent });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Tambah Konten
                </button>
              </div>
            </div>
          );
          
        case 'video':
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Play size={18} className="text-red-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Video
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Video
                </label>
                <input
                  type="url"
                  value={editLesson.videoUrl || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Video
                </label>
                <input
                  type="text"
                  value={editLesson.title || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Judul video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi
                </label>
                <input
                  type="text"
                  value={editLesson.duration || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15:30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi (opsional)
                </label>
                <textarea
                  value={editLesson.description || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Deskripsi video"
                />
              </div>
            </div>
          );
          
        case 'pdf':
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <File size={18} className="text-orange-600" />
                <label className="block text-sm font-medium text-gray-700">
                  PDF
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL PDF
                </label>
                <input
                  type="url"
                  value={editLesson.fileUrl || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul
                </label>
                <input
                  type="text"
                  value={editLesson.title || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Judul dokumen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={editLesson.description || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Deskripsi dokumen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama File
                </label>
                <input
                  type="text"
                  value={editLesson.filename || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, filename: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="nama-file.pdf"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="embed-pdf"
                  checked={editLesson.embed || false}
                  onChange={(e) => setEditLesson({ ...editLesson, embed: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="embed-pdf" className="text-sm text-gray-700">
                  Tampilkan PDF langsung di halaman
                </label>
              </div>
            </div>
          );
          
        case 'presentation':
        case 'audio':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL File
                </label>
                <input
                  type="url"
                  value={editLesson.fileUrl || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/file"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul
                </label>
                <input
                  type="text"
                  value={editLesson.title || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Judul file"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={editLesson.description || ''}
                  onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Deskripsi file"
                />
              </div>
            </div>
          );
          
        default:
          return null;
      }
    };

    return (
      <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="space-y-4 text-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Pelajaran *
              </label>
              <input
                type="text"
                value={editLesson.title}
                onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan judul pelajaran"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Pelajaran
              </label>
              <select
                value={editLesson.type}
                onChange={(e) => setEditLesson({ ...editLesson, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {lessonTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {renderContentEditor()}
          
          {/* External Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Link Eksternal
              </label>
              <button
                type="button"
                onClick={() => addExternalLink(editLesson, setEditLesson)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Plus size={16} />
                Tambah Link
              </button>
            </div>
            
            {(editLesson.externalLinks || []).length > 0 && (
              <div className="space-y-2">
                {(editLesson.externalLinks || []).map((link) => (
                  <div key={link.id} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded">
                    <ExternalLink size={16} className="text-blue-500" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{link.title}</div>
                      <div className="text-xs text-gray-500">{link.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExternalLink(editLesson, setEditLesson, link.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Save size={16} />
              {isNew ? 'Tambah Pelajaran' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Pelajaran</h3>
        <span className="text-sm text-gray-500">
          {(lessons || []).length} pelajaran
        </span>
      </div>
      
      {errors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{errors}</p>
        </div>
      )}
      
      {/* Existing Lessons */}
      {(lessons || []).length > 0 && (
        <div className="space-y-4 text-gray-900">
          {(lessons || []).map((lesson, index) => (
            <div key={lesson.id || index}>
              {editingLesson === index ? (
                <LessonEditor
                  lesson={lesson}
                  onSave={(updatedLesson) => updateLesson(index, updatedLesson)}
                  onCancel={() => setEditingLesson(null)}
                />
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {lessonTypes.find(t => t.value === lesson.type)?.label || lesson.type}
                      </p>
                      {(lesson.externalLinks || []).length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {(lesson.externalLinks || []).length} link eksternal
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingLesson(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit pelajaran"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteLesson(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus pelajaran"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Add New Lesson */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Tambah Pelajaran Baru</h4>
        <LessonEditor
          lesson={newLesson}
          onSave={addLesson}
          onCancel={() => setNewLesson({
            title: '',
            type: 'reading',
            content: [],
            videoUrl: '',
            duration: '',
            description: '',
            fileUrl: '',
            filename: '',
            embed: false,
            files: [],
            externalLinks: []
          })}
          isNew={true}
        />
      </div>
    </div>
  );
};

export default LessonForm;