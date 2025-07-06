package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"lms-backend/middleware"
	"lms-backend/models"
)

// UpdateLessonProgressHandler handles lesson progress updates
func (h *Handler) UpdateLessonProgressHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	var req struct {
		CourseID     int  `json:"courseId"`
		LessonID     int  `json:"lessonId"`
		Progress     int  `json:"progress"`
		Completed    bool `json:"completed"`
		TimeSpent    int  `json:"timeSpent"`
		LastPosition int  `json:"lastPosition"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
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

	// Update lesson progress
	err = models.UpdateLessonProgress(h.DB, userID, req.CourseID, req.LessonID, req.Progress, req.TimeSpent, req.Completed)
	if err != nil {
		http.Error(w, "Failed to update lesson progress", http.StatusInternalServerError)
		return
	}

	// Update course progress
	err = models.UpdateCourseProgress(h.DB, userID, req.CourseID)
	if err != nil {
		http.Error(w, "Failed to update course progress", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Lesson progress updated successfully",
	})
}

// GetLessonProgressHandler gets lesson progress for a user
func (h *Handler) GetLessonProgressHandler(w http.ResponseWriter, r *http.Request) {
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

	lessonID, err := strconv.Atoi(vars["lessonId"])
	if err != nil {
		http.Error(w, "Invalid lesson ID", http.StatusBadRequest)
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

	progress, err := models.GetLessonProgress(h.DB, userID, courseID, lessonID)
	if err != nil {
		http.Error(w, "Failed to get lesson progress", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    progress,
	})
}

// GetCourseProgressHandler gets course progress for a user
func (h *Handler) GetCourseProgressHandler(w http.ResponseWriter, r *http.Request) {
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

	progress, err := models.GetCourseProgress(h.DB, userID, courseID)
	if err != nil {
		// If no progress record exists, return default progress
		if err == sql.ErrNoRows {
			defaultProgress := &models.CourseProgress{
				UserID:          userID,
				CourseID:        courseID,
				OverallProgress: 0,
				LessonsCompleted: 0,
				TotalLessons:    0,
				QuizzesCompleted: 0,
				TotalQuizzes:    0,
				TimeSpent:       0,
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"data":    defaultProgress,
			})
			return
		}
		http.Error(w, "Failed to get course progress", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    progress,
	})
}

// GetUserProgressListHandler gets all course progress for a user
func (h *Handler) GetUserProgressListHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	progressList, err := models.GetUserCourseProgressList(h.DB, userID)
	if err != nil {
		http.Error(w, "Failed to get user progress list", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    progressList,
	})
}

// SyncProgressHandler synchronizes frontend progress data to backend
func (h *Handler) SyncProgressHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		http.Error(w, "User not found in context", http.StatusUnauthorized)
		return
	}

	var req struct {
		CourseID        int                    `json:"courseId"`
		CurrentStep     string                 `json:"currentStep"`
		CompletedSteps  []string               `json:"completedSteps"`
		LessonProgress  map[string]interface{} `json:"lessonProgress"`
		QuizScores      map[string]interface{} `json:"quizScores"`
		Submissions     map[string]interface{} `json:"submissions"`
		TotalTimeSpent  int                    `json:"totalTimeSpent"`
		CompletedAt     *string                `json:"completedAt"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
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

	// Calculate overall progress based on completed steps
	totalSteps := 6 // intro, pretest, lessons, posttest, postwork, finalproject
	completedCount := len(req.CompletedSteps)
	overallProgress := 0
	if totalSteps > 0 {
		overallProgress = (completedCount * 100) / totalSteps
	}

	// Update lesson progress if available
	if req.LessonProgress != nil {
		for lessonIDStr, progressData := range req.LessonProgress {
			lessonID, err := strconv.Atoi(lessonIDStr)
			if err != nil {
				continue
			}

			if progressMap, ok := progressData.(map[string]interface{}); ok {
				progress := 0
				completed := false
				timeSpent := 0

				if p, ok := progressMap["progress"].(float64); ok {
					progress = int(p)
				}
				if c, ok := progressMap["completed"].(bool); ok {
					completed = c
				}
				if t, ok := progressMap["timeSpent"].(float64); ok {
					timeSpent = int(t)
				}

				err = models.UpdateLessonProgress(h.DB, userID, req.CourseID, lessonID, progress, timeSpent, completed)
				if err != nil {
					// Log error but continue with other lessons
					continue
				}
			}
		}
	}

	// Update course progress with calculated overall progress
	// First update lesson-based progress
	err = models.UpdateCourseProgress(h.DB, userID, req.CourseID)
	if err != nil {
		http.Error(w, "Failed to update course progress", http.StatusInternalServerError)
		return
	}

	// Then update with step-based overall progress if it's higher
	err = models.UpdateCourseOverallProgress(h.DB, userID, req.CourseID, overallProgress, req.TotalTimeSpent, req.CompletedAt)
	if err != nil {
		http.Error(w, "Failed to update overall course progress", http.StatusInternalServerError)
		return
	}

	// Auto-generate certificate if course is 100% complete
	if overallProgress >= 100 {
		// Check if certificate already exists
		existingCert, _ := models.GetCertificateForCourse(h.DB, userID, req.CourseID)
		if existingCert == nil {
			// Generate certificate automatically
			err = models.AutoGenerateCertificate(h.DB, userID, req.CourseID)
			if err != nil {
				// Log error but don't fail the request
				// Certificate can be generated manually later
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Progress synchronized successfully",
		"data": map[string]interface{}{
			"overallProgress": overallProgress,
			"completedSteps":  completedCount,
			"totalSteps":      totalSteps,
		},
	})
}