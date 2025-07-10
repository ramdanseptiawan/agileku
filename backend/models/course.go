package models

import (
	"database/sql"
	"encoding/json"
	"time"
)

// Course represents the main course structure
type Course struct {
	ID            int              `json:"id"`
	Title         string           `json:"title"`
	Description   string           `json:"description"`
	Category      string           `json:"category"`
	Level         string           `json:"level"`
	Duration      string           `json:"duration"`
	Instructor    string           `json:"instructor"`
	Rating        float64          `json:"rating"`
	Students      int              `json:"students"`
	Image         string           `json:"image"`
	IntroMaterial *json.RawMessage `json:"introMaterial,omitempty"`
	Lessons       *json.RawMessage `json:"lessons,omitempty"`
	PreTest       *json.RawMessage `json:"preTest,omitempty"`
	PostTest      *json.RawMessage `json:"postTest,omitempty"`
	PostWork      *json.RawMessage `json:"postWork,omitempty"`
	FinalProject  *json.RawMessage `json:"finalProject,omitempty"`
	// Course Configuration
	HasPostWork      bool             `json:"hasPostWork"`
	HasFinalProject  bool             `json:"hasFinalProject"`
	CertificateDelay int              `json:"certificateDelay"` // dalam hari (0 = immediate)
	StepWeights      *json.RawMessage `json:"stepWeights,omitempty"` // dynamic step weights
	CreatedAt        time.Time        `json:"createdAt"`
	UpdatedAt        time.Time        `json:"updatedAt"`
}

// CourseWithEnrollment includes enrollment information for a user
type CourseWithEnrollment struct {
	Course
	IsEnrolled bool `json:"isEnrolled"`
	Progress   int  `json:"progress"`
}

// CourseEnrollment represents user enrollment in a course
type CourseEnrollment struct {
	ID          int        `json:"id"`
	UserID      int        `json:"userId"`
	CourseID    int        `json:"courseId"`
	EnrolledAt  time.Time  `json:"enrolledAt"`
	Progress    int        `json:"progress"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
}

// UserProgress represents user progress in course lessons
type UserProgress struct {
	ID          int        `json:"id"`
	UserID      int        `json:"userId"`
	CourseID    int        `json:"courseId"`
	LessonID    int        `json:"lessonId"`
	Completed   bool       `json:"completed"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
}

