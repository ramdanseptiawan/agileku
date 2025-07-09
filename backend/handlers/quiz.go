package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"lms-backend/middleware"
	"lms-backend/models"
)

// GetQuizHandler gets a quiz by ID
func (h *Handler) GetQuizHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}
	vars := mux.Vars(r)

	quizID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	quiz, err := models.GetQuizByID(h.DB, quizID)
	if err != nil {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	// Validate that user is enrolled in the course
	enrolled, err := models.IsUserEnrolledInCourse(h.DB, userID, quiz.CourseID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !enrolled {
		http.Error(w, "User not enrolled in course", http.StatusForbidden)
		return
	}

	// Hide correct answers and explanations from questions
	var questions []map[string]interface{}
	if err := json.Unmarshal(quiz.Questions, &questions); err == nil {
		for i := range questions {
			delete(questions[i], "correctAnswer")
			delete(questions[i], "explanation")
		}
		quiz.Questions, _ = json.Marshal(questions)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    quiz,
	})
}

// GetQuizzesByCourseHandler gets all quizzes for a course
func (h *Handler) GetQuizzesByCourseHandler(w http.ResponseWriter, r *http.Request) {
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

	quizzes, err := models.GetQuizzesByCourse(h.DB, courseID)
	if err != nil {
		http.Error(w, "Failed to get quizzes", http.StatusInternalServerError)
		return
	}

	// Hide correct answers and explanations from all quizzes
	for i := range quizzes {
		var questions []map[string]interface{}
		if err := json.Unmarshal(quizzes[i].Questions, &questions); err == nil {
			for j := range questions {
				delete(questions[j], "correctAnswer")
				delete(questions[j], "explanation")
			}
			quizzes[i].Questions, _ = json.Marshal(questions)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    quizzes,
	})
}

// StartQuizAttemptHandler starts a new quiz attempt
func (h *Handler) StartQuizAttemptHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		log.Printf("[ERROR] StartQuizAttempt - User not found in context: %v", err)
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}
	vars := mux.Vars(r)

	quizID, err := strconv.Atoi(vars["quizId"])
	if err != nil {
		log.Printf("[ERROR] StartQuizAttempt - Invalid quiz ID: %v", err)
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	log.Printf("[DEBUG] StartQuizAttempt - UserID: %d, QuizID: %d", userID, quizID)

	// Get quiz to validate course enrollment
	quiz, err := models.GetQuizByID(h.DB, quizID)
	if err != nil {
		log.Printf("[ERROR] StartQuizAttempt - Quiz not found: %v", err)
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	log.Printf("[DEBUG] StartQuizAttempt - Found quiz: %+v", quiz)

	// Validate that user is enrolled in the course
	enrolled, err := models.IsUserEnrolledInCourse(h.DB, userID, quiz.CourseID)
	if err != nil {
		log.Printf("[ERROR] StartQuizAttempt - Database error checking enrollment: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !enrolled {
		log.Printf("[ERROR] StartQuizAttempt - User %d not enrolled in course %d", userID, quiz.CourseID)
		http.Error(w, "User not enrolled in course", http.StatusForbidden)
		return
	}

	log.Printf("[DEBUG] StartQuizAttempt - User enrolled, starting attempt...")

	attempt, err := models.StartQuizAttempt(h.DB, userID, quizID)
	if err != nil {
		log.Printf("[ERROR] StartQuizAttempt - Failed to start quiz attempt: %v", err)
		http.Error(w, "Failed to start quiz attempt", http.StatusInternalServerError)
		return
	}

	log.Printf("[DEBUG] StartQuizAttempt - Successfully created attempt: %+v", attempt)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Quiz attempt started successfully",
		"data":    attempt,
	})
}

