package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"lms-backend/middleware"
	"lms-backend/models"

	"github.com/gorilla/mux"
)

type CourseHandler struct {
	DB *sql.DB
}

// NewCourseHandler creates a new course handler
func NewCourseHandler(db *sql.DB) *CourseHandler {
	return &CourseHandler{DB: db}
}

// GetAllCourses returns all courses (public endpoint)
func (h *CourseHandler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	courses, err := models.GetAllCourses(h.DB)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to fetch courses",
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    courses,
	})
}

// GetCourseByID returns a specific course by ID (public endpoint)
func (h *CourseHandler) GetCourseByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	idStr, exists := vars["id"]
	if !exists {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing course ID",
			Message: "Course ID is required",
		})
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid course ID",
			Message: "Course ID must be a number",
		})
		return
	}

	course, err := models.GetCourseByID(h.DB, id)
	if err != nil {
		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ErrorResponse{
				Error:   "Course not found",
				Message: "The requested course does not exist",
			})
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{
				Error:   "Failed to fetch course",
				Message: err.Error(),
			})
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    course,
	})
}

// GetCoursesWithEnrollment returns courses with enrollment status for authenticated user
func (h *CourseHandler) GetCoursesWithEnrollment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user ID",
			Message: err.Error(),
		})
		return
	}

	courses, err := models.GetCoursesWithEnrollment(h.DB, userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to fetch courses",
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    courses,
	})
}

// EnrollInCourse enrolls the authenticated user in a course
func (h *CourseHandler) EnrollInCourse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user ID",
			Message: err.Error(),
		})
		return
	}

	var req struct {
		CourseID int `json:"courseId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid request body",
			Message: err.Error(),
		})
		return
	}

	if req.CourseID <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Invalid course ID",
			Message: "Course ID must be a positive number",
		})
		return
	}

	// Check if course exists
	course, err := models.GetCourseByID(h.DB, req.CourseID)
	if err != nil {
		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ErrorResponse{
				Error:   "Course not found",
				Message: "The requested course does not exist",
			})
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{
				Error:   "Failed to verify course",
				Message: err.Error(),
			})
		}
		return
	}

	// Check if user is already enrolled
	existingEnrollment, _ := models.GetUserEnrollment(h.DB, userID, req.CourseID)
	if existingEnrollment != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Already enrolled",
			Message: "You are already enrolled in this course",
		})
		return
	}

	// Enroll user in course
	err = models.EnrollUserInCourse(h.DB, userID, req.CourseID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to enroll in course",
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Message: "Successfully enrolled in course",
		Data: map[string]interface{}{
			"courseId":    req.CourseID,
			"courseTitle": course.Title,
			"enrolledAt":  "now",
		},
	})
}

// GetUserEnrollments returns all courses the user is enrolled in
func (h *CourseHandler) GetUserEnrollments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := middleware.GetUserIDFromContext(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to get user ID",
			Message: err.Error(),
		})
		return
	}

	// Get enrolled courses with enrollment info and actual progress from course_progress table
	query := `
		SELECT c.id, c.title, c.description, c.category, c.level, c.duration,
		       c.instructor, c.rating, c.students, c.image,
		       ce.enrolled_at, ce.completed_at,
		       COALESCE(cp.overall_progress, 0) as progress,
		       COALESCE(cp.lessons_completed, 0) as lessons_completed,
		       COALESCE(cp.total_lessons, 0) as total_lessons,
		       COALESCE(cp.time_spent, 0) as time_spent,
		       cp.completed_at as course_completed_at
		FROM courses c
		INNER JOIN course_enrollments ce ON c.id = ce.course_id
		LEFT JOIN course_progress cp ON c.id = cp.course_id AND ce.user_id = cp.user_id
		WHERE ce.user_id = $1
		ORDER BY ce.enrolled_at DESC
	`

	rows, err := h.DB.Query(query, userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to fetch enrollments",
			Message: err.Error(),
		})
		return
	}
	defer rows.Close()

	var enrollments []map[string]interface{}
	for rows.Next() {
		var enrollment map[string]interface{} = make(map[string]interface{})
		var id, students, progress, lessonsCompleted, totalLessons, timeSpent int
		var title, description, category, level, duration, instructor, image string
		var rating float64
		var enrolledAt, completedAt, courseCompletedAt sql.NullTime

		err := rows.Scan(
			&id, &title, &description, &category, &level, &duration,
			&instructor, &rating, &students, &image,
			&enrolledAt, &completedAt, &progress, &lessonsCompleted, 
			&totalLessons, &timeSpent, &courseCompletedAt,
		)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{
				Error:   "Failed to scan enrollment",
				Message: err.Error(),
			})
			return
		}

		enrollment["id"] = id
		enrollment["title"] = title
		enrollment["description"] = description
		enrollment["category"] = category
		enrollment["level"] = level
		enrollment["duration"] = duration
		enrollment["instructor"] = instructor
		enrollment["rating"] = rating
		enrollment["students"] = students
		enrollment["image"] = image
		enrollment["isEnrolled"] = true
		enrollment["progress"] = progress
		enrollment["lessonsCompleted"] = lessonsCompleted
		enrollment["totalLessons"] = totalLessons
		enrollment["timeSpent"] = timeSpent
		enrollment["enrolledAt"] = enrolledAt.Time
		
		// Use course completion date from course_progress if available, otherwise from enrollment
		if courseCompletedAt.Valid {
			enrollment["completedAt"] = courseCompletedAt.Time
		} else if completedAt.Valid {
			enrollment["completedAt"] = completedAt.Time
		}

		enrollments = append(enrollments, enrollment)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Data:    enrollments,
	})
}

// SearchCourses searches courses by title, description, or category
func (h *CourseHandler) SearchCourses(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Missing search query",
			Message: "Search query parameter 'q' is required",
		})
		return
	}

	// Search in title, description, and category
	searchQuery := `
		SELECT id, title, description, category, level, duration, instructor,
		       rating, students, image, intro_material, lessons, pre_test,
		       post_test, post_work, final_project, created_at, updated_at
		FROM courses
		WHERE LOWER(title) LIKE LOWER($1)
		   OR LOWER(description) LIKE LOWER($1)
		   OR LOWER(category) LIKE LOWER($1)
		   OR LOWER(instructor) LIKE LOWER($1)
		ORDER BY 
			CASE WHEN LOWER(title) LIKE LOWER($1) THEN 1
			     WHEN LOWER(description) LIKE LOWER($1) THEN 2
			     ELSE 3 END,
			created_at DESC
	`

	searchTerm := "%" + strings.ToLower(query) + "%"
	rows, err := h.DB.Query(searchQuery, searchTerm)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error:   "Failed to search courses",
			Message: err.Error(),
		})
		return
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		err := rows.Scan(
			&course.ID, &course.Title, &course.Description, &course.Category,
			&course.Level, &course.Duration, &course.Instructor, &course.Rating,
			&course.Students, &course.Image, &course.IntroMaterial, &course.Lessons,
			&course.PreTest, &course.PostTest, &course.PostWork, &course.FinalProject,
			&course.CreatedAt, &course.UpdatedAt,
		)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(ErrorResponse{
				Error:   "Failed to scan course",
				Message: err.Error(),
			})
			return
		}
		courses = append(courses, course)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{
		Success: true,
		Message: "Search completed",
		Data: map[string]interface{}{
			"query":   query,
			"results": len(courses),
			"courses": courses,
		},
	})
}