import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Eye } from 'lucide-react';
import WysiwygEditor from './WysiwygEditor';
import LessonForm from './LessonForm';
import QuizForm from './QuizForm';
import PostWorkForm from './PostWorkForm';
import FinalProjectForm from './FinalProjectForm';
import { saveCourse, getCourseById } from '../utils/localStorage';

const CourseFormManager = ({ courseId = null, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    instructor: '',
    image: '',
    introMaterial: {
      title: '',
      content: ''
    },
    lessons: [],
    preTest: {
      title: '',
      questions: []
    },
    postTest: {
      title: '',
      questions: []
    },
    postWork: {
      title: '',
      description: '',
      instructions: '',
      requirements: '',
      submissionFormat: 'file', // file, link, both
      maxFileSize: 10, // MB
      allowedFileTypes: ['pdf', 'docx', 'zip']
    },
    finalProject: {
      title: '',
      description: '',
      instructions: '',
      requirements: '',
      submissionFormat: 'both', // file, link, both
      maxFileSize: 50, // MB
      allowedFileTypes: ['pdf', 'docx', 'zip', 'pptx']
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      const existingCourse = getCourseById(parseInt(courseId));
      if (existingCourse) {
        setCourseData(prevData => ({
          ...prevData,
          ...existingCourse,
          // Ensure all required fields exist with proper defaults
          introMaterial: {
            title: existingCourse.introMaterial?.title || '',
            content: (() => {
              const content = existingCourse.introMaterial?.content;
              if (!content) return '';
              if (typeof content === 'string') return content;
              if (Array.isArray(content)) {
                // Convert array of content objects to HTML string
                return content.map(item => {
                  if (!item || typeof item !== 'object') return '';
                  switch (item.type) {
                    case 'text':
                      return `<p>${item.content || ''}</p>`;
                    case 'image':
                      return `<img src="${item.src || ''}" alt="${item.alt || ''}" style="max-width: 100%; height: auto;" />`;
                    case 'list':
                      const listItems = (item.items || []).map(listItem => `<li>${listItem}</li>`).join('');
                      return `<ul>${listItems}</ul>`;
                    case 'pdf':
                      const pdfEmbed = item.embedUrl ? `<iframe src="${item.embedUrl}" width="100%" height="600" frameborder="0"></iframe>` : '';
                      const pdfDownload = item.downloadUrl || item.url || '';
                      return `<div><h4>${item.title || ''}</h4><p>${item.description || ''}</p>${pdfEmbed}${pdfEmbed ? '<br>' : ''}<a href="${pdfDownload}" target="_blank">Download PDF</a></div>`;
                    case 'video':
                      const videoEmbed = item.src ? `<iframe src="${item.src}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>` : '';
                      return `<div><h4>${item.title || ''}</h4><p>Duration: ${item.duration || ''}</p>${videoEmbed}</div>`;
                    case 'external_link':
                      return `<div><h4><a href="${item.url || ''}" target="_blank">${item.title || ''}</a></h4><p>${item.description || ''}</p></div>`;
                    default:
                      return `<p>Unsupported content type: ${item.type}</p>`;
                  }
                }).join('');
              }
              return String(content);
            })()
          },
          postWork: {
            title: existingCourse.postWork?.title || '',
            description: existingCourse.postWork?.description || '',
            instructions: existingCourse.postWork?.instructions || '',
            requirements: existingCourse.postWork?.requirements || '',
            submissionFormat: existingCourse.postWork?.submissionFormat || 'file',
            maxFileSize: existingCourse.postWork?.maxFileSize || 10,
            allowedFileTypes: existingCourse.postWork?.allowedFileTypes || ['pdf', 'docx', 'zip']
          },
          finalProject: {
            title: existingCourse.finalProject?.title || '',
            description: existingCourse.finalProject?.description || '',
            instructions: existingCourse.finalProject?.instructions || '',
            requirements: existingCourse.finalProject?.requirements || '',
            submissionFormat: existingCourse.finalProject?.submissionFormat || 'both',
            maxFileSize: existingCourse.finalProject?.maxFileSize || 50,
            allowedFileTypes: existingCourse.finalProject?.allowedFileTypes || ['pdf', 'docx', 'zip', 'pptx']
          }
        }));
      }
    }
  }, [courseId]); // Only depend on courseId

  const validateForm = () => {
    const newErrors = {};
    
    if (!courseData.title.trim()) newErrors.title = 'Judul kursus wajib diisi';
    if (!courseData.description.trim()) newErrors.description = 'Deskripsi kursus wajib diisi';
    if (!courseData.category.trim()) newErrors.category = 'Kategori wajib diisi';
    if (!courseData.instructor.trim()) newErrors.instructor = 'Nama instruktur wajib diisi';
    if (!courseData.duration.trim()) newErrors.duration = 'Durasi kursus wajib diisi';
    
    if (courseData.lessons.length === 0) {
      newErrors.lessons = 'Minimal harus ada 1 pelajaran';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const success = saveCourse(courseData);
      if (success) {
        alert(courseId ? 'Kursus berhasil diperbarui!' : 'Kursus berhasil dibuat!');
        if (onSave) onSave(courseData);
      } else {
        throw new Error('Gagal menyimpan kursus');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Terjadi kesalahan saat menyimpan kursus');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourseData = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (section, field, value) => {
    setCourseData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'basic', label: 'Info Dasar', icon: '📚' },
    { id: 'intro', label: 'Materi Intro', icon: '🎯' },
    { id: 'lessons', label: 'Pelajaran', icon: '📖' },
    { id: 'pretest', label: 'Pre-Test', icon: '📝' },
    { id: 'posttest', label: 'Post-Test', icon: '✅' },
    { id: 'postwork', label: 'Post Work', icon: '💼' },
    { id: 'finalproject', label: 'Final Project', icon: '🎓' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6 text-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Kursus *
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => updateCourseData('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan judul kursus"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <input
                  type="text"
                  value={courseData.category}
                  onChange={(e) => updateCourseData('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Programming, Design, Marketing"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={courseData.level}
                  onChange={(e) => updateCourseData('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi *
                </label>
                <input
                  type="text"
                  value={courseData.duration}
                  onChange={(e) => updateCourseData('duration', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 4 weeks, 20 hours"
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruktur *
                </label>
                <input
                  type="text"
                  value={courseData.instructor}
                  onChange={(e) => updateCourseData('instructor', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.instructor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nama instruktur"
                />
                {errors.instructor && <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={courseData.image}
                  onChange={(e) => updateCourseData('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Kursus *
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) => updateCourseData('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Deskripsi singkat tentang kursus ini"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
        );
        
      case 'intro':
        return (
          <div className="space-y-6 text-gray-900">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Materi Intro
              </label>
              <input
                type="text"
                value={courseData.introMaterial.title}
                onChange={(e) => updateNestedData('introMaterial', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Selamat Datang di Kursus React"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten Intro (HTML)
              </label>
              <WysiwygEditor
                value={courseData.introMaterial.content}
                onChange={(content) => updateNestedData('introMaterial', 'content', content)}
                placeholder="Tulis materi pengenalan kursus di sini..."
                height="400px"
              />
            </div>
          </div>
        );
        
      case 'lessons':
        return (
          <LessonForm
            lessons={courseData.lessons}
            onChange={(lessons) => updateCourseData('lessons', lessons)}
            errors={errors.lessons}
          />
        );
        
      case 'pretest':
        return (
          <QuizForm
            quiz={courseData.preTest}
            onChange={(quiz) => updateCourseData('preTest', quiz)}
            title="Pre-Test"
          />
        );
        
      case 'posttest':
        return (
          <QuizForm
            quiz={courseData.postTest}
            onChange={(quiz) => updateCourseData('postTest', quiz)}
            title="Post-Test"
          />
        );
        
      case 'postwork':
        return (
          <PostWorkForm
            postWork={courseData.postWork}
            onChange={(postWork) => updateCourseData('postWork', postWork)}
          />
        );
        
      case 'finalproject':
        return (
          <FinalProjectForm
            finalProject={courseData.finalProject}
            onChange={(finalProject) => updateCourseData('finalProject', finalProject)}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {courseId ? 'Edit Kursus' : 'Buat Kursus Baru'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={20} />
            {isLoading ? 'Menyimpan...' : 'Simpan Kursus'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CourseFormManager;