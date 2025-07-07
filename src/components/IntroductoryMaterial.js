import React, { useState, useEffect } from 'react';
import { BookOpen, Play, FileText, Download, ExternalLink, List, ListOrdered } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getFileFromIndexedDB, getBlobUrl } from '../utils/indexedDB';
import VideoPlayer from './VideoPlayer';

const IntroductoryMaterial = ({ material, onComplete }) => {
  const [fileUrls, setFileUrls] = useState({});
  
  // Load file URLs from IndexedDB when component mounts or material changes
  useEffect(() => {
    const loadFileUrls = async () => {
      if (!material || !material.content || !Array.isArray(material.content)) return;
      
      const urls = {};
      
      for (const item of material.content) {
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
      
      setFileUrls(urls);
    };
    
    loadFileUrls();
  }, [material]);

  const renderContent = (content) => {
    // Handle array of content objects
    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn('Invalid content item:', item);
          return null;
        }
        switch (item.type) {
          case 'text':
            return (
              <div key={index} className="text-gray-700 mb-4 leading-relaxed">
                <ReactMarkdown>
                  {item.content}
                </ReactMarkdown>
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
          case 'video':
            return (
              <div key={index} className="my-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 rounded-lg p-2">
                        <Play className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{item.title || 'Video Pembelajaran'}</h3>
                        {item.description && (
                          <p className="text-red-100 text-sm mt-1">{item.description}</p>
                        )}
                        {item.duration && (
                          <p className="text-red-100 text-sm mt-1">Durasi: {item.duration}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Content */}
                  <div className="p-6">
                    <VideoPlayer item={item} fileUrls={fileUrls} />
                  </div>
                </div>
              </div>
            );
          case 'pdf':
            return (
              <div key={index} className="my-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 rounded-lg p-2">
                        <FileText className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{item.title || 'Dokumen PDF'}</h3>
                        {item.description && (
                          <p className="text-blue-100 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* PDF Content */}
                  <div className="p-6">
                    {/* File Info */}
                    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="text-blue-600" size={20} />
                        <span className="font-medium text-gray-900">{item.filename || 'Document.pdf'}</span>
                      </div>
                      {(item.downloadUrl || (item.uploadMethod === 'upload' && item.fileId && fileUrls[item.fileId])) && (
                        <a 
                          href={item.uploadMethod === 'upload' && item.fileId ? fileUrls[item.fileId] : item.downloadUrl} 
                          download
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Unduh
                        </a>
                      )}
                    </div>
                    
                    {/* PDF Viewer */}
                    {(item.embedUrl || (item.uploadMethod === 'upload' && item.fileId && fileUrls[item.fileId])) ? (
                      <div className="relative pt-[100%] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                        <iframe
                          src={item.uploadMethod === 'upload' && item.fileId ? fileUrls[item.fileId] : item.embedUrl}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          title={`${item.title} PDF Viewer`}
                        ></iframe>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="text-center">
                          <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                          <p className="text-gray-500 font-medium">PDF tidak dapat ditampilkan</p>
                          <p className="text-gray-400 text-sm mt-1">Silakan unduh untuk melihat dokumen</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          case 'external_link':
            return (
              <div key={index} className="my-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 rounded-lg p-2">
                        <ExternalLink className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{item.title || 'Link Eksternal'}</h3>
                        {item.description && (
                          <p className="text-green-100 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Link Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="text-green-600" size={20} />
                        <span className="font-medium text-gray-900 truncate">{item.url}</span>
                      </div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex-shrink-0 ml-4"
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
            console.warn('Unknown content type:', item.type, item);
            return (
              <div key={index} className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Unsupported content type: {item.type}</p>
                <pre className="text-xs text-yellow-600 mt-2">{JSON.stringify(item, null, 2)}</pre>
              </div>
            );
        }
      });
    }
    
    // Handle string content (fallback for backward compatibility)
    if (typeof content === 'string') {
      return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-6">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg sm:text-xl font-bold text-gray-900 mb-2 mt-4">
            {line.substring(4)}
          </h3>
        );
      }
      // Image syntax: ![alt text](image_url)
      if (line.trim().startsWith('![') && line.includes('](') && line.includes(')')) {
        const match = line.match(/!\[([^\]]*)\]\(([^\)]+)\)/);
        if (match) {
          const [, altText, imageUrl] = match;
          return (
            <div key={index} className="my-6">
              <img 
                src={imageUrl} 
                alt={altText} 
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                loading="lazy"
              />
              {altText && (
                <p className="text-center text-sm text-gray-600 mt-2 italic">
                  {altText}
                </p>
              )}
            </div>
          );
        }
      }
      // Video syntax: [VIDEO: title](video_url)
      if (line.trim().startsWith('[VIDEO:') && line.includes('](') && line.includes(')')) {
        const match = line.match(/\[VIDEO:\s*([^\]]+)\]\(([^\)]+)\)/);
        if (match) {
          const [, title, videoUrl] = match;
          return (
            <div key={index} className="my-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <Play className="mr-2" size={20} />
                {title}
              </h4>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe 
                  src={videoUrl} 
                  title={title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="mb-3 text-sm sm:text-base leading-relaxed text-gray-700">
          {line}
        </p>
      );
      });
    }
    
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="text-white" size={32} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Materi Pengantar
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Pelajari konsep dasar sebelum memulai pembelajaran utama
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          {material.content ? (
            typeof material.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: material.content }} />
            ) : (
              renderContent(material.content)
            )
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Materi pengantar belum tersedia</p>
            </div>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className="text-center">
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
        >
          Lanjut ke Pre-Test
        </button>
      </div>
    </div>
  );
};

export default IntroductoryMaterial;