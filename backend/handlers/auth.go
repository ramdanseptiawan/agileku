package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"lms-backend/middleware"
	"lms-backend/models"
)

type AuthHandler struct {
	DB *sql.DB
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(db *sql.DB) *AuthHandler {
	return &AuthHandler{DB: db}
}

// Register handles user registration
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
		})
		return
	}

	// Validate required fields
	if req.Username == "" || req.Email == "" || req.Password == "" || req.FullName == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing required fields",
			Message: "Username, email, password, and full name are required",
		})
		return
	}

	// Validate email format (basic validation)
	if !strings.Contains(req.Email, "@") {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid email format",
			Message: "Please provide a valid email address",
		})
		return
	}

	// Validate password length
	if len(req.Password) < 3 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Password too short",
			Message: "Password must be at least 3 characters long",
		})
		return
	}

	// Check if user already exists
	existingUser, _ := models.GetUserByUsername(h.DB, req.Username)
	if existingUser != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "User already exists",
			Message: "Username is already taken",
		})
		return
	}

	// Create new user
	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,
		Role:     "user", // Default role
	}

	err := models.CreateUser(h.DB, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to create user",
			Message: err.Error(),
		})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateJWT(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to generate token",
			Message: err.Error(),
		})
		return
	}

	// Return success response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Message: "User registered successfully",
		Data: models.LoginResponse{
			User:  *user,
			Token: token,
		},
	})
}

// Login handles user authentication
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
		})
		return
	}

	// Validate required fields
	if req.Username == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing credentials",
			Message: "Username and password are required",
		})
		return
	}

	// Get user from database
	user, err := models.GetUserByUsername(h.DB, req.Username)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid credentials",
			Message: "Username atau password salah",
		})
		return
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid credentials",
			Message: "Username atau password salah",
		})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateJWT(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to generate token",
			Message: err.Error(),
		})
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Message: "Login successful",
		Data: models.LoginResponse{
			User:  *user,
			Token: token,
		},
	})
}

// GetProfile returns the current user's profile
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user",
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    user,
	})
}

// UpdateProfile updates the current user's profile
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user",
			Message: err.Error(),
		})
		return
	}

	var updateReq struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		FullName string `json:"fullName"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateReq); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
		})
		return
	}

	// Update user fields
	if updateReq.Username != "" {
		user.Username = updateReq.Username
	}
	if updateReq.Email != "" {
		user.Email = updateReq.Email
	}
	if updateReq.FullName != "" {
		user.FullName = updateReq.FullName
	}

	// Update in database
	err = models.UpdateUser(h.DB, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to update user",
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Message: "Profile updated successfully",
		Data:    user,
	})
}

// ChangePassword handles password change requests
func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user",
			Message: err.Error(),
		})
		return
	}

	var changePasswordReq struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}

	if err := json.NewDecoder(r.Body).Decode(&changePasswordReq); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
		})
		return
	}

	// Validate required fields
	if changePasswordReq.CurrentPassword == "" || changePasswordReq.NewPassword == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing required fields",
			Message: "Current password and new password are required",
		})
		return
	}

	// Validate new password length
	if len(changePasswordReq.NewPassword) < 3 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Password too short",
			Message: "Password must be at least 3 characters long",
		})
		return
	}

	// Verify current password
	if !user.CheckPassword(changePasswordReq.CurrentPassword) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid current password",
			Message: "Password saat ini tidak benar",
		})
		return
	}

	// Update password in database
	err = models.UpdatePassword(h.DB, user.ID, changePasswordReq.NewPassword)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to update password",
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Message: "Password berhasil diubah",
	})
}