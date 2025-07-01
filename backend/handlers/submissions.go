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

// PostWorkSubmissionRequest represents post-work submission
type PostWorkSubmissionRequest struct {
	CourseID    uint   `json:"course_id"`
	Description string `json:"description"`
	FileURL     string `json:"file_url,omitempty"`
	FileName    string `json:"file_name,omitempty"`
}

// FinalProjectSubmissionRequest represents final project submission
type FinalProjectSubmissionRequest struct {
	CourseID       uint   `json:"course_id"`
	Description    string `json:"description"`
	SubmissionType string `json:"submission_type"` // "file" or "link"
	FileURL        string `json:"file_url,omitempty"`
	FileName       string `json:"file_name,omitempty"`
	ProjectLink    string `json:"project_link,omitempty"`
}

// GradingRequest represents grading request
type GradingRequest struct {
	Grade    int    `json:"grade"`    // 0-100
	Feedback string `json:"feedback"`
}

// SubmitPostWork handles post-work submission
func SubmitPostWork(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	var req PostWorkSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate required fields
	if req.Description == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing required fields", "description is required")
		return
	}

	db := config.GetDB()

	// Check if user is enrolled in the course
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, req.CourseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusForbidden, "Not enrolled", "User is not enrolled in this course")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if submission already exists for this user and course
	var existingSubmission models.Submission
	if err := db.Where("user_id = ? AND course_id = ? AND type = ?", userID, req.CourseID, "postwork").First(&existingSubmission).Error; err == nil {
		// Update existing submission
		existingSubmission.Description = req.Description
		existingSubmission.ProjectLink = req.FileURL
		existingSubmission.SubmittedAt = time.Now()
		existingSubmission.Status = "submitted"

		if err := db.Save(&existingSubmission).Error; err != nil {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to update post-work submission", err.Error())
			return
		}

		utils.SendSuccessResponse(w, "Post-work submission updated successfully", existingSubmission)
		return
	} else if err != gorm.ErrRecordNotFound {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		return
	}

	// Get the PostWork assignment to link to
	var postWorkAssignment models.PostWork
	if err := db.Where("course_id = ?", req.CourseID).First(&postWorkAssignment).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusNotFound, "Post-work assignment not found", err.Error())
		return
	}

	// Create new post-work submission
		submission := models.Submission{
			UserID:       uint(userID),
			CourseID:     req.CourseID,
			PostWorkID:   &postWorkAssignment.ID,
			Type:         "postwork",
			Description:  req.Description,
			ProjectLink:  req.FileURL,
			Status:       "submitted",
			SubmittedAt:  time.Now(),
		}

	if err := db.Create(&submission).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to submit post-work", err.Error())
		return
	}

	utils.SendCreatedResponse(w, "Post-work submitted successfully", submission)
}

// SubmitFinalProject handles final project submission
func SubmitFinalProject(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid user ID", err.Error())
		return
	}

	var req FinalProjectSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate required fields
	if req.Description == "" || req.SubmissionType == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing required fields", "description and submission_type are required")
		return
	}

	if req.SubmissionType != "file" && req.SubmissionType != "link" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid submission type", "submission_type must be 'file' or 'link'")
		return
	}

	if req.SubmissionType == "file" && req.FileURL == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing file", "file_url is required for file submission")
		return
	}

	if req.SubmissionType == "link" && req.ProjectLink == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing link", "project_link is required for link submission")
		return
	}

	db := config.GetDB()

	// Check if user is enrolled in the course
	var enrollment models.Enrollment
	if err := db.Where("user_id = ? AND course_id = ?", userID, req.CourseID).First(&enrollment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusForbidden, "Not enrolled", "User is not enrolled in this course")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Check if submission already exists for this user and course
	var existingSubmission models.Submission
	if err := db.Where("user_id = ? AND course_id = ? AND type = ?", userID, req.CourseID, "finalproject").First(&existingSubmission).Error; err == nil {
		// Update existing submission
		existingSubmission.Description = req.Description
		existingSubmission.ProjectLink = req.ProjectLink
		existingSubmission.SubmittedAt = time.Now()
		existingSubmission.Status = "submitted"

		if err := db.Save(&existingSubmission).Error; err != nil {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to update final project submission", err.Error())
			return
		}

		utils.SendSuccessResponse(w, "Final project submission updated successfully", existingSubmission)
		return
	} else if err != gorm.ErrRecordNotFound {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		return
	}

	// Get the FinalProject assignment to link to
	var finalProjectAssignment models.FinalProject
	if err := db.Where("course_id = ?", req.CourseID).First(&finalProjectAssignment).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusNotFound, "Final project assignment not found", err.Error())
		return
	}

	// Create new final project submission
	submission := models.Submission{
		UserID:           uint(userID),
		CourseID:         req.CourseID,
		FinalProjectID:   &finalProjectAssignment.ID,
		Type:             "finalproject",
		Description:      req.Description,
		ProjectLink:      req.ProjectLink,
		Status:           "submitted",
		SubmittedAt:      time.Now(),
	}

	if err := db.Create(&submission).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to submit final project", err.Error())
		return
	}

	utils.SendCreatedResponse(w, "Final project submitted successfully", submission)
}

