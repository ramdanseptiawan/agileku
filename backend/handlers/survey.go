package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"lms-backend/middleware"

	"github.com/gorilla/mux"
)

// SurveyHandler handles survey-related operations
type SurveyHandler struct {
	DB *sql.DB
}

// NewSurveyHandler creates a new survey handler
func NewSurveyHandler(db *sql.DB) *SurveyHandler {
	return &SurveyHandler{DB: db}
}

// SurveyFeedback represents survey feedback data
type SurveyFeedback struct {
	ID             int       `json:"id"`
	UserID         int       `json:"user_id"`
	CourseID       int       `json:"course_id"`
	Rating         int       `json:"rating"`
	Difficulty     int       `json:"difficulty"`
	Clarity        int       `json:"clarity"`
	Usefulness     int       `json:"usefulness"`
	Feedback       string    `json:"feedback"`
	PostTestScore  int       `json:"post_test_score"`
	PostTestPassed bool      `json:"post_test_passed"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// SurveyFeedbackRequest represents the request payload for survey feedback
type SurveyFeedbackRequest struct {
	CourseID       int    `json:"course_id"`
	Rating         int    `json:"rating"`
	Difficulty     int    `json:"difficulty"`
	Clarity        int    `json:"clarity"`
	Usefulness     int    `json:"usefulness"`
	Feedback       string `json:"feedback"`
	PostTestScore  int    `json:"post_test_score"`
	PostTestPassed bool   `json:"post_test_passed"`
}

// Helper function to respond with JSON
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

// Helper function to respond with error
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

// SubmitSurveyFeedbackHandler handles survey feedback submission
func (h *SurveyHandler) SubmitSurveyFeedbackHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	// Parse request body
	var request SurveyFeedbackRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if request.CourseID <= 0 {
		respondWithError(w, http.StatusBadRequest, "Course ID is required")
		return
	}

	if request.Rating < 1 || request.Rating > 5 {
		respondWithError(w, http.StatusBadRequest, "Rating must be between 1 and 5")
		return
	}

	// Validate optional rating fields
	if request.Difficulty < 0 || request.Difficulty > 5 {
		request.Difficulty = 0
	}
	if request.Clarity < 0 || request.Clarity > 5 {
		request.Clarity = 0
	}
	if request.Usefulness < 0 || request.Usefulness > 5 {
		request.Usefulness = 0
	}

	// Check if user is enrolled in the course
	enrolled, err := h.isUserEnrolledInCourse(userID, request.CourseID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error checking enrollment")
		return
	}

	if !enrolled {
		respondWithError(w, http.StatusForbidden, "User is not enrolled in this course")
		return
	}

	// Create survey feedback
	feedback, err := h.createSurveyFeedback(userID, request)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error creating survey feedback")
		return
	}

	// Return success response
	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"success": true,
		"message": "Survey feedback submitted successfully",
		"data":    feedback,
	})
}

// GetSurveyFeedbackHandler gets survey feedback for a specific course
func (h *SurveyHandler) GetSurveyFeedbackHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "User not found in context")
		return
	}

	// Get course ID from URL parameters
	vars := mux.Vars(r)
	courseIDStr, exists := vars["courseId"]
	if !exists {
		respondWithError(w, http.StatusBadRequest, "Course ID is required")
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid course ID")
		return
	}

	// Check if user is enrolled in the course
	enrolled, err := h.isUserEnrolledInCourse(userID, courseID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error checking enrollment")
		return
	}

	if !enrolled {
		respondWithError(w, http.StatusForbidden, "User is not enrolled in this course")
		return
	}

	// Get survey feedback
	feedback, err := h.getSurveyFeedbackByCourse(userID, courseID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error retrieving survey feedback")
		return
	}

	if feedback == nil {
		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"message": "No survey feedback found",
			"data":    nil,
		})
		return
	}

	// Return survey feedback
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    feedback,
	})
}

// GetAllSurveyFeedbackHandler gets all survey feedback for a course (admin only)
func (h *SurveyHandler) GetAllSurveyFeedbackHandler(w http.ResponseWriter, r *http.Request) {
	// Get user role from context (assuming role is set in middleware)
	userRole, ok := r.Context().Value("userRole").(string)
	if !ok || userRole != "admin" {
		respondWithError(w, http.StatusForbidden, "Admin access required")
		return
	}

	// Get course ID from URL parameters
	vars := mux.Vars(r)
	courseIDStr, exists := vars["courseId"]
	if !exists {
		respondWithError(w, http.StatusBadRequest, "Course ID is required")
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid course ID")
		return
	}

	// Get all survey feedback for the course
	feedbacks, err := h.getAllSurveyFeedback(courseID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error retrieving survey feedback")
		return
	}

	// Return survey feedback
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    feedbacks,
	})
}

// Helper method to check if user is enrolled in course
func (h *SurveyHandler) isUserEnrolledInCourse(userID, courseID int) (bool, error) {
	query := `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND course_id = $2`
	var count int
	err := h.DB.QueryRow(query, userID, courseID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Helper method to create survey feedback
func (h *SurveyHandler) createSurveyFeedback(userID int, request SurveyFeedbackRequest) (*SurveyFeedback, error) {
	query := `
		INSERT INTO survey_feedback 
		(user_id, course_id, rating, difficulty, clarity, usefulness, feedback, post_test_score, post_test_passed, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		ON CONFLICT (user_id, course_id) DO UPDATE SET
		rating = EXCLUDED.rating,
		difficulty = EXCLUDED.difficulty,
		clarity = EXCLUDED.clarity,
		usefulness = EXCLUDED.usefulness,
		feedback = EXCLUDED.feedback,
		post_test_score = EXCLUDED.post_test_score,
		post_test_passed = EXCLUDED.post_test_passed,
		updated_at = NOW()
		RETURNING id, user_id, course_id, rating, difficulty, clarity, usefulness, feedback, post_test_score, post_test_passed, created_at, updated_at
	`
	
	feedback := &SurveyFeedback{}
	err := h.DB.QueryRow(query, userID, request.CourseID, request.Rating, request.Difficulty, 
		request.Clarity, request.Usefulness, request.Feedback, request.PostTestScore, request.PostTestPassed).Scan(
		&feedback.ID, &feedback.UserID, &feedback.CourseID, &feedback.Rating,
		&feedback.Difficulty, &feedback.Clarity, &feedback.Usefulness,
		&feedback.Feedback, &feedback.PostTestScore, &feedback.PostTestPassed,
		&feedback.CreatedAt, &feedback.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	
	return feedback, nil
}

// Helper method to get survey feedback by course
func (h *SurveyHandler) getSurveyFeedbackByCourse(userID, courseID int) (*SurveyFeedback, error) {
	query := `
		SELECT id, user_id, course_id, rating, difficulty, clarity, usefulness, 
		       feedback, post_test_score, post_test_passed, created_at, updated_at
		FROM survey_feedback 
		WHERE user_id = $1 AND course_id = $2
	`
	
	feedback := &SurveyFeedback{}
	err := h.DB.QueryRow(query, userID, courseID).Scan(
		&feedback.ID, &feedback.UserID, &feedback.CourseID, &feedback.Rating,
		&feedback.Difficulty, &feedback.Clarity, &feedback.Usefulness,
		&feedback.Feedback, &feedback.PostTestScore, &feedback.PostTestPassed,
		&feedback.CreatedAt, &feedback.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	
	return feedback, nil
}

// Helper method to get all survey feedback for a course
func (h *SurveyHandler) getAllSurveyFeedback(courseID int) ([]*SurveyFeedback, error) {
	query := `
		SELECT id, user_id, course_id, rating, difficulty, clarity, usefulness, 
		       feedback, post_test_score, post_test_passed, created_at, updated_at
		FROM survey_feedback 
		WHERE course_id = $1
		ORDER BY created_at DESC
	`
	
	rows, err := h.DB.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var feedbacks []*SurveyFeedback
	for rows.Next() {
		feedback := &SurveyFeedback{}
		err := rows.Scan(
			&feedback.ID, &feedback.UserID, &feedback.CourseID, &feedback.Rating,
			&feedback.Difficulty, &feedback.Clarity, &feedback.Usefulness,
			&feedback.Feedback, &feedback.PostTestScore, &feedback.PostTestPassed,
			&feedback.CreatedAt, &feedback.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		feedbacks = append(feedbacks, feedback)
	}
	
	return feedbacks, nil
}