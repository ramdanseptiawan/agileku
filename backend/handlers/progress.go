package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"lms-backend/models"
)

// UpdateLessonProgressHandler handles lesson progress updates
func (h *Handler) UpdateLessonProgressHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

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
	userID := r.Context().Value("userID").(int)
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
	userID := r.Context().Value("userID").(int)
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
	userID := r.Context().Value("userID").(int)

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