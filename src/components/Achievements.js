import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCertificate } from '../hooks/useCertificate';
import { Award, Download, Calendar, User, Trophy, Star, Target, BookOpen, Medal } from 'lucide-react';

const Achievements = () => {
  const { currentUser } = useAuth();
  const { certificates } = useCertificate();

  // Certificates are automatically loaded by the hook

  const downloadCertificate = (certificate) => {
    // Create a simple certificate HTML for download
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${certificate.courseName}</title>
        <style>
          body { font-family: 'Times New Roman', serif; text-align: center; padding: 50px; }
          .certificate { border: 10px solid #0066cc; padding: 50px; max-width: 800px; margin: 0 auto; }
          .title { font-size: 48px; color: #0066cc; margin-bottom: 20px; }
          .subtitle { font-size: 24px; margin-bottom: 30px; }
          .name { font-size: 36px; color: #333; margin: 30px 0; font-weight: bold; }
          .course { font-size: 28px; color: #0066cc; margin: 20px 0; }
          .details { font-size: 16px; margin: 10px 0; }
          .signature { margin-top: 50px; }
        </style>
      </head>
      <body>
        <div class="certificate">
             <div class="title">CERTIFICATE OF COMPLETION</div>
             <div class="subtitle">This is to certify that</div>
             <div class="name">${certificate.userName || 'Student'}</div>
             <div class="subtitle">has successfully completed the course</div>
             <div class="course">${certificate.courseName || 'Course'}</div>
             <div class="details">Grade: ${certificate.grade || 100}%</div>
             <div class="details">Completion Date: ${certificate.completionDate ? new Date(certificate.completionDate).toLocaleDateString() : 'N/A'}</div>
             <div class="details">Certificate Number: ${certificate.certNumber || 'N/A'}</div>
             <div class="signature">
               <p>AgileKu Learning Platform</p>
               <p>Issued on: ${certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : 'N/A'}</p>
             </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${(certificate.courseName || 'course').replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

                {/* Download Button */}
                <button
                  onClick={() => downloadCertificate(certificate)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </button>
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