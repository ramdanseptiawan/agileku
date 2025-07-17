(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/utils/indexedDB.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// IndexedDB utility for file storage
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "deleteFileFromIndexedDB": (()=>deleteFileFromIndexedDB),
    "getAllFilesFromIndexedDB": (()=>getAllFilesFromIndexedDB),
    "getBlobUrl": (()=>getBlobUrl),
    "getFileFromIndexedDB": (()=>getFileFromIndexedDB),
    "getFilesByType": (()=>getFilesByType),
    "initIndexedDB": (()=>initIndexedDB),
    "saveFileToIndexedDB": (()=>saveFileToIndexedDB)
});
const DB_NAME = 'AgilekuLMS';
const DB_VERSION = 1;
const STORE_NAME = 'files';
class IndexedDBManager {
    constructor(){
        this.db = null;
    }
    async init() {
        return new Promise((resolve, reject)=>{
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = ()=>reject(request.error);
            request.onsuccess = ()=>{
                this.db = request.result;
                resolve(this.db);
            };
            request.onupgradeneeded = (event)=>{
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id'
                    });
                    store.createIndex('type', 'type', {
                        unique: false
                    });
                    store.createIndex('courseId', 'courseId', {
                        unique: false
                    });
                }
            };
        });
    }
    async saveFile(file, courseId, type = 'general') {
        if (!this.db) await this.init();
        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.onload = ()=>{
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
                const transaction = this.db.transaction([
                    STORE_NAME
                ], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.add(fileData);
                request.onsuccess = ()=>resolve({
                        id: fileData.id,
                        name: fileData.name,
                        url: this.createBlobURL(fileData),
                        downloadUrl: this.createBlobURL(fileData)
                    });
                request.onerror = ()=>reject(request.error);
            };
            reader.onerror = ()=>reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }
    async getFile(fileId) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject)=>{
            const transaction = this.db.transaction([
                STORE_NAME
            ], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(fileId);
            request.onsuccess = ()=>{
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
            request.onerror = ()=>reject(request.error);
        });
    }
    async getFilesByType(courseId, type) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject)=>{
            const transaction = this.db.transaction([
                STORE_NAME
            ], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('courseId');
            const request = index.getAll(courseId);
            request.onsuccess = ()=>{
                const files = request.result.filter((file)=>file.type === type);
                const filesWithUrls = files.map((file)=>({
                        ...file,
                        url: this.createBlobURL(file),
                        downloadUrl: this.createBlobURL(file)
                    }));
                resolve(filesWithUrls);
            };
            request.onerror = ()=>reject(request.error);
        });
    }
    async deleteFile(fileId) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject)=>{
            const transaction = this.db.transaction([
                STORE_NAME
            ], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(fileId);
            request.onsuccess = ()=>resolve(true);
            request.onerror = ()=>reject(request.error);
        });
    }
    createBlobURL(fileData) {
        const blob = new Blob([
            fileData.data
        ], {
            type: fileData.mimeType
        });
        return URL.createObjectURL(blob);
    }
    async getAllFiles(courseId) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject)=>{
            const transaction = this.db.transaction([
                STORE_NAME
            ], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('courseId');
            const request = index.getAll(courseId);
            request.onsuccess = ()=>{
                const filesWithUrls = request.result.map((file)=>({
                        ...file,
                        url: this.createBlobURL(file),
                        downloadUrl: this.createBlobURL(file)
                    }));
                resolve(filesWithUrls);
            };
            request.onerror = ()=>reject(request.error);
        });
    }
}
// Create singleton instance
const dbManager = new IndexedDBManager();
const saveFileToIndexedDB = (file, courseId, type)=>{
    return dbManager.saveFile(file, courseId, type);
};
const getFileFromIndexedDB = (fileId)=>{
    return dbManager.getFile(fileId);
};
const getFilesByType = (courseId, type)=>{
    return dbManager.getFilesByType(courseId, type);
};
const deleteFileFromIndexedDB = (fileId)=>{
    return dbManager.deleteFile(fileId);
};
const getAllFilesFromIndexedDB = (courseId)=>{
    return dbManager.getAllFiles(courseId);
};
const initIndexedDB = ()=>{
    return dbManager.init();
};
const getBlobUrl = (fileData)=>{
    return dbManager.createBlobURL(fileData);
};
const __TURBOPACK__default__export__ = dbManager;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/utils/quizData.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Quiz and Survey Data Management
// Default quiz questions for different courses
__turbopack_context__.s({
    "addQuizQuestion": (()=>addQuizQuestion),
    "addSurveyQuestion": (()=>addSurveyQuestion),
    "defaultQuizQuestions": (()=>defaultQuizQuestions),
    "defaultSurveyQuestions": (()=>defaultSurveyQuestions),
    "deleteQuizQuestion": (()=>deleteQuizQuestion),
    "deleteSurveyQuestion": (()=>deleteSurveyQuestion),
    "exportAllData": (()=>exportAllData),
    "getQuizQuestions": (()=>getQuizQuestions),
    "getSurveyQuestions": (()=>getSurveyQuestions),
    "importAllData": (()=>importAllData),
    "saveQuizQuestions": (()=>saveQuizQuestions),
    "saveSurveyQuestions": (()=>saveSurveyQuestions),
    "updateQuizQuestion": (()=>updateQuizQuestion),
    "updateSurveyQuestion": (()=>updateSurveyQuestion)
});
const defaultQuizQuestions = {
    preTest: [
        {
            id: 1,
            question: "What is your current experience level with this topic?",
            type: "multiple_choice",
            options: [
                "Beginner - No prior experience",
                "Intermediate - Some experience",
                "Advanced - Extensive experience",
                "Expert - Professional level"
            ],
            correctAnswer: 0 // This is subjective, so any answer is correct
        },
        {
            id: 2,
            question: "How confident do you feel about learning this subject?",
            type: "multiple_choice",
            options: [
                "Very confident",
                "Somewhat confident",
                "Neutral",
                "Not very confident",
                "Not confident at all"
            ],
            correctAnswer: 0
        }
    ],
    postTest: [
        {
            id: 1,
            question: "How would you rate your understanding of the course material?",
            type: "multiple_choice",
            options: [
                "Excellent - I understand everything",
                "Good - I understand most concepts",
                "Fair - I understand some concepts",
                "Poor - I understand very little"
            ],
            correctAnswer: 0
        },
        {
            id: 2,
            question: "Which topic did you find most challenging?",
            type: "text",
            placeholder: "Please describe the most challenging topic..."
        }
    ]
};
const defaultSurveyQuestions = [
    {
        id: 1,
        question: "How would you rate the overall course quality?",
        type: "rating",
        scale: 5
    },
    {
        id: 2,
        question: "How clear were the course instructions?",
        type: "rating",
        scale: 5
    },
    {
        id: 3,
        question: "How engaging was the course content?",
        type: "rating",
        scale: 5
    },
    {
        id: 4,
        question: "What did you like most about this course?",
        type: "text",
        placeholder: "Please share what you enjoyed most..."
    },
    {
        id: 5,
        question: "What suggestions do you have for improving this course?",
        type: "text",
        placeholder: "Please share your suggestions for improvement..."
    }
];
// Quiz data storage (in a real app, this would be in a database)
let quizData = {
};
// Survey data storage
let surveyData = {
};
const getQuizQuestions = (courseId, quizType)=>{
    if (!quizData[courseId]) {
        quizData[courseId] = {
            preTest: [
                ...defaultQuizQuestions.preTest
            ],
            postTest: [
                ...defaultQuizQuestions.postTest
            ]
        };
    }
    return quizData[courseId][quizType] || [];
};
const saveQuizQuestions = (courseId, quizType, questions)=>{
    if (!quizData[courseId]) {
        quizData[courseId] = {
            preTest: [],
            postTest: []
        };
    }
    quizData[courseId][quizType] = questions;
    return true;
};
const addQuizQuestion = (courseId, quizType, question)=>{
    const questions = getQuizQuestions(courseId, quizType);
    const newQuestion = {
        ...question,
        id: Date.now() // Simple ID generation
    };
    questions.push(newQuestion);
    saveQuizQuestions(courseId, quizType, questions);
    return newQuestion;
};
const updateQuizQuestion = (courseId, quizType, questionId, updatedQuestion)=>{
    const questions = getQuizQuestions(courseId, quizType);
    const index = questions.findIndex((q)=>q.id === questionId);
    if (index !== -1) {
        questions[index] = {
            ...questions[index],
            ...updatedQuestion
        };
        saveQuizQuestions(courseId, quizType, questions);
        return questions[index];
    }
    return null;
};
const deleteQuizQuestion = (courseId, quizType, questionId)=>{
    const questions = getQuizQuestions(courseId, quizType);
    const filteredQuestions = questions.filter((q)=>q.id !== questionId);
    saveQuizQuestions(courseId, quizType, filteredQuestions);
    return true;
};
const getSurveyQuestions = (courseId)=>{
    if (!surveyData[courseId]) {
        surveyData[courseId] = [
            ...defaultSurveyQuestions
        ];
    }
    return surveyData[courseId];
};
const saveSurveyQuestions = (courseId, questions)=>{
    surveyData[courseId] = questions;
    return true;
};
const addSurveyQuestion = (courseId, question)=>{
    const questions = getSurveyQuestions(courseId);
    const newQuestion = {
        ...question,
        id: Date.now()
    };
    questions.push(newQuestion);
    saveSurveyQuestions(courseId, questions);
    return newQuestion;
};
const updateSurveyQuestion = (courseId, questionId, updatedQuestion)=>{
    const questions = getSurveyQuestions(courseId);
    const index = questions.findIndex((q)=>q.id === questionId);
    if (index !== -1) {
        questions[index] = {
            ...questions[index],
            ...updatedQuestion
        };
        saveSurveyQuestions(courseId, questions);
        return questions[index];
    }
    return null;
};
const deleteSurveyQuestion = (courseId, questionId)=>{
    const questions = getSurveyQuestions(courseId);
    const filteredQuestions = questions.filter((q)=>q.id !== questionId);
    saveSurveyQuestions(courseId, filteredQuestions);
    return true;
};
const exportAllData = ()=>{
    return {
        quizData,
        surveyData,
        timestamp: new Date().toISOString()
    };
};
const importAllData = (data)=>{
    if (data.quizData) {
        quizData = data.quizData;
    }
    if (data.surveyData) {
        surveyData = data.surveyData;
    }
    return true;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/utils/fileUtils.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// File handling utilities
// Supported file types for different purposes
__turbopack_context__.s({
    "FileUploadTracker": (()=>FileUploadTracker),
    "SUPPORTED_FILE_TYPES": (()=>SUPPORTED_FILE_TYPES),
    "canPreviewFile": (()=>canPreviewFile),
    "createFilePreviewUrl": (()=>createFilePreviewUrl),
    "default": (()=>__TURBOPACK__default__export__),
    "fileStorage": (()=>fileStorage),
    "fileUploadTracker": (()=>fileUploadTracker),
    "formatFileSize": (()=>formatFileSize),
    "generateUniqueFileName": (()=>generateUniqueFileName),
    "getFileIcon": (()=>getFileIcon),
    "handleDragEvents": (()=>handleDragEvents),
    "revokeFilePreviewUrl": (()=>revokeFilePreviewUrl),
    "validateFile": (()=>validateFile)
});
const SUPPORTED_FILE_TYPES = {
    project: {
        extensions: [
            '.pdf',
            '.docx',
            '.doc',
            '.zip',
            '.rar',
            '.7z'
        ],
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
        extensions: [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.webp'
        ],
        mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ],
        maxSize: 10 * 1024 * 1024 // 10MB
    },
    document: {
        extensions: [
            '.pdf',
            '.docx',
            '.doc',
            '.txt'
        ],
        mimeTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ],
        maxSize: 25 * 1024 * 1024 // 25MB
    }
};
const validateFile = (file, type = 'project')=>{
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
const formatFileSize = (bytes)=>{
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB'
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const getFileIcon = (fileName, fileType)=>{
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
const createFilePreviewUrl = (file)=>{
    if (file.type === 'application/pdf') {
        return URL.createObjectURL(file);
    }
    return null;
};
const revokeFilePreviewUrl = (url)=>{
    if (url) {
        URL.revokeObjectURL(url);
    }
};
const canPreviewFile = (file)=>{
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
const generateUniqueFileName = (originalName)=>{
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
};
class FileUploadTracker {
    constructor(){
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
        return Array.from(this.uploads.entries()).map(([id, upload])=>({
                id,
                ...upload
            }));
    }
}
const fileUploadTracker = new FileUploadTracker();
const handleDragEvents = {
    onDragEnter: (e)=>{
        e.preventDefault();
        e.stopPropagation();
    },
    onDragLeave: (e)=>{
        e.preventDefault();
        e.stopPropagation();
    },
    onDragOver: (e)=>{
        e.preventDefault();
        e.stopPropagation();
    },
    onDrop: (e, callback, fileType = 'project')=>{
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
const fileStorage = {
    saveFileMetadata: (fileId, metadata)=>{
        const key = `file_metadata_${fileId}`;
        localStorage.setItem(key, JSON.stringify(metadata));
    },
    getFileMetadata: (fileId)=>{
        const key = `file_metadata_${fileId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    removeFileMetadata: (fileId)=>{
        const key = `file_metadata_${fileId}`;
        localStorage.removeItem(key);
    },
    getAllFileMetadata: ()=>{
        const files = [];
        for(let i = 0; i < localStorage.length; i++){
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
const __TURBOPACK__default__export__ = {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/useLearningProgress.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "useLearningProgress": (()=>useLearningProgress)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/api.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
const useLearningProgress = (courseId)=>{
    _s();
    const { currentUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        currentStep: 'intro',
        completedSteps: [],
        lessonProgress: {},
        quizScores: {},
        submissions: {},
        lastAccessed: null,
        totalTimeSpent: 0,
        startedAt: null,
        completedAt: null,
        isCompleted: false
    });
    const [courseConfig, setCourseConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [autoSaveStatus, setAutoSaveStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('saved');
    // Save progress to backend only
    const saveProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[saveProgress]": async (newProgress)=>{
            if (!courseId || !currentUser) return;
            try {
                setAutoSaveStatus('saving');
                const progressToSave = {
                    ...newProgress,
                    lastAccessed: new Date().toISOString()
                };
                // Sync to backend only
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["syncProgress"])({
                    courseId: parseInt(courseId),
                    currentStep: newProgress.currentStep,
                    completedSteps: newProgress.completedSteps,
                    lessonProgress: newProgress.lessonProgress,
                    quizScores: newProgress.quizScores,
                    submissions: newProgress.submissions,
                    totalTimeSpent: newProgress.totalTimeSpent,
                    completedAt: newProgress.completedAt
                });
                setAutoSaveStatus('saved');
                // Reset status setelah 2 detik
                setTimeout({
                    "useLearningProgress.useCallback[saveProgress]": ()=>setAutoSaveStatus('idle')
                }["useLearningProgress.useCallback[saveProgress]"], 2000);
            } catch (error) {
                console.error('Error saving progress to backend:', error);
                setAutoSaveStatus('error');
            }
        }
    }["useLearningProgress.useCallback[saveProgress]"], [
        courseId,
        currentUser
    ]);
    // Update progress dengan auto-save
    const updateProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[updateProgress]": (updates)=>{
            setProgress({
                "useLearningProgress.useCallback[updateProgress]": (prev)=>{
                    const newProgress = {
                        ...prev,
                        ...updates
                    };
                    setAutoSaveStatus('pending');
                    saveProgress(newProgress);
                    return newProgress;
                }
            }["useLearningProgress.useCallback[updateProgress]"]);
        }
    }["useLearningProgress.useCallback[updateProgress]"], [
        saveProgress
    ]);
    // Mark step sebagai completed
    const markStepCompleted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[markStepCompleted]": (stepId)=>{
            setProgress({
                "useLearningProgress.useCallback[markStepCompleted]": (prev)=>{
                    const newProgress = {
                        ...prev,
                        completedSteps: [
                            ...new Set([
                                ...prev.completedSteps,
                                stepId
                            ])
                        ]
                    };
                    setAutoSaveStatus('pending');
                    saveProgress(newProgress);
                    return newProgress;
                }
            }["useLearningProgress.useCallback[markStepCompleted]"]);
        }
    }["useLearningProgress.useCallback[markStepCompleted]"], [
        saveProgress
    ]);
    // Set current step
    const setCurrentStep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[setCurrentStep]": (stepId)=>{
            updateProgress({
                currentStep: stepId
            });
        }
    }["useLearningProgress.useCallback[setCurrentStep]"], [
        updateProgress
    ]);
    // Update lesson progress
    const updateLessonProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[updateLessonProgress]": async (lessonId, progressData)=>{
            setProgress({
                "useLearningProgress.useCallback[updateLessonProgress]": (prev)=>{
                    const newProgress = {
                        ...prev,
                        lessonProgress: {
                            ...prev.lessonProgress,
                            [lessonId]: {
                                ...prev.lessonProgress[lessonId],
                                ...progressData,
                                lastAccessed: new Date().toISOString()
                            }
                        }
                    };
                    setAutoSaveStatus('pending');
                    saveProgress(newProgress);
                    return newProgress;
                }
            }["useLearningProgress.useCallback[updateLessonProgress]"]);
        // Note: Backend sync is handled by saveProgress via syncProgress endpoint
        // Individual lesson progress updates should not call separate API endpoints
        // to avoid inconsistent progress calculations
        }
    }["useLearningProgress.useCallback[updateLessonProgress]"], [
        saveProgress
    ]);
    // Save quiz score
    const saveQuizScore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[saveQuizScore]": (quizId, score, isPreTest = false)=>{
            const quizKey = isPreTest ? `pretest_${quizId}` : `posttest_${quizId}`;
            console.log('Saving quiz score:', {
                quizId,
                score,
                isPreTest,
                quizKey,
                currentQuizScores: progress.quizScores
            });
            updateProgress({
                quizScores: {
                    ...progress.quizScores,
                    [quizKey]: {
                        score,
                        completedAt: new Date().toISOString(),
                        attempts: (progress.quizScores[quizKey]?.attempts || 0) + 1
                    }
                }
            });
        }
    }["useLearningProgress.useCallback[saveQuizScore]"], [
        progress.quizScores,
        updateProgress
    ]);
    // Save submission (postwork/final project)
    const saveSubmission = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[saveSubmission]": (type, submissionData)=>{
            updateProgress({
                submissions: {
                    ...progress.submissions,
                    [type]: {
                        ...submissionData,
                        submittedAt: new Date().toISOString()
                    }
                }
            });
        }
    }["useLearningProgress.useCallback[saveSubmission]"], [
        progress.submissions,
        updateProgress
    ]);
    // Mark course as completed - only when all steps are actually completed
    const markCourseCompleted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[markCourseCompleted]": ()=>{
            const allSteps = [
                'intro',
                'pretest',
                'lessons',
                'posttest',
                'postwork',
                'finalproject'
            ];
            const allStepsCompleted = allSteps.every({
                "useLearningProgress.useCallback[markCourseCompleted].allStepsCompleted": (step)=>progress.completedSteps.includes(step)
            }["useLearningProgress.useCallback[markCourseCompleted].allStepsCompleted"]);
            if (allStepsCompleted) {
                updateProgress({
                    completedAt: new Date().toISOString(),
                    isCompleted: true
                });
            } else {
                console.warn('Cannot mark course as completed - not all steps are finished:', {
                    completedSteps: progress.completedSteps,
                    missingSteps: allSteps.filter({
                        "useLearningProgress.useCallback[markCourseCompleted]": (step)=>!progress.completedSteps.includes(step)
                    }["useLearningProgress.useCallback[markCourseCompleted]"])
                });
            }
        }
    }["useLearningProgress.useCallback[markCourseCompleted]"], [
        updateProgress,
        progress.completedSteps
    ]);
    // Calculate completion percentage with dynamic weighted steps
    const getCompletionPercentage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[getCompletionPercentage]": ()=>{
            // Use dynamic step weights from course configuration or default weights
            let stepWeights = {
                'intro': 5,
                'pretest': 10,
                'lessons': 50,
                'posttest': 15,
                'postwork': 10,
                'finalproject': 10
            };
            // Override with course-specific weights if available
            if (courseConfig && courseConfig.stepWeights) {
                stepWeights = {
                    ...stepWeights,
                    ...courseConfig.stepWeights
                };
            }
            let totalProgress = 0;
            progress.completedSteps.forEach({
                "useLearningProgress.useCallback[getCompletionPercentage]": (step)=>{
                    if (stepWeights[step]) {
                        totalProgress += stepWeights[step];
                    }
                }
            }["useLearningProgress.useCallback[getCompletionPercentage]"]);
            return Math.min(totalProgress, 100);
        }
    }["useLearningProgress.useCallback[getCompletionPercentage]"], [
        progress.completedSteps,
        courseConfig
    ]);
    // Check if course is completed based on course configuration
    const isCourseCompleted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[isCourseCompleted]": ()=>{
            // Get required steps based on course configuration
            let requiredSteps = [
                'intro',
                'pretest',
                'lessons',
                'posttest'
            ];
            // Add optional steps if enabled in course configuration
            if (courseConfig?.hasPostWork) {
                requiredSteps.push('postwork');
            }
            if (courseConfig?.hasFinalProject) {
                requiredSteps.push('finalproject');
            }
            return requiredSteps.every({
                "useLearningProgress.useCallback[isCourseCompleted]": (step)=>progress.completedSteps.includes(step)
            }["useLearningProgress.useCallback[isCourseCompleted]"]);
        }
    }["useLearningProgress.useCallback[isCourseCompleted]"], [
        progress.completedSteps,
        courseConfig
    ]);
    // Get time spent in course (in minutes)
    const getTimeSpent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[getTimeSpent]": ()=>{
            if (!progress.startedAt) return 0;
            const start = new Date(progress.startedAt);
            const end = progress.completedAt ? new Date(progress.completedAt) : new Date();
            return Math.round((end - start) / (1000 * 60)); // minutes
        }
    }["useLearningProgress.useCallback[getTimeSpent]"], [
        progress.startedAt,
        progress.completedAt
    ]);
    // Reset progress (untuk testing atau restart course)
    const resetProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLearningProgress.useCallback[resetProgress]": async ()=>{
            const initialProgress = {
                currentStep: 'intro',
                completedSteps: [],
                lessonProgress: {},
                quizScores: {},
                submissions: {},
                lastAccessed: new Date().toISOString(),
                totalTimeSpent: 0,
                startedAt: new Date().toISOString(),
                completedAt: null,
                isCompleted: false
            };
            setProgress(initialProgress);
            // No localStorage to clear, only sync reset to backend
            if (courseId && currentUser) {
                try {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["syncProgress"])({
                        courseId: parseInt(courseId),
                        currentStep: initialProgress.currentStep,
                        completedSteps: initialProgress.completedSteps,
                        lessonProgress: initialProgress.lessonProgress,
                        quizScores: initialProgress.quizScores,
                        submissions: initialProgress.submissions,
                        totalTimeSpent: initialProgress.totalTimeSpent,
                        completedAt: initialProgress.completedAt
                    });
                } catch (error) {
                    console.error('Failed to reset progress in backend:', error);
                }
            }
        }
    }["useLearningProgress.useCallback[resetProgress]"], [
        courseId,
        currentUser
    ]);
    // Load course configuration and progress from backend
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLearningProgress.useEffect": ()=>{
            const loadCourseData = {
                "useLearningProgress.useEffect.loadCourseData": async ()=>{
                    if (!courseId || !currentUser?.id) return;
                    try {
                        setIsLoading(true);
                        const backendUrl = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"].replace('/api', '');
                        // Load course configuration and progress in parallel
                        const [progressResponse, courseResponse] = await Promise.all([
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCourseProgress"])(courseId),
                            fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createApiUrl"])(`/public/courses/${courseId}`)).then({
                                "useLearningProgress.useEffect.loadCourseData": (res)=>res.json()
                            }["useLearningProgress.useEffect.loadCourseData"])
                        ]);
                        // Set course configuration
                        if (courseResponse && courseResponse.success && courseResponse.data) {
                            const course = courseResponse.data;
                            setCourseConfig({
                                hasPostWork: course.hasPostWork,
                                hasFinalProject: course.hasFinalProject,
                                certificateDelay: course.certificateDelay,
                                stepWeights: course.stepWeights
                            });
                        }
                        // Set progress data
                        if (progressResponse && progressResponse.success && progressResponse.data) {
                            const backendProgress = progressResponse.data;
                            const progressData = {
                                currentStep: backendProgress.currentStep || 'intro',
                                completedSteps: backendProgress.completedSteps || [],
                                lessonProgress: backendProgress.lessonProgress || {},
                                quizScores: backendProgress.quizScores || {},
                                submissions: backendProgress.submissions || {},
                                lastAccessed: new Date().toISOString(),
                                totalTimeSpent: backendProgress.totalTimeSpent || 0,
                                startedAt: backendProgress.startedAt || new Date().toISOString(),
                                completedAt: backendProgress.completedAt || null,
                                isCompleted: backendProgress.completedAt ? true : false
                            };
                            setProgress(progressData);
                        } else {
                            // No existing progress found, initialize new progress
                            const initialProgress = {
                                currentStep: 'intro',
                                completedSteps: [],
                                lessonProgress: {},
                                quizScores: {},
                                submissions: {},
                                lastAccessed: new Date().toISOString(),
                                totalTimeSpent: 0,
                                startedAt: new Date().toISOString(),
                                completedAt: null,
                                isCompleted: false
                            };
                            setProgress(initialProgress);
                        }
                    } catch (error) {
                        console.error('Failed to load course data from backend:', error);
                        // Fallback to default progress if backend fails
                        setProgress({
                            currentStep: 'intro',
                            completedSteps: [],
                            lessonProgress: {},
                            quizScores: {},
                            submissions: {},
                            lastAccessed: new Date().toISOString(),
                            totalTimeSpent: 0,
                            startedAt: new Date().toISOString(),
                            completedAt: null,
                            isCompleted: false
                        });
                    } finally{
                        setIsLoading(false);
                    }
                }
            }["useLearningProgress.useEffect.loadCourseData"];
            loadCourseData();
        }
    }["useLearningProgress.useEffect"], [
        courseId,
        currentUser?.id
    ]);
    // Auto-save progress to backend only, no localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLearningProgress.useEffect": ()=>{
            const interval = setInterval({
                "useLearningProgress.useEffect.interval": ()=>{
                    if (autoSaveStatus === 'pending') {
                        setProgress({
                            "useLearningProgress.useEffect.interval": (currentProgress)=>{
                                if (currentProgress.lastAccessed) {
                                    // Only sync to backend, no localStorage
                                    saveProgress(currentProgress);
                                }
                                return currentProgress;
                            }
                        }["useLearningProgress.useEffect.interval"]);
                    }
                }
            }["useLearningProgress.useEffect.interval"], 30000); // 30 seconds
            return ({
                "useLearningProgress.useEffect": ()=>clearInterval(interval)
            })["useLearningProgress.useEffect"];
        }
    }["useLearningProgress.useEffect"], [
        saveProgress,
        autoSaveStatus
    ]);
    return {
        progress,
        courseConfig,
        isLoading,
        autoSaveStatus,
        updateProgress,
        markStepCompleted,
        setCurrentStep,
        updateLessonProgress,
        saveQuizScore,
        saveSubmission,
        markCourseCompleted,
        getCompletionPercentage,
        isCourseCompleted,
        getTimeSpent,
        resetProgress
    };
};
_s(useLearningProgress, "LWguFgT5EWcKXgYA/oDGoTtVlmU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
const __TURBOPACK__default__export__ = useLearningProgress;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/useCertificate.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "useCertificate": (()=>useCertificate)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
const useCertificate = (courseId, userProgress)=>{
    _s();
    const { currentUser, getCourseById } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [backendProgress, setBackendProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [certificates, setCertificates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isEligible, setIsEligible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isGenerating, setIsGenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Use refs to prevent unnecessary re-renders
    const currentUserRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(currentUser);
    const courseIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(courseId);
    const userProgressRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(userProgress);
    // Update refs when values change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCertificate.useEffect": ()=>{
            currentUserRef.current = currentUser;
        }
    }["useCertificate.useEffect"], [
        currentUser
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCertificate.useEffect": ()=>{
            courseIdRef.current = courseId;
        }
    }["useCertificate.useEffect"], [
        courseId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCertificate.useEffect": ()=>{
            userProgressRef.current = userProgress;
        }
    }["useCertificate.useEffect"], [
        userProgress
    ]);
    // Load certificates dari backend - stable function
    const loadCertificates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCertificate.useCallback[loadCertificates]": async ()=>{
            if (!currentUserRef.current) return;
            // Prevent concurrent calls
            if (isLoading) {
                console.log('Already loading certificates, skipping...');
                return;
            }
            setIsLoading(true);
            try {
                console.log('Loading certificates from backend...');
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUserCertificates"])();
                if (response.success && response.certificates) {
                    console.log('Certificates loaded:', response.certificates);
                    setCertificates(response.certificates);
                } else {
                    console.log('No certificates found or invalid response:', response);
                    setCertificates([]);
                }
            } catch (error) {
                console.error('Error loading certificates from backend:', error);
                setCertificates([]);
            } finally{
                setIsLoading(false);
            }
        }
    }["useCertificate.useCallback[loadCertificates]"], []); // Empty dependency - use refs and state checks for stability
    // Load backend progress data - stable function
    const loadBackendProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCertificate.useCallback[loadBackendProgress]": async ()=>{
            if (!courseIdRef.current || !currentUserRef.current) return;
            // Only try to load progress if user has some progress (enrolled)
            if (!userProgressRef.current && userProgressRef.current !== 0) {
                console.log('User not enrolled or no progress data available, skipping backend progress load');
                return;
            }
            try {
                const progressData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCourseProgress"])(courseIdRef.current);
                if (progressData && progressData.data) {
                    setBackendProgress({
                        "useCertificate.useCallback[loadBackendProgress]": (prev)=>{
                            // Only update if data actually changed
                            if (JSON.stringify(prev) !== JSON.stringify(progressData.data)) {
                                return progressData.data;
                            }
                            return prev;
                        }
                    }["useCertificate.useCallback[loadBackendProgress]"]);
                } else {
                    setBackendProgress({
                        "useCertificate.useCallback[loadBackendProgress]": (prev)=>{
                            if (JSON.stringify(prev) !== JSON.stringify(progressData)) {
                                return progressData;
                            }
                            return prev;
                        }
                    }["useCertificate.useCallback[loadBackendProgress]"]);
                }
            } catch (error) {
                console.log('Backend progress not available (user may not be enrolled):', error.message);
                setBackendProgress(null);
            }
        }
    }["useCertificate.useCallback[loadBackendProgress]"], []); // Keep empty - uses refs for stability
    // Check eligibility untuk sertifikat
    const checkEligibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCertificate.useCallback[checkEligibility]": ()=>{
            const currentProgress = userProgressRef.current;
            if (!currentProgress && currentProgress !== 0) {
                setIsEligible({
                    "useCertificate.useCallback[checkEligibility]": (prev)=>{
                        if (prev !== false) return false;
                        return prev;
                    }
                }["useCertificate.useCallback[checkEligibility]"]);
                return false;
            }
            const eligible = currentProgress >= 100;
            console.log('Certificate eligibility check:', {
                userProgress: currentProgress,
                eligible,
                courseId: courseIdRef.current,
                hasBackendProgress: !!backendProgress
            });
            setIsEligible({
                "useCertificate.useCallback[checkEligibility]": (prev)=>{
                    if (prev !== eligible) return eligible;
                    return prev;
                }
            }["useCertificate.useCallback[checkEligibility]"]);
            return eligible;
        }
    }["useCertificate.useCallback[checkEligibility]"], []); // Remove backendProgress dependency to prevent infinite loop
    // Calculate final grade
    const calculateFinalGrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCertificate.useCallback[calculateFinalGrade]": ()=>{
            if (backendProgress && backendProgress.overall_progress) {
                return Math.round(backendProgress.overall_progress);
            }
            return userProgressRef.current || 0;
        }
    }["useCertificate.useCallback[calculateFinalGrade]"], [
        backendProgress
    ]);
    // Get time spent in readable format
    const getTimeSpent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCertificate.useCallback[getTimeSpent]": ()=>{
            if (backendProgress && backendProgress.time_spent) {
                const hours = Math.round(backendProgress.time_spent / 60);
                if (hours < 1) return '< 1 jam';
                return `${hours} jam`;
            }
            return '0 jam';
        }
    }["useCertificate.useCallback[getTimeSpent]"], [
        backendProgress
    ]);
    // Request certificate menggunakan backend API
    const generateCertificateForCourse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCertificate.useCallback[generateCertificateForCourse]": async (targetCourseId)=>{
            console.log('generateCertificateForCourse called with:', {
                targetCourseId,
                currentUser: !!currentUserRef.current
            });
            if (!currentUserRef.current || !targetCourseId) {
                console.log('Cannot request certificate: missing data');
                return;
            }
            setIsGenerating(true);
            try {
                console.log('Requesting certificate via backend API for course:', targetCourseId);
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requestCertificate"])(targetCourseId);
                if (response.success) {
                    console.log('Certificate request submitted successfully:', response.message);
                    await loadCertificates();
                    setIsGenerating(false);
                    return response;
                } else {
                    console.error('Failed to request certificate:', response);
                    setIsGenerating(false);
                    return null;
                }
            } catch (error) {
                console.error('Error requesting certificate:', error);
                setIsGenerating(false);
                throw error;
            }
        }
    }["useCertificate.useCallback[generateCertificateForCourse]"], [
        loadCertificates
    ]); // Keep loadCertificates but ensure it's stable
    // Get certificate untuk course tertentu
    const getCertificateForCourse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCertificate.useCallback[getCertificateForCourse]": (targetCourseId)=>{
            return certificates.find({
                "useCertificate.useCallback[getCertificateForCourse]": (cert)=>cert.courseId === parseInt(targetCourseId)
            }["useCertificate.useCallback[getCertificateForCourse]"]);
        }
    }["useCertificate.useCallback[getCertificateForCourse]"], [
        certificates
    ]);
    // Load certificates saat component mount - only once
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCertificate.useEffect": ()=>{
            if (currentUser?.id) {
                loadCertificates();
            }
        }
    }["useCertificate.useEffect"], [
        currentUser?.id
    ]); // Remove loadCertificates dependency
    // Load backend progress data - only when necessary
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCertificate.useEffect": ()=>{
            if (courseId && currentUser?.id && userProgress !== undefined) {
                loadBackendProgress();
            }
        }
    }["useCertificate.useEffect"], [
        courseId,
        currentUser?.id,
        userProgress
    ]); // Remove loadBackendProgress dependency
    // Auto-check eligibility ketika progress berubah
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCertificate.useEffect": ()=>{
            if (userProgress !== undefined) {
                checkEligibility();
            }
        }
    }["useCertificate.useEffect"], [
        userProgress
    ]); // Remove checkEligibility dependency to prevent loop
    // Auto-request certificate jika eligible dan belum ada - with debounce
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCertificate.useEffect": ()=>{
            if (!isEligible || !courseId || isGenerating || !currentUser?.id) return;
            const existingCert = certificates.find({
                "useCertificate.useEffect.existingCert": (cert)=>cert.courseId === parseInt(courseId)
            }["useCertificate.useEffect.existingCert"]);
            if (existingCert) return;
            console.log('Auto-requesting certificate in 5 seconds...');
            const timer = setTimeout({
                "useCertificate.useEffect.timer": ()=>{
                    generateCertificateForCourse(courseId).catch(console.error);
                }
            }["useCertificate.useEffect.timer"], 5000); // Increased delay to prevent rapid calls
            return ({
                "useCertificate.useEffect": ()=>clearTimeout(timer)
            })["useCertificate.useEffect"];
        }
    }["useCertificate.useEffect"], [
        isEligible,
        courseId,
        isGenerating,
        currentUser?.id,
        certificates.length
    ]); // Add certificates.length instead of generateCertificateForCourse
    return {
        certificates,
        isEligible,
        isGenerating,
        isLoading,
        generateCertificate: generateCertificateForCourse,
        getCertificateForCourse,
        calculateFinalGrade,
        checkEligibility,
        loadCertificates
    };
};
_s(useCertificate, "dG+KYxCdcrKTdZMQPKYHyzR/w4I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
const __TURBOPACK__default__export__ = useCertificate;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/api/quizEnhancedAPI.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Enhanced Quiz API for improved pretest and posttest functionality
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "quizEnhancedAPI": (()=>quizEnhancedAPI)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/localStorage.js [app-client] (ecmascript)");
// Import centralized API configuration
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/api.js [app-client] (ecmascript)");
;
;
// Create protected API URL
const PROTECTED_API_URL = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/protected`;
// Get authentication token from localStorage
const getAuthToken = ()=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeLocalStorage"].getItem('authToken');
};
// Create headers with authentication
const createHeaders = ()=>{
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
// Handle API response
const handleResponse = async (response)=>{
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};
const quizEnhancedAPI = {
    // Get quiz by course and type (pretest/posttest)
    getQuiz: async (courseId, type)=>{
        try {
            const response = await fetch(`${PROTECTED_API_URL}/courses/${courseId}/quiz/${type}`, {
                method: 'GET',
                headers: createHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error getting quiz:', error);
            throw error;
        }
    },
    // Start a new quiz attempt
    startQuizAttempt: async (courseId, type)=>{
        try {
            const response = await fetch(`${PROTECTED_API_URL}/courses/${courseId}/quiz/${type}/start`, {
                method: 'POST',
                headers: createHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error starting quiz attempt:', error);
            throw error;
        }
    },
    // Submit quiz attempt
    submitQuizAttempt: async (attemptId, answers, timeSpent)=>{
        try {
            const response = await fetch(`${PROTECTED_API_URL}/quiz/attempts/${attemptId}/submit`, {
                method: 'POST',
                headers: createHeaders(),
                body: JSON.stringify({
                    answers: answers,
                    timeSpent: timeSpent
                })
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            throw error;
        }
    },
    // Get quiz attempts for a course and type
    getQuizAttempts: async (courseId, type)=>{
        try {
            const response = await fetch(`${PROTECTED_API_URL}/courses/${courseId}/quiz/${type}/attempts`, {
                method: 'GET',
                headers: createHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error getting quiz attempts:', error);
            throw error;
        }
    },
    // Get detailed quiz result
    getQuizResult: async (attemptId)=>{
        try {
            const response = await fetch(`${PROTECTED_API_URL}/quiz/attempts/${attemptId}/result`, {
                method: 'GET',
                headers: createHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error getting quiz result:', error);
            throw error;
        }
    }
};
const __TURBOPACK__default__export__ = quizEnhancedAPI;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/page.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Login$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Login.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Header$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Header.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Sidebar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Sidebar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Dashboard.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AdminDashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/AdminDashboard.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CourseView$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/CourseView.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Profile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Profile.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AnnouncementList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/AnnouncementList.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Achievements$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Achievements.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MyCourses$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MyCourses.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ContactAdminButton$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ContactAdminButton.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StageManagementWrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/StageManagementWrapper.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const LMS = ()=>{
    _s();
    const { currentUser, isLoading, courses, updateCourses } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [currentView, setCurrentView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    const [selectedCourse, setSelectedCourse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentLesson, setCurrentLesson] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        reading: {},
        video: {},
        preTest: {},
        postTest: {}
    });
    // Separate states for pretest and posttest
    const [preTestState, setPreTestState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        showResult: false,
        score: 0
    });
    const [postTestState, setPostTestState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        showResult: false,
        score: 0
    });
    const [showAnnouncementModal, setShowAnnouncementModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Update currentView when user role changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LMS.useEffect": ()=>{
            console.log('User changed:', currentUser);
            if (currentUser) {
                const newView = currentUser.role === 'admin' ? 'overview' : 'dashboard';
                console.log('Setting view to:', newView);
                setCurrentView(newView);
            }
        }
    }["LMS.useEffect"], [
        currentUser
    ]);
    const handleQuizSubmit = async (quizId, isPreTest, quizAnswers, courseId = null)=>{
        try {
            // Try to find course by quiz ID first, then by courseId if provided
            let currentCourse = courses.find((c)=>isPreTest ? c.preTest?.id === quizId : c.postTest?.id === quizId);
            // If not found and courseId is provided, find by courseId
            if (!currentCourse && courseId) {
                currentCourse = courses.find((c)=>c.id === courseId);
            }
            if (!currentCourse) {
                console.warn('Course not found for quiz:', quizId, 'courseId:', courseId);
                return;
            }
            const quiz = isPreTest ? currentCourse.preTest : currentCourse.postTest;
            if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
                console.warn('Quiz data is invalid or missing:', quiz);
                return;
            }
            let score = 0;
            quiz.questions.forEach((q)=>{
                if (quizAnswers[q.id] === q.correct) score++;
            });
            const percentage = Math.round(score / quiz.questions.length * 100);
            // Submit quiz to backend
            console.log('Starting quiz submission process for quiz:', quizId);
            // Import quizAPI dynamically to avoid circular imports
            const { quizAPI, apiUtils } = await __turbopack_context__.r("[project]/src/services/api.js [app-client] (ecmascript, async loader)")(__turbopack_context__.i);
            // Test backend connectivity first
            const isConnected = await apiUtils.testConnection();
            if (!isConnected) {
                throw new Error('Cannot connect to backend server. Please check if the server is running.');
            }
            // First, start a quiz attempt
            const attemptResult = await quizAPI.startQuizAttempt(quizId);
            if (!attemptResult.success) {
                console.error('Failed to start quiz attempt:', attemptResult.error);
                throw new Error('Failed to start quiz attempt');
            }
            console.log('Quiz attempt started:', attemptResult.data);
            // Convert answers to the format expected by backend
            const formattedAnswers = {};
            Object.keys(quizAnswers).forEach((questionId)=>{
                formattedAnswers[questionId.toString()] = quizAnswers[questionId];
            });
            // Then submit the quiz with the attempt ID
            const submissionData = {
                attemptId: attemptResult.data.id,
                answers: formattedAnswers,
                timeSpent: 300 // Default 5 minutes, you can track actual time
            };
            console.log('Submitting quiz to backend:', submissionData);
            console.log('Formatted answers:', JSON.stringify(formattedAnswers, null, 2));
            const result = await quizAPI.submitQuiz(submissionData);
            console.log('Quiz submission result:', result);
            // Handle different response formats
            if (result.success === false || result.error && !result.success) {
                console.error('Quiz submission failed:', result.error || result.message);
                throw new Error(result.error || result.message || 'Quiz submission failed');
            }
            // Check if result contains the expected data
            if (!result.data && !result.score && result.success !== true) {
                console.warn('Unexpected response format:', result);
            }
            // Update appropriate state based on quiz type
            if (isPreTest) {
                setPreTestState({
                    showResult: true,
                    score: percentage
                });
            } else {
                setPostTestState({
                    showResult: true,
                    score: percentage
                });
            }
            // Update progress
            const progressKey = isPreTest ? 'preTest' : 'postTest';
            setProgress((prev)=>({
                    ...prev,
                    [progressKey]: {
                        ...prev[progressKey],
                        [quizId]: percentage
                    }
                }));
        } catch (error) {
            console.error('Error submitting quiz:', error);
            // Still update UI state even if backend submission fails
            if (isPreTest) {
                setPreTestState({
                    showResult: true,
                    score: 0
                });
            } else {
                setPostTestState({
                    showResult: true,
                    score: 0
                });
            }
        }
    };
    const handleRetakeQuiz = (isPreTest = false)=>{
        if (isPreTest) {
            setPreTestState((prev)=>({
                    ...prev,
                    showResult: false
                }));
        } else {
            setPostTestState((prev)=>({
                    ...prev,
                    showResult: false
                }));
        }
    };
    const handleStartLearning = (course)=>{
        setCurrentLesson(course);
        setCurrentView('course');
        // Close sidebar on mobile
        if ("object" !== 'undefined' && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };
    const handleBackToDashboard = ()=>{
        setCurrentView('dashboard');
        setCurrentLesson(null);
    };
    const handleMarkComplete = (lessonId)=>{
        setProgress((prev)=>({
                ...prev,
                reading: {
                    ...prev.reading,
                    [lessonId]: 100
                }
            }));
    };
    const handleUpdateCourses = (updatedCourses)=>{
        updateCourses(updatedCourses);
    };
    // Show loading spinner while checking authentication
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-50 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            }, void 0, false, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 212,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.js",
            lineNumber: 211,
            columnNumber: 7
        }, this);
    }
    // Show login if user is not authenticated
    if (!currentUser) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Login$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/page.js",
            lineNumber: 219,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 lg:flex",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Header$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isSidebarOpen: isSidebarOpen,
                setIsSidebarOpen: setIsSidebarOpen
            }, void 0, false, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 225,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Sidebar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                currentView: currentView,
                setCurrentView: setCurrentView,
                isSidebarOpen: isSidebarOpen,
                setIsSidebarOpen: setIsSidebarOpen,
                userRole: currentUser.role,
                onAnnouncementClick: ()=>setShowAnnouncementModal(true)
            }, void 0, false, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 231,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full lg:flex-1 pt-16 lg:pt-0 pb-20 lg:pb-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 sm:p-6 lg:p-8",
                    children: [
                        currentView === 'dashboard' && currentUser && currentUser.role !== 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            onStartLearning: handleStartLearning
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 244,
                            columnNumber: 13
                        }, this),
                        currentView === 'courses' && currentUser && currentUser.role !== 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MyCourses$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            onStartLearning: handleStartLearning
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 250,
                            columnNumber: 13
                        }, this),
                        (currentView === 'overview' || currentView === 'courses' || currentView === 'quizzes' || currentView === 'surveys' || currentView === 'announcements' || currentView === 'certificates' || currentView === 'project-instructions' || currentView === 'course-instructions' || currentView === 'course-config' || currentView === 'users' || currentView === 'test-results' || currentView === 'feedback-management' || currentView === 'students' || currentView === 'course-access') && currentUser.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AdminDashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            activeTab: currentView
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 260,
                            columnNumber: 13
                        }, this),
                        currentView === 'stage-management' && currentUser.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StageManagementWrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 264,
                            columnNumber: 13
                        }, this),
                        currentView === 'course' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CourseView$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            currentLesson: currentLesson,
                            onBack: handleBackToDashboard,
                            preTestState: preTestState,
                            postTestState: postTestState,
                            onRetakeQuiz: handleRetakeQuiz,
                            onMarkComplete: handleMarkComplete
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 268,
                            columnNumber: 13
                        }, this),
                        currentView === 'profile' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Profile$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 278,
                            columnNumber: 41
                        }, this),
                        currentView === 'achievements' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Achievements$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 280,
                            columnNumber: 46
                        }, this),
                        currentView === 'announcements' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AnnouncementList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            isModal: false,
                            onClose: ()=>setCurrentView('dashboard')
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.js",
                            lineNumber: 283,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.js",
                    lineNumber: 242,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            showAnnouncementModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AnnouncementList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isModal: true,
                onClose: ()=>setShowAnnouncementModal(false)
            }, void 0, false, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 293,
                columnNumber: 9
            }, this),
            currentUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ContactAdminButton$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/page.js",
                lineNumber: 300,
                columnNumber: 23
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.js",
        lineNumber: 223,
        columnNumber: 5
    }, this);
};
_s(LMS, "Lyh7mM4S9lL3Pd4tcYJORpWWrXE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = LMS;
const __TURBOPACK__default__export__ = LMS;
var _c;
__turbopack_context__.k.register(_c, "LMS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_be73c5f0._.js.map