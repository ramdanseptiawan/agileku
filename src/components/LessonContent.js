import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Play, CheckCircle } from 'lucide-react';

const LessonContent = ({ lessons, onMarkComplete }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const lesson = lessons[currentLessonIndex];

  const renderContent = (content) => {
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
      // Infographic syntax: [INFOGRAPHIC: title](image_url)
      if (line.trim().startsWith('[INFOGRAPHIC:') && line.includes('](') && line.includes(')')) {
        const match = line.match(/\[INFOGRAPHIC:\s*([^\]]+)\]\(([^\)]+)\)/);
        if (match) {
          const [, title, imageUrl] = match;
          return (
            <div key={index} className="my-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 text-center">
                📊 {title}
              </h4>
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full max-w-3xl mx-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                loading="lazy"
              />
            </div>
          );
        }
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="mb-3 text-sm sm:text-base leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="px-4">
      {/* Lesson Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{lesson.title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
            disabled={currentLessonIndex === 0}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentLessonIndex(Math.min(lessons.length - 1, currentLessonIndex + 1))}
            disabled={currentLessonIndex === lessons.length - 1}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Lesson Content */}
      {lesson.type === 'reading' && (
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-xl p-4 sm:p-8">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {renderContent(lesson.content)}
            </div>
          </div>
        </div>
      )}

      {lesson.type === 'video' && (
        <div className="bg-gray-50 rounded-xl p-4 sm:p-8">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <iframe
              src={lesson.videoUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              title={lesson.title}
            ></iframe>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Play size={16} />
              <span className="text-sm sm:text-base">Duration: {lesson.duration}</span>
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
        
        <button
          onClick={() => onMarkComplete(lesson.id)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
        >
          <CheckCircle size={16} />
          <span className="hidden sm:inline">Mark Complete</span>
          <span className="sm:hidden">Complete</span>
        </button>
      </div>
    </div>
  );
};

export default LessonContent;