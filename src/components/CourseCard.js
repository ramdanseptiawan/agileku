import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, CheckCircle, Users } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { getCourseProgress } from '../services/api';

const CourseCard = ({ course, onStartLearning }) => {
  const { 
    currentUser, 
    enrollInCourse, 
    isEnrolledInCourse, 
    getUserProgressSync,
    refreshUserProgress 
  } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [correctProgress, setCorrectProgress] = useState(null);
  
  // Calculate progress using the same weighted system as ProgressTracker
  const calculateWeightedProgress = (completedSteps, courseConfig = {}) => {
    // Default step weights (same as useLearningProgress)
    let stepWeights = {
      'intro': 15,
      'pretest': 10,
      'lessons': 50,
      'posttest': 15,
      'postwork': 10,
      'finalproject': 10
    };
    
    // Override with course-specific weights if available
    if (courseConfig && courseConfig.stepWeights) {
      stepWeights = { ...stepWeights, ...courseConfig.stepWeights };
    }
    
    let totalProgress = 0;
    completedSteps.forEach(step => {
      if (stepWeights[step]) {
        totalProgress += stepWeights[step];
      }
    });
    
    return Math.min(totalProgress, 100);
  };
  
  const isEnrolled = currentUser ? isEnrolledInCourse(course.id) : false;
  const progress = correctProgress !== null ? correctProgress : (currentUser ? getUserProgressSync(course.id) : 0);
  
  // Fetch correct progress when component mounts
  useEffect(() => {
    const fetchCorrectProgress = async () => {
      if (currentUser && isEnrolled) {
        try {
          const backendUrl = process.env.NODE_ENV === 'production' 
            ? 'https://api.mindshiftlearning.id' 
            : 'https://api.mindshiftlearning.id';
          
          // Fetch both progress and course config in parallel
          const [progressData, courseResponse] = await Promise.all([
            getCourseProgress(course.id),
            fetch(`${backendUrl}/api/public/courses/${course.id}`).then(res => res.json())
          ]);
          
          if (progressData && progressData.data) {
            // Get course configuration for step weights
            let courseConfig = {};
            if (courseResponse && courseResponse.success && courseResponse.data) {
              courseConfig = {
                hasPostWork: courseResponse.data.hasPostWork,
                hasFinalProject: courseResponse.data.hasFinalProject,
                stepWeights: courseResponse.data.stepWeights
              };
            }
            
            // Calculate progress based on completed steps using weighted system
            let completedSteps = [];
            if (progressData.data.completedSteps) {
              // Backend now returns completedSteps as array directly from GetCourseProgressHandler
              if (Array.isArray(progressData.data.completedSteps)) {
                completedSteps = progressData.data.completedSteps;
              } else if (typeof progressData.data.completedSteps === 'string') {
                try {
                  // Try to parse as JSON first
                  if (progressData.data.completedSteps.startsWith('[')) {
                    completedSteps = JSON.parse(progressData.data.completedSteps);
                  } else {
                    // Handle legacy comma-separated string format
                    completedSteps = progressData.data.completedSteps.split(',').map(s => s.trim()).filter(s => s);
                  }
                } catch (parseError) {
                  console.error('Failed to parse completedSteps:', parseError, 'Raw data:', progressData.data.completedSteps);
                  // Fallback: try to extract steps from string
                  completedSteps = progressData.data.completedSteps.split(',').map(s => s.trim()).filter(s => s);
                }
              } else {
                console.warn('Unexpected completedSteps format:', progressData.data.completedSteps);
              }
            }
            
            // Use the same weighted calculation as ProgressTracker
            const calculatedProgress = calculateWeightedProgress(completedSteps, courseConfig);
            setCorrectProgress(calculatedProgress);
          }
        } catch (error) {
          console.error('Failed to fetch course progress:', error);
          // Fallback to refresh user progress
          await refreshUserProgress();
        }
      }
    };

    fetchCorrectProgress();
  }, [currentUser, isEnrolled, course.id]); // Removed refreshUserProgress from dependencies to prevent infinite loop
  
  const handleEnrollOrStart = async () => {
    if (!currentUser) {
      // Redirect to login or show login modal
      return;
    }
    
    if (isEnrolled) {
      onStartLearning(course);
    } else {
      setIsEnrolling(true);
      try {
        const result = await enrollInCourse(course.id);
        if (result.success) {
          // If already enrolled or successfully enrolled, start learning
          onStartLearning(course);
        } else {
          console.error('Failed to enroll:', result.error);
          // Only show error for actual failures, not "Already enrolled"
          if (!result.error?.includes('Already enrolled')) {
            alert(result.error || 'Gagal mendaftar course');
          } else {
            // If already enrolled, just start learning
            onStartLearning(course);
          }
        }
      } catch (error) {
        console.error('Failed to enroll:', error);
        // Only show error for actual failures, not "Already enrolled"
        if (!error.message?.includes('Already enrolled')) {
          alert('Terjadi kesalahan saat mendaftar course');
        } else {
          // If already enrolled, just start learning
          onStartLearning(course);
        }
      } finally {
        setIsEnrolling(false);
      }
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <Image 
          src={course.image} 
          alt={course.title}
          width={400}
          height={192}
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
        
        {/* Course Stats */}
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock size={16} />
            <span>{course.lessons?.length || 0} Lessons</span>
          </div>
        </div>
        
        {/* Enrollment Status & Progress */}
        {currentUser && isEnrolled && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-green-600 mb-2">
              <div className="flex items-center space-x-1">
                <CheckCircle size={16} />
                <span>Enrolled</span>
              </div>
              <span>{progress}% Complete</span>
            </div>
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        
        {/* Action Button */}
        <button
          onClick={handleEnrollOrStart}
          disabled={isEnrolling}
          className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
            !currentUser 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : isEnrolled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${isEnrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isEnrolling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enrolling...</span>
            </>
          ) : !currentUser ? (
            <span>Login to Enroll</span>
          ) : isEnrolled ? (
            <>
              <span>Continue Learning</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <span>Enroll Now</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;