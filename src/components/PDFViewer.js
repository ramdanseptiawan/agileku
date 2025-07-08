"use client";
import React from 'react';

const PDFViewer = ({ item, fileUrls }) => {
  // Get the PDF URL based on upload method
  const pdfUrl = item.uploadMethod === 'upload' && item.fileId 
    ? fileUrls[item.fileId] 
    : (item.embedUrl || item.downloadUrl || item.url);
  
  const title = item.title || "PDF Document";
  const filename = item.filename || 'Document.pdf';

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
};

export default PDFViewer;