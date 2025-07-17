package handlers

import (
	"database/sql"
	"encoding/json"
	"lms-backend/middleware"
	"lms-backend/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type CourseAccessHandler struct {
	db *sql.DB
}

func NewCourseAccessHandler(db *sql.DB) *CourseAccessHandler {
	return &CourseAccessHandler{db: db}
}

// GetUserCourseAccess gets all course access settings (admin only)
func (h *CourseAccessHandler) GetUserCourseAccess(w http.ResponseWriter, r *http.Request) {
	accessList, err := models.GetAllCourseAccess(h.db)
	if err != nil {
		http.Error(w, "Failed to get course access data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    accessList,
	})
}

// UpdateUserCourseAccess updates user access to a course (admin only)
func (h *CourseAccessHandler) UpdateUserCourseAccess(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID    int  `json:"userId"`
		CourseID  int  `json:"courseId"`
		HasAccess bool `json:"hasAccess"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get admin user ID from context
	adminUser, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var restrictedBy *int
	if !req.HasAccess {
		restrictedBy = &adminUser.ID
	}

	err = models.SetUserCourseAccess(h.db, req.UserID, req.CourseID, req.HasAccess, restrictedBy)
	if err != nil {
		http.Error(w, "Failed to update course access", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Course access updated successfully",
	})
}

// CheckUserCourseAccess checks if a user has access to a specific course
func (h *CourseAccessHandler) CheckUserCourseAccess(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["userId"]
	courseIDStr := vars["courseId"]

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	hasAccess, err := models.GetUserCourseAccess(h.db, userID, courseID)
	if err != nil {
		http.Error(w, "Failed to check course access", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"hasAccess": hasAccess,
	})
}

// GetUserAccessibleCourses gets courses that a user can access
func (h *CourseAccessHandler) GetUserAccessibleCourses(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["userId"]

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	courseIDs, err := models.GetUserAccessibleCourses(h.db, userID)
	if err != nil {
		http.Error(w, "Failed to get accessible courses", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"courseIds": courseIDs,
	})
}

// MigrateEnrolledUsersAccess grants access to all enrolled users (admin only)
// This is useful when migrating from open access to restricted access system
func (h *CourseAccessHandler) MigrateEnrolledUsersAccess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := models.GrantAccessToEnrolledUsers(h.db)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Failed to migrate enrolled users access",
			"message": err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Successfully granted access to all enrolled users",
	})
}

// SetCourseDefaultAccess sets default access for a course to all users (admin only)
func (h *CourseAccessHandler) SetCourseDefaultAccess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		CourseID  int  `json:"courseId"`
		HasAccess bool `json:"hasAccess"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Get admin user ID from context
	adminUser, err := middleware.GetUserFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Unauthorized",
			"message": "Failed to get admin user context",
		})
		return
	}

	var adminID *int
	if !req.HasAccess {
		adminID = &adminUser.ID
	}

	err = models.SetDefaultCourseAccess(h.db, req.CourseID, req.HasAccess, adminID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Failed to set default course access",
			"message": err.Error(),
		})
		return
	}

	accessType := "granted"
	if !req.HasAccess {
		accessType = "restricted"
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Successfully " + accessType + " default access for course",
	})
}