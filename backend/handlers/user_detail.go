package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"lms-backend/middleware"
	"lms-backend/models"
)

type UserDetailHandler struct {
	DB *sql.DB
}

func NewUserDetailHandler(db *sql.DB) *UserDetailHandler {
	return &UserDetailHandler{DB: db}
}

// GetUserDetail gets current user's detail
func (h *UserDetailHandler) GetUserDetail(w http.ResponseWriter, r *http.Request) {
	log.Println("[USER_DETAIL_HANDLER] GetUserDetail called")
	
	// Get user ID from context (set by auth middleware)
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] User ID not found in context: %v", err)
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Getting user detail for user ID: %d", userID)

	// Get user detail from database
	userDetail, err := models.GetUserDetailByUserID(h.DB, userID)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error getting user detail: %v", err)
		http.Error(w, "Failed to get user detail", http.StatusInternalServerError)
		return
	}

	// If no user detail found, return empty object
	if userDetail == nil {
		log.Printf("[USER_DETAIL_HANDLER] No user detail found for user ID: %d, returning empty object", userID)
		userDetail = &models.UserDetail{
			UserID:             userID,
			EmailNotifications: true,
			PushNotifications:  true,
			WeeklyReports:      false,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(userDetail); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error encoding user detail response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Successfully returned user detail for user ID: %d", userID)
}

// UpdateUserDetail updates current user's detail
func (h *UserDetailHandler) UpdateUserDetail(w http.ResponseWriter, r *http.Request) {
	log.Println("[USER_DETAIL_HANDLER] UpdateUserDetail called")
	
	// Get user ID from context
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] User ID not found in context: %v", err)
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Updating user detail for user ID: %d", userID)

	// Parse request body
	var userDetail models.UserDetail
	if err := json.NewDecoder(r.Body).Decode(&userDetail); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set user ID from context
	userDetail.UserID = userID

	// Check if user detail already exists
	existingDetail, err := models.GetUserDetailByUserID(h.DB, userID)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error checking existing user detail: %v", err)
		http.Error(w, "Failed to check existing user detail", http.StatusInternalServerError)
		return
	}

	if existingDetail == nil {
		// Create new user detail
		log.Printf("[USER_DETAIL_HANDLER] Creating new user detail for user ID: %d", userID)
		if err := models.CreateUserDetail(h.DB, &userDetail); err != nil {
			log.Printf("[USER_DETAIL_HANDLER] Error creating user detail: %v", err)
			http.Error(w, "Failed to create user detail", http.StatusInternalServerError)
			return
		}
	} else {
		// Update existing user detail
		log.Printf("[USER_DETAIL_HANDLER] Updating existing user detail for user ID: %d", userID)
		if err := models.UpdateUserDetail(h.DB, &userDetail); err != nil {
			log.Printf("[USER_DETAIL_HANDLER] Error updating user detail: %v", err)
			http.Error(w, "Failed to update user detail", http.StatusInternalServerError)
			return
		}
	}

	// Return updated user detail
	updatedDetail, err := models.GetUserDetailByUserID(h.DB, userID)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error getting updated user detail: %v", err)
		http.Error(w, "Failed to get updated user detail", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(updatedDetail); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error encoding updated user detail response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Successfully updated user detail for user ID: %d", userID)
}

// GetUserDetailByID gets user detail by ID (admin only)
func (h *UserDetailHandler) GetUserDetailByID(w http.ResponseWriter, r *http.Request) {
	log.Println("[USER_DETAIL_HANDLER] GetUserDetailByID called")
	
	// Check if user is admin
	userRole, err := middleware.GetUserRoleFromContext(r)
	if err != nil || userRole != "admin" {
		log.Printf("[USER_DETAIL_HANDLER] Access denied - admin role required, error: %v, role: %s", err, userRole)
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	// Get user ID from URL parameters
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		log.Println("[USER_DETAIL_HANDLER] User ID not provided in URL")
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Invalid user ID format: %s", userIDStr)
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Getting user detail for user ID: %d (admin request)", userID)

	// Get user detail from database
	userDetail, err := models.GetUserDetailByUserID(h.DB, userID)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error getting user detail: %v", err)
		http.Error(w, "Failed to get user detail", http.StatusInternalServerError)
		return
	}

	if userDetail == nil {
		log.Printf("[USER_DETAIL_HANDLER] User detail not found for user ID: %d", userID)
		http.Error(w, "User detail not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(userDetail); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error encoding user detail response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Successfully returned user detail for user ID: %d (admin request)", userID)
}

// GetAllUserDetails gets all user details (admin only)
func (h *UserDetailHandler) GetAllUserDetails(w http.ResponseWriter, r *http.Request) {
	log.Println("[USER_DETAIL_HANDLER] GetAllUserDetails called")
	
	// Check if user is admin
	userRole, err := middleware.GetUserRoleFromContext(r)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] User role not found in context: %v", err)
		http.Error(w, "Role not found", http.StatusUnauthorized)
		return
	}

	if userRole != "admin" {
		log.Printf("[USER_DETAIL_HANDLER] Access denied - user role: %s", userRole)
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	log.Println("[USER_DETAIL_HANDLER] Admin access confirmed, getting all user details")

	// Get all user details from database
	userDetails, err := models.GetAllUserDetails(h.DB)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Database error getting all user details: %v", err)
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Successfully retrieved %d user details", len(userDetails))

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(userDetails); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] JSON encoding error: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	log.Println("[USER_DETAIL_HANDLER] Successfully returned all user details")
}

