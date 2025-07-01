import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, CheckCircle, FileText, ExternalLink, Download, Image, Code, List, ListOrdered, Video, BookOpen, Globe } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { getFileFromIndexedDB, getBlobUrl } from '../utils/indexedDB';
import { useLearningProgress } from '../hooks/useLearningProgress';

const LessonContent = ({ lessons, onMarkComplete, courseId, currentLessonIndex = 0, onLessonChange }) => {
  const [fileUrls, setFileUrls] = useState({});
  
  // Use learning progress hook
  const {
    progress,
    updateLessonProgress,
    markStepCompleted
  } = useLearningProgress(courseId);
  
  // Load file URLs from IndexedDB when component mounts or lesson changes
  useEffect(() => {
    const loadFileUrls = async () => {
      if (!lessons || !Array.isArray(lessons)) return;
      
      const urls = {};
      
      for (const lesson of lessons) {
        if (lesson.content && Array.isArray(lesson.content)) {
          for (const item of lesson.content) {
            if (item.fileId && item.uploadMethod === 'upload') {
              try {
                const file = await getFileFromIndexedDB(item.fileId);
                if (file) {
                  urls[item.fileId] = getBlobUrl(file);
                }
              } catch (error) {
                console.error('Error loading file:', error);
              }
            }
          }
        }
      }
      
      setFileUrls(urls);
    };
    
    loadFileUrls();
  }, [lessons, currentLessonIndex]);
  
  // Safety check for lessons array
  if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500">No lessons available.</p>
      </div>
    );
  }
  
  const lesson = lessons[currentLessonIndex];

  const renderContent = (content) => {
    // If content is already an array of objects, use renderMixedContent
    if (Array.isArray(content)) {
      return renderMixedContent(content);
    }
    
    // For string content, use ReactMarkdown for better rendering
    return (
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 mt-6 first:mt-0" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-6" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 mt-4" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 text-sm sm:text-base leading-relaxed text-gray-700" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 pl-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 pl-2" {...props} />,
          li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
          a: ({node, href, ...props}) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline" 
              target={href.startsWith('http') ? "_blank" : undefined}
              rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
              {...props} 
            />
          ),
          img: ({node, src, alt, ...props}) => (
            <div className="my-6">
              <img 
                src={src} 
                alt={alt || ''} 
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                loading="lazy"
                {...props}
              />
              {alt && (
                <p className="text-center text-sm text-gray-600 mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),
          code: ({node, inline, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline ? (
              <div className="my-4 bg-gray-900 rounded-lg p-4 overflow-x-auto shadow-md">
                <div className="flex items-center mb-2">
                  <Code size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-400 text-sm">{language || 'code'}</span>
                </div>
                <SyntaxHighlighter
                  language={language || 'javascript'}
                  style={vscDarkPlus}
                  className="rounded-md"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const renderMixedContent = (contentArray) => {
    return contentArray.map((item, index) => {
      switch (item.type) {
        case 'text':
          return (
            <div key={index} className="mb-4">
              <div className="text-gray-700 leading-relaxed">
                <ReactMarkdown>
                  {item.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        case 'image':
          return (
            <div key={index} className="my-6">
              <img 
                src={item.src} 
                alt={item.alt} 
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                loading="lazy"
              />
              {item.caption && (
                <p className="text-center text-sm text-gray-600 mt-2 italic">
                  {item.caption}
                </p>
              )}
            </div>
          );
        case 'list':
          return (
            <div key={index} className="mb-4">
              {item.ordered ? (
                <div className="flex items-start space-x-2 mb-2">
                  <ListOrdered className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                  <h4 className="font-medium text-gray-900">Langkah-langkah:</h4>
                </div>
              ) : (
                <div className="flex items-start space-x-2 mb-2">
                  <List className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                  <h4 className="font-medium text-gray-900">Poin-poin penting:</h4>
                </div>
              )}
              {item.ordered ? (
                <ol className="list-decimal list-inside mb-4 space-y-2 pl-2">
                  {item.items.map((listItem, listIndex) => (
                    <li key={listIndex} className="text-gray-700">
                      <ReactMarkdown components={{p: ({node, ...props}) => <span {...props} />}}>
                        {listItem}
                      </ReactMarkdown>
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="list-disc list-inside mb-4 space-y-2 pl-2">
                  {item.items.map((listItem, listIndex) => (
                    <li key={listIndex} className="text-gray-700">
                      <ReactMarkdown components={{p: ({node, ...props}) => <span {...props} />}}>
                        {listItem}
                      </ReactMarkdown>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        case 'code':
          return (
            <div key={index} className="my-4 bg-gray-900 rounded-lg p-4 overflow-x-auto shadow-md">
              <div className="flex items-center mb-2">
                <Code size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-400 text-sm">{item.language || 'code'}</span>
              </div>
              <SyntaxHighlighter 
                language={item.language || 'javascript'} 
                style={vscDarkPlus}
                className="rounded-md"
              >
                {item.content}
              </SyntaxHighlighter>
            </div>
          );
        case 'pdf':
          return (
            <div key={index} className="my-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="text-red-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {/* File Info */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FileText className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.filename || 'Document.pdf'}</p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <a 
                      href={item.uploadMethod === 'upload' && item.fileId ? fileUrls[item.fileId] : (item.downloadUrl || item.url)} 
                      download
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Unduh PDF
                    </a>
                  </div>
                  
                  {/* PDF Viewer */}
                  {(item.embedUrl || (item.uploadMethod === 'upload' && item.fileId && fileUrls[item.fileId])) && (
                    <div className="mt-6">
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-inner" style={{paddingBottom: '75%'}}>
                        <iframe
                          src={item.uploadMethod === 'upload' && item.fileId ? fileUrls[item.fileId] : item.embedUrl}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          title={`${item.title} PDF Viewer`}
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        case 'video':
          return (
            <div key={index} className="my-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Video className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {item.duration && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Play className="mr-1" size={12} />
                            {item.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Content */}
                <div className="p-6">
                  <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{paddingBottom: '56.25%'}}>
                    {item.uploadMethod === 'upload' && item.fileId && fileUrls[item.fileId] ? (
                      <video
                        src={fileUrls[item.fileId]}
                        className="absolute top-0 left-0 w-full h-full"
                        controls
                        title={item.title}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        src={item.src || item.url}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={item.title}
                      ></iframe>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        case 'external_link':
          return (
            <div key={index} className="my-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Globe className="text-green-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <ExternalLink className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Link Eksternal</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{item.url}</p>
                      </div>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Kunjungi
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    });
  };

  // Safety check for lesson existence
  if (!lesson) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500">No lesson content available.</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* Lesson Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{lesson.title}</h2>
        <div className="flex space-x-2">
            {/* Previous Button */}
          <button
            onClick={() => {
              if (currentLessonIndex > 0 && onLessonChange) {
                onLessonChange(currentLessonIndex - 1);
              }
            }}
            disabled={currentLessonIndex === 0}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
              currentLessonIndex === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          {/* Next Button */}
          <button
            onClick={() => {
              if (currentLessonIndex < lessons.length - 1 && onLessonChange) {
                onLessonChange(currentLessonIndex + 1);
              }
            }}
            disabled={currentLessonIndex === lessons.length - 1}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
              currentLessonIndex === lessons.length - 1 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Lesson Content */}
      {lesson.type === 'reading' && (
        <div className="prose max-w-none">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Materi Bacaan</h3>
                  <p className="text-sm text-gray-600 mt-1">Pelajari konsep-konsep penting dalam lesson ini</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="text-gray-700 leading-relaxed">
                {typeof lesson.content === 'string' ? (
                  renderContent(lesson.content)
                ) : (
                  renderContent(lesson.content)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {lesson.type === 'video' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Video className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  {lesson.description && (
                    <p className="text-sm text-gray-600">{lesson.description}</p>
                  )}
                  {lesson.duration && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Play className="mr-1" size={12} />
                      {lesson.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Video Content */}
          <div className="p-6">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{paddingBottom: '56.25%'}}>
              <iframe
                src={lesson.videoUrl}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.title}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {lesson.type === 'mixed' && (
        <div className="prose max-w-none">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="text-indigo-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Materi Pembelajaran</h3>
                  <p className="text-sm text-gray-600 mt-1">Konten interaktif dengan berbagai format media</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 sm:p-8">
              {Array.isArray(lesson.content) ? (
                renderMixedContent(lesson.content)
              ) : (
                <div className="text-gray-700 leading-relaxed">
                  {renderContent(lesson.content)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-6 border-t space-y-4 sm:space-y-0">
        <span className="text-xs sm:text-sm text-gray-500">
          Lesson {currentLessonIndex + 1} of {lessons.length}
        </span>
        
        <div className="w-full max-w-md mx-4 order-first sm:order-none">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentLessonIndex + 1) / lessons.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => {
              if (currentLessonIndex > 0 && onLessonChange) {
                onLessonChange(currentLessonIndex - 1);
              }
            }}
            disabled={currentLessonIndex === 0}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
              currentLessonIndex === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          {/* Next Button */}
          <button
            onClick={() => {
              if (currentLessonIndex < lessons.length - 1 && onLessonChange) {
                onLessonChange(currentLessonIndex + 1);
              }
            }}
            disabled={currentLessonIndex === lessons.length - 1}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
              currentLessonIndex === lessons.length - 1 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight size={16} />
          </button>
          
          {/* Mark Complete Button */}
          <button
            onClick={() => {
              const currentLesson = lessons[currentLessonIndex];
              if (onMarkComplete && currentLesson) {
                console.log('Marking lesson complete:', currentLesson.id);
                onMarkComplete(currentLesson.id);
                
                // Auto advance to next lesson if not the last one
                if (currentLessonIndex < lessons.length - 1 && onLessonChange) {
                  console.log('Auto advancing to next lesson');
                  setTimeout(() => onLessonChange(currentLessonIndex + 1), 500);
                } else {
                  console.log('All lessons completed!');
                }
              } else {
                console.log('Missing onMarkComplete or currentLesson:', { onMarkComplete: !!onMarkComplete, currentLesson });
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
          >
            <CheckCircle size={16} />
            <span className="hidden sm:inline">Mark Complete</span>
            <span className="sm:hidden">Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;