import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const FinalProject = ({ courseId }) => {
  const [projectStatus, setProjectStatus] = useState('not_submitted'); // not_submitted, submitted, reviewed
  const [selectedFile, setSelectedFile] = useState(null);
  const [projectDescription, setProjectDescription] = useState('');
  const [submissionDate, setSubmissionDate] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile && projectDescription.trim()) {
      setProjectStatus('submitted');
      setSubmissionDate(new Date().toLocaleDateString());
      // Here you would typically upload the file to your server
      alert('Final project submitted successfully!');
    } else {
      alert('Please select a file and provide a description.');
    }
  };

  const handleUpdate = () => {
    if (selectedFile && projectDescription.trim()) {
      setSubmissionDate(new Date().toLocaleDateString());
      alert('Final project updated successfully!');
    } else {
      alert('Please select a file and provide a description.');
    }
  };

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
        return 'Not Submitted';
      case 'submitted':
        return 'Submitted - Waiting for Review';
      case 'reviewed':
        return 'Reviewed';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Final Project</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Submit your final project to complete this course. Make sure to follow all the requirements outlined in the course materials.
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
        <div className="flex items-center space-x-3 mb-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
            <p className="text-gray-600">{getStatusText()}</p>
            {submissionDate && (
              <p className="text-sm text-gray-500">Last updated: {submissionDate}</p>
            )}
          </div>
        </div>
        
        {grade && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">Grade: {grade}/100</h4>
            {feedback && (
              <p className="text-green-700 mt-2">{feedback}</p>
            )}
          </div>
        )}
      </div>

      {/* Project Requirements */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Project Requirements</h3>
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
  );
};

export default FinalProject;