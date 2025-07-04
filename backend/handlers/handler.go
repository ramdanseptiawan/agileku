package handlers

import (
	"database/sql"
)

// Handler is the base handler struct that contains shared dependencies
type Handler struct {
	DB *sql.DB
}

// NewProgressHandler creates a new progress handler
func NewProgressHandler(db *sql.DB) *Handler {
	return &Handler{DB: db}
}

// NewQuizHandler creates a new quiz handler
func NewQuizHandler(db *sql.DB) *Handler {
	return &Handler{DB: db}
}

// NewSubmissionHandler creates a new submission handler
func NewSubmissionHandler(db *sql.DB) *Handler {
	return &Handler{DB: db}
}