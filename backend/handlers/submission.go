package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"lms-backend/middleware"
	"lms-backend/models"
)

// CreatePostWorkSubmissionHandler handles postwork submissions
func (h *Handler) CreatePostWorkSubmissionHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("[DEBUG] CreatePostWorkSubmissionHandler called\n")
	
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		fmt.Printf("[DEBUG] User context error: %v\n", err)
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}
	fmt.Printf("[DEBUG] UserID: %d\n", userID)

	var req models.SubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("[DEBUG] JSON decode error: %v\n", err)
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Printf("[DEBUG] Request: CourseID=%d, LessonID=%v, Title=%s, Content=%s\n", req.CourseID, req.LessonID, req.Title, req.Content)

	// Validate required fields
	if req.CourseID == 0 || req.Title == "" || req.Content == "" {
		fmt.Printf("[DEBUG] Missing required fields: CourseID=%d, Title='%s', Content='%s'\n", req.CourseID, req.Title, req.Content)
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// For PostWork submissions, lessonId can be null
	// But if provided, it should be valid
	if req.LessonID != nil && *req.LessonID <= 0 {
		fmt.Printf("[DEBUG] Invalid lesson ID: %d\n", *req.LessonID)
		http.Error(w, "Invalid lesson ID", http.StatusBadRequest)
		return
	}

	// Check if user is enrolled in the course
	var enrolled bool
	err = h.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM course_enrollments WHERE user_id = $1 AND course_id = $2)", userID, req.CourseID).Scan(&enrolled)
	if err != nil {
		fmt.Printf("[DEBUG] Database error checking enrollment: %v\n", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !enrolled {
		fmt.Printf("[DEBUG] User %d not enrolled in course %d\n", userID, req.CourseID)
		http.Error(w, "User not enrolled in this course", http.StatusForbidden)
		return
	}
	fmt.Printf("[DEBUG] User enrolled in course, proceeding with submission creation\n")

	// Create the submission
	submission, err := models.CreatePostWorkSubmission(h.DB, userID, req)
	if err != nil {
		fmt.Printf("[DEBUG] Error creating submission: %v\n", err)
		http.Error(w, "Failed to create submission", http.StatusInternalServerError)
		return
	}
	fmt.Printf("[DEBUG] Submission created successfully: %+v\n", submission)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Submission created successfully",
		"data":    submission,
	})
}

// GetPostWorkSubmissionsHandler gets postwork submissions for a user
func (h *Handler) GetPostWorkSubmissionsHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Check if courseId is provided as a query parameter
	courseIDStr := r.URL.Query().Get("courseId")
	var courseID *int
	if courseIDStr != "" {
		id, err := strconv.Atoi(courseIDStr)
		if err != nil {
			http.Error(w, "Invalid course ID", http.StatusBadRequest)
			return
		}
		courseID = &id

		// Validate that user is enrolled in the course
		enrolled, err := models.IsUserEnrolledInCourse(h.DB, userID, *courseID)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		if !enrolled {
			http.Error(w, "User not enrolled in course", http.StatusForbidden)
			return
		}
	}

	submissions, err := models.GetPostWorkSubmissions(h.DB, userID, courseID)
	if err != nil {
		http.Error(w, "Failed to get submissions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    submissions,
	})
}

// CreateFinalProjectSubmissionHandler handles final project submissions
func (h *Handler) CreateFinalProjectSubmissionHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	var req models.SubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.CourseID == 0 || req.Title == "" || req.Content == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Validate that user is enrolled in the course
	enrolled, err := models.IsUserEnrolledInCourse(h.DB, userID, req.CourseID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !enrolled {
		http.Error(w, "User not enrolled in course", http.StatusForbidden)
		return
	}

	submission, err := models.CreateFinalProjectSubmission(h.DB, userID, req)
	if err != nil {
		http.Error(w, "Failed to create submission", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Final project submission created successfully",
		"data":    submission,
	})
}

// GetFinalProjectSubmissionHandler gets final project submission for a user and course
func (h *Handler) GetFinalProjectSubmissionHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}
	vars := mux.Vars(r)

	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	// Validate that user is enrolled in the course
	enrolled, err := models.IsUserEnrolledInCourse(h.DB, userID, courseID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !enrolled {
		http.Error(w, "User not enrolled in course", http.StatusForbidden)
		return
	}

	submission, err := models.GetFinalProjectSubmission(h.DB, userID, courseID)
	if err != nil {
		// If no submission found, return empty object instead of error
		if err == sql.ErrNoRows {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"data":    nil,
			})
			return
		}
		http.Error(w, "Failed to get submission", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    submission,
	})
}

// UploadFileHandler handles file uploads
func (h *Handler) UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	// Parse multipart form with 10 MB max memory
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file from form", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file size (max 5MB)
	if handler.Size > 5<<20 {
		http.Error(w, "File too large (max 5MB)", http.StatusBadRequest)
		return
	}

	// Validate file type
	fileType := getFileType(handler.Filename)
	if fileType == "" {
		http.Error(w, "Unsupported file type", http.StatusBadRequest)
		return
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		http.Error(w, "Failed to create uploads directory", http.StatusInternalServerError)
		return
	}

	// Generate unique filename
	extension := filepath.Ext(handler.Filename)
	newFilename := fmt.Sprintf("%d_%s%s", userID, uuid.New().String(), extension)
	filePath := filepath.Join(uploadsDir, newFilename)

	// Create file
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Failed to create file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy file contents
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	// Save file info to database
	fileUpload, err := models.CreateFileUpload(
		h.DB,
		userID,
		newFilename,
		handler.Filename,
		filePath,
		handler.Size,
		handler.Header.Get("Content-Type"),
		fileType,
	)
	if err != nil {
		http.Error(w, "Failed to save file info", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "File uploaded successfully",
		"data":    fileUpload,
	})
}

// GetFileHandler gets a file by ID
func (h *Handler) GetFileHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	vars := mux.Vars(r)

	fileID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid file ID", http.StatusBadRequest)
		return
	}

	// Get file info from database
	fileUpload, err := models.GetFileUpload(h.DB, fileID)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Check if user owns the file
	if fileUpload.UserID != userID {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	// Open file
	file, err := os.Open(fileUpload.FilePath)
	if err != nil {
		http.Error(w, "Failed to open file", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// Set headers
	w.Header().Set("Content-Type", fileUpload.MimeType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileUpload.OriginalName))

	// Copy file to response
	if _, err := io.Copy(w, file); err != nil {
		http.Error(w, "Failed to send file", http.StatusInternalServerError)
		return
	}
}

// Helper function to determine file type
func getFileType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".svg":
		return "image"
	case ".pdf", ".doc", ".docx", ".txt", ".rtf", ".md":
		return "document"
	case ".mp4", ".avi", ".mov", ".wmv":
		return "video"
	case ".mp3", ".wav", ".ogg":
		return "audio"
	case ".zip", ".rar", ".7z":
		return "archive"
	case ".ppt", ".pptx":
		return "presentation"
	case ".xls", ".xlsx", ".csv":
		return "spreadsheet"
	default:
		return ""
	}
}