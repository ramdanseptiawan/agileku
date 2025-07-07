"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useState } from "react";

const PDFViewer = ({ item, fileUrls }) => {
  const [error, setError] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const handleDocumentLoadError = () => {
    setError(true);
  };

  // Get the PDF URL based on upload method
  const pdfUrl = item.uploadMethod === 'upload' && item.fileId 
    ? fileUrls[item.fileId] 
    : (item.embedUrl || item.downloadUrl || item.url);
  
  const title = item.title || "PDF Document";
  const filename = item.filename || 'Document.pdf';

  if (error) {
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
      
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
        <div style={{ height: "600px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
            onDocumentLoadError={handleDocumentLoadError}
          />
        </div>
      </Worker>
      
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