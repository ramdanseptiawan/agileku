package models

import (
	"database/sql"
	"time"
)

type Grade struct {
	ID           int       `json:"id" db:"id"`
	UserID       int       `json:"userId" db:"user_id"`
	CourseID     int       `json:"courseId" db:"course_id"`
	SubmissionID *int      `json:"submissionId,omitempty" db:"submission_id"`
	Grade        float64   `json:"grade" db:"grade"`
	Feedback     string    `json:"feedback" db:"feedback"`
	GradedAt     time.Time `json:"gradedAt" db:"graded_at"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

type GradeWithDetails struct {
	Grade
	UserName    string `json:"userName" db:"user_name"`
	CourseTitle string `json:"courseTitle" db:"course_title"`
}

type CreateGradeRequest struct {
	UserID       int     `json:"userId"`
	CourseID     int     `json:"courseId"`
	SubmissionID *int    `json:"submissionId,omitempty"`
	Grade        float64 `json:"grade"`
	Feedback     string  `json:"feedback"`
}

// CreateGrade creates a new grade record
func CreateGrade(db *sql.DB, req CreateGradeRequest) (*Grade, error) {
	query := `
		INSERT INTO grades (user_id, course_id, submission_id, grade, feedback, graded_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
		RETURNING id, user_id, course_id, submission_id, grade, feedback, graded_at, created_at, updated_at
	`

	var grade Grade
	err := db.QueryRow(query, req.UserID, req.CourseID, req.SubmissionID, req.Grade, req.Feedback).Scan(
		&grade.ID,
		&grade.UserID,
		&grade.CourseID,
		&grade.SubmissionID,
		&grade.Grade,
		&grade.Feedback,
		&grade.GradedAt,
		&grade.CreatedAt,
		&grade.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &grade, nil
}

// GetGradesByUser gets all grades for a specific user
func GetGradesByUser(db *sql.DB, userID int) ([]GradeWithDetails, error) {
	query := `
		SELECT 
			g.id, g.user_id, g.course_id, g.submission_id, g.grade, g.feedback, 
			g.graded_at, g.created_at, g.updated_at,
			u.full_name as user_name,
			c.title as course_title
		FROM grades g
		JOIN users u ON g.user_id = u.id
		JOIN courses c ON g.course_id = c.id
		WHERE g.user_id = $1
		ORDER BY g.graded_at DESC
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grades []GradeWithDetails
	for rows.Next() {
		var grade GradeWithDetails
		err := rows.Scan(
			&grade.ID,
			&grade.UserID,
			&grade.CourseID,
			&grade.SubmissionID,
			&grade.Grade,
			&grade.Feedback,
			&grade.GradedAt,
			&grade.CreatedAt,
			&grade.UpdatedAt,
			&grade.UserName,
			&grade.CourseTitle,
		)
		if err != nil {
			return nil, err
		}
		grades = append(grades, grade)
	}

	return grades, nil
}

// GetGradesByCourse gets all grades for a specific course
func GetGradesByCourse(db *sql.DB, courseID int) ([]GradeWithDetails, error) {
	query := `
		SELECT 
			g.id, g.user_id, g.course_id, g.submission_id, g.grade, g.feedback, 
			g.graded_at, g.created_at, g.updated_at,
			u.full_name as user_name,
			c.title as course_title
		FROM grades g
		JOIN users u ON g.user_id = u.id
		JOIN courses c ON g.course_id = c.id
		WHERE g.course_id = $1
		ORDER BY g.graded_at DESC
	`

	rows, err := db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grades []GradeWithDetails
	for rows.Next() {
		var grade GradeWithDetails
		err := rows.Scan(
			&grade.ID,
			&grade.UserID,
			&grade.CourseID,
			&grade.SubmissionID,
			&grade.Grade,
			&grade.Feedback,
			&grade.GradedAt,
			&grade.CreatedAt,
			&grade.UpdatedAt,
			&grade.UserName,
			&grade.CourseTitle,
		)
		if err != nil {
			return nil, err
		}
		grades = append(grades, grade)
	}

	return grades, nil
}

// GetAllGrades gets all grades (for admin)
func GetAllGrades(db *sql.DB) ([]GradeWithDetails, error) {
	query := `
		SELECT 
			g.id, g.user_id, g.course_id, g.submission_id, g.grade, g.feedback, 
			g.graded_at, g.created_at, g.updated_at,
			u.full_name as user_name,
			c.title as course_title
		FROM grades g
		JOIN users u ON g.user_id = u.id
		JOIN courses c ON g.course_id = c.id
		ORDER BY g.graded_at DESC
		LIMIT 100
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grades []GradeWithDetails
	for rows.Next() {
		var grade GradeWithDetails
		err := rows.Scan(
			&grade.ID,
			&grade.UserID,
			&grade.CourseID,
			&grade.SubmissionID,
			&grade.Grade,
			&grade.Feedback,
			&grade.GradedAt,
			&grade.CreatedAt,
			&grade.UpdatedAt,
			&grade.UserName,
			&grade.CourseTitle,
		)
		if err != nil {
			return nil, err
		}
		grades = append(grades, grade)
	}

	return grades, nil
}

// GetGradeBySubmission gets grade for a specific submission
func GetGradeBySubmission(db *sql.DB, submissionID int) (*Grade, error) {
	query := `
		SELECT id, user_id, course_id, submission_id, grade, feedback, graded_at, created_at, updated_at
		FROM grades
		WHERE submission_id = $1
	`

	var grade Grade
	err := db.QueryRow(query, submissionID).Scan(
		&grade.ID,
		&grade.UserID,
		&grade.CourseID,
		&grade.SubmissionID,
		&grade.Grade,
		&grade.Feedback,
		&grade.GradedAt,
		&grade.CreatedAt,
		&grade.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &grade, nil
}