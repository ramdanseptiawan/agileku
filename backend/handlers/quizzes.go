package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"lms-backend/config"
	"lms-backend/models"
	"lms-backend/utils"
)

// QuizSubmissionRequest represents quiz submission
type QuizSubmissionRequest struct {
	QuizID  uint                `json:"quiz_id"`
	Answers []QuizAnswerRequest `json:"answers"`
}

// QuizAnswerRequest represents individual answer
type QuizAnswerRequest struct {
	QuestionID     uint   `json:"question_id"`
	SelectedAnswer string `json:"selected_answer"`
}

// SurveySubmissionRequest represents survey submission
type SurveySubmissionRequest struct {
	CourseID     uint   `json:"course_id"`
	Satisfaction int    `json:"satisfaction"`     // 1-5 scale
	Difficulty   int    `json:"difficulty"`       // 1-5 scale
	Usefulness   int    `json:"usefulness"`       // 1-5 scale
	Feedback     string `json:"feedback"`         // text feedback
}

// GetQuiz returns a quiz by ID
func GetQuiz(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid quiz ID", err.Error())
		return
	}

	db := config.GetDB()
	var quiz models.Quiz
	if err := db.Preload("Questions").First(&quiz, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Quiz not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	utils.SendSuccessResponse(w, "Quiz retrieved successfully", quiz)
}

// GetCourseQuizzes returns all quizzes for a course
func GetCourseQuizzes(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	db := config.GetDB()
	var quizzes []models.Quiz
	if err := db.Preload("Questions").Where("course_id = ?", courseID).Find(&quizzes).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to fetch quizzes", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Quizzes retrieved successfully", quizzes)
}

// SubmitQuiz handles quiz submission
func SubmitQuiz(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	var req QuizSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	db := config.GetDB()

	// Get quiz with questions
	var quiz models.Quiz
	if err := db.Preload("Questions").First(&quiz, req.QuizID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Quiz not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if user is enrolled in the course
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, quiz.CourseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusForbidden, "Not enrolled", "User is not enrolled in this course")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Calculate score
	correctAnswers := 0
	totalQuestions := len(quiz.Questions)

	// Create answer map for quick lookup
	answerMap := make(map[uint]string)
	for _, answer := range req.Answers {
		answerMap[answer.QuestionID] = answer.SelectedAnswer
	}

	// Check answers
	for _, question := range quiz.Questions {
		if userAnswer, exists := answerMap[question.ID]; exists {
			// Convert user answer to int and compare with correct answer index
			if userAnswerInt, err := strconv.Atoi(userAnswer); err == nil {
				if userAnswerInt == question.Correct {
					correctAnswers++
				}
			}
		}
	}

	score := 0
	if totalQuestions > 0 {
		score = (correctAnswers * 100) / totalQuestions
	}

	// Convert answers to JSON
	answersJSON, err := json.Marshal(req.Answers)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to process answers", err.Error())
		return
	}

	// Create quiz attempt record
	attempt := models.QuizAttempt{
		UserID:    uint(userID),
		QuizID:    req.QuizID,
		Answers:   string(answersJSON),
		Score:     score,
		MaxScore:  totalQuestions,
		AttemptAt: time.Now(),
		Passed:    score >= 70, // 70% passing score
	}

	if err := db.Create(&attempt).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to save quiz attempt", err.Error())
		return
	}

	response := map[string]interface{}{
		"attempt_id":      attempt.ID,
		"score":           score,
		"correct_answers": correctAnswers,
		"total_questions": totalQuestions,
		"passed":          score >= 70,
		"submitted_at":    attempt.AttemptAt,
	}

	utils.SendSuccessResponse(w, "Quiz submitted successfully", response)
}

// GetQuizAttempts returns user's quiz attempts
func GetQuizAttempts(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	vars := mux.Vars(r)
	quizID, err := strconv.Atoi(vars["quizId"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid quiz ID", err.Error())
		return
	}

	db := config.GetDB()
	var attempts []models.QuizAttempt
	if err := db.Where("user_id = ? AND quiz_id = ?", userID, quizID).Order("submitted_at DESC").Find(&attempts).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to fetch quiz attempts", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Quiz attempts retrieved successfully", attempts)
}

// SubmitSurvey handles survey submission
func SubmitSurvey(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	var req SurveySubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate survey data
	if req.Satisfaction < 1 || req.Satisfaction > 5 ||
		req.Difficulty < 1 || req.Difficulty > 5 ||
		req.Usefulness < 1 || req.Usefulness > 5 {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid survey data", "Ratings must be between 1 and 5")
		return
	}

	db := config.GetDB()

	// Check if user is enrolled in the course
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, req.CourseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusForbidden, "Not enrolled", "User is not enrolled in this course")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if survey already submitted
	var existingSurvey models.SurveyResponse
	if err := db.Where("user_id = ? AND course_id = ?", userID, req.CourseID).First(&existingSurvey).Error; err == nil {
		utils.SendErrorResponse(w, http.StatusConflict, "Survey already submitted", "User has already submitted survey for this course")
		return
	}

	// Create survey response
	survey := models.SurveyResponse{
		UserID:       uint(userID),
		CourseID:     req.CourseID,
		Satisfaction: req.Satisfaction,
		Difficulty:   req.Difficulty,
		Usefulness:   req.Usefulness,
		Feedback:     req.Feedback,
		Score:        0, // Default score, can be updated later
	}

	if err := db.Create(&survey).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to save survey", err.Error())
		return
	}

	utils.SendCreatedResponse(w, "Survey submitted successfully", survey)
}

// GetCourseSurveys returns all surveys for a course (admin only)
func GetCourseSurveys(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	db := config.GetDB()
	var surveys []models.SurveyResponse
	if err := db.Preload("User").Where("course_id = ?", courseID).Find(&surveys).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to fetch surveys", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Surveys retrieved successfully", surveys)
}