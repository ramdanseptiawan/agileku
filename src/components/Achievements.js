import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCertificate } from '../hooks/useCertificate';
import { Award, Download, Calendar, User, Trophy, Star, Target, BookOpen, Medal } from 'lucide-react';

const Achievements = () => {
  const { currentUser, getUserProgressSync } = useAuth();
  const { certificates, loadCertificates } = useCertificate();
  const [completedCourses, setCompletedCourses] = useState([]);

  // Load completed courses and check for missing certificates
  useEffect(() => {
    const checkCompletedCourses = async () => {
      if (!currentUser?.id) return;
      
      try {
        // Get all user progress
        const allProgress = await getUserProgressSync();
        if (allProgress && Array.isArray(allProgress)) {
          // Find courses with 100% progress
          const completed = allProgress.filter(progress => 
            progress.overall_progress >= 100
          );
          setCompletedCourses(completed);
          
          // Check for missing certificates and auto-request them
          for (const progress of completed) {
            const existingCert = certificates.find(cert => 
              cert.courseId === progress.course_id
            );
            
            if (!existingCert) {
              console.log(`Auto-requesting certificate for completed course ${progress.course_id}`);
              try {
                const { requestCertificate } = await import('../services/api');
                await requestCertificate(progress.course_id);
              } catch (error) {
                console.error(`Failed to auto-request certificate for course ${progress.course_id}:`, error);
              }
            }
          }
          
          // Reload certificates after auto-requests
          if (completed.length > 0) {
            setTimeout(() => {
              loadCertificates();
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking completed courses:', error);
      }
    };
    
    checkCompletedCourses();
  }, [currentUser?.id, certificates.length]);

  // Certificates are automatically loaded by the hook

  const downloadCertificate = async (certificate) => {
    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create certificate content for PDF with fixed dimensions
      const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 40px;
              font-family: 'Georgia', serif;
              background: white;
              width: 1000px;
              height: 700px;
              box-sizing: border-box;
            }
            .certificate {
              width: 100%;
              height: 100%;
              border: 8px solid #f8f9fa;
              padding: 40px;
              text-align: center;
              position: relative;
              background: white;
              box-sizing: border-box;
            }
            .border-inner {
              position: absolute;
              top: 20px;
              left: 20px;
              right: 20px;
              bottom: 20px;
              border: 3px solid #667eea;
              border-radius: 10px;
            }
            .content {
              position: relative;
              z-index: 1;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .title {
              color: #667eea;
              margin-bottom: 20px;
            }
            .title h1 {
              font-size: 28px;
              margin: 0;
            }
            .main-title {
              font-size: 32px;
              font-weight: bold;
              margin: 15px 0;
              color: #2d3748;
            }
            .subtitle {
              font-size: 16px;
              margin: 15px 0;
              color: #4a5568;
            }
            .name {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              margin: 20px 0;
              text-decoration: underline;
            }
            .course {
              font-size: 20px;
              font-weight: bold;
              color: #2d3748;
              margin: 15px 0;
            }
            .details {
              margin: 20px 0;
              color: #718096;
            }
            .details p {
              margin: 8px 0;
              font-size: 14px;
            }
            .signatures {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature {
              border-top: 2px solid #e2e8f0;
              width: 180px;
              padding-top: 10px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="border-inner"></div>
            <div class="content">
              <div class="title">
                <h1>🏆 SERTIFIKAT PENYELESAIAN 🏆</h1>
              </div>
              <div class="main-title">CERTIFICATE OF COMPLETION</div>
              <div class="subtitle">Dengan ini menyatakan bahwa</div>
              <div class="name">${certificate.userName || 'Student'}</div>
              <div class="subtitle">telah berhasil menyelesaikan kursus</div>
              <div class="course">${certificate.courseName || 'Course'}</div>
              <div class="details">
                <p><strong>Nomor Sertifikat:</strong> ${certificate.certNumber || 'N/A'}</p>
                <p><strong>Tanggal Penyelesaian:</strong> ${certificate.completionDate ? new Date(certificate.completionDate).toLocaleDateString('id-ID') : 'N/A'}</p>
              </div>
              <div class="signatures">
                <div class="signature">
                  <div>Direktur Akademik</div>
                </div>
                <div class="signature">
                  <div>Instruktur Kursus</div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // PDF options with better settings
      const opt = {
        margin: 0.5,
        filename: `Sertifikat-${(certificate.courseName || 'course').replace(/\s+/g, '-')}-${(certificate.userName || 'Student').replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          allowTaint: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        }
      };

      // Generate PDF directly from HTML string
      await html2pdf().set(opt).from(certificateHTML).save();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Your Achievements
        </h1>
        <p className="text-lg text-gray-600">
          View and download your course completion certificates
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-400">
              Complete courses to earn your first certificate!
            </p>
          </div>
        ) : (
          certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8" />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(certificate.grade / 20)
                            ? 'text-yellow-300 fill-current'
                            : 'text-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{certificate.courseName || 'Course'}</h3>
                <p className="text-blue-100 text-sm">
                  Certificate #{certificate.certNumber || 'N/A'}
                </p>
              </div>

              {/* Certificate Body */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Completed: {certificate.completionDate ? new Date(certificate.completionDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">Grade: {certificate.grade || 100}%</span>
                  </div>
                   {certificate.timeSpent && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">Time Spent: {certificate.timeSpent}</span>
                      </div>
                    )}
                </div>

                {/* Skills */}
                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Skills Acquired:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status and Download Button */}
                {certificate.status === 'pending' ? (
                  <div className="space-y-2">
                    <div className="w-full bg-yellow-100 text-yellow-800 font-semibold py-3 px-4 rounded-lg text-center">
                      Menunggu Persetujuan Admin
                    </div>
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </button>
                  </div>
                ) : certificate.status === 'approved' ? (
                  <button
                    onClick={() => downloadCertificate(certificate)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </button>
                ) : certificate.status === 'rejected' ? (
                  <div className="space-y-2">
                    <div className="w-full bg-red-100 text-red-800 font-semibold py-3 px-4 rounded-lg text-center">
                      Sertifikat Ditolak
                    </div>
                    {certificate.rejectionReason && (
                      <div className="text-sm text-red-600 text-center">
                        Alasan: {certificate.rejectionReason}
                      </div>
                    )}
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => downloadCertificate(certificate)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Achievement Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {certificates.length}
              </div>
              <div className="text-gray-600">Certificates Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {(() => {
                  const totalGrade = certificates.reduce((sum, cert) => sum + (cert.grade || 100), 0);
                  return certificates.length > 0 ? Math.round(totalGrade / certificates.length) : 0;
                })()}%
              </div>
              <div className="text-gray-600">Average Grade</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {new Set(certificates.flatMap(cert => cert.skills || [])).size}
              </div>
              <div className="text-gray-600">Skills Acquired</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;