package models

import (
	"database/sql"
	"encoding/json"
	"time"
)

// PostWorkSubmission represents a postwork submission
type PostWorkSubmission struct {
	ID          int             `json:"id"`
	UserID      int             `json:"userId"`
	CourseID    int             `json:"courseId"`
	LessonID    int             `json:"lessonId"`
	Title       string          `json:"title"`
	Content     string          `json:"content"`
	Attachments json.RawMessage `json:"attachments,omitempty"`
	Status      string          `json:"status"` // submitted, reviewed, approved, rejected
	Score       *int            `json:"score,omitempty"`
	Feedback    string          `json:"feedback,omitempty"`
	SubmittedAt time.Time       `json:"submittedAt"`
	ReviewedAt  *time.Time      `json:"reviewedAt,omitempty"`
	ReviewedBy  *int            `json:"reviewedBy,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// FinalProjectSubmission represents a final project submission
type FinalProjectSubmission struct {
	ID          int             `json:"id"`
	UserID      int             `json:"userId"`
	CourseID    int             `json:"courseId"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Content     string          `json:"content"`
	Attachments json.RawMessage `json:"attachments,omitempty"`
	GitHubURL   string          `json:"githubUrl,omitempty"`
	LiveURL     string          `json:"liveUrl,omitempty"`
	Status      string          `json:"status"` // submitted, reviewed, approved, rejected
	Score       *int            `json:"score,omitempty"`
	Feedback    string          `json:"feedback,omitempty"`
	SubmittedAt time.Time       `json:"submittedAt"`
	ReviewedAt  *time.Time      `json:"reviewedAt,omitempty"`
	ReviewedBy  *int            `json:"reviewedBy,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// FileUpload represents an uploaded file
type FileUpload struct {
	ID           int       `json:"id"`
	UserID       int       `json:"userId"`
	FileName     string    `json:"fileName"`
	OriginalName string    `json:"originalName"`
	FilePath     string    `json:"filePath"`
	FileSize     int64     `json:"fileSize"`
	MimeType     string    `json:"mimeType"`
	FileType     string    `json:"fileType"` // image, document, video, etc.
	UploadedAt   time.Time `json:"uploadedAt"`
}

// SubmissionRequest represents a submission request
type SubmissionRequest struct {
	CourseID    int             `json:"courseId"`
	LessonID    *int            `json:"lessonId,omitempty"`
	Title       string          `json:"title"`
	Content     string          `json:"content"`
	Description string          `json:"description,omitempty"`
	GitHubURL   string          `json:"githubUrl,omitempty"`
	LiveURL     string          `json:"liveUrl,omitempty"`
	Attachments json.RawMessage `json:"attachments,omitempty"`
}

// CreatePostWorkSubmissionTable creates the postwork_submissions table
func CreatePostWorkSubmissionTable(db *sql.DB) error {
	// First, try to alter the existing table to allow NULL lesson_id
	alterQuery := `ALTER TABLE postwork_submissions ALTER COLUMN lesson_id DROP NOT NULL;`
	db.Exec(alterQuery) // Ignore error if table doesn't exist or column is already nullable

	query := `
	CREATE TABLE IF NOT EXISTS postwork_submissions (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
		lesson_id INTEGER, -- NULL allowed for course-level PostWork
		title VARCHAR(255) NOT NULL,
		content TEXT NOT NULL,
		attachments JSONB,
		status VARCHAR(50) DEFAULT 'submitted',
		score INTEGER,
		feedback TEXT,
		submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		reviewed_at TIMESTAMP,
		reviewed_by INTEGER REFERENCES users(id),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(query)
	return err
}

// CreateFinalProjectSubmissionTable creates the final_project_submissions table
func CreateFinalProjectSubmissionTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS final_project_submissions (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		content TEXT NOT NULL,
		attachments JSONB,
		github_url VARCHAR(500),
		live_url VARCHAR(500),
		status VARCHAR(50) DEFAULT 'submitted',
		score INTEGER,
		feedback TEXT,
		submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		reviewed_at TIMESTAMP,
		reviewed_by INTEGER REFERENCES users(id),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, course_id)
	);
	`
	_, err := db.Exec(query)
	return err
}

// CreateFileUploadTable creates the file_uploads table
func CreateFileUploadTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS file_uploads (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		file_name VARCHAR(255) NOT NULL,
		original_name VARCHAR(255) NOT NULL,
		file_path VARCHAR(500) NOT NULL,
		file_size BIGINT NOT NULL,
		mime_type VARCHAR(100) NOT NULL,
		file_type VARCHAR(50) NOT NULL,
		uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(query)
	return err
}

// CreatePostWorkSubmission creates a new postwork submission
func CreatePostWorkSubmission(db *sql.DB, userID int, req SubmissionRequest) (*PostWorkSubmission, error) {
	query := `
	INSERT INTO postwork_submissions (user_id, course_id, lesson_id, title, content, attachments, submitted_at, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING id, user_id, course_id, lesson_id, title, content, attachments, status, score, feedback, submitted_at, reviewed_at, reviewed_by, created_at, updated_at
	`
	row := db.QueryRow(query, userID, req.CourseID, req.LessonID, req.Title, req.Content, req.Attachments)

	var submission PostWorkSubmission
	var lessonID sql.NullInt64
	var score sql.NullInt64
	var feedback sql.NullString
	var reviewedAt sql.NullTime
	var reviewedBy sql.NullInt64
	err := row.Scan(&submission.ID, &submission.UserID, &submission.CourseID, &lessonID, &submission.Title, &submission.Content, &submission.Attachments, &submission.Status, &score, &feedback, &submission.SubmittedAt, &reviewedAt, &reviewedBy, &submission.CreatedAt, &submission.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if lessonID.Valid {
		submission.LessonID = int(lessonID.Int64)
	}
	if score.Valid {
		scoreInt := int(score.Int64)
		submission.Score = &scoreInt
	}
	if feedback.Valid {
		submission.Feedback = feedback.String
	}
	if reviewedAt.Valid {
		submission.ReviewedAt = &reviewedAt.Time
	}
	if reviewedBy.Valid {
		reviewedByInt := int(reviewedBy.Int64)
		submission.ReviewedBy = &reviewedByInt
	}

	return &submission, nil
}

// CreateFinalProjectSubmission creates a new final project submission
func CreateFinalProjectSubmission(db *sql.DB, userID int, req SubmissionRequest) (*FinalProjectSubmission, error) {
	query := `
	INSERT INTO final_project_submissions (user_id, course_id, title, description, content, attachments, github_url, live_url, submitted_at, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	ON CONFLICT (user_id, course_id)
	DO UPDATE SET
		title = EXCLUDED.title,
		description = EXCLUDED.description,
		content = EXCLUDED.content,
		attachments = EXCLUDED.attachments,
		github_url = EXCLUDED.github_url,
		live_url = EXCLUDED.live_url,
		status = 'submitted',
		submitted_at = CURRENT_TIMESTAMP,
		updated_at = CURRENT_TIMESTAMP
	RETURNING id, user_id, course_id, title, description, content, attachments, github_url, live_url, status, score, feedback, submitted_at, reviewed_at, reviewed_by, created_at, updated_at
	`
	row := db.QueryRow(query, userID, req.CourseID, req.Title, req.Description, req.Content, req.Attachments, req.GitHubURL, req.LiveURL)

	var submission FinalProjectSubmission
	var score sql.NullInt64
	var feedback sql.NullString
	var reviewedAt sql.NullTime
	var reviewedBy sql.NullInt64
	err := row.Scan(&submission.ID, &submission.UserID, &submission.CourseID, &submission.Title, &submission.Description, &submission.Content, &submission.Attachments, &submission.GitHubURL, &submission.LiveURL, &submission.Status, &score, &feedback, &submission.SubmittedAt, &reviewedAt, &reviewedBy, &submission.CreatedAt, &submission.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if score.Valid {
		scoreInt := int(score.Int64)
		submission.Score = &scoreInt
	}
	if feedback.Valid {
		submission.Feedback = feedback.String
	}
	if reviewedAt.Valid {
		submission.ReviewedAt = &reviewedAt.Time
	}
	if reviewedBy.Valid {
		reviewedByInt := int(reviewedBy.Int64)
		submission.ReviewedBy = &reviewedByInt
	}

	return &submission, nil
}

// GetPostWorkSubmissions gets postwork submissions for a user
func GetPostWorkSubmissions(db *sql.DB, userID int, courseID *int) ([]PostWorkSubmission, error) {
	var query string
	var args []interface{}

	if courseID != nil {
		query = `
		SELECT id, user_id, course_id, lesson_id, title, content, attachments, status, score, feedback, submitted_at, reviewed_at, reviewed_by, created_at, updated_at
		FROM postwork_submissions
		WHERE user_id = $1 AND course_id = $2
		ORDER BY submitted_at DESC
		`
		args = []interface{}{userID, *courseID}
	} else {
		query = `
		SELECT id, user_id, course_id, lesson_id, title, content, attachments, status, score, feedback, submitted_at, reviewed_at, reviewed_by, created_at, updated_at
		FROM postwork_submissions
		WHERE user_id = $1
		ORDER BY submitted_at DESC
		`
		args = []interface{}{userID}
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []PostWorkSubmission
	for rows.Next() {
		var submission PostWorkSubmission
		var lessonID sql.NullInt64
		var score sql.NullInt64
		var feedback sql.NullString
		var reviewedAt sql.NullTime
		var reviewedBy sql.NullInt64
		err := rows.Scan(&submission.ID, &submission.UserID, &submission.CourseID, &lessonID, &submission.Title, &submission.Content, &submission.Attachments, &submission.Status, &score, &feedback, &submission.SubmittedAt, &reviewedAt, &reviewedBy, &submission.CreatedAt, &submission.UpdatedAt)
		if err != nil {
			return nil, err
		}

		if lessonID.Valid {
			submission.LessonID = int(lessonID.Int64)
		}
		if score.Valid {
			scoreInt := int(score.Int64)
			submission.Score = &scoreInt
		}
		if feedback.Valid {
			submission.Feedback = feedback.String
		}
		if reviewedAt.Valid {
			submission.ReviewedAt = &reviewedAt.Time
		}
		if reviewedBy.Valid {
			reviewedByInt := int(reviewedBy.Int64)
			submission.ReviewedBy = &reviewedByInt
		}

		submissions = append(submissions, submission)
	}

	return submissions, nil
}

// GetFinalProjectSubmission gets final project submission for a user and course
func GetFinalProjectSubmission(db *sql.DB, userID, courseID int) (*FinalProjectSubmission, error) {
	query := `
	SELECT id, user_id, course_id, title, description, content, attachments, github_url, live_url, status, score, feedback, submitted_at, reviewed_at, reviewed_by, created_at, updated_at
	FROM final_project_submissions
	WHERE user_id = $1 AND course_id = $2
	`
	row := db.QueryRow(query, userID, courseID)

	var submission FinalProjectSubmission
	var score sql.NullInt64
	var feedback sql.NullString
	var reviewedAt sql.NullTime
	var reviewedBy sql.NullInt64
	err := row.Scan(&submission.ID, &submission.UserID, &submission.CourseID, &submission.Title, &submission.Description, &submission.Content, &submission.Attachments, &submission.GitHubURL, &submission.LiveURL, &submission.Status, &score, &feedback, &submission.SubmittedAt, &reviewedAt, &reviewedBy, &submission.CreatedAt, &submission.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if score.Valid {
		scoreInt := int(score.Int64)
		submission.Score = &scoreInt
	}
	if feedback.Valid {
		submission.Feedback = feedback.String
	}
	if reviewedAt.Valid {
		submission.ReviewedAt = &reviewedAt.Time
	}
	if reviewedBy.Valid {
		reviewedByInt := int(reviewedBy.Int64)
		submission.ReviewedBy = &reviewedByInt
	}

	return &submission, nil
}

// CreateFileUpload creates a new file upload record
func CreateFileUpload(db *sql.DB, userID int, fileName, originalName, filePath string, fileSize int64, mimeType, fileType string) (*FileUpload, error) {
	query := `
	INSERT INTO file_uploads (user_id, file_name, original_name, file_path, file_size, mime_type, file_type, uploaded_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
	RETURNING id, user_id, file_name, original_name, file_path, file_size, mime_type, file_type, uploaded_at
	`
	row := db.QueryRow(query, userID, fileName, originalName, filePath, fileSize, mimeType, fileType)

	var upload FileUpload
	err := row.Scan(&upload.ID, &upload.UserID, &upload.FileName, &upload.OriginalName, &upload.FilePath, &upload.FileSize, &upload.MimeType, &upload.FileType, &upload.UploadedAt)
	if err != nil {
		return nil, err
	}

	return &upload, nil
}

// GetFileUpload gets a file upload by ID
func GetFileUpload(db *sql.DB, fileID int) (*FileUpload, error) {
	query := `
	SELECT id, user_id, file_name, original_name, file_path, file_size, mime_type, file_type, uploaded_at
	FROM file_uploads
	WHERE id = $1
	`
	row := db.QueryRow(query, fileID)

	var upload FileUpload
	err := row.Scan(&upload.ID, &upload.UserID, &upload.FileName, &upload.OriginalName, &upload.FilePath, &upload.FileSize, &upload.MimeType, &upload.FileType, &upload.UploadedAt)
	if err != nil {
		return nil, err
	}

	return &upload, nil
}