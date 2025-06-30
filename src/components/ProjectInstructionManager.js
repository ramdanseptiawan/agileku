import React, { useState, useEffect } from 'react';
import { Save, Edit, Eye, FileText, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProjectInstructionManager = () => {
  const { currentUser } = useAuth();
  const [instructions, setInstructions] = useState({
    postWork: {
      title: 'Post Work Assignment',
      description: 'Complete the assigned post-work tasks to reinforce your learning.',
      requirements: [
        'Submit your work in PDF, DOCX, or image format',
        'Maximum file size: 10MB',
        'Include detailed explanations of your approach',
        'Follow the provided guidelines and rubric'
      ],
      guidelines: 'Please ensure your submission is well-organized and clearly demonstrates your understanding of the concepts covered in this module.'
    },
    finalProject: {
      title: 'Final Project',
      description: 'Create a comprehensive project that demonstrates your mastery of the course material.',
      requirements: [
        'Create a complete web application using the technologies learned in this course',
        'Include proper documentation and README file',
        'Implement responsive design for mobile and desktop',
        'Submit as a ZIP file or provide GitHub repository link',
        'Maximum file size: 50MB'
      ],
      guidelines: 'Your final project should showcase your ability to apply the concepts and skills learned throughout the course. Focus on creating a functional, well-designed application that solves a real-world problem.'
    }
  });
  const [editMode, setEditMode] = useState({ postWork: false, finalProject: false });
  const [tempInstructions, setTempInstructions] = useState({});
  const [activeTab, setActiveTab] = useState('postWork');

  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = () => {
    const savedInstructions = localStorage.getItem('projectInstructions');
    if (savedInstructions) {
      setInstructions(JSON.parse(savedInstructions));
    }
  };

  const saveInstructions = () => {
    localStorage.setItem('projectInstructions', JSON.stringify(instructions));
    alert('Instruksi berhasil disimpan!');
  };

  const startEdit = (type) => {
    setTempInstructions({ ...instructions[type] });
    setEditMode({ ...editMode, [type]: true });
  };

  const cancelEdit = (type) => {
    setEditMode({ ...editMode, [type]: false });
    setTempInstructions({});
  };

  const saveEdit = (type) => {
    setInstructions({
      ...instructions,
      [type]: tempInstructions
    });
    setEditMode({ ...editMode, [type]: false });
    setTempInstructions({});
  };

  const updateTempField = (field, value) => {
    setTempInstructions({
      ...tempInstructions,
      [field]: value
    });
  };

  const addRequirement = () => {
    const newRequirements = [...(tempInstructions.requirements || []), ''];
    updateTempField('requirements', newRequirements);
  };

  const updateRequirement = (index, value) => {
    const newRequirements = [...tempInstructions.requirements];
    newRequirements[index] = value;
    updateTempField('requirements', newRequirements);
  };

  const removeRequirement = (index) => {
    const newRequirements = tempInstructions.requirements.filter((_, i) => i !== index);
    updateTempField('requirements', newRequirements);
  };

  const renderEditForm = (type) => {
    const data = tempInstructions;
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateTempField('title', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Masukkan judul"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => updateTempField('description', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Masukkan deskripsi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Persyaratan
          </label>
          <div className="space-y-2">
            {(data.requirements || []).map((req, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Masukkan persyaratan"
                />
                <button
                  onClick={() => removeRequirement(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addRequirement}
              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm"
            >
              <Plus size={16} />
              <span>Tambah Persyaratan</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Panduan
          </label>
          <textarea
            value={data.guidelines || ''}
            onChange={(e) => updateTempField('guidelines', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
            placeholder="Masukkan panduan untuk siswa"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => saveEdit(type)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Simpan</span>
          </button>
          <button
            onClick={() => cancelEdit(type)}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    );
  };

  const renderViewMode = (type) => {
    const data = instructions[type];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{data.title}</h3>
          <button
            onClick={() => startEdit(type)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Deskripsi</h4>
          <p className="text-gray-600">{data.description}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Persyaratan</h4>
          <ul className="space-y-2">
            {data.requirements.map((req, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Panduan</h4>
          <p className="text-gray-600">{data.guidelines}</p>
        </div>
      </div>
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Akses Ditolak</h2>
          <p className="text-red-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Instruksi Proyek</h1>
        <p className="text-gray-600">Kelola instruksi dan persyaratan untuk Post Work dan Final Project</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('postWork')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'postWork'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Briefcase size={16} />
                <span>Post Work</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('finalProject')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'finalProject'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span>Final Project</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {editMode[activeTab] ? renderEditForm(activeTab) : renderViewMode(activeTab)}
        </div>
      </div>

      {/* Save All Button */}
      <div className="text-center">
        <button
          onClick={saveInstructions}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center space-x-2 mx-auto"
        >
          <Save size={20} />
          <span>Simpan Semua Perubahan</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectInstructionManager;