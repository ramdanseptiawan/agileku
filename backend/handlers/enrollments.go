package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"lms-backend/config"
	"lms-backend/models"
	"lms-backend/utils"
)

// EnrollmentRequest represents enrollment request
type EnrollmentRequest struct {
	CourseID uint `json:"course_id"`
}

// ProgressRequest represents progress update request
type ProgressRequest struct {
	LessonID   uint `json:"lesson_id"`
	Completed  bool `json:"completed"`
	TimeSpent  int  `json:"time_spent"` // in minutes
}

// EnrollInCourse enrolls a user in a course
func EnrollInCourse(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	var req EnrollmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	db := config.GetDB()

	// Check if course exists
	var course models.Course
	if err := db.First(&course, req.CourseID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Course not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if already enrolled
	var existingEnrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, req.CourseID).First(&existingEnrollment).Error; err == nil {
		utils.SendErrorResponse(w, http.StatusConflict, "Already enrolled", "User is already enrolled in this course")
		return
	}

	// Create enrollment
	enrollment := models.Enrollment{
		UserID:    uint(userID),
		CourseID:  req.CourseID,
		StartedAt: time.Now(),
		Status:    "active",
	}

	if err := db.Create(&enrollment).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to enroll in course", err.Error())
		return
	}

	// Update course student count
	db.Model(&course).Update("students", gorm.Expr("students + ?", 1))

	utils.SendCreatedResponse(w, "Enrolled in course successfully", enrollment)
}

// GetUserEnrollments returns user's enrollments
func GetUserEnrollments(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	db := config.GetDB()
	var enrollments []models.Enrollment
	if err := db.Preload("Course").Where("user_id = ?", userID).Find(&enrollments).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to fetch enrollments", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Enrollments retrieved successfully", enrollments)
}

// UpdateLessonProgress updates lesson progress
func UpdateLessonProgress(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	var req ProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	db := config.GetDB()

	// Check if lesson exists and get course ID
	var lesson models.Lesson
	if err := db.First(&lesson, req.LessonID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Lesson not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if user is enrolled in the course
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, lesson.CourseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusForbidden, "Not enrolled", "User is not enrolled in this course")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Update or create lesson progress
	var lessonProgress models.LessonProgress
	result := db.Where("user_id = ? AND lesson_id = ?", userID, req.LessonID).First(&lessonProgress)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new progress record
		lessonProgress = models.LessonProgress{
			UserID:    uint(userID),
			LessonID:  req.LessonID,
			Completed: req.Completed,
			TimeSpent: req.TimeSpent,
		}
		if req.Completed {
			lessonProgress.LastAccessed = time.Now()
		}
		if err := db.Create(&lessonProgress).Error; err != nil {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to create lesson progress", err.Error())
			return
		}
	} else if result.Error != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", result.Error.Error())
		return
	} else {
		// Update existing progress
		lessonProgress.Completed = req.Completed
		lessonProgress.TimeSpent += req.TimeSpent
		if req.Completed {
			lessonProgress.LastAccessed = time.Now()
		}
		if err := db.Save(&lessonProgress).Error; err != nil {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to update lesson progress", err.Error())
			return
		}
	}

	// Update overall course progress
	updateCourseProgress(db, uint(userID), lesson.CourseID)

	utils.SendSuccessResponse(w, "Lesson progress updated successfully", lessonProgress)
}

// GetCourseProgress returns user's progress for a specific course
func GetCourseProgress(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	db := config.GetDB()

	// Get enrollment
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Enrollment not found", "User is not enrolled in this course")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Get lesson progress
	var lessonProgress []models.LessonProgress
	db.Preload("Lesson").Where("user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)", userID, courseID).Find(&lessonProgress)

	response := map[string]interface{}{
		"enrollment":      enrollment,
		"lesson_progress": lessonProgress,
	}

	utils.SendSuccessResponse(w, "Course progress retrieved successfully", response)
}

// updateCourseProgress calculates and updates overall course progress
func updateCourseProgress(db *gorm.DB, userID, courseID uint) {
	// Get total lessons in course
	var totalLessons int64
	db.Model(&models.Lesson{}).Where("course_id = ?", courseID).Count(&totalLessons)

	if totalLessons == 0 {
		return
	}

	// Get completed lessons
	var completedLessons int64
	db.Model(&models.LessonProgress{}).Where("user_id = ? AND completed = true AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)", userID, courseID).Count(&completedLessons)

	// Calculate progress percentage
	progress := float64(completedLessons) / float64(totalLessons) * 100

	// Update enrollment progress
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&enrollment).Error; err == nil {
		enrollment.Progress = int(progress)
		if progress >= 100 {
			enrollment.CompletedAt = &time.Time{}
			*enrollment.CompletedAt = time.Now()
		}
		db.Save(&enrollment)
	}
}