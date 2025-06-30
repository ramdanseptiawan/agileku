// IndexedDB utility for file storage
const DB_NAME = 'AgilekuLMS';
const DB_VERSION = 1;
const STORE_NAME = 'files';

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('courseId', 'courseId', { unique: false });
        }
      };
    });
  }

  async saveFile(file, courseId, type = 'general') {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const fileData = {
          id: `${courseId}_${type}_${Date.now()}_${file.name}`,
          name: file.name,
          type: type,
          mimeType: file.type,
          size: file.size,
          courseId: courseId,
          data: reader.result,
          uploadedAt: new Date().toISOString()
        };
        
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(fileData);
        
        request.onsuccess = () => resolve({
          id: fileData.id,
          name: fileData.name,
          url: this.createBlobURL(fileData),
          downloadUrl: this.createBlobURL(fileData)
        });
        request.onerror = () => reject(request.error);
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  async getFile(fileId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(fileId);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            ...result,
            url: this.createBlobURL(result),
            downloadUrl: this.createBlobURL(result)
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByType(courseId, type) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('courseId');
      const request = index.getAll(courseId);
      
      request.onsuccess = () => {
        const files = request.result.filter(file => file.type === type);
        const filesWithUrls = files.map(file => ({
          ...file,
          url: this.createBlobURL(file),
          downloadUrl: this.createBlobURL(file)
        }));
        resolve(filesWithUrls);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(fileId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(fileId);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  createBlobURL(fileData) {
    const blob = new Blob([fileData.data], { type: fileData.mimeType });
    return URL.createObjectURL(blob);
  }

  async getAllFiles(courseId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('courseId');
      const request = index.getAll(courseId);
      
      request.onsuccess = () => {
        const filesWithUrls = request.result.map(file => ({
          ...file,
          url: this.createBlobURL(file),
          downloadUrl: this.createBlobURL(file)
        }));
        resolve(filesWithUrls);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
const dbManager = new IndexedDBManager();

// Export functions
export const saveFileToIndexedDB = (file, courseId, type) => {
  return dbManager.saveFile(file, courseId, type);
};

export const getFileFromIndexedDB = (fileId) => {
  return dbManager.getFile(fileId);
};

export const getFilesByType = (courseId, type) => {
  return dbManager.getFilesByType(courseId, type);
};

export const deleteFileFromIndexedDB = (fileId) => {
  return dbManager.deleteFile(fileId);
};

export const getAllFilesFromIndexedDB = (courseId) => {
  return dbManager.getAllFiles(courseId);
};

export const initIndexedDB = () => {
  return dbManager.init();
};

export const getBlobUrl = (fileData) => {
  return dbManager.createBlobURL(fileData);
};

export default dbManager;