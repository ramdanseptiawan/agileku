package models

import (
	"database/sql"
	"fmt"
	"time"
)

// Certificate represents a course completion certificate
type Certificate struct {
	ID           int       `json:"id"`
	UserID       int       `json:"userId"`
	CourseID     int       `json:"courseId"`
	CertNumber   string    `json:"certNumber"`
	UserName     string    `json:"userName"`
	CourseName   string    `json:"courseName"`
	Instructor   string    `json:"instructor"`
	CompletionDate time.Time `json:"completionDate"`
	IssuedAt     time.Time `json:"issuedAt"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// CertificateVerification represents certificate verification data
type CertificateVerification struct {
	CertNumber     string    `json:"certNumber"`
	UserName       string    `json:"userName"`
	CourseName     string    `json:"courseName"`
	Instructor     string    `json:"instructor"`
	CompletionDate time.Time `json:"completionDate"`
	IssuedAt       time.Time `json:"issuedAt"`
	IsValid        bool      `json:"isValid"`
}

// CreateCertificate creates a new certificate in the database
func CreateCertificate(db *sql.DB, cert *Certificate) error {
	query := `
		INSERT INTO certificates (user_id, course_id, cert_number, user_name, course_name, instructor, completion_date, issued_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	err := db.QueryRow(query, cert.UserID, cert.CourseID, cert.CertNumber, cert.UserName, 
		cert.CourseName, cert.Instructor, cert.CompletionDate, cert.IssuedAt).Scan(
		&cert.ID, &cert.CreatedAt, &cert.UpdatedAt,
	)

	return err
}

// GetCertificateByNumber retrieves a certificate by certificate number
func GetCertificateByNumber(db *sql.DB, certNumber string) (*Certificate, error) {
	query := `
		SELECT id, user_id, course_id, cert_number, user_name, course_name, instructor,
		       completion_date, issued_at, created_at, updated_at
		FROM certificates
		WHERE cert_number = $1
	`

	var cert Certificate
	err := db.QueryRow(query, certNumber).Scan(
		&cert.ID, &cert.UserID, &cert.CourseID, &cert.CertNumber, &cert.UserName,
		&cert.CourseName, &cert.Instructor, &cert.CompletionDate, &cert.IssuedAt,
		&cert.CreatedAt, &cert.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &cert, nil
}

// GetUserCertificates retrieves all certificates for a user
func GetUserCertificates(db *sql.DB, userID int) ([]Certificate, error) {
	query := `
		SELECT id, user_id, course_id, cert_number, user_name, course_name, instructor,
		       completion_date, issued_at, created_at, updated_at
		FROM certificates
		WHERE user_id = $1
		ORDER BY issued_at DESC
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var certificates []Certificate
	for rows.Next() {
		var cert Certificate
		err := rows.Scan(
			&cert.ID, &cert.UserID, &cert.CourseID, &cert.CertNumber, &cert.UserName,
			&cert.CourseName, &cert.Instructor, &cert.CompletionDate, &cert.IssuedAt,
			&cert.CreatedAt, &cert.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		certificates = append(certificates, cert)
	}

	return certificates, nil
}

// GetCertificateForCourse checks if user has certificate for a specific course
func GetCertificateForCourse(db *sql.DB, userID, courseID int) (*Certificate, error) {
	query := `
		SELECT id, user_id, course_id, cert_number, user_name, course_name, instructor,
		       completion_date, issued_at, created_at, updated_at
		FROM certificates
		WHERE user_id = $1 AND course_id = $2
	`

	var cert Certificate
	err := db.QueryRow(query, userID, courseID).Scan(
		&cert.ID, &cert.UserID, &cert.CourseID, &cert.CertNumber, &cert.UserName,
		&cert.CourseName, &cert.Instructor, &cert.CompletionDate, &cert.IssuedAt,
		&cert.CreatedAt, &cert.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &cert, nil
}

// VerifyCertificate verifies if a certificate is valid
func VerifyCertificate(db *sql.DB, certNumber string) (*CertificateVerification, error) {
	cert, err := GetCertificateByNumber(db, certNumber)
	if err != nil {
		return &CertificateVerification{
			CertNumber: certNumber,
			IsValid:    false,
		}, nil
	}

	return &CertificateVerification{
		CertNumber:     cert.CertNumber,
		UserName:       cert.UserName,
		CourseName:     cert.CourseName,
		Instructor:     cert.Instructor,
		CompletionDate: cert.CompletionDate,
		IssuedAt:       cert.IssuedAt,
		IsValid:        true,
	}, nil
}

// AutoGenerateCertificate automatically generates a certificate for course completion
func AutoGenerateCertificate(db *sql.DB, userID, courseID int) error {
	// Get user information
	user, err := GetUserByID(db, userID)
	if err != nil {
		return err
	}

	// Get course information
	course, err := GetCourseByID(db, courseID)
	if err != nil {
		return err
	}

	// Generate certificate number
	certNumber := generateCertificateNumber(courseID, userID)

	// Create certificate
	cert := &Certificate{
		UserID:         userID,
		CourseID:       courseID,
		CertNumber:     certNumber,
		UserName:       user.FullName,
		CourseName:     course.Title,
		Instructor:     course.Instructor,
		CompletionDate: time.Now(),
		IssuedAt:       time.Now(),
	}

	return CreateCertificate(db, cert)
}

// generateCertificateNumber generates a unique certificate number
func generateCertificateNumber(courseID, userID int) string {
	// Simple certificate number format: CERT-YYYYMMDD-COURSEID-USERID
	now := time.Now()
	return fmt.Sprintf("CERT-%s-%d-%d", now.Format("20060102"), courseID, userID)
}