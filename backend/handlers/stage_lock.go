package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"lms-backend/middleware"
	"lms-backend/models"

	"github.com/gorilla/mux"
)

type StageLockHandler struct {
	DB *sql.DB
}

// NewStageLockHandler creates a new stage lock handler
func NewStageLockHandler(db *sql.DB) *StageLockHandler {
	return &StageLockHandler{DB: db}
}

// UpdateStageLockRequest represents the request body for updating stage locks
type UpdateStageLockRequest struct {
	CourseID    int    `json:"courseId"`
	StageName   string `json:"stageName"`
	IsLocked    bool   `json:"isLocked"`
	LockMessage string `json:"lockMessage"`
}

// GetStageLocks retrieves all stage locks for a course
func (h *StageLockHandler) GetStageLocks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	courseIDStr, exists := vars["id"]
	if !exists {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing course ID",
			Message: "Course ID is required",
		})
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid course ID",
			Message: "Course ID must be a number",
		})
		return
	}

	// Get all stage locks for the course
	stageLocks, err := models.GetStageLocksByCourse(h.DB, courseID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to fetch stage locks",
			Message: err.Error(),
		})
		return
	}

	// If no locks exist, create default unlocked entries for all stages
		if len(stageLocks) == 0 {
			allStages := models.GetAllStageNames()
			for _, stageName := range allStages {
				stageLock := &models.StageLock{
					CourseID:    courseID,
					StageName:   stageName,
					IsLocked:    false,
					LockMessage: "",
					LockedBy:    sql.NullInt64{Valid: false},
				}
				err := models.UpsertStageLock(h.DB, stageLock)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(ErrorResponse{
						Error:   "Failed to create default stage locks",
						Message: err.Error(),
					})
					return
				}
				stageLocks = append(stageLocks, *stageLock)
			}
		}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    stageLocks,
	})
}

// UpdateStageLock updates a stage lock status
func (h *StageLockHandler) UpdateStageLock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	courseIDStr, exists := vars["id"]
	if !exists {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing course ID",
			Message: "Course ID is required",
		})
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid course ID",
			Message: "Course ID must be a number",
		})
		return
	}

	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user ID",
			Message: err.Error(),
		})
		return
	}

	// Get user role from context
	userRole, err := middleware.GetUserRoleFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user role",
			Message: err.Error(),
		})
		return
	}

	// Only admin can update stage locks
	if userRole != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Access denied",
			Message: "Only admin can update stage locks",
		})
		return
	}

	var req UpdateStageLockRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
		})
		return
	}

	// Validate course ID matches URL parameter
	if req.CourseID != courseID {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Course ID mismatch",
			Message: "Course ID in request body must match URL parameter",
		})
		return
	}

	// Validate stage name
	allStages := models.GetAllStageNames()
	validStage := false
	for _, stage := range allStages {
		if stage == req.StageName {
			validStage = true
			break
		}
	}

	if !validStage {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid stage name",
			Message: "Stage name must be one of: intro, pretest, lessons, posttest, postwork, finalproject",
		})
		return
	}

	// Create or update stage lock
	stageLock := &models.StageLock{
		CourseID:    courseID,
		StageName:   req.StageName,
		IsLocked:    req.IsLocked,
		LockMessage: req.LockMessage,
		LockedBy:    sql.NullInt64{Int64: int64(userID), Valid: true},
	}

	err = models.UpsertStageLock(h.DB, stageLock)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to update stage lock",
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    stageLock,
		Message: "Stage lock updated successfully",
	})
}

// CheckStageAccess checks if a user can access a specific stage
func (h *StageLockHandler) CheckStageAccess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	courseIDStr, exists := vars["courseId"]
	if !exists {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing course ID",
			Message: "Course ID is required",
		})
		return
	}

	stageName, exists := vars["stageName"]
	if !exists {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing stage name",
			Message: "Stage name is required",
		})
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid course ID",
			Message: "Course ID must be a number",
		})
		return
	}

	// Get user role from context
	userRole, err := middleware.GetUserRoleFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user role",
			Message: err.Error(),
		})
		return
	}

	// Check if stage is locked
	isLocked, lockMessage, err := models.IsStageLockedForUser(h.DB, courseID, stageName, userRole)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to check stage access",
			Message: err.Error(),
		})
		return
	}

	response := map[string]interface{}{
		"isLocked":    isLocked,
		"lockMessage": lockMessage,
		"canAccess":   !isLocked,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    response,
	})
}