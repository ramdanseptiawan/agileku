import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, X, Download, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PostWork = ({ courseId, onSubmit }) => {
  const { currentUser } = useAuth();
  const [workStatus, setWorkStatus] = useState('not_submitted'); // not_submitted, submitted, reviewed
  const [selectedFile, setSelectedFile] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  const [submissionDate, setSubmissionDate] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // saved, saving, error
  const [lastSaved, setLastSaved] = useState(null);
  const [instructions, setInstructions] = useState(null);

  const allowedFileTypes = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Load saved progress and instructions on component mount
  useEffect(() => {
    loadProgress();
    loadInstructions();
  }, [courseId, currentUser]);

  const loadInstructions = () => {
    try {
      const storageKey = `course_instructions_${courseId}`;
      const savedInstructions = localStorage.getItem(storageKey);
      
      if (savedInstructions) {
        const parsedInstructions = JSON.parse(savedInstructions);
        setInstructions(parsedInstructions.postwork);
      } else {
        // Default instructions
        setInstructions({
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
        });
      }
    } catch (error) {
      console.error('Error loading instructions:', error);
      // Fallback to default
      setInstructions({
        title: 'Post Work Assignment',
        description: 'Silakan kerjakan tugas post work berikut untuk mempraktikkan materi yang telah dipelajari.',
        requirements: ['Menyelesaikan semua materi pembelajaran'],
        deliverables: ['Dokumen laporan hasil praktik'],
        timeline: '7 hari setelah menyelesaikan materi',
        resources: ['Materi pembelajaran yang telah dipelajari']
      });
    }
  };

  // Auto-save progress when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (workDescription || selectedFile) {
        saveProgress();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [workDescription, selectedFile]);

  const loadProgress = () => {
    const savedProgress = localStorage.getItem(`postWork_${courseId}_${currentUser?.id}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setWorkDescription(progress.description || '');
      setWorkStatus(progress.status || 'not_submitted');
      setSubmissionDate(progress.submissionDate);
      setFeedback(progress.feedback || '');
      setGrade(progress.grade);
      setLastSaved(progress.lastSaved);
    }
  };

  const saveProgress = () => {
    if (!currentUser) return;
    
    setAutoSaveStatus('saving');
    const progress = {
      description: workDescription,
      status: workStatus,
      submissionDate,
      feedback,
      grade,
      lastSaved: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`postWork_${courseId}_${currentUser.id}`, JSON.stringify(progress));
      setAutoSaveStatus('saved');
      setLastSaved(new Date().toISOString());
    } catch (error) {
      setAutoSaveStatus('error');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Check file type
    if (!Object.keys(allowedFileTypes).includes(file.type)) {
      alert('Format file tidak didukung. Gunakan PDF, DOCX, atau gambar (JPG, PNG, GIF).');
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      alert('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile && workDescription.trim()) {
      setWorkStatus('submitted');
      setSubmissionDate(new Date().toLocaleDateString('id-ID'));
      
      // Call parent submit handler
      if (onSubmit) {
        onSubmit({
          file: selectedFile,
          description: workDescription,
          submissionDate: new Date().toISOString()
        });
      }
      
      alert('Tugas berhasil dikumpulkan!');
    } else {
      alert('Silakan pilih file dan berikan deskripsi tugas.');
    }
  };

  const handleUpdate = () => {
    if (selectedFile && workDescription.trim()) {
      setSubmissionDate(new Date().toLocaleDateString('id-ID'));
      
      if (onSubmit) {
        onSubmit({
          file: selectedFile,
          description: workDescription,
          submissionDate: new Date().toISOString(),
          isUpdate: true
        });
      }
      
      alert('Tugas berhasil diperbarui!');
    } else {
      alert('Silakan pilih file dan berikan deskripsi tugas.');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const getStatusIcon = () => {
    switch (workStatus) {
      case 'not_submitted':
        return <Clock className="text-yellow-500" size={24} />;
      case 'submitted':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'reviewed':
        return <CheckCircle className="text-blue-500" size={24} />;
      default:
        return <AlertCircle className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = () => {
    switch (workStatus) {
      case 'not_submitted':
        return 'Belum Dikumpulkan';
      case 'submitted':
        return 'Sudah Dikumpulkan - Menunggu Review';
      case 'reviewed':
        return 'Sudah Dinilai';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-gray-900">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Upload className="text-white" size={32} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Post Work</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Kumpulkan hasil pekerjaan atau tugas kecil Anda di sini
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
        <div className="flex items-center space-x-3 mb-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Status Tugas</h3>
            <p className="text-gray-600">{getStatusText()}</p>
            {submissionDate && (
              <p className="text-sm text-gray-500">Terakhir diperbarui: {submissionDate}</p>
            )}
          </div>
        </div>
        
        {grade && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">Nilai: {grade}/100</h4>
            {feedback && (
              <p className="text-green-700 mt-2">{feedback}</p>
            )}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Tugas</h3>
        
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="text-orange-500" size={24} />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600">File siap untuk diunggah</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto text-gray-400" size={48} />
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag & drop file di sini atau
                </p>
                <label className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 cursor-pointer transition-colors">
                  Pilih File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif"
                  />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p>Format yang didukung: PDF, DOCX, JPG, PNG, GIF</p>
                <p>Maksimal ukuran file: 10MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Tugas *
          </label>
          <textarea
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={4}
            placeholder="Jelaskan tugas yang Anda kumpulkan, metodologi yang digunakan, atau hal-hal penting lainnya..."
            required
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {workStatus === 'not_submitted' ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || !workDescription.trim()}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kumpulkan Tugas
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={!selectedFile || !workDescription.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Perbarui Tugas
            </button>
          )}
        </div>
      </div>

      {/* Auto-save Status */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center space-x-2">
          <Save className={`${autoSaveStatus === 'saving' ? 'animate-spin text-blue-500' : autoSaveStatus === 'saved' ? 'text-green-500' : 'text-red-500'}`} size={20} />
          <span className="text-sm text-gray-600">
            {autoSaveStatus === 'saving' && 'Menyimpan...'}
            {autoSaveStatus === 'saved' && lastSaved && `Tersimpan otomatis ${new Date(lastSaved).toLocaleTimeString('id-ID')}`}
            {autoSaveStatus === 'error' && 'Gagal menyimpan'}
          </span>
        </div>
      </div>

      {/* Instructions */}
      {instructions && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">{instructions.title}</h4>
          {instructions.description && (
            <p className="text-blue-700 mb-3 text-sm">{instructions.description}</p>
          )}
          
          {instructions.timeline && (
            <div className="mb-4 p-3 bg-blue-100 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-1">⏰ Timeline:</h5>
              <p className="text-blue-700 text-sm">{instructions.timeline}</p>
            </div>
          )}
          
          {instructions.requirements && instructions.requirements.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-blue-800 mb-2">📋 Persyaratan:</h5>
              <ul className="text-blue-700 space-y-1 text-sm">
                {instructions.requirements.map((req, index) => (
                  <li key={index}>• {req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {instructions.deliverables && instructions.deliverables.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-blue-800 mb-2">📦 Deliverables:</h5>
              <ul className="text-blue-700 space-y-1 text-sm">
                {instructions.deliverables.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {instructions.resources && instructions.resources.length > 0 && (
            <div>
              <h5 className="font-semibold text-blue-800 mb-2">📚 Resources:</h5>
              <ul className="text-blue-700 space-y-1 text-sm">
                {instructions.resources.map((resource, index) => (
                  <li key={index}>• {resource}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostWork;