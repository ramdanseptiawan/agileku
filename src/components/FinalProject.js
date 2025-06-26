import React, { useState, useCallback } from 'react';
import { Upload, FileText, ExternalLink, CheckCircle, Clock, AlertCircle, X, Eye, Download, Link } from 'lucide-react';
import {
  validateFile,
  formatFileSize,
  createFilePreviewUrl,
  revokeFilePreviewUrl,
  canPreviewFile,
  handleDragEvents
} from '../utils/fileUtils';

const FinalProject = ({ courseId, onSubmit }) => {
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

  const allowedFileTypes = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip'
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    const validation = validateFile(file, 'project');
    
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setSelectedFile(file);
    
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

  const handleDrop = useCallback((e) => {
    setDragActive(false);
    handleDragEvents.onDrop(e, validateAndSetFile, 'project');
  }, []);

  const handleSubmit = () => {
    const isValid = submissionType === 'file' 
      ? (selectedFile && projectDescription.trim())
      : (projectLink.trim() && projectDescription.trim());

    if (isValid) {
      setProjectStatus('submitted');
      setSubmissionDate(new Date().toLocaleDateString('id-ID'));
      
      // Call parent submit handler
      if (onSubmit) {
        onSubmit({
          type: submissionType,
          file: selectedFile,
          link: projectLink,
          description: projectDescription,
          submissionDate: new Date().toISOString()
        });
      }
      
      alert('Proyek akhir berhasil dikumpulkan!');
    } else {
      const message = submissionType === 'file' 
        ? 'Silakan pilih file dan berikan deskripsi proyek.'
        : 'Silakan masukkan link dan berikan deskripsi proyek.';
      alert(message);
    }
  };

  const handleUpdate = () => {
    const isValid = submissionType === 'file' 
      ? (selectedFile && projectDescription.trim())
      : (projectLink.trim() && projectDescription.trim());

    if (isValid) {
      setSubmissionDate(new Date().toLocaleDateString('id-ID'));
      
      if (onSubmit) {
        onSubmit({
          type: submissionType,
          file: selectedFile,
          link: projectLink,
          description: projectDescription,
          submissionDate: new Date().toISOString(),
          isUpdate: true
        });
      }
      
      alert('Proyek akhir berhasil diperbarui!');
    } else {
      const message = submissionType === 'file' 
        ? 'Silakan pilih file dan berikan deskripsi proyek.'
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              disabled={submissionType === 'file' ? (!selectedFile || !projectDescription.trim()) : (!projectLink.trim() || !projectDescription.trim())}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kumpulkan Proyek Akhir
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={submissionType === 'file' ? (!selectedFile || !projectDescription.trim()) : (!projectLink.trim() || !projectDescription.trim())}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Perbarui Proyek Akhir
            </button>
          )}
        </div>
      </div>

      {/* Project Requirements */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4">Persyaratan Proyek</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Create a complete web application using the technologies learned in this course</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Include proper documentation and README file</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Implement responsive design for mobile and desktop</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Submit as a ZIP file or provide GitHub repository link</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Maximum file size: 50MB</p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {projectStatus === 'not_submitted' ? 'Submit Your Project' : 'Update Your Project'}
        </h3>
        
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project File (ZIP, RAR, or GitHub Link)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="project-file"
                className="hidden"
                accept=".zip,.rar,.7z"
                onChange={handleFileSelect}
              />
              <label htmlFor="project-file" className="cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600 mb-1">
                  {selectedFile ? selectedFile.name : 'Click to upload your project file'}
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: ZIP, RAR, 7Z (Max 50MB)
                </p>
              </label>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Describe your project, technologies used, features implemented, and any special instructions..."
            />
          </div>

          {/* GitHub Link (Alternative) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository Link (Optional)
            </label>
            <input
              type="url"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://github.com/username/repository"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={projectStatus === 'not_submitted' ? handleSubmit : handleUpdate}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <FileText size={20} />
              <span>
                {projectStatus === 'not_submitted' ? 'Submit Project' : 'Update Project'}
              </span>
            </button>
            
            {projectStatus !== 'not_submitted' && (
              <button
                onClick={() => {
                  setProjectStatus('not_submitted');
                  setSelectedFile(null);
                  setProjectDescription('');
                  setSubmissionDate(null);
                }}
                className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Submission
              </button>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>

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