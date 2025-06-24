import React from 'react';
import { Edit, Trash2, Eye, Clock, BookOpen } from 'lucide-react';

const CourseList = ({ courses, onEdit, onDelete }) => {
  if (courses.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
        <p className="text-gray-600">Create your first course to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  
                  {/* Course Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                    {course.lessons && course.lessons.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {course.lessons.filter(l => l.type === 'video').length} videos, {' '}
                          {course.lessons.filter(l => l.type === 'reading').length} readings
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(course)}
                className="inline-flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                title="Edit course"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              
              <button
                onClick={() => onDelete(course.id)}
                className="inline-flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete course"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>

          {/* Lessons Preview */}
          {course.lessons && course.lessons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lessons:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {course.lessons.slice(0, 6).map((lesson, index) => (
                  <div key={lesson.id || index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      lesson.type === 'video' ? 'bg-red-400' : 'bg-green-400'
                    }`}></div>
                    <span className="truncate">{lesson.title || `Lesson ${index + 1}`}</span>
                  </div>
                ))}
                {course.lessons.length > 6 && (
                  <div className="text-sm text-gray-500">
                    +{course.lessons.length - 6} more lessons
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CourseList;