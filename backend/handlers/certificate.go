package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"lms-backend/middleware"
	"lms-backend/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type CertificateHandler struct {
	db *sql.DB
}

func NewCertificateHandler(db *sql.DB) *CertificateHandler {
	return &CertificateHandler{db: db}
}

// RequestCertificate creates a certificate request for course completion
func (h *CertificateHandler) RequestCertificate(w http.ResponseWriter, r *http.Request) {
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

	// Check if certificate request already exists
	existingCert, _ := models.GetCertificateForCourse(h.db, userID, courseID)
	if existingCert != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Certificate request already exists",
			"certificate": existingCert,
		})
		return
	}

	// Create certificate request
	err = models.RequestCertificate(h.db, userID, courseID)
	if err != nil {
		http.Error(w, "Failed to create certificate request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Certificate request submitted successfully. Please wait for admin approval.",
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

// GetAllCertificates returns all certificates (admin only)
func (h *CertificateHandler) GetAllCertificates(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}

	// Check if user is admin
	user, err := models.GetUserByID(h.db, userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if user.Role != "admin" {
		http.Error(w, "Access denied. Admin role required.", http.StatusForbidden)
		return
	}

	certificates, err := models.GetAllCertificates(h.db)
	if err != nil {
		http.Error(w, "Failed to get certificates", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"certificates": certificates,
	})
}

// GetPendingCertificates returns all pending certificates (admin only)
func (h *CertificateHandler) GetPendingCertificates(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}

	// Check if user is admin
	user, err := models.GetUserByID(h.db, userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if user.Role != "admin" {
		http.Error(w, "Access denied. Admin role required.", http.StatusForbidden)
		return
	}

	certificates, err := models.GetPendingCertificates(h.db)
	if err != nil {
		http.Error(w, "Failed to get pending certificates", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"certificates": certificates,
	})
}

// ApproveCertificate approves a pending certificate (admin only)
func (h *CertificateHandler) ApproveCertificate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	certIDStr := vars["certId"]
	certID, err := strconv.Atoi(certIDStr)
	if err != nil {
		http.Error(w, "Invalid certificate ID", http.StatusBadRequest)
		return
	}

	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}

	// Check if user is admin
	user, err := models.GetUserByID(h.db, userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if user.Role != "admin" {
		http.Error(w, "Access denied. Admin role required.", http.StatusForbidden)
		return
	}

	err = models.ApproveCertificate(h.db, certID, userID)
	if err != nil {
		http.Error(w, "Failed to approve certificate", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Certificate approved successfully",
	})
}

// RejectCertificate rejects a pending certificate (admin only)
func (h *CertificateHandler) RejectCertificate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	certIDStr := vars["certId"]
	certID, err := strconv.Atoi(certIDStr)
	if err != nil {
		http.Error(w, "Invalid certificate ID", http.StatusBadRequest)
		return
	}

	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}

	// Check if user is admin
	user, err := models.GetUserByID(h.db, userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if user.Role != "admin" {
		http.Error(w, "Access denied. Admin role required.", http.StatusForbidden)
		return
	}

	// Parse request body for rejection reason
	var requestBody struct {
		Reason string `json:"reason"`
	}

	err = json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = models.RejectCertificate(h.db, certID, userID, requestBody.Reason)
	if err != nil {
		http.Error(w, "Failed to reject certificate", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Certificate rejected successfully",
	})
}