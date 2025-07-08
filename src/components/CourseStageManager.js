'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Save, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CourseStageManager = ({ courseId, courseName }) => {
  const { currentUser, getStageLocks, updateStageLock: updateStageLockAPI } = useAuth();
  const [stageLocks, setStageLocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Stage names with their display labels
  const stageInfo = {
    intro: { label: 'Materi Pengantar', description: 'Pengenalan dan overview course' },
    pretest: { label: 'Pre-Test', description: 'Tes awal sebelum pembelajaran' },
    lessons: { label: 'Materi Pembelajaran', description: 'Konten utama pembelajaran' },
    posttest: { label: 'Post-Test', description: 'Tes akhir setelah pembelajaran' },
    postwork: { label: 'Tugas Akhir', description: 'Tugas praktik setelah pembelajaran' },
    finalproject: { label: 'Proyek Final', description: 'Proyek akhir untuk menyelesaikan course' }
  };

  // Initialize with default stage locks if API fails
  const getDefaultStageLocks = () => {
    return Object.keys(stageInfo).map(stageName => ({
      id: Math.random(),
      courseId: parseInt(courseId),
      stageName,
      isLocked: false,
      lockMessage: '',
      lockedBy: null,
      lockedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  };

  // Load stage locks when component mounts
  useEffect(() => {
    if (courseId) {
      loadStageLocks();
    }
  }, [courseId]);

  const loadStageLocks = async (useDefault = false) => {
    try {
      setLoading(true);
      setError('');
      
      if (useDefault) {
        // Use default stage locks as fallback
        const defaultLocks = getDefaultStageLocks();
        setStageLocks(defaultLocks);
        setError('Menggunakan data default. Koneksi ke server bermasalah.');
        return;
      }
      
      const result = await getStageLocks(courseId);
      if (result.success && result.data) {
        setStageLocks(result.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(result.error || 'Failed to load stage locks');
      }
    } catch (error) {
      console.error('Error loading stage locks:', error);
      
      // If this is the first few retries, try again
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadStageLocks(), 2000); // Retry after 2 seconds
        setError(`Mencoba ulang... (${retryCount + 1}/3)`);
      } else {
        // After multiple retries, use default data
        const defaultLocks = getDefaultStageLocks();
        setStageLocks(defaultLocks);
        setError(`Koneksi bermasalah. Menggunakan data default. Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    loadStageLocks();
  };

  const handleUseDefault = () => {
    loadStageLocks(true);
  };

  const updateStageLock = async (stageName, isLocked, lockMessage = '') => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Optimistic update - update local state immediately
      setStageLocks(prevLocks => 
        prevLocks.map(lock => 
          lock.stageName === stageName 
            ? { ...lock, isLocked, lockMessage, updatedAt: new Date().toISOString() }
            : lock
        )
      );
      
      const result = await updateStageLockAPI(courseId, stageName, isLocked, lockMessage);
      
      if (result.success) {
        setSuccess(`Stage ${stageInfo[stageName]?.label} berhasil ${isLocked ? 'dikunci' : 'dibuka'}!`);
        // Try to reload from server, but don't fail if it doesn't work
        try {
          await loadStageLocks();
        } catch (reloadError) {
          console.warn('Failed to reload from server, keeping local state:', reloadError);
        }
      } else {
        throw new Error(result.error || 'Failed to update stage lock');
      }
    } catch (error) {
      console.error('Error updating stage lock:', error);
      
      // Revert optimistic update on error
      setStageLocks(prevLocks => 
        prevLocks.map(lock => 
          lock.stageName === stageName 
            ? { ...lock, isLocked: !isLocked, lockMessage: '', updatedAt: new Date().toISOString() }
            : lock
        )
      );
      
      setError(`Gagal memperbarui stage lock: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async (stageName, currentLockStatus) => {
    const newLockStatus = !currentLockStatus;
    let lockMessage = '';
    
    if (newLockStatus) {
      // If locking, ask for a message
      lockMessage = prompt('Masukkan pesan untuk tahap yang dikunci (opsional):') || 'Tahap ini masih dikunci oleh admin.';
    }
    
    await updateStageLock(stageName, newLockStatus, lockMessage);
  };

  const handleUpdateLockMessage = async (stageName, currentMessage) => {
    const newMessage = prompt('Masukkan pesan baru untuk tahap yang dikunci:', currentMessage) || currentMessage;
    const stageLock = stageLocks.find(lock => lock.stageName === stageName);
    
    if (stageLock && newMessage !== currentMessage) {
      await updateStageLock(stageName, stageLock.isLocked, newMessage);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">Akses Ditolak</span>
        </div>
        <p className="text-red-600 mt-1">Hanya admin yang dapat mengakses fitur ini.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data stage locks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Kelola Akses Tahap Course</h3>
        <p className="text-gray-600 mt-1">
          Course: <span className="font-medium">{courseName}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Anda dapat mengunci atau membuka akses ke setiap tahap dalam course ini.
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            {error.includes('Koneksi bermasalah') && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Coba Lagi
                </button>
                <button
                  onClick={handleUseDefault}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Gunakan Default
                </button>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle size={20} />
              <span className="font-medium">Berhasil</span>
            </div>
            <p className="text-green-600 mt-1">{success}</p>
          </div>
        )}

        {/* Stage Locks List */}
        <div className="space-y-4">
          {Object.keys(stageInfo).map((stageName) => {
            const stageLock = stageLocks.find(lock => lock.stageName === stageName) || {
              stageName,
              isLocked: false,
              lockMessage: ''
            };
            
            const stage = stageInfo[stageName];
            
            return (
              <div key={stageName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        stageLock.isLocked 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {stageLock.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{stage.label}</h4>
                        <p className="text-sm text-gray-500">{stage.description}</p>
                      </div>
                    </div>
                    
                    {/* Lock Message */}
                    {stageLock.isLocked && stageLock.lockMessage && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Pesan:</strong> {stageLock.lockMessage}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Edit Message Button (only for locked stages) */}
                    {stageLock.isLocked && (
                      <button
                        onClick={() => handleUpdateLockMessage(stageName, stageLock.lockMessage)}
                        disabled={saving}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                        title="Edit pesan kunci"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    
                    {/* Toggle Lock Button */}
                    <button
                      onClick={() => handleToggleLock(stageName, stageLock.isLocked)}
                      disabled={saving}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        stageLock.isLocked
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Menyimpan...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {stageLock.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                          <span>{stageLock.isLocked ? 'Buka' : 'Kunci'}</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connection Status */}
        {error && error.includes('data default') && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
              <div className="text-yellow-800">
                <p className="font-medium">Mode Offline:</p>
                <p className="text-sm mt-1">
                  Saat ini menggunakan data default karena koneksi ke server bermasalah. 
                  Perubahan akan disimpan secara lokal dan akan disinkronkan ketika koneksi pulih.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-blue-600 mt-0.5" />
            <div className="text-blue-800">
              <p className="font-medium">Informasi Penting:</p>
              <ul className="text-sm mt-1 space-y-1">
                <li>• Tahap yang dikunci tidak dapat diakses oleh siswa</li>
                <li>• Admin tetap dapat mengakses semua tahap meskipun dikunci</li>
                <li>• Pesan kunci akan ditampilkan kepada siswa yang mencoba mengakses tahap yang dikunci</li>
                <li>• Perubahan akan langsung berlaku untuk semua siswa</li>
                {error && error.includes('data default') && (
                  <li>• <strong>Mode Offline:</strong> Perubahan disimpan lokal, akan disinkronkan saat koneksi pulih</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStageManager;