import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook untuk mengelola sertifikat
 * Mengecek kelayakan dan generate sertifikat otomatis
 */
export const useCertificate = (courseId, progress) => {
  const { currentUser, getCourseById } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get storage key untuk certificates
  const getCertificateStorageKey = useCallback(() => {
    if (!currentUser) return null;
    return `certificates_${currentUser.id}`;
  }, [currentUser]);

  // Load certificates dari localStorage
  const loadCertificates = useCallback(() => {
    const storageKey = getCertificateStorageKey();
    if (!storageKey) return;

    try {
      const savedCertificates = localStorage.getItem(storageKey);
      if (savedCertificates) {
        setCertificates(JSON.parse(savedCertificates));
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  }, [getCertificateStorageKey]);

  // Save certificates ke localStorage
  const saveCertificates = useCallback((newCertificates) => {
    const storageKey = getCertificateStorageKey();
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(newCertificates));
      setCertificates(newCertificates);
    } catch (error) {
      console.error('Error saving certificates:', error);
    }
  }, [getCertificateStorageKey]);

  // Check eligibility untuk sertifikat
  const checkEligibility = useCallback(() => {
    if (!progress || !courseId) {
      setIsEligible(false);
      return;
    }

    const requiredSteps = ['intro', 'pretest', 'lessons', 'posttest', 'postwork', 'finalproject'];
    const allStepsCompleted = requiredSteps.every(step => 
      progress.completedSteps.includes(step)
    );

    // Check minimum quiz scores
    const preTestScore = progress.quizScores[`pretest_${courseId}`]?.score || 0;
    const postTestScore = progress.quizScores[`posttest_${courseId}`]?.score || 0;
    const minScore = 70; // Minimum 70%

    // Check if submissions exist
    const hasPostWork = progress.submissions.postwork;
    const hasFinalProject = progress.submissions.finalproject;

    const eligible = allStepsCompleted && 
                    postTestScore >= minScore && 
                    hasPostWork && 
                    hasFinalProject;

    setIsEligible(eligible);
    return eligible;
  }, [progress, courseId]);

  // Generate certificate
  const generateCertificate = useCallback(async () => {
    if (!isEligible || !currentUser || !courseId) {
      throw new Error('Not eligible for certificate');
    }

    setIsGenerating(true);

    try {
      const course = getCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if certificate already exists
      const existingCertificate = certificates.find(cert => cert.courseId === courseId);
      if (existingCertificate) {
        setIsGenerating(false);
        return existingCertificate;
      }

      // Generate new certificate
      const certificate = {
        id: `cert_${Date.now()}`,
        courseId: courseId,
        courseName: course.title,
        studentName: currentUser.fullName || currentUser.username,
        studentEmail: currentUser.email,
        completionDate: new Date().toISOString(),
        issueDate: new Date().toISOString(),
        certificateNumber: `AGK-${Date.now()}-${courseId}`,
        grade: calculateFinalGrade(),
        timeSpent: getTimeSpent(),
        skills: course.skills || [],
        instructor: course.instructor || 'AgileKu Team',
        validationUrl: `https://agileku.com/verify/${Date.now()}`,
        status: 'active'
      };

      // Save certificate
      const updatedCertificates = [...certificates, certificate];
      saveCertificates(updatedCertificates);

      setIsGenerating(false);
      return certificate;
    } catch (error) {
      setIsGenerating(false);
      throw error;
    }
  }, [isEligible, currentUser, courseId, certificates, getCourseById, saveCertificates]);

  // Calculate final grade
  const calculateFinalGrade = useCallback(() => {
    if (!progress) return 0;

    const preTestScore = progress.quizScores[`pretest_${courseId}`]?.score || 0;
    const postTestScore = progress.quizScores[`posttest_${courseId}`]?.score || 0;
    
    // Weighted average: pretest 30%, posttest 70%
    const finalGrade = Math.round((preTestScore * 0.3) + (postTestScore * 0.7));
    return finalGrade;
  }, [progress, courseId]);

  // Get time spent in readable format
  const getTimeSpent = useCallback(() => {
    if (!progress?.startedAt) return '0 jam';
    
    const start = new Date(progress.startedAt);
    const end = progress.completedAt ? new Date(progress.completedAt) : new Date();
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    
    if (hours < 1) return '< 1 jam';
    return `${hours} jam`;
  }, [progress]);

  // Get certificate untuk course tertentu
  const getCertificateForCourse = useCallback((targetCourseId) => {
    return certificates.find(cert => cert.courseId === targetCourseId);
  }, [certificates]);

  // Download certificate sebagai PDF (simulasi)
  const downloadCertificate = useCallback((certificateId) => {
    const certificate = certificates.find(cert => cert.id === certificateId);
    if (!certificate) return;

    // Simulasi download - dalam implementasi nyata, ini akan generate PDF
    const certificateData = {
      ...certificate,
      downloadedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate_${certificate.courseName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [certificates]);

  // Auto-check eligibility ketika progress berubah
  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  // Load certificates saat component mount
  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // Auto-generate certificate jika eligible dan belum ada
  useEffect(() => {
    if (isEligible && courseId && !getCertificateForCourse(courseId)) {
      // Auto-generate setelah delay untuk memberikan feedback yang baik
      const timer = setTimeout(() => {
        generateCertificate().catch(console.error);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isEligible, courseId, getCertificateForCourse, generateCertificate]);

  return {
    certificates,
    isEligible,
    isGenerating,
    generateCertificate,
    getCertificateForCourse,
    downloadCertificate,
    calculateFinalGrade,
    checkEligibility
  };
};

export default useCertificate;