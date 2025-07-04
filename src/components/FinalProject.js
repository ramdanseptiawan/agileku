import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, ExternalLink, CheckCircle, Clock, AlertCircle, X, Eye, Download, Link, Save } from 'lucide-react';
import {
  validateFile,
  formatFileSize,
  createFilePreviewUrl,
  revokeFilePreviewUrl,
  canPreviewFile,
  handleDragEvents
} from '../utils/fileUtils';
import { useAuth } from '../contexts/AuthContext';
import { submissionAPI } from '../services/api';

const FinalProject = ({ courseId, onSubmit }) => {
  const { currentUser } = useAuth();
  const [projectStatus, setProjectStatus] = useState('not_submitted'); // not_submitted, submitted, reviewed
  const [selectedFile, setSelectedFile] = useState(null);
  const [projectDescription, setProjectDescription] = useState('');
  const [submissionDate, setSubmissionDate] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState(null);
  const [submissionType, setSubmissionType] = useState('file'); // file, link
  const [projectLink, setProjectLink] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // saved, saving, error
  const [lastSaved, setLastSaved] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);

  const allowedFileTypes = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip'
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const loadProgress = useCallback(() => {
    const savedProgress = localStorage.getItem(`finalProject_${courseId}_${currentUser?.id}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setProjectDescription(progress.description || '');
      setProjectLink(progress.link || '');
      setSubmissionType(progress.submissionType || 'file');
      setProjectStatus(progress.status || 'not_submitted');
      setSubmissionDate(progress.submissionDate);
      setFeedback(progress.feedback || '');
      setGrade(progress.grade);
      setLastSaved(progress.lastSaved);
    }
  }, [courseId, currentUser?.id]);

  const loadInstructions = useCallback(() => {
    try {
      const storageKey = `course_instructions_${courseId}`;
      const savedInstructions = localStorage.getItem(storageKey);
      
      if (savedInstructions) {
        const parsedInstructions = JSON.parse(savedInstructions);
        setInstructions(parsedInstructions.finalproject);
      } else {
        // Default instructions
        setInstructions({
          title: 'Final Project',
          description: 'Proyek akhir untuk mendemonstrasikan pemahaman komprehensif terhadap seluruh materi kursus.',
          requirements: [
            'Menyelesaikan semua tahap pembelajaran',
            'Lulus post-test dengan nilai minimal 70%',
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
        });
      }
    } catch (error) {
      console.error('Error loading instructions:', error);
      // Fallback to default
      setInstructions({
        title: 'Final Project',
        description: 'Proyek akhir untuk mendemonstrasikan pemahaman komprehensif terhadap seluruh materi kursus.',
        requirements: ['Menyelesaikan semua tahap pembelajaran'],
        deliverables: ['Proyek lengkap sesuai spesifikasi'],
        timeline: '14 hari setelah menyelesaikan post work',
        resources: ['Seluruh materi kursus']
      });
    }
  }, [courseId]);

  // Load saved progress and instructions on component mount
  useEffect(() => {
    loadProgress();
    loadInstructions();
    
    // Try to load existing submissions from backend
     const loadExistingSubmission = async () => {
       setIsLoadingSubmission(true);
       try {
         const response = await submissionAPI.getFinalProjectSubmission(parseInt(courseId));
         if (response.success && response.data) {
           const submission = response.data;
           setExistingSubmission(submission);
           setProjectStatus('submitted');
           setProjectDescription(submission.content || '');
           setSubmissionDate(new Date(submission.submittedAt).toLocaleDateString('id-ID'));
           if (submission.feedback) {
             setFeedback(submission.feedback);
             setProjectStatus('reviewed');
           }
           if (submission.score) {
             setGrade(submission.score);
           }
           if (submission.fileId) {
             setUploadedFileId(submission.fileId);
           }
         }
       } catch (error) {
         console.error('Failed to load existing submission:', error);
       } finally {
         setIsLoadingSubmission(false);
       }
     };
    
    if (currentUser && courseId) {
      loadExistingSubmission();
    }
  }, [loadProgress, loadInstructions, courseId, currentUser]);

  const saveProgress = useCallback(() => {
    if (!currentUser) return;
    
    setAutoSaveStatus('saving');
    const progress = {
      description: projectDescription,
      link: projectLink,
      submissionType,
      status: projectStatus,
      submissionDate,
      feedback,
      grade,
      lastSaved: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`finalProject_${courseId}_${currentUser.id}`, JSON.stringify(progress));
      setAutoSaveStatus('saved');
      setLastSaved(new Date().toISOString());
    } catch (error) {
      setAutoSaveStatus('error');
    }
  }, [currentUser, courseId, projectDescription, projectLink, submissionType, projectStatus, submissionDate, feedback, grade]);

  // Auto-save progress when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (projectDescription || selectedFile || projectLink) {
        saveProgress();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [projectDescription, selectedFile, projectLink, submissionType, saveProgress]);

  const checkCourseCompletion = () => {
    // Check if user has completed all course requirements
    const courseProgress = localStorage.getItem(`courseProgress_${courseId}_${currentUser?.id}`);
    if (courseProgress) {
      const progress = JSON.parse(courseProgress);
      return progress.completed === true;
    }
    return false;
  };

  const generateCertificate = () => {
    if (!checkCourseCompletion()) {
      alert('Anda harus menyelesaikan semua materi kursus terlebih dahulu untuk mendapatkan sertifikat.');
      return;
    }

    if (projectStatus !== 'reviewed' || !grade || grade < 70) {
      alert('Proyek akhir harus dinilai dan mendapat nilai minimal 70 untuk mendapatkan sertifikat.');
      return;
    }

    // Generate certificate
    const certificate = {
      id: Date.now().toString(),
      courseId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      courseName: `Course ${courseId}`,
      completionDate: new Date().toISOString(),
      certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      grade: grade,
      issueDate: new Date().toISOString()
    };

    const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    certificates.push(certificate);
    localStorage.setItem('certificates', JSON.stringify(certificates));
    
    alert('Selamat! Sertifikat Anda telah berhasil dibuat. Anda dapat mengunduhnya dari menu Sertifikat.');
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('File type not supported. Please upload: ' + allowedTypes.join(', '));
        return;
      }
      
      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size exceeds 10MB limit');
        return;
      }
      
      setSelectedFile(file);
      setIsUploading(true);
      
      try {
        const response = await submissionAPI.uploadFile(file);
        if (response.success) {
          setUploadedFileId(response.data.id);
          setSelectedFile(null); // Clear selected file after successful upload
          alert('File project berhasil diupload!');
        } else {
          alert('Upload gagal: ' + response.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload gagal: ' + error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const validateAndSetFile = async (file) => {
    const validation = validateFile(file, 'project');
    
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setAutoSaveStatus('saving');
    
    try {
      const uploadResponse = await submissionAPI.uploadFile(file);
      if (uploadResponse.success) {
        setUploadedFileId(uploadResponse.data.id);
        setAutoSaveStatus('saved');
        setLastSaved(new Date().toISOString());
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setAutoSaveStatus('error');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
    
    // Create PDF preview URL if it's a PDF
    if (canPreviewFile(file) && file.type === 'application/pdf') {
      const url = createFilePreviewUrl(file);
      setPdfUrl(url);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await validateAndSetFile(files[0]);
    }
  }, []);

  const handleSubmit = async () => {
    const isValid = submissionType === 'file' 
      ? (projectDescription.trim() && uploadedFileId)
      : (projectLink.trim() && projectDescription.trim());

    if (isValid) {
      try {
        setAutoSaveStatus('saving');
        
        const submissionData = {
          courseId: parseInt(courseId),
          title: 'Final Project Submission',
          description: projectDescription,
          content: projectDescription,
          attachments: submissionType === 'file' ? JSON.stringify([uploadedFileId]) : null,
          githubUrl: submissionType === 'link' ? projectLink : null,
          liveUrl: submissionType === 'link' ? projectLink : null
        };
        
        const response = await submissionAPI.createFinalProjectSubmission(submissionData);
        
        if (response.success) {
          setProjectStatus('submitted');
          setSubmissionDate(new Date().toLocaleDateString('id-ID'));
          setAutoSaveStatus('saved');
          
          // Call parent submit handler
          if (onSubmit) {
            onSubmit({
              type: submissionType,
              file: selectedFile,
              link: projectLink,
              description: projectDescription,
              submissionDate: new Date().toISOString(),
              submissionId: response.data.id
            });
          }
          
          alert('Proyek akhir berhasil dikumpulkan!');
        }
      } catch (error) {
        console.error('Submission failed:', error);
        setAutoSaveStatus('error');
        alert('Gagal mengumpulkan proyek akhir. Silakan coba lagi.');
      }
    } else {
      const message = submissionType === 'file' 
        ? 'Silakan upload file dan berikan deskripsi proyek.'
        : 'Silakan masukkan link dan berikan deskripsi proyek.';
      alert(message);
    }
  };

  const handleUpdate = async () => {
    const isValid = submissionType === 'file' 
      ? (projectDescription.trim() && uploadedFileId)
      : (projectLink.trim() && projectDescription.trim());

    if (isValid) {
      try {
        setAutoSaveStatus('saving');
        
        const submissionData = {
          courseId: parseInt(courseId),
          title: 'Final Project Update',
          description: projectDescription,
          content: projectDescription,
          attachments: submissionType === 'file' ? JSON.stringify([uploadedFileId]) : null,
          githubUrl: submissionType === 'link' ? projectLink : null,
          liveUrl: submissionType === 'link' ? projectLink : null
        };
        
        const response = await submissionAPI.createFinalProjectSubmission(submissionData);
        
        if (response.success) {
          setSubmissionDate(new Date().toLocaleDateString('id-ID'));
          setAutoSaveStatus('saved');
          
          if (onSubmit) {
            onSubmit({
              type: submissionType,
              file: selectedFile,
              link: projectLink,
              description: projectDescription,
              submissionDate: new Date().toISOString(),
              isUpdate: true,
              submissionId: response.data.id
            });
          }
          
          alert('Proyek akhir berhasil diperbarui!');
        }
      } catch (error) {
        console.error('Update failed:', error);
        setAutoSaveStatus('error');
        alert('Gagal memperbarui proyek akhir. Silakan coba lagi.');
      }
    } else {
      const message = submissionType === 'file' 
        ? 'Silakan upload file dan berikan deskripsi proyek.'
        : 'Silakan masukkan link dan berikan deskripsi proyek.';
      alert(message);
    }
  };

  const removeFile = () => {
    if (pdfUrl) {
      revokeFilePreviewUrl(pdfUrl);
      setPdfUrl(null);
    }
    setSelectedFile(null);
  };

  const handlePdfPreview = () => {
    if (pdfUrl) {
      setShowPdfViewer(true);
    }
  };

  const closePdfViewer = () => {
    setShowPdfViewer(false);
  };

  // formatFileSize is now imported from utils

  const getStatusIcon = () => {
    switch (projectStatus) {
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
    switch (projectStatus) {
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-900">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Final Project</h1>
        <p className="text-gray-600">Submit your final project for evaluation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Status */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Project Status</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </span>
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

            {/* Submission History (if submitted) */}
            {projectStatus !== 'not_submitted' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Submission History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedFile ? selectedFile.name : 'Project Submission'}
                      </p>
                      <p className="text-sm text-gray-600">Submitted on {submissionDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusText()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Submission Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Jenis Pengumpulan</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSubmissionType('file')}
            className={`p-4 rounded-lg border-2 transition-all ${
              submissionType === 'file'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText size={24} />
              <div className="text-left">
                <h4 className="font-semibold">Upload File</h4>
                <p className="text-sm">Upload file proyek (PDF, DOCX, ZIP)</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setSubmissionType('link')}
            className={`p-4 rounded-lg border-2 transition-all ${
              submissionType === 'link'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <ExternalLink size={24} />
              <div className="text-left">
                <h4 className="font-semibold">Link Eksternal</h4>
                <p className="text-sm">GitHub, Google Drive, dll.</p>
              </div>
            </div>
          </button>
        </div>

        {/* File Upload Section */}
        {submissionType === 'file' && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-indigo-500" size={24} />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedFile.type === 'application/pdf' && (
                        <button
                          onClick={handlePdfPreview}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <Eye size={16} />
                          <span className="text-sm">Preview</span>
                        </button>
                      )}
                      <button
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">File siap untuk diunggah</p>
                </div>
              ) : uploadedFileId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-500" size={24} />
                      <div>
                        <p className="font-medium text-green-900">File project berhasil diupload</p>
                        <p className="text-sm text-green-700">File siap untuk dikumpulkan</p>
                      </div>
                    </div>
                    <button 
                      type="button"
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
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Download size={16} />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto text-gray-400" size={48} />
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop file di sini atau
                    </p>
                    <label className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                      Pilih File
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.docx,.doc,.zip"
                      />
                    </label>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Format yang didukung: PDF, DOCX, ZIP</p>
                    <p>Maksimal ukuran file: 50MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link Input Section */}
        {submissionType === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Proyek *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://github.com/username/project atau https://drive.google.com/..."
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pastikan link dapat diakses oleh instruktur
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Proyek *
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={5}
            placeholder="Jelaskan proyek Anda, teknologi yang digunakan, fitur utama, dan hal-hal penting lainnya..."
            required
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {projectStatus === 'not_submitted' ? (
            <button
              onClick={handleSubmit}
              disabled={submissionType === 'file' 
                      ? (!projectDescription.trim() || isUploading || !uploadedFileId)
                      : (!projectLink.trim() || !projectDescription.trim())}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kumpulkan Proyek Akhir
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={submissionType === 'file' ? (!projectDescription.trim() || isUploading || !uploadedFileId) : (!projectLink.trim() || !projectDescription.trim())}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Perbarui Proyek Akhir
            </button>
          )}
        </div>
      </div>

      {/* Project Requirements */}
      {instructions && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">{instructions.title}</h3>
          <p className="text-blue-700 mb-4">{instructions.description}</p>
          
          {/* Requirements */}
          {instructions.requirements && instructions.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Requirements:</h4>
              <div className="space-y-2 text-gray-700">
                {instructions.requirements.map((req, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>{req}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Deliverables */}
          {instructions.deliverables && instructions.deliverables.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Deliverables:</h4>
              <div className="space-y-2 text-gray-700">
                {instructions.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>{deliverable}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Timeline */}
          {instructions.timeline && (
            <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-1">Timeline:</h4>
              <p className="text-yellow-700 text-sm">{instructions.timeline}</p>
            </div>
          )}
          
          {/* Resources */}
          {instructions.resources && instructions.resources.length > 0 && (
            <div className="p-4 bg-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Resources:</h4>
              <div className="space-y-1 text-blue-700 text-sm">
                {instructions.resources.map((resource, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span>•</span>
                    <p>{resource}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-save Status & Certificate Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Save className={`${autoSaveStatus === 'saving' ? 'animate-spin text-blue-500' : autoSaveStatus === 'saved' ? 'text-green-500' : 'text-red-500'}`} size={20} />
            <span className="text-sm text-gray-600">
              {autoSaveStatus === 'saving' && 'Menyimpan...'}
              {autoSaveStatus === 'saved' && lastSaved && `Tersimpan otomatis ${new Date(lastSaved).toLocaleTimeString('id-ID')}`}
              {autoSaveStatus === 'error' && 'Gagal menyimpan'}
            </span>
          </div>
          
          {projectStatus === 'reviewed' && grade >= 70 && (
            <button
              onClick={generateCertificate}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-semibold flex items-center space-x-2"
            >
              <CheckCircle size={20} />
              <span>Dapatkan Sertifikat</span>
            </button>
          )}
        </div>
        
        {projectStatus === 'reviewed' && grade < 70 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Catatan:</strong> Nilai minimal 70 diperlukan untuk mendapatkan sertifikat. Nilai Anda saat ini: {grade}/100
            </p>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Submission History */}
      {existingSubmission && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Submission Final Project</h3>
          {isLoadingSubmission ? (
            <div className="text-center py-4">
              <span className="text-gray-500">⏳ Memuat submission...</span>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Final Project Submission
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(existingSubmission.submittedAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {existingSubmission.score && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Score: {existingSubmission.score}
                  </span>
                )}
              </div>
              
              {existingSubmission.content && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Deskripsi Project:</p>
                  <p className="text-gray-800 text-sm bg-gray-50 p-2 rounded">
                    {existingSubmission.content.substring(0, 300)}
                    {existingSubmission.content.length > 300 && '...'}
                  </p>
                </div>
              )}
              
              {existingSubmission.fileId && (
                <div className="mb-3">
                  <button
                    onClick={async () => {
                      try {
                        const response = await submissionAPI.getFile(existingSubmission.fileId);
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
                    <span>Download Project File</span>
                  </button>
                </div>
              )}
              
              {existingSubmission.feedback && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                  <p className="text-blue-800 text-sm">{existingSubmission.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfViewer && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">PDF Preview</h3>
              <div className="flex items-center space-x-2">
                <a
                  href={pdfUrl}
                  download={selectedFile?.name}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <Download size={16} />
                  <span className="text-sm">Download</span>
                </a>
                <button
                  onClick={closePdfViewer}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full border rounded-lg"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalProject;