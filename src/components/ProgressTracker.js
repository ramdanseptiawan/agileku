import React from 'react';
import { CheckCircle, Circle, Lock, BookOpen, FileText, Award, Upload, Target } from 'lucide-react';

const ProgressTracker = ({ currentStep, completedSteps, onStepClick }) => {
  const steps = [
    {
      id: 'intro',
      title: 'Materi Pengantar',
      description: 'Pelajari konsep dasar',
      icon: BookOpen,
      color: 'blue'
    },
    {
      id: 'pretest',
      title: 'Pre-Test',
      description: 'Tes pemahaman awal',
      icon: FileText,
      color: 'purple'
    },
    {
      id: 'lessons',
      title: 'Materi Inti',
      description: 'Pembelajaran utama',
      icon: BookOpen,
      color: 'green'
    },
    {
      id: 'posttest',
      title: 'Post-Test & Survei',
      description: 'Evaluasi & feedback',
      icon: Award,
      color: 'orange'
    },
    {
      id: 'postwork',
      title: 'Post Work',
      description: 'Upload tugas kecil',
      icon: Upload,
      color: 'red'
    },
    {
      id: 'finalproject',
      title: 'Final Project',
      description: 'Proyek akhir',
      icon: Target,
      color: 'indigo'
    }
  ];

  const getStepStatus = (stepId, index) => {
    if (completedSteps.includes(stepId)) {
      return 'completed';
    } else if (stepId === currentStep) {
      return 'current';
    } else if (index === 0 || completedSteps.includes(steps[index - 1].id)) {
      return 'available';
    } else {
      return 'locked';
    }
  };

  const getStepIcon = (step, status) => {
    const Icon = step.icon;
    
    if (status === 'completed') {
      return <CheckCircle className="text-green-500" size={24} />;
    } else if (status === 'locked') {
      return <Lock className="text-gray-400" size={24} />;
    } else {
      return <Icon className={`text-${step.color}-500`} size={24} />;
    }
  };

  const getStepClasses = (status, color) => {
    const baseClasses = "relative flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer";
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-50 border-2 border-green-200 hover:bg-green-100`;
      case 'current':
        return `${baseClasses} bg-${color}-50 border-2 border-${color}-500 shadow-lg ring-2 ring-${color}-200`;
      case 'available':
        return `${baseClasses} bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-${color}-300`;
      case 'locked':
        return `${baseClasses} bg-gray-50 border-2 border-gray-200 opacity-60 cursor-not-allowed`;
      default:
        return baseClasses;
    }
  };

  const getConnectorClasses = (index, steps) => {
    if (index === steps.length - 1) return 'hidden';
    
    const currentStepCompleted = completedSteps.includes(steps[index].id);
    const nextStepCompleted = completedSteps.includes(steps[index + 1].id);
    
    if (currentStepCompleted && nextStepCompleted) {
      return 'w-full h-1 bg-green-400 rounded-full';
    } else if (currentStepCompleted) {
      return 'w-full h-1 bg-gradient-to-r from-green-400 to-gray-300 rounded-full';
    } else {
      return 'w-full h-1 bg-gray-300 rounded-full';
    }
  };

  const calculateProgress = () => {
    return Math.round((completedSteps.length / steps.length) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Pembelajaran</h3>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Ikuti setiap tahap untuk menyelesaikan kursus</p>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{calculateProgress()}%</div>
            <div className="text-sm text-gray-500">Selesai</div>
          </div>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {steps.slice(0, 3).map((step, index) => {
            const status = getStepStatus(step.id, index);
            const isClickable = status === 'available' || status === 'current' || status === 'completed';
            
            return (
              <div key={step.id} className="relative">
                <div 
                  className={getStepClasses(status, step.color)}
                  onClick={() => isClickable && onStepClick && onStepClick(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepIcon(step, status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Step Number Badge */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    status === 'completed' ? 'bg-green-500 text-white' :
                    status === 'current' ? `bg-${step.color}-500 text-white` :
                    status === 'available' ? 'bg-gray-400 text-white' :
                    'bg-gray-300 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Second Row for remaining steps */}
        <div className="grid grid-cols-3 gap-4">
          {steps.slice(3).map((step, index) => {
            const actualIndex = index + 3;
            const status = getStepStatus(step.id, actualIndex);
            const isClickable = status === 'available' || status === 'current' || status === 'completed';
            
            return (
              <div key={step.id} className="relative">
                <div 
                  className={getStepClasses(status, step.color)}
                  onClick={() => isClickable && onStepClick && onStepClick(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepIcon(step, status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Step Number Badge */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    status === 'completed' ? 'bg-green-500 text-white' :
                    status === 'current' ? `bg-${step.color}-500 text-white` :
                    status === 'available' ? 'bg-gray-400 text-white' :
                    'bg-gray-300 text-gray-500'
                  }`}>
                    {actualIndex + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Vertical Stepper */}
      <div className="lg:hidden space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isClickable = status === 'available' || status === 'current' || status === 'completed';
          
          return (
            <div key={step.id} className="relative">
              <div 
                className={getStepClasses(status, step.color)}
                onClick={() => isClickable && onStepClick && onStepClick(step.id)}
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="flex-shrink-0">
                    {getStepIcon(step, status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    status === 'completed' ? 'bg-green-500 text-white' :
                    status === 'current' ? `bg-${step.color}-500 text-white` :
                    status === 'available' ? 'bg-gray-400 text-white' :
                    'bg-gray-300 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              </div>
              
              {/* Vertical Connector */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className={`w-1 h-8 ${
                    completedSteps.includes(step.id) ? 'bg-green-400' : 'bg-gray-300'
                  } rounded-full`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={16} />
            <span className="text-gray-600">Selesai</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="text-blue-500" size={16} />
            <span className="text-gray-600">Sedang Aktif</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="text-gray-400" size={16} />
            <span className="text-gray-600">Tersedia</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="text-gray-400" size={16} />
            <span className="text-gray-600">Terkunci</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;