package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"lms-backend/middleware"
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

// GetAllCourses gets all courses (admin only)
func (h *AdminHandler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
	log.Printf("[ADMIN DEBUG] GetAllCourses called")
	query := `
		SELECT id, title, description, category, level, duration, instructor, rating, students, image,
		       intro_material, lessons, pre_test, post_test, post_work, final_project, created_at, updated_at
		FROM courses
		ORDER BY created_at DESC
	`

	rows, err := h.db.Query(query)
	if err != nil {
		log.Printf("[ADMIN ERROR] Error querying courses: %v", err)
		http.Error(w, "Failed to get courses", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		err := rows.Scan(&course.ID, &course.Title, &course.Description, &course.Category,
			&course.Level, &course.Duration, &course.Instructor, &course.Rating,
			&course.Students, &course.Image, &course.IntroMaterial, &course.Lessons,
			&course.PreTest, &course.PostTest, &course.PostWork, &course.FinalProject,
			&course.CreatedAt, &course.UpdatedAt)
		if err != nil {
			log.Printf("[ADMIN ERROR] Error scanning course: %v", err)
			continue
		}
		courses = append(courses, course)
	}

	if err = rows.Err(); err != nil {
		log.Printf("[ADMIN ERROR] Error iterating courses: %v", err)
		http.Error(w, "Failed to get courses", http.StatusInternalServerError)
		return
	}

	log.Printf("[ADMIN DEBUG] Found %d courses", len(courses))
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"success": true,
		"data":    courses,
	}
	log.Printf("[ADMIN DEBUG] Sending response: %+v", response)
	json.NewEncoder(w).Encode(response)
}

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

	// Create default stage locks for the new course
	defaultStages := []string{
		"intro",
		"pretest",
		"lessons",
		"posttest",
		"postwork",
		"finalproject",
	}

	for _, stageName := range defaultStages {
		stageQuery := `
			INSERT INTO course_stage_locks (course_id, stage_name, is_locked, lock_message, created_at, updated_at)
			VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		`
		_, stageErr := h.db.Exec(stageQuery, course.ID, stageName, false, "")
		if stageErr != nil {
			// Log the error but don't fail the course creation
			log.Printf("Warning: Failed to create stage lock for course %d, stage %s: %v", course.ID, stageName, stageErr)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Course created successfully",
		"course":  course,
	})
}

// UpdateCouse updates an existing course (admin only)
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

// GetCoursePreTestAdmin gets the pre-test for a course (admin only, no enrollment check)
func (h *AdminHandler) GetCoursePreTestAdmin(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	preTest, err := models.GetQuizByTypeAndCourse(h.db, courseID, "pretest")
	if err != nil {
		if err == sql.ErrNoRows {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"data":    nil,
				"message": "No pre-test found for this course",
			})
			return
		}
		http.Error(w, "Failed to get pre-test", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    preTest,
	})
}

// GetCoursePostTestAdmin gets the post-test for a course (admin only, no enrollment check)
func (h *AdminHandler) GetCoursePostTestAdmin(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	postTest, err := models.GetQuizByTypeAndCourse(h.db, courseID, "posttest")
	if err != nil {
		if err == sql.ErrNoRows {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"data":    nil,
				"message": "No post-test found for this course",
			})
			return
		}
		http.Error(w, "Failed to get post-test", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    postTest,
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
	var req UserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Username == "" || req.Email == "" || req.Password == "" {
		http.Error(w, "Username, email, and password are required", http.StatusBadRequest)
		return
	}

	// Validate role if provided
	if req.Role != "" && req.Role != "user" && req.Role != "admin" {
		http.Error(w, "Role must be either 'user' or 'admin'", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Set default role if not provided
	if req.Role == "" {
		req.Role = "user"
	}

	query := `
		INSERT INTO users (username, full_name, email, password_hash, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	var user UserResponse
	err = h.db.QueryRow(query, req.Username, req.FullName, req.Email, string(hashedPassword), req.Role).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
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

// Announcement Management

// CreateAnnouncement creates a new announcement (admin only)
func (h *AdminHandler) CreateAnnouncement(w http.ResponseWriter, r *http.Request) {
	var req models.CreateAnnouncementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("[DEBUG] Received announcement data: Title=%s, Priority=%s, TargetAudience=%s", req.Title, req.Priority, req.TargetAudience)

	// Validate required fields
	if req.Title == "" || req.Content == "" {
		http.Error(w, "Title and content are required", http.StatusBadRequest)
		return
	}

	// Validate priority
	if req.Priority != "normal" && req.Priority != "medium" && req.Priority != "high" {
		req.Priority = "normal" // default
	}

	// Validate target audience
	if req.TargetAudience != "all" && req.TargetAudience != "users" && req.TargetAudience != "admins" {
		req.TargetAudience = "all" // default
	}

	// Get author from context (admin user)
	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		log.Printf("Error getting user ID from context: %v", err)
		http.Error(w, "Unauthorized: user context not found", http.StatusUnauthorized)
		return
	}
	
	var author string
	err = h.db.QueryRow("SELECT full_name FROM users WHERE id = $1", userID).Scan(&author)
	if err != nil {
		author = "Admin" // fallback
	}

	announcement, err := models.CreateAnnouncement(h.db, req, author)
	if err != nil {
		log.Printf("Error creating announcement: %v", err)
		http.Error(w, "Failed to create announcement", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"message":      "Announcement created successfully",
		"announcement": announcement,
	})
}

// GetAllAnnouncements gets all announcements (admin only)
func (h *AdminHandler) GetAllAnnouncements(w http.ResponseWriter, r *http.Request) {
	announcements, err := models.GetAllAnnouncements(h.db)
	if err != nil {
		log.Printf("Error getting announcements: %v", err)
		http.Error(w, "Failed to get announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"announcements": announcements,
	})
}

// GetAnnouncementByID gets a specific announcement (admin only)
func (h *AdminHandler) GetAnnouncementByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	announcementID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid announcement ID", http.StatusBadRequest)
		return
	}

	announcement, err := models.GetAnnouncementByID(h.db, announcementID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Announcement not found", http.StatusNotFound)
			return
		}
		log.Printf("Error getting announcement: %v", err)
		http.Error(w, "Failed to get announcement", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"announcement": announcement,
	})
}

// UpdateAnnouncement updates an existing announcement (admin only)
func (h *AdminHandler) UpdateAnnouncement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	announcementID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid announcement ID", http.StatusBadRequest)
		return
	}

	var req models.UpdateAnnouncementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Title == "" || req.Content == "" {
		http.Error(w, "Title and content are required", http.StatusBadRequest)
		return
	}

	// Validate priority
	if req.Priority != "normal" && req.Priority != "medium" && req.Priority != "high" {
		req.Priority = "normal" // default
	}

	// Validate target audience
	if req.TargetAudience != "all" && req.TargetAudience != "users" && req.TargetAudience != "admins" {
		req.TargetAudience = "all" // default
	}

	announcement, err := models.UpdateAnnouncement(h.db, announcementID, req)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Announcement not found", http.StatusNotFound)
			return
		}
		log.Printf("Error updating announcement: %v", err)
		http.Error(w, "Failed to update announcement", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"message":      "Announcement updated successfully",
		"announcement": announcement,
	})
}

// DeleteAnnouncement deletes an announcement (admin only)
func (h *AdminHandler) DeleteAnnouncement(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	announcementID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid announcement ID", http.StatusBadRequest)
		return
	}

	err = models.DeleteAnnouncement(h.db, announcementID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Announcement not found", http.StatusNotFound)
			return
		}
		log.Printf("Error deleting announcement: %v", err)
		http.Error(w, "Failed to delete announcement", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Announcement deleted successfully",
	})
}

// Dashboard Statistics

type DashboardStats struct {
	TotalCourses     int     `json:"totalCourses"`
	TotalLessons     int     `json:"totalLessons"`
	TotalStudents    int     `json:"totalStudents"`
	CompletionRate   float64 `json:"completionRate"`
	ActiveStudents   int     `json:"activeStudents"`
	TotalEnrollments int     `json:"totalEnrollments"`
}

// GetDashboardStats gets dashboard statistics (admin only)
func (h *AdminHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	var stats DashboardStats

	// Get total courses
	err := h.db.QueryRow("SELECT COUNT(*) FROM courses").Scan(&stats.TotalCourses)
	if err != nil {
		log.Printf("Error getting total courses: %v", err)
		stats.TotalCourses = 0
	}

	// Get total lessons (sum of lessons from all courses)
	err = h.db.QueryRow(`
		SELECT COALESCE(SUM(CASE 
			WHEN lessons IS NOT NULL AND lessons != 'null' AND lessons != '[]' 
			THEN json_array_length(lessons::json) 
			ELSE 0 
		END), 0) 
		FROM courses
	`).Scan(&stats.TotalLessons)
	if err != nil {
		log.Printf("Error getting total lessons: %v", err)
		stats.TotalLessons = 0
	}

	// Get total unique students (users with role 'user')
	err = h.db.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'user'").Scan(&stats.TotalStudents)
	if err != nil {
		log.Printf("Error getting total students: %v", err)
		stats.TotalStudents = 0
	}

	// Get total enrollments
	err = h.db.QueryRow("SELECT COUNT(*) FROM course_enrollments").Scan(&stats.TotalEnrollments)
	if err != nil {
		log.Printf("Error getting total enrollments: %v", err)
		stats.TotalEnrollments = 0
	}

	// Get active students (students with at least one enrollment)
	err = h.db.QueryRow(`
		SELECT COUNT(DISTINCT user_id) 
		FROM course_enrollments
	`).Scan(&stats.ActiveStudents)
	if err != nil {
		log.Printf("Error getting active students: %v", err)
		stats.ActiveStudents = 0
	}

	// Calculate completion rate (percentage of enrollments with progress >= 100%)
	var completedEnrollments int
	err = h.db.QueryRow(`
		SELECT COUNT(*) 
		FROM course_progress 
		WHERE overall_progress >= 100
	`).Scan(&completedEnrollments)
	if err != nil {
		log.Printf("Error getting completed enrollments: %v", err)
		completedEnrollments = 0
	}

	if stats.TotalEnrollments > 0 {
		stats.CompletionRate = float64(completedEnrollments) / float64(stats.TotalEnrollments) * 100
	} else {
		stats.CompletionRate = 0
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"stats":   stats,
	})
}