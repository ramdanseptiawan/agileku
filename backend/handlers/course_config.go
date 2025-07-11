package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"lms-backend/middleware"
	"lms-backend/models"
)

// CourseConfigRequest represents the request body for updating course configuration
type CourseConfigRequest struct {
	HasPostWork      bool                   `json:"hasPostWork"`
	HasFinalProject  bool                   `json:"hasFinalProject"`
	CertificateDelay int                    `json:"certificateDelay"`
	StepWeights      map[string]interface{} `json:"stepWeights"`
}

// CourseConfigResponse represents the response for course configuration
type CourseConfigResponse struct {
	HasPostWork      bool                   `json:"hasPostWork"`
	HasFinalProject  bool                   `json:"hasFinalProject"`
	CertificateDelay int                    `json:"certificateDelay"`
	StepWeights      map[string]interface{} `json:"stepWeights"`
}

// UpdateCourseConfigHandler handles updating course configuration
func UpdateCourseConfigHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		user, err := middleware.GetUserFromContext(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if user.Role != "admin" {
			http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
			return
		}

		// Get course ID from URL
		vars := mux.Vars(r)
		courseIDStr := vars["courseId"]
		courseID, err := strconv.Atoi(courseIDStr)
		if err != nil {
			http.Error(w, "Invalid course ID", http.StatusBadRequest)
			return
		}

		// Parse request body
		var req CourseConfigRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Convert stepWeights to JSON
		var stepWeightsJSON *json.RawMessage
		if req.StepWeights != nil {
			stepWeightsBytes, err := json.Marshal(req.StepWeights)
			if err != nil {
				http.Error(w, "Invalid step weights format", http.StatusBadRequest)
				return
			}
			stepWeightsRaw := json.RawMessage(stepWeightsBytes)
			stepWeightsJSON = &stepWeightsRaw
		}

		// Update course configuration
		err = models.UpdateCourseConfiguration(db, courseID, req.HasPostWork, req.HasFinalProject, req.CertificateDelay, stepWeightsJSON)
		if err != nil {
			http.Error(w, "Failed to update course configuration", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Course configuration updated successfully"})
	}
}

// GetCourseConfigHandler handles getting course configuration
func GetCourseConfigHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if user is admin
		user, err := middleware.GetUserFromContext(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if user.Role != "admin" {
			http.Error(w, "Forbidden: Admin access required", http.StatusForbidden)
			return
		}

		// Get course ID from URL
		vars := mux.Vars(r)
		courseIDStr := vars["courseId"]
		courseID, err := strconv.Atoi(courseIDStr)
		if err != nil {
			http.Error(w, "Invalid course ID", http.StatusBadRequest)
			return
		}

		// Get course configuration
		hasPostWork, hasFinalProject, certificateDelay, stepWeights, err := models.GetCourseConfiguration(db, courseID)
		if err != nil {
			http.Error(w, "Failed to get course configuration", http.StatusInternalServerError)
			return
		}

		// Parse stepWeights
		var stepWeightsMap map[string]interface{}
		if stepWeights != nil {
			if err := json.Unmarshal(*stepWeights, &stepWeightsMap); err != nil {
				// If parsing fails, use default weights
				stepWeightsMap = map[string]interface{}{
					"intro":        10,
					"pretest":      15,
					"lessons":      40,
					"posttest":     35,
					"postwork":     0,
					"finalproject": 0,
				}
			}
		} else {
			// Default weights
			stepWeightsMap = map[string]interface{}{
				"intro":        10,
				"pretest":      15,
				"lessons":      40,
				"posttest":     35,
				"postwork":     0,
				"finalproject": 0,
			}
		}

		response := CourseConfigResponse{
			HasPostWork:      hasPostWork,
			HasFinalProject:  hasFinalProject,
			CertificateDelay: certificateDelay,
			StepWeights:      stepWeightsMap,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// GetCourseConfigForUserHandler handles getting course configuration for regular users
func GetCourseConfigForUserHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get course ID from URL
		vars := mux.Vars(r)
		courseIDStr := vars["courseId"]
		courseID, err := strconv.Atoi(courseIDStr)
		if err != nil {
			http.Error(w, "Invalid course ID", http.StatusBadRequest)
			return
		}

		// Get course configuration (no admin check needed for reading)
		hasPostWork, hasFinalProject, certificateDelay, stepWeights, err := models.GetCourseConfiguration(db, courseID)
		if err != nil {
			http.Error(w, "Failed to get course configuration", http.StatusInternalServerError)
			return
		}

		// Parse stepWeights
		var stepWeightsMap map[string]interface{}
		if stepWeights != nil {
			if err := json.Unmarshal(*stepWeights, &stepWeightsMap); err != nil {
				// If parsing fails, use default weights
				stepWeightsMap = map[string]interface{}{
					"intro":        10,
					"pretest":      15,
					"lessons":      40,
					"posttest":     35,
					"postwork":     0,
					"finalproject": 0,
				}
			}
		} else {
			// Default weights
			stepWeightsMap = map[string]interface{}{
				"intro":        10,
				"pretest":      15,
				"lessons":      40,
				"posttest":     35,
				"postwork":     0,
				"finalproject": 0,
			}
		}

		response := CourseConfigResponse{
			HasPostWork:      hasPostWork,
			HasFinalProject:  hasFinalProject,
			CertificateDelay: certificateDelay,
			StepWeights:      stepWeightsMap,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}