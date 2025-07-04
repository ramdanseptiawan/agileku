import React, { useState, useEffect, useCallback } from 'react';
import { Award, Download, Search, Filter, Calendar, User, Trophy, Eye, Trash2, FileText, BarChart3 } from 'lucide-react';
import { certificateAPI, adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CertificateManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const { currentUser } = useAuth();

  const loadCertificates = useCallback(async () => {
    try {
      let response;
      
      // Check if user is admin to load all certificates or just user certificates
      if (currentUser?.role === 'admin') {
        response = await adminAPI.getAllCertificates();
      } else {
        response = await certificateAPI.getUserCertificates();
      }
      
      if (response.success) {
        setCertificates(response.certificates || []);
      } else {
        // Fallback to localStorage
        loadCertificatesFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading certificates from backend:', error);
      // Fallback to localStorage
      loadCertificatesFromLocalStorage();
    }
  }, [currentUser]);
  
  const loadCertificatesFromLocalStorage = () => {
    // Load all certificates from all users for admin management
    const allCertificates = [];
    
    // Get all localStorage keys that match certificate pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('certificates_')) {
        try {
          const userCertificates = JSON.parse(localStorage.getItem(key) || '[]');
          allCertificates.push(...userCertificates);
        } catch (error) {
          console.error('Error loading certificates from key:', key, error);
        }
      }
    }
    
    console.log('CertificateManager: Loaded certificates:', allCertificates);
    setCertificates(allCertificates);
  };

  const filterCertificates = useCallback(() => {
    let filtered = certificates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        (cert.studentName || cert.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.certificateNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (filterBy !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterBy) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(cert => new Date(cert.completionDate) >= filterDate);
    }

    setFilteredCertificates(filtered.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate)));
  }, [certificates, searchTerm, filterBy]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  useEffect(() => {
    filterCertificates();
  }, [filterCertificates]);

  // filterCertificates is now defined as useCallback above

  const deleteCertificate = (certificateId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) {
      const updatedCertificates = certificates.filter(cert => cert.id !== certificateId);
      setCertificates(updatedCertificates);
      localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
    }
  };

  const downloadCertificate = (certificate) => {
    // Use correct property names and add safety checks
    const studentName = certificate.studentName || certificate.userName || 'Unknown Student';
    const courseName = certificate.courseName || 'Unknown Course';
    const certificateNumber = certificate.certificateNumber || 'N/A';
    const completionDate = certificate.completionDate || new Date().toISOString();
    const grade = certificate.grade || 'N/A';
    
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
          <div class="name">${studentName}</div>
          <div class="subtitle">telah berhasil menyelesaikan kursus</div>
          <div class="course">${courseName}</div>
          <div class="details">
            <p><strong>Nomor Sertifikat:</strong> ${certificateNumber}</p>
            <p><strong>Tanggal Penyelesaian:</strong> ${new Date(completionDate).toLocaleDateString('id-ID')}</p>
            <p><strong>Grade:</strong> ${grade}</p>
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
    // Safe filename generation with fallbacks
    const safeCourseName = courseName.replace(/[^a-zA-Z0-9]/g, '-');
    const safeStudentName = studentName.replace(/[^a-zA-Z0-9]/g, '-');
    a.download = `Sertifikat-${safeCourseName}-${safeStudentName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CertificateModal = ({ certificate, onClose }) => (
    <div className="fixed text-gray-900 inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={28} />
              <h2 className="text-xl font-bold">Detail Sertifikat</h2>
            </div>
            <button
              onClick={onClose}
              className="bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-yellow-300">
            <div className="text-center mb-6">
              <Award className="mx-auto text-yellow-500 mb-3" size={40} />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">SERTIFIKAT PENYELESAIAN</h3>
              <p className="text-gray-600">Certificate of Completion</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="text-blue-500" size={16} />
                  <span className="font-semibold text-sm">Nama Peserta</span>
                </div>
                <p className="text-gray-800 font-medium">{certificate.studentName || certificate.userName || 'Unknown Student'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-green-500" size={16} />
                  <span className="font-semibold text-sm">Nama Kursus</span>
                </div>
                <p className="text-gray-800 font-medium">{certificate.courseName}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-purple-500" size={16} />
                  <span className="font-semibold text-sm">Nomor Sertifikat</span>
                </div>
                <p className="text-gray-800 font-mono text-sm">{certificate.certificateNumber}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-red-500" size={16} />
                  <span className="font-semibold text-sm">Tanggal Penyelesaian</span>
                </div>
                <p className="text-gray-800 font-medium">{formatDate(certificate.completionDate)}</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => downloadCertificate(certificate)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="bg-opacity-20 p-4 rounded-full">
                <Trophy className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Manajemen Sertifikat</h1>
                <p className="text-yellow-100 text-lg">Kelola semua sertifikat yang telah diterbitkan</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, kursus, atau nomor sertifikat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Semua Waktu</option>
                  <option value="week">7 Hari Terakhir</option>
                  <option value="month">30 Hari Terakhir</option>
                  <option value="year">1 Tahun Terakhir</option>
                </select>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Sertifikat</p>
                    <p className="text-3xl font-bold">{certificates.length}</p>
                  </div>
                  <Award size={40} className="text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Bulan Ini</p>
                    <p className="text-3xl font-bold">
                      {certificates.filter(cert => {
                        const certDate = new Date(cert.completionDate);
                        const now = new Date();
                        return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <Calendar size={40} className="text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Kursus Unik</p>
                    <p className="text-3xl font-bold">
                      {new Set(certificates.map(cert => cert.courseName)).size}
                    </p>
                  </div>
                  <FileText size={40} className="text-purple-200" />
                </div>
              </div>
            </div>

            {/* Certificates List */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Daftar Sertifikat</h2>
              
              {filteredCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Tidak ada sertifikat ditemukan</p>
                  <p className="text-gray-400">Sertifikat akan muncul setelah peserta menyelesaikan kursus</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCertificates.map((certificate) => (
                    <div key={certificate.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-yellow-100 p-3 rounded-full">
                            <Award className="text-yellow-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{certificate.studentName || certificate.userName || 'Unknown Student'}</h3>
                            <p className="text-gray-600">{certificate.courseName}</p>
                            <p className="text-sm text-gray-500">No: {certificate.certificateNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Diselesaikan</p>
                            <p className="font-medium text-gray-800">{formatDate(certificate.completionDate)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedCertificate(certificate)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => downloadCertificate(certificate)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => deleteCertificate(certificate.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {selectedCertificate && (
        <CertificateModal 
          certificate={selectedCertificate} 
          onClose={() => setSelectedCertificate(null)} 
        />
      )}
    </div>
  );
};

export default CertificateManager;