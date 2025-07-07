"use client";
import React, { useState } from 'react';

// Conditional import for react-pdf to avoid build issues
let Document, Page, pdfjs;
if (typeof window !== 'undefined') {
  try {
    const reactPdf = require('react-pdf');
    Document = reactPdf.Document;
    Page = reactPdf.Page;
    pdfjs = reactPdf.pdfjs;
    // Set up the worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  } catch (error) {
    console.warn('react-pdf not available:', error);
  }
}

const PDFViewer = ({ item, fileUrls }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError(true);
  };

  const goToPrevPage = () => {
    setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);
  };

  const goToNextPage = () => {
    setPageNumber(pageNumber + 1 >= numPages ? numPages : pageNumber + 1);
  };

  // Get the PDF URL based on upload method
  const pdfUrl = item.uploadMethod === 'upload' && item.fileId 
    ? fileUrls[item.fileId] 
    : (item.embedUrl || item.downloadUrl || item.url);
  
  const title = item.title || "PDF Document";
  const filename = item.filename || 'Document.pdf';

  // Show fallback if react-pdf is not available or if there's an error
  if (error || !Document || !Page) {
    return (
      <div style={{
        margin: "20px 0",
        padding: "20px",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        background: "#f9f9f9",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "15px" }}>
          <span style={{ fontSize: "24px", marginRight: "8px" }}>📄</span>
          <strong style={{ color: "#333" }}>{title}</strong>
        </div>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          PDF tidak dapat ditampilkan. Klik tombol di bawah untuk membuka atau mengunduh PDF
        </p>
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#fff",
              background: "#3b82f6",
              padding: "10px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            🔗 Buka PDF di Tab Baru
          </a>
          <a
            href={pdfUrl}
            download
            style={{
              color: "#fff",
              background: "#10b981",
              padding: "10px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            ⬇️ Download PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      margin: "20px 0",
      padding: "15px",
      border: "2px dashed #ccc",
      borderRadius: "8px",
      background: "#fff"
    }}>
      <div style={{
        marginBottom: "15px",
        textAlign: "center",
        borderBottom: "1px solid #eee",
        paddingBottom: "10px"
      }}>
        <span style={{ fontSize: "20px", marginRight: "8px" }}>📄</span>
        <strong style={{ color: "#333" }}>{title}</strong>
      </div>
      
      <div style={{ height: "600px", border: "1px solid #ddd", borderRadius: "4px", overflow: "auto" }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div style={{ textAlign: "center", padding: "20px" }}>Loading PDF...</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={Math.min(window.innerWidth * 0.8, 800)}
          />
        </Document>
        {numPages && (
          <div style={{
            marginTop: "10px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px"
          }}>
            <button 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              style={{
                padding: "5px 10px",
                border: "1px solid #3b82f6",
                borderRadius: "4px",
                background: pageNumber <= 1 ? "#f5f5f5" : "#fff",
                color: pageNumber <= 1 ? "#999" : "#3b82f6",
                cursor: pageNumber <= 1 ? "not-allowed" : "pointer"
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: "14px", color: "#666" }}>
              Page {pageNumber} of {numPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber >= numPages}
              style={{
                padding: "5px 10px",
                border: "1px solid #3b82f6",
                borderRadius: "4px",
                background: pageNumber >= numPages ? "#f5f5f5" : "#fff",
                color: pageNumber >= numPages ? "#999" : "#3b82f6",
                cursor: pageNumber >= numPages ? "not-allowed" : "pointer"
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      <div style={{
        marginTop: "10px",
        textAlign: "center",
        borderTop: "1px solid #eee",
        paddingTop: "10px"
      }}>
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontSize: "14px",
              padding: "5px 10px",
              border: "1px solid #3b82f6",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            🔗 Buka di Tab Baru
          </a>
          <a
            href={pdfUrl}
            download
            style={{
              color: "#10b981",
              textDecoration: "none",
              fontSize: "14px",
              padding: "5px 10px",
              border: "1px solid #10b981",
              borderRadius: "4px",
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            ⬇️ Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;