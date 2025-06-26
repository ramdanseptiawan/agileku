import React from 'react';
import { BookOpen, Play, FileText, Download, ExternalLink } from 'lucide-react';

const IntroductoryMaterial = ({ material, onComplete }) => {
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
              <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                {item.content}
              </p>
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
              <ul key={index} className="list-disc list-inside mb-4 space-y-2">
                {item.items.map((listItem, listIndex) => (
                  <li key={listIndex} className="text-gray-700">{listItem}</li>
                ))}
              </ul>
            );
          case 'video':
            return (
              <div key={index} className="my-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  {item.duration && (
                    <p className="text-sm text-gray-500 mb-3">Duration: {item.duration}</p>
                  )}
                  {item.src ? (
                    <div className="relative w-full" style={{paddingBottom: '56.25%'}}>
                      <iframe
                        src={item.src}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        frameBorder="0"
                        allowFullScreen
                        title={item.title}
                      ></iframe>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <Play className="mx-auto text-blue-600 mb-2" size={48} />
                      <p className="text-gray-700 font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">Video: {item.duration}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          case 'pdf':
            return (
              <div key={index} className="my-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="text-red-600" size={24} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <a 
                    href={item.downloadUrl || item.url} 
                    download
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </a>
                </div>
                {item.embedUrl && (
                  <div className="mt-4">
                    <iframe
                      src={item.embedUrl}
                      width="100%"
                      height="600"
                      className="border border-gray-300 rounded-lg"
                      title={item.title}
                    >
                      <p>Your browser does not support PDFs. 
                        <a href={item.downloadUrl || item.url} target="_blank" rel="noopener noreferrer">
                          Download the PDF
                        </a>
                      </p>
                    </iframe>
                  </div>
                )}
              </div>
            );
          case 'external_link':
            return (
              <div key={index} className="my-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <ExternalLink className="text-blue-600" size={24} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink size={16} />
                    <span>Visit</span>
                  </a>
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