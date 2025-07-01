package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"lms-backend/config"
	"lms-backend/models"
	"lms-backend/utils"
)

// GenerateCertificate generates a certificate for completed course
func GenerateCertificate(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	db := config.GetDB()

	// Check if user completed the course
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Enrollment not found", "User is not enrolled in this course")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if course is completed
	if enrollment.Progress < 100 || enrollment.CompletedAt == nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Course not completed", "User must complete the course to generate certificate")
		return
	}

	// Get user and course details
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to get user details", err.Error())
		return
	}

	var course models.Course
	if err := db.First(&course, courseID).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to get course details", err.Error())
		return
	}

	// Check if certificate already exists
	var existingCert models.Certificate
	if err := db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&existingCert).Error; err == nil {
		utils.SendSuccessResponse(w, "Certificate already exists", existingCert)
		return
	}

	// Calculate final grade (average of quiz scores, post-work, and final project)
	finalGrade := calculateFinalGrade(db, uint(userID), uint(courseID))

	// Generate certificate number
	certNumber := fmt.Sprintf("CERT-%d-%d-%d", courseID, userID, time.Now().Unix())

	// Create certificate
	certificate := models.Certificate{
		UserID:            uint(userID),
		CourseID:          uint(courseID),
		CertificateNumber: certNumber,
		Grade:             fmt.Sprintf("%.1f", finalGrade),
		CompletionDate:    *enrollment.CompletedAt,
		IssueDate:         time.Now(),
	}

	if err := db.Create(&certificate).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to generate certificate", err.Error())
		return
	}

	utils.SendCreatedResponse(w, "Certificate generated successfully", certificate)
}

// GetUserCertificates returns all certificates for a user
func GetUserCertificates(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	db := config.GetDB()
	var certificates []models.Certificate
	if err := db.Preload("Course").Where("user_id = ?", userID).Find(&certificates).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to fetch certificates", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Certificates retrieved successfully", certificates)
}

// GetCertificate returns a specific certificate
func GetCertificate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	certID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid certificate ID", err.Error())
		return
	}

	db := config.GetDB()
	var certificate models.Certificate
	if err := db.Preload("User").Preload("Course").First(&certificate, certID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Certificate not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if user owns this certificate or is admin
	userIDStr := r.Header.Get("X-User-ID")
	userRole := r.Header.Get("X-User-Role")
	userID, _ := strconv.Atoi(userIDStr)

	if userRole != "admin" && certificate.UserID != uint(userID) {
		utils.SendErrorResponse(w, http.StatusForbidden, "Access denied", "You can only view your own certificates")
		return
	}

	utils.SendSuccessResponse(w, "Certificate retrieved successfully", certificate)
}

// VerifyCertificate verifies a certificate by certificate number
func VerifyCertificate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	certNumber := vars["certNumber"]

	if certNumber == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing certificate number", "Certificate number is required")
		return
	}

	db := config.GetDB()
	var certificate models.Certificate
	if err := db.Preload("User").Preload("Course").Where("certificate_number = ?", certNumber).First(&certificate).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Certificate not found", "Invalid certificate number")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Remove sensitive user information
	certificate.User.Password = ""
	certificate.User.Email = ""

	response := map[string]interface{}{
		"valid":       true,
		"certificate": certificate,
	}

	utils.SendSuccessResponse(w, "Certificate verified successfully", response)
}

// calculateFinalGrade calculates the final grade for a user in a course
func calculateFinalGrade(db *gorm.DB, userID, courseID uint) float64 {
	// Get quiz scores
	var quizAttempts []models.QuizAttempt
	db.Joins("JOIN quizzes ON quiz_attempts.quiz_id = quizzes.id").Where("quiz_attempts.user_id = ? AND quizzes.course_id = ?", userID, courseID).Find(&quizAttempts)

	quizScore := 0.0
	if len(quizAttempts) > 0 {
		totalScore := 0
		for _, attempt := range quizAttempts {
			totalScore += attempt.Score
		}
		quizScore = float64(totalScore) / float64(len(quizAttempts))
	}

	// Get post-work grade
	// Get post-work submission grade
	postWorkScore := 0.0
	var postWorkSubmission models.Submission
	if err := db.Where("user_id = ? AND course_id = ? AND type = ?", userID, courseID, "postwork").First(&postWorkSubmission).Error; err == nil {
		if postWorkSubmission.Grade != nil {
			postWorkScore = float64(*postWorkSubmission.Grade)
		}
	}

	// Get final project submission grade
	finalProjectScore := 0.0
	var finalProjectSubmission models.Submission
	if err := db.Where("user_id = ? AND course_id = ? AND type = ?", userID, courseID, "finalproject").First(&finalProjectSubmission).Error; err == nil {
		if finalProjectSubmission.Grade != nil {
			finalProjectScore = float64(*finalProjectSubmission.Grade)
		}
	}

	// Calculate weighted average (30% quiz, 30% post-work, 40% final project)
	finalGrade := (quizScore * 0.3) + (postWorkScore * 0.3) + (finalProjectScore * 0.4)

	// If some components are missing, adjust weights
	components := 0
	totalWeight := 0.0
	weightedSum := 0.0

	if len(quizAttempts) > 0 {
		components++
		totalWeight += 0.3
		weightedSum += quizScore * 0.3
	}
	if postWorkSubmission.Grade != nil {
		components++
		totalWeight += 0.3
		weightedSum += postWorkScore * 0.3
	}
	if finalProjectSubmission.Grade != nil {
		components++
		totalWeight += 0.4
		weightedSum += finalProjectScore * 0.4
	}

	if totalWeight > 0 {
		finalGrade = weightedSum / totalWeight * (1.0 / totalWeight)
		if finalGrade > 100 {
			finalGrade = 100
		}
	} else {
		finalGrade = 0
	}

	return finalGrade
}