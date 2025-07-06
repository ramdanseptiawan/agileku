import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCertificates, generateCertificate } from '../services/api';
import { getCourseProgress } from '../services/api';

/**
 * Hook untuk mengelola sertifikat kursus
 */
export const useCertificate = (courseId, userProgress) => {
  const { currentUser, getCourseById } = useAuth();
  const [backendProgress, setBackendProgress] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to prevent unnecessary re-renders
  const currentUserRef = useRef(currentUser);
  const courseIdRef = useRef(courseId);
  const userProgressRef = useRef(userProgress);
  
  // Update refs when values change
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  
  useEffect(() => {
    courseIdRef.current = courseId;
  }, [courseId]);
  
  useEffect(() => {
    userProgressRef.current = userProgress;
  }, [userProgress]);

  // Load certificates dari backend - stable function
  const loadCertificates = useCallback(async () => {
    if (!currentUserRef.current) return;

    // Prevent concurrent calls
    if (isLoading) {
      console.log('Already loading certificates, skipping...');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading certificates from backend...');
      const response = await getUserCertificates();
      
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
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency - use refs and state checks for stability

  // Load backend progress data - stable function
  const loadBackendProgress = useCallback(async () => {
    if (!courseIdRef.current || !currentUserRef.current) return;
    
    // Only try to load progress if user has some progress (enrolled)
    if (!userProgressRef.current && userProgressRef.current !== 0) {
      console.log('User not enrolled or no progress data available, skipping backend progress load');
      return;
    }
    
    try {
      const progressData = await getCourseProgress(courseIdRef.current);
      if (progressData && progressData.data) {
        setBackendProgress(progressData.data);
      } else {
        setBackendProgress(progressData);
      }
    } catch (error) {
      console.log('Backend progress not available (user may not be enrolled):', error.message);
      setBackendProgress(null);
    }
  }, []); // Keep empty - uses refs for stability

  // Check eligibility untuk sertifikat
  const checkEligibility = useCallback(() => {
    const currentProgress = userProgressRef.current;
    
    if (!currentProgress && currentProgress !== 0) {
      setIsEligible(false);
      return false;
    }

    const eligible = currentProgress >= 100;
    
    console.log('Certificate eligibility check:', {
      userProgress: currentProgress,
      eligible,
      courseId: courseIdRef.current,
      hasBackendProgress: !!backendProgress
    });

    setIsEligible(eligible);
    return eligible;
  }, []); // Remove backendProgress dependency to prevent infinite loop

  // Calculate final grade
  const calculateFinalGrade = useCallback(() => {
    if (backendProgress && backendProgress.overall_progress) {
      return Math.round(backendProgress.overall_progress);
    }
    
    return userProgressRef.current || 0;
  }, [backendProgress]);

  // Get time spent in readable format
  const getTimeSpent = useCallback(() => {
    if (backendProgress && backendProgress.time_spent) {
      const hours = Math.round(backendProgress.time_spent / 60);
      if (hours < 1) return '< 1 jam';
      return `${hours} jam`;
    }
    return '0 jam';
  }, [backendProgress]);

  // Generate certificate menggunakan backend API
  const generateCertificateForCourse = useCallback(async (targetCourseId) => {
    console.log('generateCertificateForCourse called with:', {
      targetCourseId,
      currentUser: !!currentUserRef.current
    });
    
    if (!currentUserRef.current || !targetCourseId) {
      console.log('Cannot generate certificate: missing data');
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating certificate via backend API for course:', targetCourseId);

      const response = await generateCertificate(targetCourseId);
      
      if (response.success && response.certificate) {
        console.log('Certificate generated successfully:', response.certificate);
        await loadCertificates();
        setIsGenerating(false);
        return response.certificate;
      } else {
        console.error('Failed to generate certificate:', response);
        setIsGenerating(false);
        return null;
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      setIsGenerating(false);
      throw error;
    }
  }, [loadCertificates]); // Keep loadCertificates but ensure it's stable

  // Get certificate untuk course tertentu
  const getCertificateForCourse = useCallback((targetCourseId) => {
    return certificates.find(cert => cert.courseId === parseInt(targetCourseId));
  }, [certificates]);

  // Load certificates saat component mount - only once
  useEffect(() => {
    if (currentUser?.id) {
      loadCertificates();
    }
  }, [currentUser?.id, loadCertificates]);

  // Load backend progress data - only when necessary
  useEffect(() => {
    if (courseId && currentUser?.id && userProgress !== undefined) {
      loadBackendProgress();
    }
  }, [courseId, currentUser?.id, userProgress, loadBackendProgress]);

  // Auto-check eligibility ketika progress berubah
  useEffect(() => {
    if (userProgress !== undefined) {
      checkEligibility();
    }
  }, [userProgress, checkEligibility]); // Remove backendProgress to prevent loop

  // Auto-generate certificate jika eligible dan belum ada - with debounce
  useEffect(() => {
    if (!isEligible || !courseId || isGenerating || !currentUser?.id) return;
    
    const existingCert = certificates.find(cert => cert.courseId === parseInt(courseId));
    if (existingCert) return;
    
    console.log('Auto-generating certificate in 5 seconds...');
    const timer = setTimeout(() => {
      generateCertificateForCourse(courseId).catch(console.error);
    }, 5000); // Increased delay to prevent rapid calls

    return () => clearTimeout(timer);
  }, [isEligible, courseId, isGenerating, currentUser?.id]); // Remove generateCertificateForCourse dependency to prevent loop

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

export default useCertificate;