// GetAllCourses retrieves all courses from database
func GetAllCourses(db *sql.DB) ([]Course, error) {
	query := `
		SELECT id, title, description, category, level, duration, instructor,
		       rating, students, image, intro_material, lessons, pre_test,
		       post_test, post_work, final_project, has_post_work, has_final_project,
		       certificate_delay, step_weights, created_at, updated_at
		FROM courses
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []Course
	for rows.Next() {
		var course Course
		err := rows.Scan(
			&course.ID, &course.Title, &course.Description, &course.Category,
			&course.Level, &course.Duration, &course.Instructor, &course.Rating,
			&course.Students, &course.Image, &course.IntroMaterial, &course.Lessons,
			&course.PreTest, &course.PostTest, &course.PostWork, &course.FinalProject,
			&course.HasPostWork, &course.HasFinalProject, &course.CertificateDelay,
			&course.StepWeights, &course.CreatedAt, &course.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

// GetCourseByID retrieves a specific course by ID
func GetCourseByID(db *sql.DB, id int) (*Course, error) {
	query := `
		SELECT id, title, description, category, level, duration, instructor,
		       rating, students, image, intro_material, lessons, pre_test,
		       post_test, post_work, final_project, has_post_work, has_final_project,
		       certificate_delay, step_weights, created_at, updated_at
		FROM courses
		WHERE id = $1
	`

	var course Course
	err := db.QueryRow(query, id).Scan(
		&course.ID, &course.Title, &course.Description, &course.Category,
		&course.Level, &course.Duration, &course.Instructor, &course.Rating,
		&course.Students, &course.Image, &course.IntroMaterial, &course.Lessons,
		&course.PreTest, &course.PostTest, &course.PostWork, &course.FinalProject,
		&course.HasPostWork, &course.HasFinalProject, &course.CertificateDelay,
		&course.StepWeights, &course.CreatedAt, &course.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &course, nil
}

// GetCoursesWithEnrollment retrieves courses with enrollment status for a user
func GetCoursesWithEnrollment(db *sql.DB, userID int) ([]CourseWithEnrollment, error) {
	query := `
		SELECT c.id, c.title, c.description, c.category, c.level, c.duration,
		       c.instructor, c.rating, c.students, c.image, c.intro_material,
		       c.lessons, c.pre_test, c.post_test, c.post_work, c.final_project,
		       c.has_post_work, c.has_final_project, c.certificate_delay, c.step_weights,
		       c.created_at, c.updated_at,
		       CASE WHEN ce.id IS NOT NULL THEN true ELSE false END as is_enrolled,
		       COALESCE(ce.progress, 0) as progress
		FROM courses c
		LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.user_id = $1
		ORDER BY c.created_at DESC
	`

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []CourseWithEnrollment
	for rows.Next() {
		var course CourseWithEnrollment
		err := rows.Scan(
			&course.ID, &course.Title, &course.Description, &course.Category,
			&course.Level, &course.Duration, &course.Instructor, &course.Rating,
			&course.Students, &course.Image, &course.IntroMaterial, &course.Lessons,
			&course.PreTest, &course.PostTest, &course.PostWork, &course.FinalProject,
			&course.HasPostWork, &course.HasFinalProject, &course.CertificateDelay,
			&course.StepWeights, &course.CreatedAt, &course.UpdatedAt, &course.IsEnrolled, &course.Progress,
		)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

// EnrollUserInCourse enrolls a user in a course
func EnrollUserInCourse(db *sql.DB, userID, courseID int) error {
	query := `
		INSERT INTO course_enrollments (user_id, course_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, course_id) DO NOTHING
	`

	_, err := db.Exec(query, userID, courseID)
	return err
}

// GetUserEnrollment gets user enrollment for a specific course
func GetUserEnrollment(db *sql.DB, userID, courseID int) (*CourseEnrollment, error) {
	query := `
		SELECT id, user_id, course_id, enrolled_at, progress, completed_at
		FROM course_enrollments
		WHERE user_id = $1 AND course_id = $2
	`

	var enrollment CourseEnrollment
	err := db.QueryRow(query, userID, courseID).Scan(
		&enrollment.ID, &enrollment.UserID, &enrollment.CourseID,
		&enrollment.EnrolledAt, &enrollment.Progress, &enrollment.CompletedAt,
	)

	if err != nil {
		return nil, err
	}

	return &enrollment, nil
}

// IsUserEnrolledInCourse checks if a user is enrolled in a course
func IsUserEnrolledInCourse(db *sql.DB, userID, courseID int) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND course_id = $2`
	err := db.QueryRow(query, userID, courseID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// UpdateCourseConfiguration updates course configuration (hasPostWork, hasFinalProject, certificateDelay, stepWeights)
func UpdateCourseConfiguration(db *sql.DB, courseID int, hasPostWork, hasFinalProject bool, certificateDelay int, stepWeights *json.RawMessage) error {
	query := `
		UPDATE courses 
		SET has_post_work = $2, has_final_project = $3, certificate_delay = $4, step_weights = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
	`
	_, err := db.Exec(query, courseID, hasPostWork, hasFinalProject, certificateDelay, stepWeights)
	return err
}

// GetCourseConfiguration gets course configuration
func GetCourseConfiguration(db *sql.DB, courseID int) (bool, bool, int, *json.RawMessage, error) {
	query := `
		SELECT has_post_work, has_final_project, certificate_delay, step_weights
		FROM courses
		WHERE id = $1
	`
	var hasPostWork, hasFinalProject bool
	var certificateDelay int
	var stepWeights *json.RawMessage
	
	err := db.QueryRow(query, courseID).Scan(&hasPostWork, &hasFinalProject, &certificateDelay, &stepWeights)
	if err != nil {
		return false, false, 0, nil, err
	}
	
	return hasPostWork, hasFinalProject, certificateDelay, stepWeights, nil
}