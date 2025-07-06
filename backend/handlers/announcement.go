package handlers

import (
	"database/sql"
	"encoding/json"
	"lms-backend/models"
	"log"
	"net/http"
)

type AnnouncementHandler struct {
	db *sql.DB
}

func NewAnnouncementHandler(db *sql.DB) *AnnouncementHandler {
	return &AnnouncementHandler{db: db}
}

// GetUserAnnouncements gets announcements for the current user based on their role
func (h *AnnouncementHandler) GetUserAnnouncements(w http.ResponseWriter, r *http.Request) {
	// Get user role from context
	userRole := r.Context().Value("userRole").(string)

	announcements, err := models.GetAnnouncementsByAudience(h.db, userRole)
	if err != nil {
		log.Printf("Error getting user announcements: %v", err)
		http.Error(w, "Failed to get announcements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"announcements": announcements,
	})
}