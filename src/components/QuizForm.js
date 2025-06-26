import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

const QuizForm = ({ quiz, onChange, title }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: ''
  });

  const updateQuiz = (field, value) => {
    onChange({
      ...quiz,
      [field]: value
    });
  };

  const addQuestion = () => {
    if (!newQuestion.question.trim()) {
      alert('Pertanyaan wajib diisi');
      return;
    }

    const hasEmptyOptions = newQuestion.options.some(option => !option.trim());
    if (hasEmptyOptions) {
      alert('Semua opsi jawaban wajib diisi');
      return;
    }

    const questionToAdd = {
      ...newQuestion,
      id: Date.now(),
    };

    updateQuiz('questions', [...quiz.questions, questionToAdd]);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: ''
    });
  };

  const updateQuestion = (index, updatedQuestion) => {
    const updatedQuestions = quiz.questions.map((question, i) => 
      i === index ? updatedQuestion : question
    );
    updateQuiz('questions', updatedQuestions);
    setEditingQuestion(null);
  };

  const deleteQuestion = (index) => {
    if (confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
      updateQuiz('questions', updatedQuestions);
    }
  };

  const QuestionEditor = ({ question, onSave, onCancel, isNew = false }) => {
    const [editQuestion, setEditQuestion] = useState(question);

    const handleSave = () => {
      if (!editQuestion.question.trim()) {
        alert('Pertanyaan wajib diisi');
        return;
      }

      const hasEmptyOptions = editQuestion.options.some(option => !option.trim());
      if (hasEmptyOptions) {
        alert('Semua opsi jawaban wajib diisi');
        return;
      }

      onSave(editQuestion);
    };

    const updateOption = (index, value) => {
      const newOptions = [...editQuestion.options];
      newOptions[index] = value;
      setEditQuestion({ ...editQuestion, options: newOptions });
    };

    return (
      <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="space-y-4 text-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pertanyaan *
            </label>
            <textarea
              value={editQuestion.question}
              onChange={(e) => setEditQuestion({ ...editQuestion, question: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan pertanyaan..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opsi Jawaban *
            </label>
            <div className="space-y-3">
              {editQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`correct-${isNew ? 'new' : editingQuestion}`}
                    checked={editQuestion.correct === index}
                    onChange={() => setEditQuestion({ ...editQuestion, correct: index })}
                    className="text-blue-600"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Opsi ${String.fromCharCode(65 + index)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pilih radio button untuk menandai jawaban yang benar
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penjelasan (Opsional)
            </label>
            <textarea
              value={editQuestion.explanation}
              onChange={(e) => setEditQuestion({ ...editQuestion, explanation: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Penjelasan mengapa jawaban ini benar..."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Save size={16} />
              {isNew ? 'Tambah Pertanyaan' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">
          {quiz.questions.length} pertanyaan
        </span>
      </div>
      
      {/* Quiz Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul {title}
        </label>
        <input
          type="text"
          value={quiz.title}
          onChange={(e) => updateQuiz('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Masukkan judul ${title.toLowerCase()}...`}
        />
      </div>
      
      {/* Existing Questions */}
      {quiz.questions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Daftar Pertanyaan</h4>
          {quiz.questions.map((question, index) => (
            <div key={question.id || index}>
              {editingQuestion === index ? (
                <QuestionEditor
                  question={question}
                  onSave={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                  onCancel={() => setEditingQuestion(null)}
                />
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-2">
                        {index + 1}. {question.question}
                      </h5>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`text-sm ${
                            question.correct === optIndex 
                              ? 'text-green-600 font-medium' 
                              : 'text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {question.correct === optIndex && ' ✓'}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                          <strong>Penjelasan:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingQuestion(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit pertanyaan"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteQuestion(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus pertanyaan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Add New Question */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Tambah Pertanyaan Baru</h4>
        <QuestionEditor
          question={newQuestion}
          onSave={addQuestion}
          onCancel={() => setNewQuestion({
            question: '',
            options: ['', '', '', ''],
            correct: 0,
            explanation: ''
          })}
          isNew={true}
        />
      </div>
      
      {quiz.questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada pertanyaan. Tambahkan pertanyaan pertama Anda!</p>
        </div>
      )}
    </div>
  );
};

export default QuizForm;