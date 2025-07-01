import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, FileText, Video, Globe, BookOpen, Edit, Upload, Link, Eye, AlertCircle } from 'lucide-react';
import SimpleLessonForm from './SimpleLessonForm';
import { saveFileToIndexedDB } from '../utils/indexedDB';
import { saveCourse } from '../utils/localStorage';

const SimpleCourseForm = ({ initialData, onSave, onCancel, isLoading, isEditing }) => {
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    instructor: '',
    image: '',
    introMaterial: {
      title: '',
      content: []
    },
    lessons: []
  });

  // Effect to update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log('Loading initial data:', initialData);
      setFormData(prevData => ({
        id: initialData.id || Date.now(),
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        level: initialData.level || 'Beginner',
        duration: initialData.duration || '',
        instructor: initialData.instructor || '',
        image: initialData.image || '',
        introMaterial: {
          title: initialData.introMaterial?.title || '',
          content: Array.isArray(initialData.introMaterial?.content) 
            ? initialData.introMaterial.content.map(item => ({
                id: item.id || Date.now() + Math.random(),
                type: item.type || 'text',
                content: item.content || '',
                title: item.title || '',
                description: item.description || '',
                uploadMethod: item.uploadMethod || 'link',
                downloadUrl: item.downloadUrl || '',
                embedUrl: item.embedUrl || '',
                src: item.src || '',
                duration: item.duration || '',
                url: item.url || '',
                fileId: item.fileId || '',
                filename: item.filename || ''
              }))
            : []
        },
        lessons: Array.isArray(initialData.lessons) ? initialData.lessons : []
      }));
    } else if (!isEditing) {
      // Reset form for new course
      setFormData({
        id: Date.now(),
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        duration: '',
        instructor: '',
        image: '',
        introMaterial: {
          title: '',
          content: []
        },
        lessons: []
      });
    }
   }, [initialData, isEditing]);

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showIntroForm, setShowIntroForm] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState(new Set());
  const [uploadProgress, setUploadProgress] = useState({});

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIntroChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      introMaterial: {
        ...prev.introMaterial,
        [field]: value
      }
    }));
  };

  const addIntroContentItem = (type) => {
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
        newItem.uploadMethod = 'link'; // 'link' or 'upload'
        newItem.fileId = '';
        break;
      case 'video':
        newItem.title = '';
        newItem.description = '';
        newItem.src = '';
        newItem.duration = '';
        newItem.uploadMethod = 'link'; // 'link' or 'upload'
        newItem.fileId = '';
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
      introMaterial: {
        ...prev.introMaterial,
        content: [...(prev.introMaterial.content || []), newItem]
      }
    }));
  };

  const updateIntroContentItem = (index, field, value) => {
    setFormData(prev => {
      const newContent = [...(prev.introMaterial.content || [])];
      if (newContent[index]) {
        const updatedItem = { ...newContent[index], [field]: value };
        
        // Clear irrelevant fields when uploadMethod changes
        if (field === 'uploadMethod') {
          if (value === 'link') {
            // Clear upload-related fields
            updatedItem.fileId = '';
            updatedItem.filename = '';
          } else if (value === 'upload') {
            // Clear link-related fields based on content type
            if (updatedItem.type === 'pdf') {
              updatedItem.downloadUrl = '';
              updatedItem.embedUrl = '';
            } else if (updatedItem.type === 'video') {
              updatedItem.src = '';
              updatedItem.duration = '';
            }
          }
        }
        
        newContent[index] = updatedItem;
      }
      
      return {
        ...prev,
        introMaterial: {
          ...prev.introMaterial,
          content: newContent
        }
      };
    });
  };

  const removeIntroContentItem = (index) => {
    setFormData(prev => ({
      ...prev,
      introMaterial: {
        ...prev.introMaterial,
        content: (prev.introMaterial.content || []).filter((_, i) => i !== index)
      }
    }));
  };

  const handleLessonSave = (lessonData) => {
    if (editingLesson !== null) {
      // Edit existing lesson
      const updatedLessons = [...formData.lessons];
      updatedLessons[editingLesson] = lessonData;
      setFormData(prev => ({
        ...prev,
        lessons: updatedLessons
      }));
    } else {
      // Add new lesson
      setFormData(prev => ({
        ...prev,
        lessons: [...prev.lessons, lessonData]
      }));
    }
    setShowLessonForm(false);
    setEditingLesson(null);
  };

  const handleLessonEdit = (index) => {
    setEditingLesson(index);
    setShowLessonForm(true);
  };

  const handleLessonDelete = (index) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }));
  };

  const validateUrl = (url, type) => {
    if (!url) return false;
    if (url.startsWith('blob:')) return true;
    
    if (type === 'video') {
      return url.includes('youtube.com') || url.includes('youtu.be') || 
             url.includes('vimeo.com') || url.startsWith('http');
    }
    return url.startsWith('http') || url.startsWith('https');
  };

  const getUrlValidationMessage = (url, type) => {
    if (!url) return '';
    if (url.startsWith('blob:')) return '';
    
    if (type === 'video') {
      if (!url.includes('youtube.com') && !url.includes('youtu.be') && 
          !url.includes('vimeo.com') && !url.startsWith('http')) {
        return 'URL harus berupa link YouTube, Vimeo, atau URL video langsung';
      }
    } else {
      if (!url.startsWith('http') && !url.startsWith('https')) {
        return 'URL harus dimulai dengan http:// atau https://';
      }
    }
    return '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeUploadedFile = (index, type) => {
    const item = formData.introMaterial[index];
    
    // Clean up blob URLs
    if (item.embedUrl && item.embedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.embedUrl);
      setPreviewUrls(prev => {
        const newUrls = new Set(prev);
        newUrls.delete(item.embedUrl);
        return newUrls;
      });
    }
    if (item.downloadUrl && item.downloadUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.downloadUrl);
      setPreviewUrls(prev => {
        const newUrls = new Set(prev);
        newUrls.delete(item.downloadUrl);
        return newUrls;
      });
    }
    if (item.src && item.src.startsWith('blob:')) {
      URL.revokeObjectURL(item.src);
      setPreviewUrls(prev => {
        const newUrls = new Set(prev);
        newUrls.delete(item.src);
        return newUrls;
      });
    }
    
    // Clear file-related fields
    updateIntroContentItem(index, 'fileId', '');
    updateIntroContentItem(index, 'filename', '');
    updateIntroContentItem(index, 'fileSize', '');
    
    if (type === 'pdf') {
      updateIntroContentItem(index, 'downloadUrl', '');
      updateIntroContentItem(index, 'embedUrl', '');
    } else if (type === 'video') {
      updateIntroContentItem(index, 'src', '');
    }
  };

  const handleFileUpload = async (file, index, type) => {
    try {
      const uploadKey = `${type}_${index}`;
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
      setUploadProgress(prev => ({ ...prev, [uploadKey]: 0 }));
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [uploadKey]: Math.min((prev[uploadKey] || 0) + Math.random() * 30, 90)
        }));
      }, 200);
      
      const fileData = await saveFileToIndexedDB(file, formData.id, type);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [uploadKey]: 100 }));
      
      // Track blob URLs for cleanup
      setPreviewUrls(prev => new Set([...prev, fileData.url, fileData.downloadUrl]));
      
      updateIntroContentItem(index, 'fileId', fileData.id);
      updateIntroContentItem(index, 'filename', fileData.name);
      updateIntroContentItem(index, 'fileSize', formatFileSize(file.size));
      
      if (type === 'pdf') {
        updateIntroContentItem(index, 'downloadUrl', fileData.downloadUrl);
        updateIntroContentItem(index, 'embedUrl', fileData.url);
      } else if (type === 'video') {
        updateIntroContentItem(index, 'src', fileData.url);
      }
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[uploadKey];
          return newProgress;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Gagal mengupload file ${file.name}. Silakan coba lagi.`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [`${type}_${index}`]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Judul course harus diisi');
      return;
    }
    
    if (!formData.category.trim()) {
      alert('Kategori course harus diisi');
      return;
    }
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Terjadi error saat menyimpan course.');
    }
  };

  const renderIntroContentForm = (item, index) => {
    switch (item.type) {
      case 'text':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-purple-600" size={16} />
                <span className="text-sm font-medium text-gray-900">Teks</span>
              </div>
              <button
                type="button"
                onClick={() => removeIntroContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={item.content || ''}
              onChange={(e) => updateIntroContentItem(index, 'content', e.target.value)}
              placeholder="Konten teks (mendukung Markdown)"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
            {item.content && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                <div className="flex items-center space-x-1 mb-1">
                  <Eye size={12} />
                  <span className="text-xs font-medium">Preview:</span>
                </div>
                <div className="whitespace-pre-wrap">{item.content}</div>
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="text-red-600" size={16} />
                <span className="text-sm font-medium text-gray-900">PDF</span>
              </div>
              <button
                type="button"
                onClick={() => removeIntroContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateIntroContentItem(index, 'title', e.target.value)}
                placeholder="Judul PDF"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => updateIntroContentItem(index, 'description', e.target.value)}
                placeholder="Deskripsi"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              
              {/* File Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Upload size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Upload PDF atau Input Link</span>
                </div>
                
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file, index, 'pdf');
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  disabled={uploadingFiles[`pdf_${index}`]}
                />
                
                {uploadingFiles[`pdf_${index}`] && (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600">Mengupload PDF...</p>
                    {uploadProgress[`pdf_${index}`] !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[`pdf_${index}`]}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {item.filename && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700 font-medium">✓ File terupload: {item.filename}</p>
                    {item.fileSize && (
                      <p className="text-xs text-green-600">Ukuran: {item.fileSize}</p>
                    )}
                    <div className="flex space-x-2 mt-1">
                      {item.embedUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(item.embedUrl, '_blank')}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <Eye size={12} />
                          <span>Preview</span>
                        </button>
                      )}
                      {item.downloadUrl && (
                         <button
                           type="button"
                           onClick={() => window.open(item.downloadUrl, '_blank')}
                           className="text-xs text-green-600 hover:text-green-800 flex items-center space-x-1"
                         >
                           <FileText size={12} />
                           <span>Download</span>
                         </button>
                       )}
                       <button
                         type="button"
                         onClick={() => removeUploadedFile(index, 'pdf')}
                         className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                         title="Hapus file"
                       >
                         <Trash2 size={12} />
                         <span>Hapus</span>
                       </button>
                     </div>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atau edit link manual:
                  </label>
                  <input
                    type="url"
                    value={item.downloadUrl || ''}
                    onChange={(e) => updateIntroContentItem(index, 'downloadUrl', e.target.value)}
                    placeholder="URL Download PDF"
                    className={`w-full p-2 border rounded text-sm ${
                      item.downloadUrl && !validateUrl(item.downloadUrl, 'pdf') 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {item.downloadUrl && !validateUrl(item.downloadUrl, 'pdf') && (
                    <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={12} />
                      <span>{getUrlValidationMessage(item.downloadUrl, 'pdf') || 'URL tidak valid'}</span>
                    </div>
                  )}
              
              {/* PDF Preview */}
              {(item.embedUrl || item.downloadUrl) && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                  <div className="flex items-center space-x-1 mb-2">
                    <Eye size={12} />
                    <span className="font-medium text-xs">Preview PDF:</span>
                  </div>
                  {item.embedUrl ? (
                    <div className="space-y-2">
                      <iframe
                        src={item.embedUrl}
                        className="w-full h-64 border border-gray-300 rounded"
                        title="PDF Preview"
                      />
                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <FileText size={12} />
                          <span>Download PDF</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <FileText size={12} />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              )}
                  <input
                    type="url"
                    value={item.embedUrl || ''}
                    onChange={(e) => updateIntroContentItem(index, 'embedUrl', e.target.value)}
                    placeholder="URL Embed PDF (opsional)"
                    className={`w-full p-2 border rounded text-sm ${
                      item.embedUrl && !validateUrl(item.embedUrl, 'pdf') 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {item.embedUrl && !validateUrl(item.embedUrl, 'pdf') && (
                    <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={12} />
                      <span>{getUrlValidationMessage(item.embedUrl, 'pdf') || 'URL tidak valid'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video Preview */}
              {item.src && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                  <div className="flex items-center space-x-1 mb-2">
                    <Eye size={12} />
                    <span className="font-medium text-xs">Preview Video:</span>
                    {item.duration && (
                      <span className="text-xs text-gray-600">({item.duration})</span>
                    )}
                  </div>
                  {item.src.includes('youtube.com') || item.src.includes('youtu.be') ? (
                    <div className="relative">
                      <iframe
                        width="100%"
                        height="200"
                        src={item.src.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded"
                      />
                      <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded">
                        YouTube
                      </div>
                    </div>
                  ) : item.src.includes('vimeo.com') ? (
                    <div className="relative">
                      <iframe
                        src={item.src.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        width="100%"
                        height="200"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="rounded"
                      />
                      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">
                        Vimeo
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        controls
                        className="w-full h-48 rounded"
                        src={item.src}
                      >
                        Browser Anda tidak mendukung tag video.
                      </video>
                      <div className="absolute top-1 right-1 bg-gray-600 text-white text-xs px-1 rounded">
                        {item.src.startsWith('blob:') ? 'Upload' : 'Direct'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Video className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-gray-900">Video</span>
              </div>
              <button
                type="button"
                onClick={() => removeIntroContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateIntroContentItem(index, 'title', e.target.value)}
                placeholder="Judul Video"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => updateIntroContentItem(index, 'description', e.target.value)}
                placeholder="Deskripsi Video"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              
              {/* File Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Upload size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Upload Video atau Input Link</span>
                </div>
                
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file, index, 'video');
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  disabled={uploadingFiles[`video_${index}`]}
                />
                
                {uploadingFiles[`video_${index}`] && (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-600">Mengupload Video...</p>
                    {uploadProgress[`video_${index}`] !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[`video_${index}`]}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {item.filename && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700 font-medium">✓ File terupload: {item.filename}</p>
                    {item.fileSize && (
                      <p className="text-xs text-green-600">Ukuran: {item.fileSize}</p>
                    )}
                    <div className="flex space-x-2 mt-1">
                       {item.src && (
                         <button
                           type="button"
                           onClick={() => window.open(item.src, '_blank')}
                           className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                         >
                           <Eye size={12} />
                           <span>Preview</span>
                         </button>
                       )}
                       <button
                         type="button"
                         onClick={() => removeUploadedFile(index, 'video')}
                         className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                         title="Hapus file"
                       >
                         <Trash2 size={12} />
                         <span>Hapus</span>
                       </button>
                     </div>
                   </div>
                )}
                
                <div className="border-t pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atau edit link manual:
                  </label>
                  <input
                    type="url"
                    value={item.src || ''}
                    onChange={(e) => updateIntroContentItem(index, 'src', e.target.value)}
                    placeholder="URL Video (YouTube, Vimeo, atau link langsung)"
                    className={`w-full p-2 border rounded text-sm ${
                      item.src && !validateUrl(item.src, 'video') 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {item.src && !validateUrl(item.src, 'video') && (
                    <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                      <AlertCircle size={12} />
                      <span>{getUrlValidationMessage(item.src, 'video') || 'URL video tidak valid'}</span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={item.duration || ''}
                    onChange={(e) => updateIntroContentItem(index, 'duration', e.target.value)}
                    placeholder="Durasi (contoh: 5:30)"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'external_link':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Globe className="text-green-600" size={16} />
                <span className="text-sm font-medium text-gray-900">Link</span>
              </div>
              <button
                type="button"
                onClick={() => removeIntroContentItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateIntroContentItem(index, 'title', e.target.value)}
                placeholder="Judul Link"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => updateIntroContentItem(index, 'description', e.target.value)}
                placeholder="Deskripsi"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="url"
                value={item.url || ''}
                onChange={(e) => updateIntroContentItem(index, 'url', e.target.value)}
                placeholder="URL"
                className={`w-full p-2 border rounded text-sm ${
                  item.url && !validateUrl(item.url, 'link') 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {item.url && !validateUrl(item.url, 'link') && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <AlertCircle size={12} />
                  <span>{getUrlValidationMessage(item.url, 'link') || 'URL tidak valid'}</span>
                </div>
              )}
              
              {/* External Link Preview */}
              {item.url && validateUrl(item.url, 'link') && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                  <div className="flex items-center space-x-1 mb-2">
                    <Eye size={12} />
                    <span className="font-medium text-xs">Preview Link:</span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 break-all"
                  >
                    <Globe size={12} />
                    <span className="text-xs">{item.url}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showLessonForm) {
    return (
      <SimpleLessonForm
        lesson={editingLesson !== null ? formData.lessons[editingLesson] : null}
        onSave={handleLessonSave}
        onCancel={() => {
          setShowLessonForm(false);
          setEditingLesson(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 max-h-screen overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Course' : 'Tambah Course Baru'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-gray-900 overflow-y-auto">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Course
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <input
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                name="level"
                value={formData.level || 'Beginner'}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durasi
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration || ''}
                onChange={handleInputChange}
                placeholder="contoh: 4 weeks"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar
              </label>
              <input
                type="url"
                name="image"
                value={formData.image || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Course
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Intro Material */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Materi Pengantar</h3>
              <button
                type="button"
                onClick={() => setShowIntroForm(!showIntroForm)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showIntroForm ? 'Sembunyikan' : 'Kelola Materi Pengantar'}
              </button>
            </div>

            {showIntroForm && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Materi Pengantar
                  </label>
                  <input
                    type="text"
                    value={formData.introMaterial?.title || ''}
                    onChange={(e) => handleIntroChange('title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Selamat Datang di Course..."
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Konten Pengantar</span>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => addIntroContentItem('text')}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <BookOpen size={12} className="inline mr-1" />Teks
                      </button>
                      <button
                        type="button"
                        onClick={() => addIntroContentItem('pdf')}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <FileText size={12} className="inline mr-1" />PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => addIntroContentItem('video')}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Video size={12} className="inline mr-1" />Video
                      </button>
                      <button
                        type="button"
                        onClick={() => addIntroContentItem('external_link')}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Globe size={12} className="inline mr-1" />Link
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {(formData.introMaterial.content || []).map((item, index) => 
                      <div key={item.id || index}>
                        {renderIntroContentForm(item, index)}
                      </div>
                    )}
                    {(!formData.introMaterial.content || formData.introMaterial.content.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Belum ada konten pengantar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lessons */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Lessons ({formData.lessons.length})</h3>
              <button
                type="button"
                onClick={() => setShowLessonForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Lesson
              </button>
            </div>

            <div className="space-y-3">
              {formData.lessons.map((lesson, index) => (
                <div key={lesson.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">Type: {lesson.type} • Content items: {lesson.content?.length || 0}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleLessonEdit(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLessonDelete(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {formData.lessons.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada lesson. Klik &quot;Tambah Lesson&quot; untuk memulai.
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
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Menyimpan...' : (isEditing ? 'Update Course' : 'Simpan Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleCourseForm;