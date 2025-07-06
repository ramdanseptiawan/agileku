package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"lms-backend/middleware"
	"lms-backend/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/google/uuid"
)

type CertificateHandler struct {
	db *sql.DB
}

func NewCertificateHandler(db *sql.DB) *CertificateHandler {
	return &CertificateHandler{db: db}
}

// GenerateCertificate generates a certificate for course completion
func (h *CertificateHandler) GenerateCertificate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseIDStr := vars["courseId"]
	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}

	// Check if user is enrolled in the course
	enrolled, err := models.IsUserEnrolledInCourse(h.db, userID, courseID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !enrolled {
		http.Error(w, "User not enrolled in this course", http.StatusForbidden)
		return
	}

	// Check course completion status from course_progress table
	courseProgress, err := models.GetCourseProgress(h.db, userID, courseID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Course progress not found. Please complete the course first.",
			"error": "COURSE_NOT_STARTED",
		})
		return
	}

	// Validate course completion (100% progress required)
	if courseProgress.OverallProgress < 100 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("Course not completed. Current progress: %d%%. Please complete all course requirements.", courseProgress.OverallProgress),
			"error": "COURSE_NOT_COMPLETED",
			"currentProgress": courseProgress.OverallProgress,
			"requiredProgress": 100,
		})
		return
	}

	// Check if certificate already exists
	existingCert, _ := models.GetCertificateForCourse(h.db, userID, courseID)
	if existingCert != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Certificate already exists",
			"certificate": existingCert,
		})
		return
	}

	// Get user and course information
	user, err := models.GetUserByID(h.db, userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	course, err := models.GetCourseByID(h.db, courseID)
	if err != nil {
		http.Error(w, "Course not found", http.StatusNotFound)
		return
	}

	// Generate certificate number
	certNumber := fmt.Sprintf("CERT-%s-%d-%d", uuid.New().String()[:8], courseID, userID)

	// Create certificate
	cert := &models.Certificate{
		UserID:         userID,
		CourseID:       courseID,
		CertNumber:     certNumber,
		UserName:       user.FullName,
		CourseName:     course.Title,
		Instructor:     course.Instructor,
		CompletionDate: time.Now(),
		IssuedAt:       time.Now(),
	}

	err = models.CreateCertificate(h.db, cert)
	if err != nil {
		http.Error(w, "Failed to create certificate", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Certificate generated successfully",
		"certificate": cert,
	})
}

// VerifyCertificate verifies a certificate by certificate number
func (h *CertificateHandler) VerifyCertificate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	certNumber := vars["certNumber"]

	if certNumber == "" {
		http.Error(w, "Certificate number is required", http.StatusBadRequest)
		return
	}

	verification, err := models.VerifyCertificate(h.db, certNumber)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(verification)
}

// GetUserCertificates gets all certificates for the authenticated user
func (h *CertificateHandler) GetUserCertificates(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}

	certificates, err := models.GetUserCertificates(h.db, userID)
	if err != nil {
		http.Error(w, "Failed to get certificates", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"certificates": certificates,
	})
}

// GetAllCertificates gets all certificates (admin only)
func (h *CertificateHandler) GetAllCertificates(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT id, user_id, course_id, cert_number, user_name, course_name, instructor,
		       completion_date, issued_at, created_at, updated_at
		FROM certificates
		ORDER BY issued_at DESC
	`

	rows, err := h.db.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var certificates []models.Certificate
	for rows.Next() {
		var cert models.Certificate
		err := rows.Scan(
			&cert.ID, &cert.UserID, &cert.CourseID, &cert.CertNumber, &cert.UserName,
			&cert.CourseName, &cert.Instructor, &cert.CompletionDate, &cert.IssuedAt,
			&cert.CreatedAt, &cert.UpdatedAt,
		)
		if err != nil {
			http.Error(w, "Database scan error", http.StatusInternalServerError)
			return
		}
		certificates = append(certificates, cert)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"certificates": certificates,
	})
}