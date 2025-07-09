import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit3, FileText, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component untuk mengelola instruksi PostWork dan FinalProject per course
 * Hanya dapat diakses oleh admin
 */
const CourseInstructionManager = () => {
  const { currentUser, courses } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeTab, setActiveTab] = useState('postwork');
  const [instructions, setInstructions] = useState({
    postwork: {
      title: '',
      description: '',
      requirements: [],
      deliverables: [],
      timeline: '',
      resources: []
    },
    finalproject: {
      title: '',
      description: '',
      requirements: [],
      deliverables: [],
      timeline: '',
      resources: []
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Load instructions for selected course
  useEffect(() => {
    if (selectedCourse) {
      loadCourseInstructions(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourseInstructions = (courseId) => {
    try {
      const storageKey = `course_instructions_${courseId}`;
      const savedInstructions = localStorage.getItem(storageKey);
      
      if (savedInstructions) {
        setInstructions(JSON.parse(savedInstructions));
      } else {
        // Set default instructions
        setInstructions({
          postwork: {
            title: 'Post Work Assignment',
            description: 'Silakan kerjakan tugas post work berikut untuk mempraktikkan materi yang telah dipelajari.',
            requirements: [
              'Menyelesaikan semua materi pembelajaran',
              'Memahami konsep dasar yang telah diajarkan'
            ],
            deliverables: [
              'Dokumen laporan hasil praktik',
              'Screenshot atau bukti implementasi'
            ],
            timeline: '7 hari setelah menyelesaikan materi',
            resources: [
              'Materi pembelajaran yang telah dipelajari',
              'Template dokumen (jika tersedia)'
            ]
          },
          finalproject: {
            title: 'Final Project',
            description: 'Proyek akhir untuk mendemonstrasikan pemahaman komprehensif terhadap seluruh materi kursus.',
            requirements: [
            'Menyelesaikan semua tahap pembelajaran',
            'Menyelesaikan post work assignment'
          ],
            deliverables: [
              'Proyek lengkap sesuai spesifikasi',
              'Dokumentasi proyek',
              'Presentasi atau demo (jika diperlukan)'
            ],
            timeline: '14 hari setelah menyelesaikan post work',
            resources: [
              'Seluruh materi kursus',
              'Template proyek (jika tersedia)',
              'Panduan teknis'
            ]
          }
        });
      }
    } catch (error) {
      console.error('Error loading course instructions:', error);
    }
  };

  const saveInstructions = async () => {
    if (!selectedCourse) {
      setSaveStatus('Pilih course terlebih dahulu');
      return;
    }

    setIsSaving(true);
    setSaveStatus('');

    try {
      const storageKey = `course_instructions_${selectedCourse}`;
      localStorage.setItem(storageKey, JSON.stringify(instructions));
      
      setSaveStatus('✅ Instruksi berhasil disimpan!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving instructions:', error);
      setSaveStatus('❌ Gagal menyimpan instruksi');
    } finally {
      setIsSaving(false);
    }
  };

  const updateInstruction = (type, field, value) => {
    setInstructions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const addArrayItem = (type, field) => {
    setInstructions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: [...prev[type][field], '']
      }
    }));
  };

  const updateArrayItem = (type, field, index, value) => {
    setInstructions(prev => {
      const newArray = [...prev[type][field]];
      newArray[index] = value;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          [field]: newArray
        }
      };
    });
  };

  const removeArrayItem = (type, field, index) => {
    setInstructions(prev => {
      const newArray = prev[type][field].filter((_, i) => i !== index);
      return {
        ...prev,
        [type]: {
          ...prev[type],
          [field]: newArray
        }
      };
    });
  };

  const renderArrayField = (type, field, label, placeholder) => {
    const items = instructions[type][field] || [];
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <button
            onClick={() => addArrayItem(type, field)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </div>
        
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateArrayItem(type, field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => removeArrayItem(type, field, index)}
              className="text-red-600 hover:text-red-800 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {items.length === 0 && (
          <p className="text-gray-500 text-sm italic">Belum ada {label.toLowerCase()}</p>
        )}
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Akses Ditolak
          </h3>
          <p className="text-red-600">
            Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  const currentInstruction = instructions[activeTab];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kelola Instruksi Course
          </h2>
          
          {/* Course Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">{saveStatus}</p>
            </div>
          )}
        </div>

        {selectedCourse && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('postwork')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'postwork'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Post Work
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('finalproject')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'finalproject'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Final Project
                  </div>
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Instruksi {activeTab === 'postwork' ? 'Post Work' : 'Final Project'}
                  </h3>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul
                    </label>
                    <input
                      type="text"
                      value={currentInstruction.title}
                      onChange={(e) => updateInstruction(activeTab, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan judul instruksi"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={currentInstruction.description}
                      onChange={(e) => updateInstruction(activeTab, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan deskripsi instruksi"
                    />
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline
                    </label>
                    <input
                      type="text"
                      value={currentInstruction.timeline}
                      onChange={(e) => updateInstruction(activeTab, 'timeline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 7 hari setelah menyelesaikan materi"
                    />
                  </div>

                  {/* Requirements */}
                  {renderArrayField(activeTab, 'requirements', 'Persyaratan', 'Masukkan persyaratan')}

                  {/* Deliverables */}
                  {renderArrayField(activeTab, 'deliverables', 'Deliverables', 'Masukkan deliverable')}

                  {/* Resources */}
                  {renderArrayField(activeTab, 'resources', 'Resources', 'Masukkan resource')}
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Preview
                  </h3>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      {currentInstruction.title || 'Judul Instruksi'}
                    </h4>
                    
                    <p className="text-gray-700 mb-4">
                      {currentInstruction.description || 'Deskripsi instruksi akan muncul di sini.'}
                    </p>

                    {currentInstruction.timeline && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">⏰ Timeline:</h5>
                        <p className="text-gray-700">{currentInstruction.timeline}</p>
                      </div>
                    )}

                    {currentInstruction.requirements.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">📋 Persyaratan:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {currentInstruction.requirements.map((req, index) => (
                            <li key={index} className="text-gray-700">{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentInstruction.deliverables.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">📦 Deliverables:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {currentInstruction.deliverables.map((item, index) => (
                            <li key={index} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentInstruction.resources.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">📚 Resources:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {currentInstruction.resources.map((resource, index) => (
                            <li key={index} className="text-gray-700">{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveInstructions}
                  disabled={isSaving || !selectedCourse}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Instruksi'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseInstructionManager;