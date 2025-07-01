package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"lms-backend/config"
	"lms-backend/models"
	"lms-backend/utils"
)

// RegisterRequest represents user registration request
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

// LoginRequest represents user login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents login response
type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// Register handles user registration
func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate required fields
	if req.Username == "" || req.Email == "" || req.Password == "" || req.FullName == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing required fields", "username, email, password, and full_name are required")
		return
	}

	// Check if user already exists
	db := config.GetDB()
	var existingUser models.User
	if err := db.Where("email = ? OR username = ?", req.Email, req.Username).First(&existingUser).Error; err == nil {
		utils.SendErrorResponse(w, http.StatusConflict, "User already exists", "Email or username already registered")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to hash password", err.Error())
		return
	}

	// Create user
	user := models.User{
			Username: req.Username,
			Email:    req.Email,
			Password: string(hashedPassword),
			Name:     req.FullName,
			Role:     "student",
		}

	if err := db.Create(&user).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to create user", err.Error())
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to generate token", err.Error())
		return
	}

	// Remove password from response
	user.Password = ""

	response := LoginResponse{
		Token: token,
		User:  user,
	}

	utils.SendCreatedResponse(w, "User registered successfully", response)
}

// Login handles user login
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing required fields", "email and password are required")
		return
	}

	// Find user
	db := config.GetDB()
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusUnauthorized, "Invalid credentials", "User not found")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.SendErrorResponse(w, http.StatusUnauthorized, "Invalid credentials", "Incorrect password")
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to generate token", err.Error())
		return
	}

	// Remove password from response
	user.Password = ""

	response := LoginResponse{
		Token: token,
		User:  user,
	}

	utils.SendSuccessResponse(w, "Login successful", response)
}

// GetProfile returns user profile
func GetProfile(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	db := config.GetDB()
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "User not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Remove password from response
	user.Password = ""

	utils.SendSuccessResponse(w, "Profile retrieved successfully", user)
}