import { useState, useEffect, useCallback } from 'react';
import { getUserCertificates, generateCertificate, getCourseProgress } from '../services/api';

export const useCertificate = (courseId = null) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load user certificates
  const loadCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserCertificates();
      setCertificates(response.certificates || []);
    } catch (err) {
      setError('Failed to load certificates');
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has certificate for specific course
  const hasCertificate = useCallback((targetCourseId) => {
    const courseIdToCheck = targetCourseId || courseId;
    if (!courseIdToCheck) return false;
    
    return certificates.some(cert => cert.course_id === parseInt(courseIdToCheck));
  }, [certificates, courseId]);

  // Get certificate for specific course
  const getCertificate = useCallback((targetCourseId) => {
    const courseIdToCheck = targetCourseId || courseId;
    if (!courseIdToCheck) return null;
    
    return certificates.find(cert => cert.course_id === parseInt(courseIdToCheck)) || null;
  }, [certificates, courseId]);

  // Check if course is eligible for certificate (100% completion)
  const checkEligibility = useCallback(async (targetCourseId) => {
    const courseIdToCheck = targetCourseId || courseId;
    if (!courseIdToCheck) return false;

    try {
      const progress = await getCourseProgress(courseIdToCheck);
      return progress.overall_progress >= 100;
    } catch (err) {
      console.error('Error checking course progress:', err);
      return false;
    }
  }, [courseId]);

  // Generate certificate for course
  const generateCourseCertificate = useCallback(async (targetCourseId) => {
    const courseIdToCheck = targetCourseId || courseId;
    if (!courseIdToCheck) {
      setError('Course ID is required');
      return null;
    }

    // Check if certificate already exists
    if (hasCertificate(courseIdToCheck)) {
      setError('Certificate already exists for this course');
      return getCertificate(courseIdToCheck);
    }

    // Check if course is completed
    const isEligible = await checkEligibility(courseIdToCheck);
    if (!isEligible) {
      setError('Course must be 100% completed to generate certificate');
      return null;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateCertificate(courseIdToCheck);
      
      // Reload certificates to include the new one
      await loadCertificates();
      
      return response.certificate;
    } catch (err) {
      setError('Failed to generate certificate');
      console.error('Error generating certificate:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [courseId, hasCertificate, getCertificate, checkEligibility, loadCertificates]);

  // Auto-check for certificate eligibility and generation
  const autoCheckCertificate = useCallback(async (targetCourseId) => {
    const courseIdToCheck = targetCourseId || courseId;
    if (!courseIdToCheck) return null;

    // If certificate already exists, return it
    if (hasCertificate(courseIdToCheck)) {
      return getCertificate(courseIdToCheck);
    }

    // Check if eligible for certificate
    const isEligible = await checkEligibility(courseIdToCheck);
    if (isEligible) {
      // Auto-generate certificate
      return await generateCourseCertificate(courseIdToCheck);
    }

    return null;
  }, [courseId, hasCertificate, getCertificate, checkEligibility, generateCourseCertificate]);

  // Load certificates on mount
  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  return {
    certificates,
    loading,
    error,
    isGenerating,
    hasCertificate,
    getCertificate,
    checkEligibility,
    generateCourseCertificate,
    autoCheckCertificate,
    loadCertificates,
    clearError: () => setError(null)
  };
};

export default useCertificate;