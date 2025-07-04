package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"lms-backend/models"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

type AdminHandler struct {
	db *sql.DB
}

func NewAdminHandler(db *sql.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

// Course Management

// CreateCourse creates a new course (admin only)
func (h *AdminHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	query := `
		INSERT INTO courses (title, description, category, level, duration, instructor, rating, students, image, intro_material, lessons, pre_test, post_test, post_work, final_project)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, created_at, updated_at
	`

	err := h.db.QueryRow(query, course.Title, course.Description, course.Category, course.Level,
		course.Duration, course.Instructor, course.Rating, course.Students, course.Image,
		course.IntroMaterial, course.Lessons, course.PreTest, course.PostTest,
		course.PostWork, course.FinalProject).Scan(&course.ID, &course.CreatedAt, &course.UpdatedAt)

	if err != nil {
		http.Error(w, "Failed to create course", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Course created successfully",
		"course":  course,
	})
}

// UpdateCourse updates an existing course (admin only)
func (h *AdminHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseIDStr := vars["id"]
	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	var course models.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	course.ID = courseID

	query := `
		UPDATE courses SET
			title = $1, description = $2, category = $3, level = $4, duration = $5,
			instructor = $6, rating = $7, students = $8, image = $9,
			intro_material = $10, lessons = $11, pre_test = $12, post_test = $13,
			post_work = $14, final_project = $15, updated_at = CURRENT_TIMESTAMP
		WHERE id = $16
		RETURNING updated_at
	`

	err = h.db.QueryRow(query, course.Title, course.Description, course.Category, course.Level,
		course.Duration, course.Instructor, course.Rating, course.Students, course.Image,
		course.IntroMaterial, course.Lessons, course.PreTest, course.PostTest,
		course.PostWork, course.FinalProject, courseID).Scan(&course.UpdatedAt)

	if err != nil {
		http.Error(w, "Failed to update course", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Course updated successfully",
		"course":  course,
	})
}

// DeleteCourse deletes a course (admin only)
func (h *AdminHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseIDStr := vars["id"]
	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	query := `DELETE FROM courses WHERE id = $1`
	result, err := h.db.Exec(query, courseID)
	if err != nil {
		http.Error(w, "Failed to delete course", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Course not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Course deleted successfully",
	})
}

// Grading System

type GradeRequest struct {
	UserID       int     `json:"userId"`
	CourseID     int     `json:"courseId"`
	SubmissionID int     `json:"submissionId"`
	Grade        float64 `json:"grade"`
	Feedback     string  `json:"feedback"`
}

type Grade struct {
	ID           int       `json:"id"`
	UserID       int       `json:"userId"`
	CourseID     int       `json:"courseId"`
	SubmissionID int       `json:"submissionId"`
	Grade        float64   `json:"grade"`
	Feedback     string    `json:"feedback"`
	GradedBy     int       `json:"gradedBy"`
	GradedAt     time.Time `json:"gradedAt"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// CreateGrade creates a new grade (admin only)
func (h *AdminHandler) CreateGrade(w http.ResponseWriter, r *http.Request) {
	var req models.CreateGradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate grade range
	if req.Grade < 0 || req.Grade > 100 {
		http.Error(w, "Grade must be between 0 and 100", http.StatusBadRequest)
		return
	}

	grade, err := models.CreateGrade(h.db, req)
	if err != nil {
		http.Error(w, "Failed to create grade", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Grade created successfully",
		"grade":   grade,
	})
}

// GetGrades gets all grades (admin only)
func (h *AdminHandler) GetGrades(w http.ResponseWriter, r *http.Request) {
	grades, err := models.GetAllGrades(h.db)
	if err != nil {
		http.Error(w, "Failed to get grades", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"grades":  grades,
	})
}

// GetCourseSubmissions gets all submissions for a course (admin only)
func (h *AdminHandler) GetCourseSubmissions(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	submissions, err := models.GetCourseSubmissionsWithGrades(h.db, courseID)
	if err != nil {
		http.Error(w, "Failed to get submissions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"submissions": submissions,
	})
}

// User Management

type UserRequest struct {
	Username string `json:"username"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Password string `json:"password,omitempty"`
}

type UserResponse struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	FullName  string    `json:"fullName"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// GetAllUsers gets all users (admin only)
func (h *AdminHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT id, username, full_name, email, role, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`

	rows, err := h.db.Query(query)
	if err != nil {
		http.Error(w, "Failed to get users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []UserResponse
	for rows.Next() {
		var user UserResponse
		err := rows.Scan(&user.ID, &user.Username, &user.FullName, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			http.Error(w, "Failed to scan user", http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"users":   users,
	})
}

// CreateUser creates a new user (admin only)
func (h *AdminHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	log.Printf("[CREATE USER] Starting user creation process")
	
	var req UserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[CREATE USER ERROR] Failed to decode request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("[CREATE USER] Request data - Username: %s, Email: %s, FullName: %s, Role: %s", req.Username, req.Email, req.FullName, req.Role)

	// Validate required fields
	if req.Username == "" || req.Email == "" || req.Password == "" {
		log.Printf("[CREATE USER ERROR] Missing required fields - Username: %s, Email: %s, Password: %s", req.Username, req.Email, req.Password)
		http.Error(w, "Username, email, and password are required", http.StatusBadRequest)
		return
	}

	// Validate role if provided
	if req.Role != "" && req.Role != "user" && req.Role != "admin" {
		log.Printf("[CREATE USER ERROR] Invalid role provided: %s", req.Role)
		http.Error(w, "Role must be either 'user' or 'admin'", http.StatusBadRequest)
		return
	}

	// Hash password
	log.Printf("[CREATE USER] Hashing password...")
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[CREATE USER ERROR] Failed to hash password: %v", err)
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Set default role if not provided
	if req.Role == "" {
		req.Role = "user"
		log.Printf("[CREATE USER] Set default role to: %s", req.Role)
	}

	query := `
		INSERT INTO users (username, full_name, email, password_hash, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	log.Printf("[CREATE USER] Executing database query with role: %s", req.Role)
	var user UserResponse
	err = h.db.QueryRow(query, req.Username, req.FullName, req.Email, string(hashedPassword), req.Role).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		log.Printf("[CREATE USER ERROR] Database error: %v", err)
		if strings.Contains(err.Error(), "duplicate key") {
			http.Error(w, "Username or email already exists", http.StatusConflict)
			return
		}
		if strings.Contains(err.Error(), "check constraint") {
			http.Error(w, "Invalid role value. Must be 'user' or 'admin'", http.StatusBadRequest)
			return
		}
		http.Error(w, fmt.Sprintf("Failed to create user: %v", err), http.StatusInternalServerError)
		return
	}

	user.Username = req.Username
	user.FullName = req.FullName
	user.Email = req.Email
	user.Role = req.Role

	log.Printf("[CREATE USER SUCCESS] User created with ID: %d", user.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User created successfully",
		"user":    user,
	})
}

// UpdateUser updates an existing user (admin only)
func (h *AdminHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["id"]
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req UserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Build dynamic query based on provided fields
	var setParts []string
	var args []interface{}
	argIndex := 1

	if req.Username != "" {
		setParts = append(setParts, fmt.Sprintf("username = $%d", argIndex))
		args = append(args, req.Username)
		argIndex++
	}
	if req.FullName != "" {
		setParts = append(setParts, fmt.Sprintf("full_name = $%d", argIndex))
		args = append(args, req.FullName)
		argIndex++
	}
	if req.Email != "" {
		setParts = append(setParts, fmt.Sprintf("email = $%d", argIndex))
		args = append(args, req.Email)
		argIndex++
	}
	if req.Role != "" {
		setParts = append(setParts, fmt.Sprintf("role = $%d", argIndex))
		args = append(args, req.Role)
		argIndex++
	}
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}
		setParts = append(setParts, fmt.Sprintf("password_hash = $%d", argIndex))
		args = append(args, string(hashedPassword))
		argIndex++
	}

	if len(setParts) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	// Add updated_at
	setParts = append(setParts, fmt.Sprintf("updated_at = $%d", argIndex))
	args = append(args, time.Now())
	argIndex++

	// Add user ID for WHERE clause
	args = append(args, userID)

	query := fmt.Sprintf(`
		UPDATE users SET %s
		WHERE id = $%d
		RETURNING id, username, full_name, email, role, created_at, updated_at
	`, strings.Join(setParts, ", "), argIndex)

	var user UserResponse
	err = h.db.QueryRow(query, args...).Scan(&user.ID, &user.Username, &user.FullName, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		if strings.Contains(err.Error(), "duplicate key") {
			http.Error(w, "Username or email already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User updated successfully",
		"user":    user,
	})
}

// DeleteUser deletes a user (admin only)
func (h *AdminHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr := vars["id"]
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	query := `DELETE FROM users WHERE id = $1`
	result, err := h.db.Exec(query, userID)
	if err != nil {
		http.Error(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "User deleted successfully",
	})
}