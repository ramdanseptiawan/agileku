package utils

import (
	"encoding/json"
	"net/http"
)

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error"`
}

// SendJSONResponse sends a JSON response
func SendJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// SendSuccessResponse sends a success response
func SendSuccessResponse(w http.ResponseWriter, message string, data interface{}) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	SendJSONResponse(w, http.StatusOK, response)
}

// SendErrorResponse sends an error response
func SendErrorResponse(w http.ResponseWriter, statusCode int, message, error string) {
	response := ErrorResponse{
		Success: false,
		Message: message,
		Error:   error,
	}
	SendJSONResponse(w, statusCode, response)
}

// SendCreatedResponse sends a created response
func SendCreatedResponse(w http.ResponseWriter, message string, data interface{}) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	SendJSONResponse(w, http.StatusCreated, response)
}

// SendNoContentResponse sends a no content response
func SendNoContentResponse(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}