// GetUserSubmissions returns user's submissions for a course
func GetUserSubmissions(w http.ResponseWriter, r *http.Request) {
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

	// Get post-work
	var postWork models.PostWork
	postWorkErr := db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&postWork).Error

	// Get final project
	var finalProject models.FinalProject
	finalProjectErr := db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&finalProject).Error

	response := map[string]interface{}{}

	if postWorkErr == nil {
		response["post_work"] = postWork
	} else if postWorkErr != gorm.ErrRecordNotFound {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", postWorkErr.Error())
		return
	}

	if finalProjectErr == nil {
		response["final_project"] = finalProject
	} else if finalProjectErr != gorm.ErrRecordNotFound {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", finalProjectErr.Error())
		return
	}

	utils.SendSuccessResponse(w, "Submissions retrieved successfully", response)
}

// GradePostWork grades a post-work submission (admin only)
func GradePostWork(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid post-work ID", err.Error())
		return
	}

	var req GradingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate grade
	if req.Grade < 0 || req.Grade > 100 {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid grade", "Grade must be between 0 and 100")
		return
	}

	db := config.GetDB()
	var postWork models.PostWork
	if err := db.First(&postWork, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Post-work not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Find the submission for this post-work
	var submission models.Submission
	if err := db.Where("post_work_id = ?", id).First(&submission).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusNotFound, "Submission not found", err.Error())
		return
	}

	// Update submission with grade and feedback
	now := time.Now()
	submission.Grade = &req.Grade
	submission.Feedback = req.Feedback
	submission.Status = "graded"
	submission.ReviewedAt = &now

	if err := db.Save(&submission).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to grade post-work", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Post-work graded successfully", submission)
}

// GradeFinalProject grades a final project submission (admin only)
func GradeFinalProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid final project ID", err.Error())
		return
	}

	var req GradingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate grade
	if req.Grade < 0 || req.Grade > 100 {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid grade", "Grade must be between 0 and 100")
		return
	}

	db := config.GetDB()
	var finalProject models.FinalProject
	if err := db.First(&finalProject, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.SendErrorResponse(w, http.StatusNotFound, "Final project not found", "")
		} else {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Database error", err.Error())
		}
		return
	}

	// Find the submission for this final project
	var submission models.Submission
	if err := db.Where("final_project_id = ?", id).First(&submission).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusNotFound, "Submission not found", err.Error())
		return
	}

	// Update submission with grade and feedback
	now := time.Now()
	submission.Grade = &req.Grade
	submission.Feedback = req.Feedback
	submission.Status = "graded"
	submission.ReviewedAt = &now

	if err := db.Save(&submission).Error; err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to grade final project", err.Error())
		return
	}

	utils.SendSuccessResponse(w, "Final project graded successfully", submission)
}

// GetCourseSubmissions returns all submissions for a course (admin only)
func GetCourseSubmissions(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid course ID", err.Error())
		return
	}

	db := config.GetDB()

	// Get post-works
	var postWorks []models.PostWork
	db.Preload("User").Where("course_id = ?", courseID).Find(&postWorks)

	// Get final projects
	var finalProjects []models.FinalProject
	db.Preload("User").Where("course_id = ?", courseID).Find(&finalProjects)

	response := map[string]interface{}{
		"post_works":      postWorks,
		"final_projects": finalProjects,
	}

	utils.SendSuccessResponse(w, "Course submissions retrieved successfully", response)
}