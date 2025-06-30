import React, { useState, useEffect } from 'react';
import { Award, Download, Calendar, User, CheckCircle, Star, Trophy, Medal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Certificate = ({ courseId, courseName, onClose }) => {
  const { currentUser } = useAuth();
  const [certificate, setCertificate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadCertificate();
  }, [courseId, currentUser]);

  const loadCertificate = () => {
    const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    const userCertificate = certificates.find(
      cert => cert.courseId === courseId && cert.userId === currentUser?.id
    );
    setCertificate(userCertificate);
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    // Simulate certificate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newCertificate = {
      id: Date.now().toString(),
      courseId,
      courseName,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      completionDate: new Date().toISOString(),
      certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      grade: 'A', // This could be calculated based on course performance
      issueDate: new Date().toISOString()
    };

    const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    certificates.push(newCertificate);
    localStorage.setItem('certificates', JSON.stringify(certificates));
    
    setCertificate(newCertificate);
    setIsGenerating(false);
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

  if (!certificate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Dapatkan Sertifikat Anda!</h2>
            <p className="text-gray-600">Selamat! Anda telah menyelesaikan kursus <strong>{courseName}</strong></p>
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
              onClick={generateCertificate}
              disabled={isGenerating}
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
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Download size={20} />
                  Download Sertifikat
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