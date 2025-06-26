import React from 'react';
import WysiwygEditor from './WysiwygEditor';

const FinalProjectForm = ({ finalProject, onChange }) => {
  const updateFinalProject = (field, value) => {
    onChange({
      ...finalProject,
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
    { value: 'rar', label: 'RAR Archive' },
    { value: 'jpg', label: 'JPEG Image' },
    { value: 'png', label: 'PNG Image' },
    { value: 'gif', label: 'GIF Image' },
    { value: 'mp4', label: 'MP4 Video' },
    { value: 'mov', label: 'MOV Video' }
  ];

  const toggleFileType = (fileType) => {
    const currentTypes = finalProject.allowedFileTypes || [];
    const updatedTypes = currentTypes.includes(fileType)
      ? currentTypes.filter(type => type !== fileType)
      : [...currentTypes, fileType];
    
    updateFinalProject('allowedFileTypes', updatedTypes);
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Final Project Configuration</h3>
        <span className="text-sm text-gray-500">
          Proyek akhir untuk menyelesaikan kursus
        </span>
      </div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Final Project
          </label>
          <input
            type="text"
            value={finalProject.title}
            onChange={(e) => updateFinalProject('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Capstone Project: Full-Stack Web Application"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format Submission
          </label>
          <select
            value={finalProject.submissionFormat}
            onChange={(e) => updateFinalProject('submissionFormat', e.target.value)}
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
          Deskripsi Final Project
        </label>
        <WysiwygEditor
          value={finalProject.description}
          onChange={(content) => updateFinalProject('description', content)}
          placeholder="Jelaskan tujuan, scope, dan overview dari final project ini..."
          height="250px"
        />
      </div>
      
      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instruksi Pengerjaan
        </label>
        <WysiwygEditor
          value={finalProject.instructions}
          onChange={(content) => updateFinalProject('instructions', content)}
          placeholder="Berikan instruksi detail tentang cara mengerjakan final project, timeline, dan deliverables..."
          height="350px"
        />
      </div>
      
      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requirements & Kriteria Penilaian
        </label>
        <WysiwygEditor
          value={finalProject.requirements}
          onChange={(content) => updateFinalProject('requirements', content)}
          placeholder="Sebutkan technical requirements, functional requirements, dan kriteria penilaian..."
          height="300px"
        />
      </div>
      
      {/* File Upload Settings */}
      {(finalProject.submissionFormat === 'file' || finalProject.submissionFormat === 'both') && (
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
                max="500"
                value={finalProject.maxFileSize}
                onChange={(e) => updateFinalProject('maxFileSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Untuk final project, ukuran file bisa lebih besar (hingga 500MB)
              </p>
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
                    checked={(finalProject.allowedFileTypes || []).includes(fileType.value)}
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
      
      {/* Link Submission Guidelines */}
      {(finalProject.submissionFormat === 'link' || finalProject.submissionFormat === 'both') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-blue-900 mb-2">Guidelines untuk Link Submission</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Pastikan link dapat diakses secara publik</p>
            <p>• Untuk GitHub repository, pastikan repository bersifat public</p>
            <p>• Untuk deployed application, pastikan aplikasi dapat diakses</p>
            <p>• Sertakan dokumentasi yang jelas (README.md untuk GitHub)</p>
            <p>• Jika menggunakan demo video, upload ke YouTube atau platform serupa</p>
          </div>
        </div>
      )}
      
      {/* Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Preview Final Project</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          {finalProject.title && (
            <h5 className="text-lg font-semibold text-gray-900 mb-3">{finalProject.title}</h5>
          )}
          
          {finalProject.description && (
            <div className="mb-4">
              <h6 className="font-medium text-gray-700 mb-2">Deskripsi:</h6>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: finalProject.description }}
              />
            </div>
          )}
          
          {finalProject.instructions && (
            <div className="mb-4">
              <h6 className="font-medium text-gray-700 mb-2">Instruksi:</h6>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: finalProject.instructions }}
              />
            </div>
          )}
          
          {finalProject.requirements && (
            <div className="mb-4">
              <h6 className="font-medium text-gray-700 mb-2">Requirements:</h6>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: finalProject.requirements }}
              />
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>🎯 Format: {submissionFormats.find(f => f.value === finalProject.submissionFormat)?.label}</span>
              {(finalProject.submissionFormat === 'file' || finalProject.submissionFormat === 'both') && (
                <>
                  <span>📁 Max Size: {finalProject.maxFileSize}MB</span>
                  <span>📄 File Types: {(finalProject.allowedFileTypes || []).join(', ').toUpperCase()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tips for Students */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-green-900 mb-2">💡 Tips untuk Mahasiswa</h4>
        <div className="text-sm text-green-800 space-y-1">
          <p>• Mulai mengerjakan final project sedini mungkin</p>
          <p>• Buat timeline dan breakdown task yang jelas</p>
          <p>• Konsultasikan progress secara berkala dengan instruktur</p>
          <p>• Dokumentasikan proses pengerjaan dengan baik</p>
          <p>• Test aplikasi/project secara menyeluruh sebelum submit</p>
          <p>• Siapkan presentasi atau demo jika diperlukan</p>
        </div>
      </div>
    </div>
  );
};

export default FinalProjectForm;