// SubmitQuizHandler submits a quiz attempt
func (h *Handler) SubmitQuizHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		AttemptID int             `json:"attemptId"`
		Answers   json.RawMessage `json:"answers"`
		TimeSpent int             `json:"timeSpent"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	result, err := models.SubmitQuizAttempt(h.DB, req.AttemptID, req.Answers, req.TimeSpent)
	if err != nil {
		http.Error(w, "Failed to submit quiz", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Quiz submitted successfully",
		"data":    result,
	})
}

// GetQuizAttemptsHandler gets quiz attempts for a user
func (h *Handler) GetQuizAttemptsHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}
	vars := mux.Vars(r)

	quizID, err := strconv.Atoi(vars["quizId"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	// Get quiz to validate course enrollment
	quiz, err := models.GetQuizByID(h.DB, quizID)
	if err != nil {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	// Validate that user is enrolled in the course
	enrolled, err := models.IsUserEnrolledInCourse(h.DB, userID, quiz.CourseID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !enrolled {
		http.Error(w, "User not enrolled in course", http.StatusForbidden)
		return
	}

	attempts, err := models.GetQuizAttempts(h.DB, userID, quizID)
	if err != nil {
		http.Error(w, "Failed to get quiz attempts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    attempts,
	})
}

// GetPreTestHandler gets the pre-test for a course
func (h *Handler) GetPreTestHandler(w http.ResponseWriter, r *http.Request) {
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

	preTest, err := models.GetQuizByTypeAndCourse(h.DB, courseID, "pretest")
	if err != nil {
		http.Error(w, "Pre-test not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    preTest,
	})
}

// GetPostTestHandler gets the post-test for a course
func (h *Handler) GetPostTestHandler(w http.ResponseWriter, r *http.Request) {
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

	postTest, err := models.GetQuizByTypeAndCourse(h.DB, courseID, "posttest")
	if err != nil {
		http.Error(w, "Post-test not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    postTest,
	})
}

// CreateQuizHandler creates a new quiz (admin only)
func (h *Handler) CreateQuizHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title       string          `json:"title"`
		Description string          `json:"description"`
		CourseID    int             `json:"courseId"`
		QuizType    string          `json:"quizType"`
		Questions   json.RawMessage `json:"questions"`
		TimeLimit   int             `json:"timeLimit"`
		PassingScore int            `json:"passingScore"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate quiz type
	if req.QuizType != "pretest" && req.QuizType != "posttest" && req.QuizType != "lesson" {
		http.Error(w, "Invalid quiz type. Must be 'pretest', 'posttest', or 'lesson'", http.StatusBadRequest)
		return
	}

	quiz := &models.Quiz{
		Title:        req.Title,
		Description:  req.Description,
		CourseID:     req.CourseID,
		QuizType:     req.QuizType,
		Questions:    req.Questions,
		TimeLimit:    req.TimeLimit,
		PassingScore: req.PassingScore,
	}

	if err := models.CreateQuiz(h.DB, quiz); err != nil {
		http.Error(w, "Failed to create quiz: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Quiz created successfully",
		"data":    quiz,
	})
}

// UpdateQuizHandler updates an existing quiz (admin only)
func (h *Handler) UpdateQuizHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	quizID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Title       string          `json:"title"`
		Description string          `json:"description"`
		QuizType    string          `json:"quizType"`
		Questions   json.RawMessage `json:"questions"`
		TimeLimit   int             `json:"timeLimit"`
		PassingScore int            `json:"passingScore"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate quiz type
	if req.QuizType != "pretest" && req.QuizType != "posttest" && req.QuizType != "lesson" {
		http.Error(w, "Invalid quiz type. Must be 'pretest', 'posttest', or 'lesson'", http.StatusBadRequest)
		return
	}

	quiz := &models.Quiz{
		ID:           quizID,
		Title:        req.Title,
		Description:  req.Description,
		QuizType:     req.QuizType,
		Questions:    req.Questions,
		TimeLimit:    req.TimeLimit,
		PassingScore: req.PassingScore,
	}

	if err := models.UpdateQuiz(h.DB, quiz); err != nil {
		http.Error(w, "Failed to update quiz: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Quiz updated successfully",
		"data":    quiz,
	})
}

// DeleteQuizHandler deletes a quiz (admin only)
func (h *Handler) DeleteQuizHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	quizID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	if err := models.DeleteQuiz(h.DB, quizID); err != nil {
		http.Error(w, "Failed to delete quiz: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Quiz deleted successfully",
	})
}

// GetAllQuizzesHandler gets all quizzes (admin only)
func (h *Handler) GetAllQuizzesHandler(w http.ResponseWriter, r *http.Request) {
	quizzes, err := models.GetAllQuizzes(h.DB)
	if err != nil {
		http.Error(w, "Failed to get quizzes: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    quizzes,
	})
}