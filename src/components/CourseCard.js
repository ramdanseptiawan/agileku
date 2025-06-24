import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

const CourseCard = ({ course, onStartLearning }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>{course.lessons.length} Lessons</span>
          </div>
          
          <button
            onClick={() => onStartLearning(course)}
            className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Start Learning</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;