package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// AllowedFileTypes defines allowed file extensions
var AllowedFileTypes = map[string][]string{
	"document": {".pdf", ".doc", ".docx", ".txt"},
	"image":    {".jpg", ".jpeg", ".png", ".gif", ".webp"},
	"video":    {".mp4", ".avi", ".mov", ".wmv", ".flv"},
	"archive":  {".zip", ".rar", ".7z", ".tar", ".gz"},
	"all":      {".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".avi", ".mov", ".wmv", ".flv", ".zip", ".rar", ".7z", ".tar", ".gz"},
}

// MaxFileSizes defines maximum file sizes in bytes
var MaxFileSizes = map[string]int64{
	"document":    10 * 1024 * 1024,  // 10MB
	"image":       5 * 1024 * 1024,   // 5MB
	"video":       100 * 1024 * 1024, // 100MB
	"archive":     50 * 1024 * 1024,  // 50MB
	"postwork":    10 * 1024 * 1024,  // 10MB
	"finalproject": 50 * 1024 * 1024, // 50MB
}

// ValidateFile validates uploaded file
func ValidateFile(file multipart.File, header *multipart.FileHeader, fileType string) error {
	// Check file size
	maxSize, exists := MaxFileSizes[fileType]
	if !exists {
		maxSize = MaxFileSizes["document"] // Default to document size
	}

	if header.Size > maxSize {
		return fmt.Errorf("file size exceeds maximum allowed size of %d bytes", maxSize)
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts, exists := AllowedFileTypes[fileType]
	if !exists {
		allowedExts = AllowedFileTypes["all"] // Default to all types
	}

	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			return nil
		}
	}

	return fmt.Errorf("file type %s is not allowed", ext)
}

// SaveFile saves uploaded file to disk
func SaveFile(file multipart.File, header *multipart.FileHeader, uploadDir string) (string, error) {
	// Create upload directory if it doesn't exist
	err := os.MkdirAll(uploadDir, 0755)
	if err != nil {
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), strings.ReplaceAll(header.Filename[:len(header.Filename)-len(ext)], " ", "_"), ext)
	filePath := filepath.Join(uploadDir, filename)

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()

	// Copy file content
	_, err = io.Copy(dst, file)
	if err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return filename, nil
}

// DeleteFile deletes a file from disk
func DeleteFile(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil // File doesn't exist, nothing to delete
	}
	return os.Remove(filePath)
}

// GetFileURL returns the URL for accessing a file
func GetFileURL(filename, baseURL string) string {
	if filename == "" {
		return ""
	}
	return fmt.Sprintf("%s/uploads/%s", baseURL, filename)
}