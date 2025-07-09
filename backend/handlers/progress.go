package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"lms-backend/middleware"
	"lms-backend/models"
)

// determineCurrentStep calculates the correct current step based on completed steps
// This ensures proper resume functionality
func determineCurrentStep(completedSteps []string) string {
	// Define the step order
	stepOrder := []string{"intro", "pretest", "lessons", "posttest", "postwork", "finalproject"}
	
	// Create a map for quick lookup of completed steps
	completedMap := make(map[string]bool)
	for _, step := range completedSteps {
		completedMap[step] = true
	}
	
	// Find the next step that hasn't been completed
	for _, step := range stepOrder {
		if !completedMap[step] {
			return step
		}
	}
	
	// If all steps are completed, return the final step
	return "finalproject"
}

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

	// Note: Course overall progress should only be updated via SyncProgressHandler
	// which calculates progress based on all 6 steps (intro, pretest, lessons, posttest, postwork, finalproject)
	// Individual lesson progress updates should not affect overall course completion percentage

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
    // If no progress record exists, return default progress structure that frontend expects
    if err == sql.ErrNoRows {
      defaultProgressData := map[string]interface{}{
        "currentStep":     "intro",
        "completedSteps":  []string{},
        "lessonProgress":  map[string]interface{}{},
        "quizScores":      map[string]interface{}{},
        "submissions":     map[string]interface{}{},
        "totalTimeSpent":  0,
        "startedAt":       nil,
        "completedAt":     nil,
        "overallProgress": 0,
      }
      w.Header().Set("Content-Type", "application/json")
      json.NewEncoder(w).Encode(map[string]interface{}{
        "success": true,
        "data":    defaultProgressData,
      })
      return
    }
    http.Error(w, "Failed to get course progress", http.StatusInternalServerError)
    return
  }

  // Parse completed steps from JSON string
  var completedSteps []string
  if progress.CompletedSteps != "" {
    err = json.Unmarshal([]byte(progress.CompletedSteps), &completedSteps)
    if err != nil {
      // If parsing fails, default to empty array
      completedSteps = []string{}
    }
  } else {
    completedSteps = []string{}
  }
  
  // Determine the correct current step based on completed steps
  correctCurrentStep := determineCurrentStep(completedSteps)
  
  // Convert CourseProgress to frontend-expected format
  progressData := map[string]interface{}{
    "currentStep":     correctCurrentStep, // Use calculated correct step
    "completedSteps":  completedSteps, // Use actual completed steps from database
    "lessonProgress":  map[string]interface{}{}, // Default, frontend will manage this
    "quizScores":      map[string]interface{}{}, // Default, frontend will manage this
    "submissions":     map[string]interface{}{}, // Default, frontend will manage this
    "totalTimeSpent":  progress.TimeSpent,
    "startedAt":       progress.StartedAt.Format(time.RFC3339),
    "completedAt":     nil,
    "overallProgress": progress.OverallProgress,
  }

	// Set completedAt if course is completed
	if progress.CompletedAt != nil {
		progressData["completedAt"] = progress.CompletedAt.Format(time.RFC3339)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    progressData,
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
  // Calculate overall progress with weighted steps
  // Essential steps: intro(5%), pretest(10%), lessons(50%), posttest(15%), postwork(10%), finalproject(10%)
  stepWeights := map[string]int{
    "intro":       5,
    "pretest":     10,
    "lessons":     50,
    "posttest":    15,
    "postwork":    10,
    "finalproject": 10,
  }
  
  totalProgress := 0
  for _, completedStep := range req.CompletedSteps {
    if weight, exists := stepWeights[completedStep]; exists {
      totalProgress += weight
    }
  }
  
  // Ensure progress doesn't exceed 100%
  overallProgress := totalProgress
  if overallProgress > 100 {
    overallProgress = 100
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

	// Determine the correct current step based on completed steps
  // This ensures resume functionality works correctly
  correctCurrentStep := determineCurrentStep(req.CompletedSteps)
  
  // Convert completed steps to JSON string for storage
  completedStepsJSON, err := json.Marshal(req.CompletedSteps)
  if err != nil {
    http.Error(w, "Failed to marshal completed steps", http.StatusInternalServerError)
    return
  }
  
  // Update current step and completed steps
  err = models.UpdateCurrentStepAndCompletedSteps(h.DB, userID, req.CourseID, correctCurrentStep, string(completedStepsJSON))
  if err != nil {
    http.Error(w, "Failed to update current step and completed steps", http.StatusInternalServerError)
    return
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

	// Auto-generate certificate only if ALL steps are actually completed
  allRequiredSteps := []string{"intro", "pretest", "lessons", "posttest", "postwork", "finalproject"}
  allStepsCompleted := true
  for _, requiredStep := range allRequiredSteps {
    found := false
    for _, completedStep := range req.CompletedSteps {
      if requiredStep == completedStep {
        found = true
        break
      }
    }
    if !found {
      allStepsCompleted = false
      break
    }
  }
  
  if allStepsCompleted {
    // Check if certificate request already exists
    existingCert, _ := models.GetCertificateForCourse(h.DB, userID, req.CourseID)
    if existingCert == nil {
      // Create certificate request with pending status
      err = models.RequestCertificate(h.DB, userID, req.CourseID)
      if err != nil {
        // Log error but don't fail the request
        // Certificate can be requested manually later
      }
    }
  }

	// Return the complete progress data that frontend expects
  responseData := map[string]interface{}{
    "currentStep":     correctCurrentStep, // Use the calculated correct step
    "completedSteps":  req.CompletedSteps,
    "lessonProgress":  req.LessonProgress,
    "quizScores":      req.QuizScores,
    "submissions":     req.Submissions,
    "totalTimeSpent":  req.TotalTimeSpent,
    "completedAt":     req.CompletedAt,
    "overallProgress": overallProgress,
    "startedAt":       nil, // Will be set by frontend
  }

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Progress synchronized successfully",
		"data":    responseData,
	})
}