import React, { useState, useEffect } from 'react';
import { Save, Settings, ToggleLeft, ToggleRight, Sliders } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component untuk mengelola konfigurasi course (step weights, post work, final project, certificate delay)
 * Hanya dapat diakses oleh admin
 */
const CourseConfigManager = () => {
  const { currentUser, courses } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [config, setConfig] = useState({
    hasPostWork: false,
    hasFinalProject: false,
    stepWeights: {
      intro: 10,
      pretest: 15,
      lessons: 40,
      posttest: 35,
      postwork: 0,
      finalproject: 0
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  // Load course configuration
  useEffect(() => {
    if (selectedCourse) {
      loadCourseConfig(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourseConfig = async (courseId) => {
    setIsLoading(true);
    try {
       const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api.mindshiftlearning.id' 
        : 'https://api.mindshiftlearning.id';
      const response = await fetch(`${backendUrl}/api/protected/admin/courses/${courseId}/config`, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig({
          hasPostWork: data.hasPostWork || false,
          hasFinalProject: data.hasFinalProject || false,
          stepWeights: data.stepWeights || {
            intro: 10,
            pretest: 15,
            lessons: 40,
            posttest: 35,
            postwork: 0,
            finalproject: 0
          }
        });
      } else {
        console.error('Failed to load course config');
        // Set default config
        setConfig({
          hasPostWork: false,
          hasFinalProject: false,
          stepWeights: {
            intro: 10,
            pretest: 15,
            lessons: 40,
            posttest: 35,
            postwork: 0,
            finalproject: 0
          }
        });
      }
    } catch (error) {
      console.error('Error loading course config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedCourse) {
      setSaveStatus('Pilih course terlebih dahulu');
      return;
    }

    setIsSaving(true);
    setSaveStatus('');

    try {
          const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api.mindshiftlearning.id' 
        : 'https://api.mindshiftlearning.id';
      const response = await fetch(`${backendUrl}/api/protected/admin/courses/${selectedCourse}/config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setSaveStatus('✅ Konfigurasi berhasil disimpan!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('❌ Gagal menyimpan konfigurasi');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveStatus('❌ Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStepWeight = (step, value) => {
    setConfig(prev => ({
      ...prev,
      stepWeights: {
        ...prev.stepWeights,
        [step]: parseInt(value) || 0
      }
    }));
  };

  const toggleFeature = (feature) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [feature]: !prev[feature]
      };
      
      // Auto-adjust step weights when toggling features
      if (feature === 'hasPostWork' || feature === 'hasFinalProject') {
        const newStepWeights = { ...prev.stepWeights };
        
        if (feature === 'hasPostWork') {
          if (!prev.hasPostWork) {
            // Enabling post work - redistribute weights
            newStepWeights.postwork = 10;
            newStepWeights.posttest = 25; // reduce from 35 to 25
          } else {
            // Disabling post work - redistribute weights
            newStepWeights.postwork = 0;
            newStepWeights.posttest = 35; // increase back to 35
          }
        }
        
        if (feature === 'hasFinalProject') {
          if (!prev.hasFinalProject) {
            // Enabling final project - redistribute weights
            newStepWeights.finalproject = 15;
            newStepWeights.lessons = 25; // reduce from 40 to 25
          } else {
            // Disabling final project - redistribute weights
            newStepWeights.finalproject = 0;
            newStepWeights.lessons = 40; // increase back to 40
          }
        }
        
        newConfig.stepWeights = newStepWeights;
      }
      
      return newConfig;
    });
  };

  const getTotalWeight = () => {
    return Object.values(config.stepWeights).reduce((sum, weight) => sum + weight, 0);
  };

  const getStepLabel = (step) => {
    const labels = {
      intro: 'Intro',
      pretest: 'Pre Test',
      lessons: 'Lessons',
      posttest: 'Post Test',
      postwork: 'Post Work',
      finalproject: 'Final Project'
    };
    return labels[step] || step;
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Akses Ditolak
          </h3>
          <p className="text-red-600">
            Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Konfigurasi Course
          </h2>
          
          {/* Course Selection */}
          <div className="mb-4 text-gray-900">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">{saveStatus}</p>
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat konfigurasi...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Course Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fitur Course</h3>
                  <div className="space-y-4">
                    {/* Post Work Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Post Work</h4>
                        <p className="text-sm text-gray-600">Aktifkan tugas post work setelah post test</p>
                      </div>
                      <button
                        onClick={() => toggleFeature('hasPostWork')}
                        className={`flex items-center ${config.hasPostWork ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {config.hasPostWork ? (
                          <ToggleRight className="w-8 h-8" />
                        ) : (
                          <ToggleLeft className="w-8 h-8" />
                        )}
                      </button>
                    </div>

                    {/* Final Project Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Final Project</h4>
                        <p className="text-sm text-gray-600">Aktifkan final project sebagai tahap terakhir</p>
                      </div>
                      <button
                        onClick={() => toggleFeature('hasFinalProject')}
                        className={`flex items-center ${config.hasFinalProject ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {config.hasFinalProject ? (
                          <ToggleRight className="w-8 h-8" />
                        ) : (
                          <ToggleLeft className="w-8 h-8" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step Weights */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Bobot Progress (%)
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(config.stepWeights).map(([step, weight]) => (
                      <div key={step} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <label className="font-medium text-gray-900">
                            {getStepLabel(step)}
                          </label>
                          {((step === 'postwork' && !config.hasPostWork) || 
                            (step === 'finalproject' && !config.hasFinalProject)) && (
                            <span className="ml-2 text-sm text-gray-500">(Tidak aktif)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={weight}
                            onChange={(e) => updateStepWeight(step, e.target.value)}
                            className="w-32"
                            disabled={(step === 'postwork' && !config.hasPostWork) || 
                                     (step === 'finalproject' && !config.hasFinalProject)}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={weight}
                            onChange={(e) => updateStepWeight(step, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            disabled={(step === 'postwork' && !config.hasPostWork) || 
                                     (step === 'finalproject' && !config.hasFinalProject)}
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Weight Display */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-900">Total Bobot:</span>
                        <span className={`font-bold text-lg ${
                          getTotalWeight() === 100 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {getTotalWeight()}%
                        </span>
                      </div>
                      {getTotalWeight() !== 100 && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ Total bobot harus 100% untuk perhitungan progress yang akurat
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={saveConfig}
                    disabled={isSaving || !selectedCourse}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseConfigManager;