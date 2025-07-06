import React, { useState, useEffect, useCallback } from 'react';
import { Award, Download, Calendar, User, CheckCircle, Star, Trophy, Medal, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCertificate } from '../hooks/useCertificate';
// Remove unused import - we'll use getUserProgress from AuthContext instead

const Certificate = ({ courseId, courseName, onClose }) => {
  const { currentUser, getUserProgress } = useAuth();
  const userProgress = getUserProgress(courseId);
  
  // Debug log to check progress value
  console.log('Certificate component - userProgress:', userProgress, 'courseId:', courseId);
  
  const { 
    certificates, 
    isEligible, 
    getCertificate, 
    generateCertificate: generateCert, 
    isGenerating 
  } = useCertificate(courseId, userProgress);
  
  const certificate = getCertificate(courseId);

  const handleGenerateCertificate = async () => {
    try {
      await generateCert();
      alert('Sertifikat berhasil dibuat!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      if (error.message.includes('already exists')) {
        alert('Sertifikat untuk kursus ini sudah ada.');
      } else {
        alert('Gagal membuat sertifikat. Silakan coba lagi.');
      }
    }
  };

  const downloadCertificate = () => {
    // Create a simple certificate HTML for download
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sertifikat - ${courseName}</title>
        <style>
          body { 
            font-family: 'Georgia', serif; 
            margin: 0; 
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 800px;
            border: 8px solid #f8f9fa;
            position: relative;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #667eea;
            border-radius: 10px;
          }
          .header { color: #667eea; margin-bottom: 30px; }
          .title { font-size: 48px; font-weight: bold; margin: 20px 0; color: #2d3748; }
          .subtitle { font-size: 24px; margin: 20px 0; color: #4a5568; }
          .name { font-size: 36px; font-weight: bold; color: #667eea; margin: 30px 0; text-decoration: underline; }
          .course { font-size: 28px; font-weight: bold; color: #2d3748; margin: 20px 0; }
          .details { margin: 30px 0; color: #718096; }
          .signature { margin-top: 50px; display: flex; justify-content: space-between; }
          .sig-line { border-top: 2px solid #e2e8f0; width: 200px; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <h1>🏆 SERTIFIKAT PENYELESAIAN 🏆</h1>
          </div>
          <div class="title">CERTIFICATE OF COMPLETION</div>
          <div class="subtitle">Dengan ini menyatakan bahwa</div>
          <div class="name">${certificate.userName}</div>
          <div class="subtitle">telah berhasil menyelesaikan kursus</div>
          <div class="course">${courseName}</div>
          <div class="details">
            <p><strong>Nomor Sertifikat:</strong> ${certificate.certificateNumber}</p>
            <p><strong>Tanggal Penyelesaian:</strong> ${new Date(certificate.completionDate).toLocaleDateString('id-ID')}</p>
            <p><strong>Grade:</strong> ${certificate.grade}</p>
          </div>
          <div class="signature">
            <div class="sig-line">
              <div>Direktur Akademik</div>
            </div>
            <div class="sig-line">
              <div>Instruktur Kursus</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sertifikat-${courseName.replace(/\s+/g, '-')}-${certificate.userName.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCertificateAsPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create certificate content for PDF
      const certificateContent = `
        <div style="
          font-family: 'Georgia', serif;
          background: white;
          padding: 60px;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          border: 8px solid #f8f9fa;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #667eea;
            border-radius: 10px;
          "></div>
          <div style="color: #667eea; margin-bottom: 30px; position: relative; z-index: 1;">
            <h1 style="font-size: 32px; margin: 0;">🏆 SERTIFIKAT PENYELESAIAN 🏆</h1>
          </div>
          <div style="font-size: 36px; font-weight: bold; margin: 20px 0; color: #2d3748; position: relative; z-index: 1;">CERTIFICATE OF COMPLETION</div>
          <div style="font-size: 18px; margin: 20px 0; color: #4a5568; position: relative; z-index: 1;">Dengan ini menyatakan bahwa</div>
          <div style="font-size: 28px; font-weight: bold; color: #667eea; margin: 30px 0; text-decoration: underline; position: relative; z-index: 1;">${certificate.userName}</div>
          <div style="font-size: 18px; margin: 20px 0; color: #4a5568; position: relative; z-index: 1;">telah berhasil menyelesaikan kursus</div>
          <div style="font-size: 22px; font-weight: bold; color: #2d3748; margin: 20px 0; position: relative; z-index: 1;">${courseName}</div>
          <div style="margin: 30px 0; color: #718096; position: relative; z-index: 1;">
            <p><strong>Nomor Sertifikat:</strong> ${certificate.certificateNumber}</p>
            <p><strong>Tanggal Penyelesaian:</strong> ${new Date(certificate.completionDate).toLocaleDateString('id-ID')}</p>
            <p><strong>Grade:</strong> ${certificate.grade || 'A'}</p>
          </div>
          <div style="margin-top: 50px; display: flex; justify-content: space-between; position: relative; z-index: 1;">
            <div style="border-top: 2px solid #e2e8f0; width: 200px; padding-top: 10px;">
              <div>Direktur Akademik</div>
            </div>
            <div style="border-top: 2px solid #e2e8f0; width: 200px; padding-top: 10px;">
              <div>Instruktur Kursus</div>
            </div>
          </div>
        </div>
      `;

      // Create a temporary element
      const element = document.createElement('div');
      element.innerHTML = certificateContent;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);

      // PDF options
      const opt = {
        margin: 1,
        filename: `Sertifikat-${courseName.replace(/\s+/g, '-')}-${certificate.userName.replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };

      // Generate PDF
      await html2pdf().set(opt).from(element).save();
      
      // Remove temporary element
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    }
  };

  if (!certificate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isEligible ? 'Dapatkan Sertifikat Anda!' : 'Sertifikat Belum Tersedia'}
            </h2>
            <p className="text-gray-600">
              {isEligible 
                ? `Selamat! Anda telah menyelesaikan kursus ${courseName}` 
                : `Selesaikan kursus ${courseName} untuk mendapatkan sertifikat. Progress saat ini: ${userProgress || 0}%`
              }
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Medal className="text-gold-500" size={32} />
              <span className="text-lg font-semibold">Sertifikat Resmi</span>
              <Medal className="text-gold-500" size={32} />
            </div>
            <p className="text-sm text-gray-600">
              Sertifikat ini akan mencantumkan nama Anda, nama kursus, tanggal penyelesaian, 
              dan nomor sertifikat unik yang dapat diverifikasi.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleGenerateCertificate}
              disabled={isGenerating || !isEligible}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Membuat Sertifikat...
                </>
              ) : (
                <>
                  <Award size={20} />
                  Buat Sertifikat
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6">
          <div className="flex items-center justify-center gap-3">
            <Trophy size={32} />
            <h2 className="text-2xl font-bold">Sertifikat Penyelesaian</h2>
            <Trophy size={32} />
          </div>
        </div>
        
        <div className="p-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border-4 border-yellow-300 relative">
            <div className="absolute top-4 left-4 text-yellow-500">
              <Star size={24} />
            </div>
            <div className="absolute top-4 right-4 text-yellow-500">
              <Star size={24} />
            </div>
            <div className="absolute bottom-4 left-4 text-yellow-500">
              <Star size={24} />
            </div>
            <div className="absolute bottom-4 right-4 text-yellow-500">
              <Star size={24} />
            </div>
            
            <div className="text-center">
              <div className="mb-6">
                <Award className="mx-auto text-yellow-500 mb-4" size={48} />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">SERTIFIKAT PENYELESAIAN</h3>
                <p className="text-gray-600">Certificate of Completion</p>
              </div>
              
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">Dengan ini menyatakan bahwa</p>
                <h4 className="text-2xl font-bold text-blue-600 mb-2">{certificate.userName}</h4>
                <p className="text-lg text-gray-700 mb-2">telah berhasil menyelesaikan kursus</p>
                <h5 className="text-xl font-bold text-gray-800">{courseName}</h5>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="font-semibold">Nomor Sertifikat</span>
                  </div>
                  <p className="text-gray-600">{certificate.certificateNumber}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-blue-500" size={16} />
                    <span className="font-semibold">Tanggal Penyelesaian</span>
                  </div>
                  <p className="text-gray-600">{new Date(certificate.completionDate).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={downloadCertificate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                >
                  <FileText size={20} />
                  Download HTML
                </button>
                <button
                  onClick={downloadCertificateAsPDF}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Download size={20} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;