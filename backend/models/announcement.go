package models

import (
	"database/sql"
	"time"
)

type Announcement struct {
	ID             int       `json:"id"`
	Title          string    `json:"title"`
	Content        string    `json:"content"`
	Priority       string    `json:"priority"`       // normal, medium, high
	TargetAudience string    `json:"targetAudience"` // all, users, admins
	Author         string    `json:"author"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type CreateAnnouncementRequest struct {
	Title          string `json:"title"`
	Content        string `json:"content"`
	Priority       string `json:"priority"`
	TargetAudience string `json:"targetAudience"`
}

type UpdateAnnouncementRequest struct {
	Title          string `json:"title"`
	Content        string `json:"content"`
	Priority       string `json:"priority"`
	TargetAudience string `json:"targetAudience"`
}

// CreateAnnouncement creates a new announcement
func CreateAnnouncement(db *sql.DB, req CreateAnnouncementRequest, author string) (*Announcement, error) {
	query := `
		INSERT INTO announcements (title, content, priority, target_audience, author)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	announcement := &Announcement{
		Title:          req.Title,
		Content:        req.Content,
		Priority:       req.Priority,
		TargetAudience: req.TargetAudience,
		Author:         author,
	}

	err := db.QueryRow(query, req.Title, req.Content, req.Priority, req.TargetAudience, author).Scan(
		&announcement.ID, &announcement.CreatedAt, &announcement.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return announcement, nil
}

// GetAllAnnouncements retrieves all announcements
func GetAllAnnouncements(db *sql.DB) ([]Announcement, error) {
	query := `
		SELECT id, title, content, priority, target_audience, author, created_at, updated_at
		FROM announcements
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var announcements []Announcement
	for rows.Next() {
		var announcement Announcement
		err := rows.Scan(&announcement.ID, &announcement.Title, &announcement.Content,
			&announcement.Priority, &announcement.TargetAudience, &announcement.Author,
			&announcement.CreatedAt, &announcement.UpdatedAt)
		if err != nil {
			return nil, err
		}
		announcements = append(announcements, announcement)
	}

	return announcements, nil
}

// GetAnnouncementsByAudience retrieves announcements for specific audience
func GetAnnouncementsByAudience(db *sql.DB, userRole string) ([]Announcement, error) {
	query := `
		SELECT id, title, content, priority, target_audience, author, created_at, updated_at
		FROM announcements
		WHERE target_audience = 'all' OR target_audience = $1
		ORDER BY created_at DESC
	`

	// Map user roles to announcement audiences
	audience := "users" // default
	if userRole == "admin" {
		audience = "admins"
	}

	rows, err := db.Query(query, audience)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var announcements []Announcement
	for rows.Next() {
		var announcement Announcement
		err := rows.Scan(&announcement.ID, &announcement.Title, &announcement.Content,
			&announcement.Priority, &announcement.TargetAudience, &announcement.Author,
			&announcement.CreatedAt, &announcement.UpdatedAt)
		if err != nil {
			return nil, err
		}
		announcements = append(announcements, announcement)
	}

	return announcements, nil
}

// GetAnnouncementByID retrieves a specific announcement by ID
func GetAnnouncementByID(db *sql.DB, id int) (*Announcement, error) {
	query := `
		SELECT id, title, content, priority, target_audience, author, created_at, updated_at
		FROM announcements
		WHERE id = $1
	`

	var announcement Announcement
	err := db.QueryRow(query, id).Scan(&announcement.ID, &announcement.Title, &announcement.Content,
		&announcement.Priority, &announcement.TargetAudience, &announcement.Author,
		&announcement.CreatedAt, &announcement.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &announcement, nil
}

// UpdateAnnouncement updates an existing announcement
func UpdateAnnouncement(db *sql.DB, id int, req UpdateAnnouncementRequest) (*Announcement, error) {
	query := `
		UPDATE announcements
		SET title = $1, content = $2, priority = $3, target_audience = $4, updated_at = CURRENT_TIMESTAMP
		WHERE id = $5
		RETURNING id, title, content, priority, target_audience, author, created_at, updated_at
	`

	var announcement Announcement
	err := db.QueryRow(query, req.Title, req.Content, req.Priority, req.TargetAudience, id).Scan(
		&announcement.ID, &announcement.Title, &announcement.Content, &announcement.Priority,
		&announcement.TargetAudience, &announcement.Author, &announcement.CreatedAt, &announcement.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &announcement, nil
}

// DeleteAnnouncement deletes an announcement
func DeleteAnnouncement(db *sql.DB, id int) error {
	query := `DELETE FROM announcements WHERE id = $1`
	result, err := db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}