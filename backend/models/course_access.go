package models

import (
	"database/sql"
	"time"
)

// CourseAccess represents user access control for courses
type CourseAccess struct {
	ID           int       `json:"id"`
	UserID       int       `json:"userId"`
	CourseID     int       `json:"courseId"`
	HasAccess    bool      `json:"hasAccess"`
	RestrictedBy *int      `json:"restrictedBy,omitempty"` // Admin ID who restricted access
	RestrictedAt *time.Time `json:"restrictedAt,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// CourseAccessWithDetails includes user and course details
type CourseAccessWithDetails struct {
	CourseAccess
	UserName    string `json:"userName"`
	UserEmail   string `json:"userEmail"`
	CourseTitle string `json:"courseTitle"`
	RestrictedByName *string `json:"restrictedByName,omitempty"`
}

// GetAllCourseAccess retrieves all course access settings with user and course details
func GetAllCourseAccess(db *sql.DB) ([]CourseAccessWithDetails, error) {
	query := `
		SELECT 
			ca.id, ca.user_id, ca.course_id, ca.has_access, 
			ca.restricted_by, ca.restricted_at, ca.created_at, ca.updated_at,
			u.full_name as user_name, u.email as user_email,
			c.title as course_title,
			admin.full_name as restricted_by_name
		FROM course_access ca
		JOIN users u ON ca.user_id = u.id
		JOIN courses c ON ca.course_id = c.id
		LEFT JOIN users admin ON ca.restricted_by = admin.id
		ORDER BY ca.updated_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accessList []CourseAccessWithDetails
	for rows.Next() {
		var access CourseAccessWithDetails
		var restrictedBy sql.NullInt64
		var restrictedAt sql.NullTime
		var restrictedByName sql.NullString

		err := rows.Scan(
			&access.ID, &access.UserID, &access.CourseID, &access.HasAccess,
			&restrictedBy, &restrictedAt, &access.CreatedAt, &access.UpdatedAt,
			&access.UserName, &access.UserEmail, &access.CourseTitle,
			&restrictedByName,
		)
		if err != nil {
			return nil, err
		}

		if restrictedBy.Valid {
			restrictedByInt := int(restrictedBy.Int64)
			access.RestrictedBy = &restrictedByInt
		}
		if restrictedAt.Valid {
			access.RestrictedAt = &restrictedAt.Time
		}
		if restrictedByName.Valid {
			access.RestrictedByName = &restrictedByName.String
		}

		accessList = append(accessList, access)
	}

	return accessList, rows.Err()
}

// GetUserCourseAccess checks if a user has access to a specific course
func GetUserCourseAccess(db *sql.DB, userID, courseID int) (bool, error) {
	query := `
		SELECT has_access 
		FROM course_access 
		WHERE user_id = $1 AND course_id = $2
	`

	var hasAccess bool
	err := db.QueryRow(query, userID, courseID).Scan(&hasAccess)
	if err != nil {
		if err == sql.ErrNoRows {
			// If no record exists, default to restricting access (secure by default)
			return false, nil
		}
		return false, err
	}

	return hasAccess, nil
}

// SetUserCourseAccess sets or updates user access to a course
func SetUserCourseAccess(db *sql.DB, userID, courseID int, hasAccess bool, restrictedBy *int) error {
	var restrictedAt *time.Time
	if !hasAccess && restrictedBy != nil {
		now := time.Now()
		restrictedAt = &now
	}

	query := `
		INSERT INTO course_access (user_id, course_id, has_access, restricted_by, restricted_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id, course_id) 
		DO UPDATE SET 
			has_access = EXCLUDED.has_access,
			restricted_by = EXCLUDED.restricted_by,
			restricted_at = EXCLUDED.restricted_at,
			updated_at = CURRENT_TIMESTAMP
	`

	_, err := db.Exec(query, userID, courseID, hasAccess, restrictedBy, restrictedAt)
	return err
}

// GetUserAccessibleCourses returns courses that a user has access to
func GetUserAccessibleCourses(db *sql.DB, userID int) ([]int, error) {
	query := `
		SELECT c.id
		FROM courses c
		INNER JOIN course_access ca ON c.id = ca.course_id AND ca.user_id = $1
		WHERE ca.has_access = true
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courseIDs []int
	for rows.Next() {
		var courseID int
		if err := rows.Scan(&courseID); err != nil {
			return nil, err
		}
		courseIDs = append(courseIDs, courseID)
	}

	return courseIDs, rows.Err()
}

// DeleteCourseAccess removes course access record
func DeleteCourseAccess(db *sql.DB, userID, courseID int) error {
	query := `DELETE FROM course_access WHERE user_id = $1 AND course_id = $2`
	_, err := db.Exec(query, userID, courseID)
	return err
}

// GrantAccessToEnrolledUsers grants access to all users who are enrolled in courses but don't have explicit access
// This is useful for migrating from open access to restricted access system
func GrantAccessToEnrolledUsers(db *sql.DB) error {
	query := `
		INSERT INTO course_access (user_id, course_id, has_access, created_at, updated_at)
		SELECT ce.user_id, ce.course_id, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
		FROM course_enrollments ce
		LEFT JOIN course_access ca ON ce.user_id = ca.user_id AND ce.course_id = ca.course_id
		WHERE ca.id IS NULL
		ON CONFLICT (user_id, course_id) DO NOTHING
	`
	
	_, err := db.Exec(query)
	return err
}

// SetDefaultCourseAccess sets default access for a course to all existing users
// hasAccess: true to grant access, false to restrict access
func SetDefaultCourseAccess(db *sql.DB, courseID int, hasAccess bool, adminID *int) error {
	query := `
		INSERT INTO course_access (user_id, course_id, has_access, restricted_by, restricted_at, created_at, updated_at)
		SELECT u.id, $1, $2, $3, 
			CASE WHEN $2 = false AND $3 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END,
			CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
		FROM users u
		WHERE NOT EXISTS (
			SELECT 1 FROM course_access ca 
			WHERE ca.user_id = u.id AND ca.course_id = $1
		)
	`
	
	_, err := db.Exec(query, courseID, hasAccess, adminID)
	return err
}