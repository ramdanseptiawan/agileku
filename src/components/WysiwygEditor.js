import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Image, Quote, Code, Undo, Redo, FileText, ExternalLink, Eye, EyeOff } from 'lucide-react';

const WysiwygEditor = ({ value = '', onChange, placeholder = 'Mulai menulis...', height = '300px' }) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', target: '_blank' });
  const [pdfData, setPdfData] = useState({ url: '', title: '', showPreview: true });

  useEffect(() => {
    if (editorRef.current && value !== undefined && value !== null) {
      // Always set the content when value changes, regardless of current innerHTML
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertImage = () => {
    const url = prompt('Masukkan URL gambar:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const selectedText = window.getSelection().toString();
    setLinkData({ 
      url: '', 
      text: selectedText || 'Link Text', 
      target: '_blank' 
    });
    setShowLinkModal(true);
  };

  const handleInsertLink = () => {
    if (linkData.url) {
      const linkHtml = `<a href="${linkData.url}" target="${linkData.target}" style="color: #3b82f6; text-decoration: underline;">${linkData.text}</a>`;
      execCommand('insertHTML', linkHtml);
      setShowLinkModal(false);
      setLinkData({ url: '', text: '', target: '_blank' });
    }
  };

  const insertPDF = () => {
    setPdfData({ url: '', title: 'PDF Document', showPreview: true });
    setShowPdfModal(true);
  };

  const handleInsertPDF = () => {
    if (pdfData.url) {
      const embedCode = pdfData.showPreview ? `
        <div class="pdf-embed" style="margin: 20px 0; padding: 15px; border: 2px dashed #ccc; border-radius: 8px; text-align: center;">
          <p><strong>📄 ${pdfData.title}</strong></p>
          <a href="${pdfData.url}" target="_blank" style="color: #3b82f6; text-decoration: underline;">Buka PDF: ${pdfData.title}</a>
          <br/>
          <iframe src="${pdfData.url}" width="100%" height="400" style="margin-top: 10px; border: 1px solid #ddd; border-radius: 4px;"></iframe>
        </div>
      ` : `
        <div class="pdf-link" style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
          <p><strong>📄 ${pdfData.title}</strong></p>
          <a href="${pdfData.url}" target="_blank" style="color: #3b82f6; text-decoration: underline;">Download/View PDF</a>
        </div>
      `;
      execCommand('insertHTML', embedCode);
      setShowPdfModal(false);
      setPdfData({ url: '', title: 'PDF Document', showPreview: true });
    }
  };

  const toggleHtmlSource = () => {
    if (showHtmlSource) {
      // Switch back to visual editor
      const htmlContent = editorRef.current.value;
      setShowHtmlSource(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlContent;
          onChange(htmlContent);
        }
      }, 0);
    } else {
      // Switch to HTML source
      setShowHtmlSource(true);
    }
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      }`}
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Align Left" />
        <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Align Center" />
        <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Align Right" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton onClick={insertLink} icon={ExternalLink} title="Insert Link" />
        <ToolbarButton onClick={insertImage} icon={Image} title="Insert Image" />
        <ToolbarButton onClick={insertPDF} icon={FileText} title="Insert PDF" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton onClick={() => execCommand('formatBlock', 'blockquote')} icon={Quote} title="Quote" />
        <ToolbarButton onClick={() => execCommand('formatBlock', 'pre')} icon={Code} title="Code Block" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} title="Redo" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton 
          onClick={toggleHtmlSource} 
          icon={showHtmlSource ? Eye : EyeOff} 
          title={showHtmlSource ? 'Visual Editor' : 'HTML Source'}
          isActive={showHtmlSource}
        />
        
        <div className="ml-auto flex items-center gap-2">
          <select 
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="div">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        </div>
      </div>
      
      {/* Editor */}
      {showHtmlSource ? (
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 font-mono text-sm border-none outline-none resize-none text-gray-900"
          style={{ minHeight: height }}
          placeholder="Enter HTML code..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          className={`p-4 outline-none overflow-y-auto text-gray-900 ${
            isEditorFocused ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ minHeight: height }}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />
      )}
      
      <style jsx>{`
        [contenteditable] {
          color: #111827;
        }
        
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        [contenteditable] h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.12em 0;
        }
        
        [contenteditable] h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.5em 0;
        }
        
        [contenteditable] h6 {
          font-size: 0.75em;
          font-weight: bold;
          margin: 1.67em 0;
        }
        
        [contenteditable] blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 4px solid #e5e7eb;
          color: #6b7280;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: monospace;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 0.5em 0;
        }
      `}</style>
      
      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({...linkData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData({...linkData, text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select
                  value={linkData.target}
                  onChange={(e) => setLinkData({...linkData, target: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="_blank">New Window (_blank)</option>
                  <option value="_self">Same Window (_self)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert PDF</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL</label>
                <input
                  type="url"
                  value={pdfData.url}
                  onChange={(e) => setPdfData({...pdfData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={pdfData.title}
                  onChange={(e) => setPdfData({...pdfData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PDF Document Title"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPreview"
                  checked={pdfData.showPreview}
                  onChange={(e) => setPdfData({...pdfData, showPreview: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="showPreview" className="text-sm text-gray-700">
                  Show PDF preview (embed iframe)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Insert PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WysiwygEditor;