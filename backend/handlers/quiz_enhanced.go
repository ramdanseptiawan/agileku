package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"lms-backend/models"
	"lms-backend/middleware"
)

// Global database variable for enhanced handlers
var db *sql.DB

// SetEnhancedHandlerDB sets the database connection for enhanced handlers
func SetEnhancedHandlerDB(database *sql.DB) {
	db = database
}

// GetQuizEnhancedHandler handles getting a quiz with enhanced structure
func GetQuizEnhancedHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	courseIDStr := vars["courseId"]
	quizType := vars["type"] // pretest or posttest

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid course ID",
		})
		return
	}

	// Validate quiz type
	if quizType != "pretest" && quizType != "posttest" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid quiz type. Must be 'pretest' or 'posttest'",
		})
		return
	}

	// Check if user is enrolled in the course
	isEnrolled, err := models.IsUserEnrolledInCourse(db, userID, courseID)
	if err != nil {
		http.Error(w, "Error checking enrollment", http.StatusInternalServerError)
		return
	}
	if !isEnrolled {
		http.Error(w, "User not enrolled in this course", http.StatusForbidden)
		return
	}

	// Get quiz
	quiz, err := models.GetQuizEnhancedByTypeAndCourse(db, courseID, quizType)
	if err != nil {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	// Remove correct answers and explanations from response for security
	for i := range quiz.Questions {
		quiz.Questions[i].CorrectAnswer = 0
		quiz.Questions[i].Explanation = ""
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    quiz,
	})
}

// StartQuizAttemptEnhancedHandler handles starting a new quiz attempt
func StartQuizAttemptEnhancedHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	courseIDStr := vars["courseId"]
	quizType := vars["type"]

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid course ID",
		})
		return
	}

	// Validate quiz type
	if quizType != "pretest" && quizType != "posttest" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid quiz type",
		})
		return
	}

	// Check enrollment
	isEnrolled, err := models.IsUserEnrolledInCourse(db, userID, courseID)
	if err != nil {
		http.Error(w, "Error checking enrollment", http.StatusInternalServerError)
		return
	}
	if !isEnrolled {
		http.Error(w, "User not enrolled in this course", http.StatusForbidden)
		return
	}

	// Get quiz to get quiz ID
	quiz, err := models.GetQuizEnhancedByTypeAndCourse(db, courseID, quizType)
	if err != nil {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	// Start attempt
	attempt, err := models.StartQuizAttemptEnhanced(db, userID, quiz.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Quiz attempt started successfully",
		"data":    attempt,
	})
}

// SubmitQuizEnhancedHandler handles submitting a quiz attempt
func SubmitQuizEnhancedHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	attemptIDStr := vars["attemptId"]

	attemptID, err := strconv.Atoi(attemptIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid attempt ID",
		})
		return
	}

	// Parse request body
	var submission models.QuizSubmissionEnhanced
	err = json.NewDecoder(r.Body).Decode(&submission)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set attempt ID from URL
	submission.AttemptID = attemptID

	// Verify that the attempt belongs to the authenticated user
	var attemptUserID int
	err = db.QueryRow("SELECT user_id FROM quiz_attempts WHERE id = $1", attemptID).Scan(&attemptUserID)
	if err != nil {
		http.Error(w, "Attempt not found", http.StatusNotFound)
		return
	}
	if attemptUserID != userID {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	// Submit quiz
	result, err := models.SubmitQuizAttemptEnhanced(db, submission)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Quiz submitted successfully",
		"data":    result,
	})
}

