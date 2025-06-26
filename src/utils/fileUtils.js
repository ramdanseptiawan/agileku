// File handling utilities

// Supported file types for different purposes
export const SUPPORTED_FILE_TYPES = {
  project: {
    extensions: ['.pdf', '.docx', '.doc', '.zip', '.rar', '.7z'],
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  document: {
    extensions: ['.pdf', '.docx', '.doc', '.txt'],
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ],
    maxSize: 25 * 1024 * 1024 // 25MB
  }
};

// File validation function
export const validateFile = (file, type = 'project') => {
  const config = SUPPORTED_FILE_TYPES[type];
  
  if (!config) {
    return {
      isValid: false,
      error: 'Invalid file type configuration'
    };
  }

  // Check file size
  if (file.size > config.maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(config.maxSize)} limit`
    };
  }

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  const isValidExtension = config.extensions.includes(fileExtension);
  const isValidMimeType = config.mimeTypes.includes(file.type);

  if (!isValidExtension && !isValidMimeType) {
    return {
      isValid: false,
      error: `File type not supported. Allowed types: ${config.extensions.join(', ')}`
    };
  }

  return {
    isValid: true,
    error: null
  };
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on file type
export const getFileIcon = (fileName, fileType) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconMap = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📄',
    zip: '🗜️',
    rar: '🗜️',
    '7z': '🗜️',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️'
  };
  
  return iconMap[extension] || '📎';
};

// Create file preview URL
export const createFilePreviewUrl = (file) => {
  if (file.type === 'application/pdf') {
    return URL.createObjectURL(file);
  }
  return null;
};

// Revoke file preview URL to prevent memory leaks
export const revokeFilePreviewUrl = (url) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};

// Check if file can be previewed
export const canPreviewFile = (file) => {
  const previewableTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain'
  ];
  
  return previewableTypes.includes(file.type);
};

// Generate unique filename to prevent conflicts
export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  
  return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
};

// File upload progress tracking
export class FileUploadTracker {
  constructor() {
    this.uploads = new Map();
  }

  startUpload(fileId, fileName) {
    this.uploads.set(fileId, {
      fileName,
      progress: 0,
      status: 'uploading',
      startTime: Date.now()
    });
  }

  updateProgress(fileId, progress) {
    const upload = this.uploads.get(fileId);
    if (upload) {
      upload.progress = progress;
      upload.status = progress === 100 ? 'completed' : 'uploading';
    }
  }

  setError(fileId, error) {
    const upload = this.uploads.get(fileId);
    if (upload) {
      upload.status = 'error';
      upload.error = error;
    }
  }

  getUpload(fileId) {
    return this.uploads.get(fileId);
  }

  removeUpload(fileId) {
    this.uploads.delete(fileId);
  }

  getAllUploads() {
    return Array.from(this.uploads.entries()).map(([id, upload]) => ({
      id,
      ...upload
    }));
  }
}

// Create a global instance
export const fileUploadTracker = new FileUploadTracker();

// Drag and drop utilities
export const handleDragEvents = {
  onDragEnter: (e) => {
    e.preventDefault();
    e.stopPropagation();
  },
  
  onDragLeave: (e) => {
    e.preventDefault();
    e.stopPropagation();
  },
  
  onDragOver: (e) => {
    e.preventDefault();
    e.stopPropagation();
  },
  
  onDrop: (e, callback, fileType = 'project') => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
      const file = files[0]; // Take only the first file
      const validation = validateFile(file, fileType);
      
      if (validation.isValid) {
        callback(file);
      } else {
        console.error('File validation failed:', validation.error);
        // You might want to show this error to the user
      }
    }
  }
};

// Local storage utilities for file metadata
export const fileStorage = {
  saveFileMetadata: (fileId, metadata) => {
    const key = `file_metadata_${fileId}`;
    localStorage.setItem(key, JSON.stringify(metadata));
  },
  
  getFileMetadata: (fileId) => {
    const key = `file_metadata_${fileId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  
  removeFileMetadata: (fileId) => {
    const key = `file_metadata_${fileId}`;
    localStorage.removeItem(key);
  },
  
  getAllFileMetadata: () => {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('file_metadata_')) {
        const data = localStorage.getItem(key);
        if (data) {
          files.push(JSON.parse(data));
        }
      }
    }
    return files;
  }
};

export default {
  validateFile,
  formatFileSize,
  getFileIcon,
  createFilePreviewUrl,
  revokeFilePreviewUrl,
  canPreviewFile,
  generateUniqueFileName,
  FileUploadTracker,
  fileUploadTracker,
  handleDragEvents,
  fileStorage,
  SUPPORTED_FILE_TYPES
};