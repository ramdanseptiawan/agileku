package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"lms-backend/config"
	"lms-backend/models"
	"lms-backend/utils"
)

// CourseRequest represents course creation/update request
type CourseRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Level       string `json:"level"`
	Duration    string `json:"duration"`
	Instructor  string `json:"instructor"`
	Image       string `json:"image"`
}

// GetCourses returns all courses
func GetCourses(w http.ResponseWriter, r *http.Request) {
	db := config.GetDB()
	var courses []models.Course

	// Get query parameters
	category := r.URL.Query().Get("category")
	level := r.URL.Query().Get("level")
	search := r.URL.Query().Get("search")

	query := db.Preload("Lessons").Preload("Quizzes")

	// Apply filters
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if level != "" {
		query = query.Where("level = ?", level)
	}
	if search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&courses).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to fetch courses", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Courses retrieved successfully", courses)
}

// GetCourse returns a single course by ID
func GetCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	db := config.GetDB()
	var course models.Course
	if err := db.Preload("Lessons").Preload("Quizzes.Questions").Preload("IntroMaterials").First(&course, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Course not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	utils.SendSuccessResponse(w, "Course retrieved successfully", course)
}

// CreateCourse creates a new course
func CreateCourse(w http.ResponseWriter, r *http.Request) {
	var req CourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate required fields
	if req.Title == "" || req.Description == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing required fields", "title and description are required")
		return
	}

	course := models.Course{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Level:       req.Level,
		Duration:    req.Duration,
		Instructor:  req.Instructor,
		Image:       req.Image,
		Rating:      0.0,
		Students:    0,
	}

	db := config.GetDB()
	if err := db.Create(&course).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to create course", err.Error())
		return
	}

	utils.SendCreatedResponse(w, "Course created successfully", course)
}

// UpdateCourse updates an existing course
func UpdateCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	var req CourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	db := config.GetDB()
	var course models.Course
	if err := db.First(&course, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Course not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Update fields
	if req.Title != "" {
		course.Title = req.Title
	}
	if req.Description != "" {
		course.Description = req.Description
	}
	if req.Category != "" {
		course.Category = req.Category
	}
	if req.Level != "" {
		course.Level = req.Level
	}
	if req.Duration != "" {
		course.Duration = req.Duration
	}
	if req.Instructor != "" {
		course.Instructor = req.Instructor
	}
	if req.Image != "" {
		course.Image = req.Image
	}

	if err := db.Save(&course).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to update course", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Course updated successfully", course)
}

// DeleteCourse deletes a course
func DeleteCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	db := config.GetDB()
	var course models.Course
	if err := db.First(&course, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Course not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	if err := db.Delete(&course).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to delete course", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Course deleted successfully", nil)
}