// GetQuizAttemptsEnhancedHandler handles getting quiz attempts for a user
func GetQuizAttemptsEnhancedHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	courseIDStr := vars["courseId"]
	quizType := vars["type"]

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid course ID",
		})
		return
	}

	// Validate quiz type
	if quizType != "pretest" && quizType != "posttest" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid quiz type",
		})
		return
	}

	// Check enrollment
	isEnrolled, err := models.IsUserEnrolledInCourse(db, userID, courseID)
	if err != nil {
		http.Error(w, "Error checking enrollment", http.StatusInternalServerError)
		return
	}
	if !isEnrolled {
		http.Error(w, "User not enrolled in this course", http.StatusForbidden)
		return
	}

	// Get quiz to get quiz ID
	quiz, err := models.GetQuizEnhancedByTypeAndCourse(db, courseID, quizType)
	if err != nil {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	// Get attempts
	attempts, err := models.GetQuizAttemptsEnhanced(db, userID, quiz.ID)
	if err != nil {
		http.Error(w, "Error getting attempts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    attempts,
	})
}

// GetQuizResultEnhancedHandler handles getting detailed quiz result
func GetQuizResultEnhancedHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	attemptIDStr := vars["attemptId"]

	attemptID, err := strconv.Atoi(attemptIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid attempt ID",
		})
		return
	}

	// Verify that the attempt belongs to the authenticated user and is completed
	var attemptUserID int
	var completed bool
	err = db.QueryRow("SELECT user_id, completed FROM quiz_attempts WHERE id = $1", attemptID).Scan(&attemptUserID, &completed)
	if err != nil {
		http.Error(w, "Attempt not found", http.StatusNotFound)
		return
	}
	if attemptUserID != userID {
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}
	if !completed {
		http.Error(w, "Attempt not completed yet", http.StatusBadRequest)
		return
	}

	// Get detailed result with correct answers and explanations
	query := `
	SELECT qa.id, qa.score, qa.time_spent, qa.attempt_number, qa.passed, qa.answers,
	       q.questions, q.max_attempts, q.passing_score
	FROM quiz_attempts qa
	JOIN quizzes q ON qa.quiz_id = q.id
	WHERE qa.id = $1
	`
	row := db.QueryRow(query, attemptID)

	var result models.QuizResultEnhanced
	var answersJSON, questionsJSON []byte
	var maxAttempts, passingScore int

	err = row.Scan(&result.AttemptID, &result.Score, &result.TimeSpent, &result.AttemptNumber, 
		&result.Passed, &answersJSON, &questionsJSON, &maxAttempts, &passingScore)
	if err != nil {
		http.Error(w, "Error getting result", http.StatusInternalServerError)
		return
	}

	// Parse answers
	err = json.Unmarshal(answersJSON, &result.Answers)
	if err != nil {
		result.Answers = make(map[string]interface{})
	}

	// Parse questions to get correct answers and explanations
	var questions []models.QuizQuestion
	err = json.Unmarshal(questionsJSON, &questions)
	if err != nil {
		http.Error(w, "Error parsing questions", http.StatusInternalServerError)
		return
	}

	// Build correct answers and explanations maps
	result.CorrectAnswers = make(map[string]int)
	result.Explanations = make(map[string]string)
	correctCount := 0

	for _, question := range questions {
		questionIDStr := fmt.Sprintf("%d", question.ID)
		result.CorrectAnswers[questionIDStr] = question.CorrectAnswer
		result.Explanations[questionIDStr] = question.Explanation
		
		// Count correct answers
		if userAnswer, exists := result.Answers[questionIDStr]; exists {
			if userAnswerInt, ok := userAnswer.(float64); ok {
				if int(userAnswerInt) == question.CorrectAnswer {
					correctCount++
				}
			}
		}
	}

	result.CorrectCount = correctCount
	result.TotalCount = len(questions)

	// Check if can retake
	var totalAttempts int
	err = db.QueryRow("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = (SELECT quiz_id FROM quiz_attempts WHERE id = $2)", 
		userID, attemptID).Scan(&totalAttempts)
	if err != nil {
		totalAttempts = maxAttempts // Assume max reached on error
	}

	result.CanRetake = totalAttempts < maxAttempts && !result.Passed

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    result,
	})
}