// UpdateUserDetailByID updates user detail by ID (admin only)
func (h *UserDetailHandler) UpdateUserDetailByID(w http.ResponseWriter, r *http.Request) {
	log.Println("[USER_DETAIL_HANDLER] UpdateUserDetailByID called")
	
	// Check if user is admin
	userRole, err := middleware.GetUserRoleFromContext(r)
	if err != nil || userRole != "admin" {
		log.Printf("[USER_DETAIL_HANDLER] Access denied - admin role required, error: %v, role: %s", err, userRole)
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	// Get user ID from URL parameters
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		log.Println("[USER_DETAIL_HANDLER] User ID not provided in URL")
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Invalid user ID format: %s", userIDStr)
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Updating user detail for user ID: %d (admin request)", userID)

	// Parse request body
	var userDetail models.UserDetail
	if err := json.NewDecoder(r.Body).Decode(&userDetail); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set user ID from URL parameter
	userDetail.UserID = userID

	// Check if user detail exists
	existingDetail, err := models.GetUserDetailByUserID(h.DB, userID)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error checking existing user detail: %v", err)
		http.Error(w, "Failed to check existing user detail", http.StatusInternalServerError)
		return
	}

	if existingDetail == nil {
		// Create new user detail
		log.Printf("[USER_DETAIL_HANDLER] Creating new user detail for user ID: %d (admin request)", userID)
		if err := models.CreateUserDetail(h.DB, &userDetail); err != nil {
			log.Printf("[USER_DETAIL_HANDLER] Error creating user detail: %v", err)
			http.Error(w, "Failed to create user detail", http.StatusInternalServerError)
			return
		}
	} else {
		// Update existing user detail
		log.Printf("[USER_DETAIL_HANDLER] Updating existing user detail for user ID: %d (admin request)", userID)
		if err := models.UpdateUserDetail(h.DB, &userDetail); err != nil {
			log.Printf("[USER_DETAIL_HANDLER] Error updating user detail: %v", err)
			http.Error(w, "Failed to update user detail", http.StatusInternalServerError)
			return
		}
	}

	// Return updated user detail
	updatedDetail, err := models.GetUserDetailByUserID(h.DB, userID)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error getting updated user detail: %v", err)
		http.Error(w, "Failed to get updated user detail", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(updatedDetail); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error encoding updated user detail response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Successfully updated user detail for user ID: %d (admin request)", userID)
}

// DeleteUserDetailByID deletes user detail by ID (admin only)
func (h *UserDetailHandler) DeleteUserDetailByID(w http.ResponseWriter, r *http.Request) {
	log.Println("[USER_DETAIL_HANDLER] DeleteUserDetailByID called")
	
	// Check if user is admin
	userRole, err := middleware.GetUserRoleFromContext(r)
	if err != nil || userRole != "admin" {
		log.Printf("[USER_DETAIL_HANDLER] Access denied - admin role required, error: %v, role: %s", err, userRole)
		http.Error(w, "Access denied", http.StatusForbidden)
		return
	}

	// Get user ID from URL parameters
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		log.Println("[USER_DETAIL_HANDLER] User ID not provided in URL")
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Invalid user ID format: %s", userIDStr)
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Deleting user detail for user ID: %d (admin request)", userID)

	// Delete user detail
	if err := models.DeleteUserDetail(h.DB, userID); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error deleting user detail: %v", err)
		http.Error(w, "Failed to delete user detail", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"message": "User detail deleted successfully"}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("[USER_DETAIL_HANDLER] Error encoding delete response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}

	log.Printf("[USER_DETAIL_HANDLER] Successfully deleted user detail for user ID: %d (admin request)", userID)
}