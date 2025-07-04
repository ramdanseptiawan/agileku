import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, X, Download, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submissionAPI } from '../services/api';

const styles = `
  .file-upload-section {
    margin: 20px 0;
    padding: 20px;
    border: 2px dashed #ddd;
    border-radius: 8px;
    text-align: center;
  }

  .file-upload-label {
    display: block;
    cursor: pointer;
    color: #666;
    font-weight: 500;
  }

  .file-upload-input {
    display: none;
  }

  .file-info {
    margin-top: 10px;
    padding: 10px;
    background-color: #f0f8ff;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .file-size {
    color: #888;
    font-size: 0.9em;
  }

  .upload-progress {
    margin-top: 10px;
    padding: 10px;
    background-color: #fff3cd;
    border-radius: 4px;
    color: #856404;
  }

  .uploaded-file-info {
    margin-top: 10px;
    padding: 15px;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .download-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s;
  }

  .download-btn:hover {
    background-color: #0056b3;
  }
`;

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [existingSubmissions, setExistingSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // File validation is now handled in the API layer

  const loadInstructions = useCallback(() => {
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
  }, [courseId]);

  const loadProgress = useCallback(async () => {
    // Load from localStorage first
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
    
    // Try to load existing submissions from backend
     setIsLoadingSubmissions(true);
     try {
       const response = await submissionAPI.getPostWorkSubmissions(parseInt(courseId));
       if (response.success && response.data && response.data.length > 0) {
         setExistingSubmissions(response.data);
         const latestSubmission = response.data[0]; // Get the latest submission
         setWorkStatus('submitted');
         setWorkDescription(latestSubmission.content || '');
         setSubmissionDate(new Date(latestSubmission.submittedAt).toLocaleDateString('id-ID'));
         if (latestSubmission.feedback) {
           setFeedback(latestSubmission.feedback);
           setWorkStatus('reviewed');
         }
         if (latestSubmission.score) {
           setGrade(latestSubmission.score);
         }
         if (latestSubmission.fileId) {
           setUploadedFileId(latestSubmission.fileId);
         }
       }
     } catch (error) {
       console.error('Failed to load existing submissions:', error);
     } finally {
       setIsLoadingSubmissions(false);
     }
  }, [courseId, currentUser?.id]);

  // Load saved progress and instructions on component mount
  useEffect(() => {
    if (currentUser && courseId) {
      loadProgress();
      loadInstructions();
    }
  }, [loadProgress, loadInstructions, currentUser, courseId]);

  const saveProgress = useCallback(() => {
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
  }, [currentUser, courseId, workDescription, workStatus, submissionDate, feedback, grade]);

  // Auto-save progress when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (workDescription || selectedFile) {
        saveProgress();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [workDescription, selectedFile, saveProgress]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsUploading(true);
      
      try {
        const response = await submissionAPI.uploadFile(file);
        setUploadedFileId(response.data.id);
        alert('File berhasil diupload!');
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload gagal: ' + error.message);
        setSelectedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const validateAndSetFile = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);
    setAutoSaveStatus('saving');
    
    try {
      const uploadResponse = await submissionAPI.uploadFile(file);
      setUploadedFileId(uploadResponse.data.id);
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      alert('File berhasil diupload!');
    } catch (error) {
      console.error('File upload failed:', error);
      setAutoSaveStatus('error');
      setSelectedFile(null);
      alert('Upload gagal: ' + error.message);
    } finally {
      setIsUploading(false);
    }
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

  const handleSubmit = async () => {
    if (!uploadedFileId || !workDescription.trim()) {
      alert('Silakan upload file dan berikan deskripsi tugas.');
      return;
    }
    
    try {
      setAutoSaveStatus('saving');
      
      const submissionData = {
        courseId: parseInt(courseId),
        lessonId: null, // PostWork is course-level, not lesson-specific
        title: 'PostWork Submission',
        content: workDescription,
        attachments: JSON.stringify([uploadedFileId])
      };
      
      const response = await submissionAPI.createPostWorkSubmission(submissionData);
      
      if (response.success) {
        setWorkStatus('submitted');
        setSubmissionDate(new Date().toLocaleDateString('id-ID'));
        setAutoSaveStatus('saved');
        
        // Call parent submit handler
        if (onSubmit) {
          onSubmit({
            fileId: uploadedFileId,
            description: workDescription,
            submissionDate: new Date().toISOString(),
            submissionId: response.data.id
          });
        }
        
        alert('Tugas berhasil dikumpulkan!');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setAutoSaveStatus('error');
      alert('Gagal mengumpulkan tugas. Silakan coba lagi.');
    }
  };

  const handleUpdate = async () => {
    if (!uploadedFileId || !workDescription.trim()) {
      alert('Silakan upload file dan berikan deskripsi tugas.');
      return;
    }
    
    try {
      setAutoSaveStatus('saving');
      
      const submissionData = {
        courseId: parseInt(courseId),
        lessonId: null,
        title: 'PostWork Update',
        content: workDescription,
        attachments: JSON.stringify([uploadedFileId])
      };
      
      const response = await submissionAPI.createPostWorkSubmission(submissionData);
      
      if (response.success) {
        setSubmissionDate(new Date().toLocaleDateString('id-ID'));
        setAutoSaveStatus('saved');
        
        if (onSubmit) {
          onSubmit({
            fileId: uploadedFileId,
            description: workDescription,
            submissionDate: new Date().toISOString(),
            isUpdate: true,
            submissionId: response.data.id
          });
        }
        
        alert('Tugas berhasil diperbarui!');
      }
    } catch (error) {
      console.error('Update failed:', error);
      setAutoSaveStatus('error');
      alert('Gagal memperbarui tugas. Silakan coba lagi.');
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
      <style>{styles}</style>
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
          ) : uploadedFileId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-500" size={24} />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">File berhasil diupload</p>
                  <p className="text-sm text-gray-500">File siap untuk dikumpulkan</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const response = await submissionAPI.getFile(uploadedFileId);
                      if (response.success) {
                        const url = window.URL.createObjectURL(response.data);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = response.filename || 'download';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }
                    } catch (error) {
                      console.error('Failed to download file:', error);
                    }
                  }}
                  className="text-blue-500 hover:text-blue-700 p-1"
                >
                  <Download size={20} />
                </button>
              </div>
              <label className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 cursor-pointer transition-colors">
                Ganti File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif"
                />
              </label>
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
              disabled={!selectedFile || !workDescription.trim() || isUploading || !uploadedFileId}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Mengupload...' : 'Kumpulkan Tugas'}
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={!selectedFile || !workDescription.trim() || isUploading || !uploadedFileId}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Mengupload...' : 'Perbarui Tugas'}
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

      {/* Submission History */}
      {existingSubmissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Riwayat Submission</h3>
          {isLoadingSubmissions ? (
            <div className="text-center py-4">
              <span className="text-gray-500">⏳ Memuat riwayat submission...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {existingSubmissions.map((submission, index) => (
                <div key={submission.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Submission #{existingSubmissions.length - index}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {submission.score && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Score: {submission.score}
                      </span>
                    )}
                  </div>
                  
                  {submission.content && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Deskripsi:</p>
                      <p className="text-gray-800 text-sm bg-gray-50 p-2 rounded">
                        {submission.content.substring(0, 200)}
                        {submission.content.length > 200 && '...'}
                      </p>
                    </div>
                  )}
                  
                  {submission.fileId && (
                    <div className="mb-3">
                      <button
                        onClick={async () => {
                          try {
                            const response = await submissionAPI.getFile(submission.fileId);
                            if (response.success) {
                              const url = window.URL.createObjectURL(response.data);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = response.filename || 'download';
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            }
                          } catch (error) {
                            console.error('Failed to download file:', error);
                          }
                        }}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Download size={16} />
                        <span>Download File</span>
                      </button>
                    </div>
                  )}
                  
                  {submission.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                      <p className="text-blue-800 text-sm">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostWork;