import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Eye } from 'lucide-react';
import SimpleCourseForm from './SimpleCourseForm';
import { saveCourse, saveCourseWithFiles, getCourseById, getCourseWithFiles, getAllCourses } from '../utils/localStorage';
import { coursesData } from '../data/coursesData';
import { initIndexedDB } from '../utils/indexedDB';
import { courseAPI } from '../services/api';

const CourseFormManager = ({ courseId = null, onSave, onCancel }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    instructor: '',
    image: '',
    introMaterial: {
      title: '',
      content: []
    },
    lessons: []
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize IndexedDB
        await initIndexedDB();
        
        // Initialize default data if no courses exist
        const existingCourses = getAllCourses();
        if (existingCourses.length === 0 && coursesData.length > 0) {
          // Import default courses data to localStorage
          coursesData.forEach(course => {
            saveCourse(course);
          });
        }
        
        // Load course data if editing
        if (courseId) {
          try {
            // Try to get course from backend API first
            const backendCourse = await courseAPI.getCourseById(courseId);
            if (backendCourse && backendCourse.success && backendCourse.data) {
              const course = backendCourse.data;
              
              // Parse JSON fields if they are strings
              let introMaterial = course.introMaterial;
              let lessons = course.lessons;
              
              if (typeof introMaterial === 'string') {
                try {
                  introMaterial = JSON.parse(introMaterial);
                } catch (e) {
                  console.warn('Failed to parse introMaterial:', e);
                  introMaterial = { title: '', content: [] };
                }
              }
              
              if (typeof lessons === 'string') {
                try {
                  lessons = JSON.parse(lessons);
                } catch (e) {
                  console.warn('Failed to parse lessons:', e);
                  lessons = [];
                }
              }
              
              setCourseData({
                ...course,
                introMaterial: {
                  title: introMaterial?.title || '',
                  content: Array.isArray(introMaterial?.content) 
                    ? introMaterial.content 
                    : []
                },
                lessons: Array.isArray(lessons) ? lessons : []
              });
            } else {
              // Fallback to localStorage if backend doesn't have the course
              const existingCourse = await getCourseWithFiles(parseInt(courseId));
              if (existingCourse) {
                setCourseData({
                  ...existingCourse,
                  introMaterial: {
                    title: existingCourse.introMaterial?.title || '',
                    content: Array.isArray(existingCourse.introMaterial?.content) 
                      ? existingCourse.introMaterial.content 
                      : []
                  },
                  lessons: existingCourse.lessons || []
                });
              }
            }
          } catch (error) {
            console.error('Error loading course from backend, trying localStorage:', error);
            // Fallback to localStorage
            const existingCourse = await getCourseWithFiles(parseInt(courseId));
            if (existingCourse) {
              setCourseData({
                ...existingCourse,
                introMaterial: {
                  title: existingCourse.introMaterial?.title || '',
                  content: Array.isArray(existingCourse.introMaterial?.content) 
                    ? existingCourse.introMaterial.content 
                    : []
                },
                lessons: existingCourse.lessons || []
              });
            }
          }
        }
       } catch (error) {
         console.error('Error initializing data:', error);
       }
     };
     
     initializeData();
   }, [courseId]);

  const handleSave = async (data) => {
    setIsLoading(true);
    try {
      const success = await saveCourseWithFiles(data);
      if (success) {
        alert(courseId ? 'Kursus berhasil diperbarui!' : 'Kursus berhasil dibuat!');
        if (onSave) onSave(data);
      } else {
        throw new Error('Gagal menyimpan kursus');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Terjadi kesalahan saat menyimpan kursus');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {courseId ? 'Edit Kursus' : 'Buat Kursus Baru'}
          </h1>
        </div>
      </div>
      
      <SimpleCourseForm
        initialData={courseData}
        onSave={handleSave}
        onCancel={onCancel}
        isLoading={isLoading}
        isEditing={!!courseId}
      />
    </div>
  );
};

export default CourseFormManager;