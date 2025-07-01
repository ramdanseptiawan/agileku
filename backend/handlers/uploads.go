package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"lms-backend/config"
	"lms-backend/models"
	"lms-backend/utils"
)

// UploadFile handles file uploads
func UploadFile(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	// Parse multipart form
	err = r.ParseMultipartForm(50 << 20) // 50MB max
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Failed to parse form", err.Error())
		return
	}

	// Get file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "No file provided", err.Error())
		return
	}
	defer file.Close()

	// Get file type from form (optional)
	fileType := r.FormValue("type")
	if fileType == "" {
		fileType = "document" // default
	}

	// Validate file
	if err := utils.ValidateFile(file, header, fileType); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "File validation failed", err.Error())
		return
	}

	// Create upload directory
	uploadDir := filepath.Join("uploads", fileType)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to create upload directory", err.Error())
		return
	}

	// Save file
	filename, err := utils.SaveFile(file, header, uploadDir)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to save file", err.Error())
		return
	}

	// Create file record in database
	db := config.GetDB()
	fileUpload := models.FileUpload{
		Filename: filename,
		Path:     filepath.Join(uploadDir, filename),
		Size:     header.Size,
		MimeType: header.Header.Get("Content-Type"),
		UserID:   uint(userID),
	}

	if err := db.Create(&fileUpload).Error; err != nil {
		// If database save fails, delete the uploaded file
		utils.DeleteFile(filepath.Join(uploadDir, filename))
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to save file record", err.Error())
		return
	}

	// Generate file URL
	baseURL := getBaseURL(r)
	fileURL := utils.GetFileURL(filename, baseURL)

	response := map[string]interface{}{
		"id":        fileUpload.ID,
		"filename":  fileUpload.Filename,
		"path":      fileUpload.Path,
		"file_url":  fileURL,
		"size":      fileUpload.Size,
		"mime_type": fileUpload.MimeType,
	}

	utils.SendCreatedResponse(w, "File uploaded successfully", response)
}

// GetFile serves uploaded files
func GetFile(w http.ResponseWriter, r *http.Request) {
	filename := r.URL.Query().Get("filename")
	fileType := r.URL.Query().Get("type")

	if filename == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing filename", "filename parameter is required")
		return
	}

	if fileType == "" {
		fileType = "document" // default
	}

	// Construct file path
	filePath := filepath.Join("uploads", fileType, filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		utils.SendErrorResponse(w, http.StatusNotFound, "File not found", "")
		return
	}

	// Get file info from database
	db := config.GetDB()
	var fileUpload models.FileUpload
	if err := db.Where("file_name = ?", filename).First(&fileUpload).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusNotFound, "File record not found", "")
		return
	}

	// Set appropriate headers
	w.Header().Set("Content-Type", fileUpload.MimeType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", fileUpload.Filename))
	w.Header().Set("Content-Length", strconv.FormatInt(fileUpload.Size, 10))

	// Serve file
	http.ServeFile(w, r, filePath)
}

// DeleteFile deletes an uploaded file
func DeleteFile(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	fileID := r.URL.Query().Get("id")
	if fileID == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing file ID", "id parameter is required")
		return
	}

	id, err := strconv.Atoi(fileID)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid file ID", err.Error())
		return
	}

	db := config.GetDB()
	var fileUpload models.FileUpload
	if err := db.First(&fileUpload, id).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusNotFound, "File not found", "")
		return
	}

	// Check if user owns the file or is admin
	userRole := r.Header.Get("X-User-Role")
	if userRole != "admin" && fileUpload.UserID != uint(userID) {
		utils.SendErrorResponse(w, http.StatusForbidden, "Access denied", "You can only delete your own files")
		return
	}

	// Delete file from disk
	if err := utils.DeleteFile(fileUpload.Path); err != nil {
		// Log error but continue with database deletion
		fmt.Printf("Warning: Failed to delete file from disk: %v\n", err)
	}

	// Delete file record from database
	if err := db.Delete(&fileUpload).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to delete file record", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "File deleted successfully", nil)
}

// GetUserFiles returns all files uploaded by a user
func GetUserFiles(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	// Get query parameters
	fileType := r.URL.Query().Get("type")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	db := config.GetDB()
	query := db.Where("user_id = ?", userID)

	// Apply filters
	if fileType != "" {
		query = query.Where("file_type = ?", fileType)
	}

	// Apply pagination
	if limit != "" {
		if limitInt, err := strconv.Atoi(limit); err == nil {
			query = query.Limit(limitInt)
		}
	}
	if offset != "" {
		if offsetInt, err := strconv.Atoi(offset); err == nil {
			query = query.Offset(offsetInt)
		}
	}

	var files []models.FileUpload
	if err := query.Order("created_at DESC").Find(&files).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to fetch files", err.Error())
		return
	}

	// Create response with file URLs
	baseURL := getBaseURL(r)
	var response []map[string]interface{}
	for _, file := range files {
		fileData := map[string]interface{}{
			"id":         file.ID,
			"filename":   file.Filename,
			"path":       file.Path,
			"size":       file.Size,
			"mime_type":  file.MimeType,
			"user_id":    file.UserID,
			"created_at": file.CreatedAt,
			"file_url":   fmt.Sprintf("%s/uploads/%s", baseURL, file.Filename),
		}
		response = append(response, fileData)
	}

	utils.SendSuccessResponse(w, "Files retrieved successfully", response)
}

// getBaseURL extracts base URL from request
func getBaseURL(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s", scheme, r.Host)
}