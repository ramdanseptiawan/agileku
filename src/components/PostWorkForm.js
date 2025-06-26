import React from 'react';
import WysiwygEditor from './WysiwygEditor';

const PostWorkForm = ({ postWork, onChange }) => {
  const updatePostWork = (field, value) => {
    onChange({
      ...postWork,
      [field]: value
    });
  };

  const submissionFormats = [
    { value: 'file', label: 'File Upload Only' },
    { value: 'link', label: 'Link/URL Only' },
    { value: 'both', label: 'File Upload & Link' }
  ];

  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word Document (.docx)' },
    { value: 'doc', label: 'Word Document (.doc)' },
    { value: 'pptx', label: 'PowerPoint (.pptx)' },
    { value: 'zip', label: 'ZIP Archive' },
    { value: 'jpg', label: 'JPEG Image' },
    { value: 'png', label: 'PNG Image' },
    { value: 'gif', label: 'GIF Image' }
  ];

  const toggleFileType = (fileType) => {
    const currentTypes = postWork.allowedFileTypes || [];
    const updatedTypes = currentTypes.includes(fileType)
      ? currentTypes.filter(type => type !== fileType)
      : [...currentTypes, fileType];
    
    updatePostWork('allowedFileTypes', updatedTypes);
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Post Work Configuration</h3>
        <span className="text-sm text-gray-500">
          Tugas setelah menyelesaikan kursus
        </span>
      </div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Post Work
          </label>
          <input
            type="text"
            value={postWork.title}
            onChange={(e) => updatePostWork('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Implementasi Project React"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format Submission
          </label>
          <select
            value={postWork.submissionFormat}
            onChange={(e) => updatePostWork('submissionFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {submissionFormats.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi Post Work
        </label>
        <WysiwygEditor
          value={postWork.description}
          onChange={(content) => updatePostWork('description', content)}
          placeholder="Jelaskan tujuan dan overview dari post work ini..."
          height="200px"
        />
      </div>
      
      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instruksi Pengerjaan
        </label>
        <WysiwygEditor
          value={postWork.instructions}
          onChange={(content) => updatePostWork('instructions', content)}
          placeholder="Berikan instruksi detail tentang cara mengerjakan post work..."
          height="300px"
        />
      </div>
      
      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requirements & Kriteria Penilaian
        </label>
        <WysiwygEditor
          value={postWork.requirements}
          onChange={(content) => updatePostWork('requirements', content)}
          placeholder="Sebutkan requirements dan kriteria penilaian..."
          height="250px"
        />
      </div>
      
      {/* File Upload Settings */}
      {(postWork.submissionFormat === 'file' || postWork.submissionFormat === 'both') && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Pengaturan File Upload</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksimal Ukuran File (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={postWork.maxFileSize}
                onChange={(e) => updatePostWork('maxFileSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipe File yang Diizinkan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fileTypes.map(fileType => (
                <label key={fileType.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(postWork.allowedFileTypes || []).includes(fileType.value)}
                    onChange={() => toggleFileType(fileType.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{fileType.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Preview Post Work</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          {postWork.title && (
            <h5 className="text-lg font-semibold text-gray-900 mb-3">{postWork.title}</h5>
          )}
          
          {postWork.description && (
            <div className="mb-4">
              <h6 className="font-medium text-gray-700 mb-2">Deskripsi:</h6>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: postWork.description }}
              />
            </div>
          )}
          
          {postWork.instructions && (
            <div className="mb-4">
              <h6 className="font-medium text-gray-700 mb-2">Instruksi:</h6>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: postWork.instructions }}
              />
            </div>
          )}
          
          {postWork.requirements && (
            <div className="mb-4">
              <h6 className="font-medium text-gray-700 mb-2">Requirements:</h6>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: postWork.requirements }}
              />
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📋 Format: {submissionFormats.find(f => f.value === postWork.submissionFormat)?.label}</span>
              {(postWork.submissionFormat === 'file' || postWork.submissionFormat === 'both') && (
                <>
                  <span>📁 Max Size: {postWork.maxFileSize}MB</span>
                  <span>📄 File Types: {(postWork.allowedFileTypes || []).join(', ').toUpperCase()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostWorkForm;