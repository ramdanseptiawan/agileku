package models

import (
	"database/sql"
	"time"
)

// LessonProgress represents user progress on a specific lesson
type LessonProgress struct {
	ID         int       `json:"id"`
	UserID     int       `json:"userId"`
	CourseID   int       `json:"courseId"`
	LessonID   int       `json:"lessonId"`
	Completed  bool      `json:"completed"`
	Progress   int       `json:"progress"` // 0-100
	TimeSpent  int       `json:"timeSpent"` // in seconds
	StartedAt  time.Time `json:"startedAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
}

// CourseProgress represents overall user progress in a course
type CourseProgress struct {
	ID              int       `json:"id"`
	UserID          int       `json:"userId"`
	CourseID        int       `json:"courseId"`
	CurrentStep     string    `json:"currentStep"`
	OverallProgress int       `json:"overallProgress"` // 0-100
	LessonsCompleted int      `json:"lessonsCompleted"`
	TotalLessons    int       `json:"totalLessons"`
	QuizzesCompleted int      `json:"quizzesCompleted"`
	TotalQuizzes    int       `json:"totalQuizzes"`
	TimeSpent       int       `json:"timeSpent"` // total time in seconds
	StartedAt       time.Time `json:"startedAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
}

// CreateLessonProgressTable creates the lesson_progress table
func CreateLessonProgressTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS lesson_progress (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
		lesson_id INTEGER NOT NULL,
		completed BOOLEAN DEFAULT FALSE,
		progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
		time_spent INTEGER DEFAULT 0,
		started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		completed_at TIMESTAMP,
		UNIQUE(user_id, course_id, lesson_id)
	);
	`
	_, err := db.Exec(query)
	return err
}

// CreateCourseProgressTable creates the course_progress table
func CreateCourseProgressTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS course_progress (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
		current_step VARCHAR(50) DEFAULT 'intro',
		overall_progress INTEGER DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
		lessons_completed INTEGER DEFAULT 0,
		total_lessons INTEGER DEFAULT 0,
		quizzes_completed INTEGER DEFAULT 0,
		total_quizzes INTEGER DEFAULT 0,
		time_spent INTEGER DEFAULT 0,
		started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		completed_at TIMESTAMP,
		UNIQUE(user_id, course_id)
	);
	`
	_, err := db.Exec(query)
	return err
}

// UpdateLessonProgress updates or creates lesson progress
func UpdateLessonProgress(db *sql.DB, userID, courseID, lessonID int, progress int, timeSpent int, completed bool) error {
	var completedAt *time.Time
	if completed {
		now := time.Now()
		completedAt = &now
	}

	query := `
	INSERT INTO lesson_progress (user_id, course_id, lesson_id, progress, time_spent, completed, completed_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
	ON CONFLICT (user_id, course_id, lesson_id)
	DO UPDATE SET
		progress = EXCLUDED.progress,
		time_spent = lesson_progress.time_spent + EXCLUDED.time_spent,
		completed = EXCLUDED.completed,
		completed_at = EXCLUDED.completed_at,
		updated_at = CURRENT_TIMESTAMP
	`
	_, err := db.Exec(query, userID, courseID, lessonID, progress, timeSpent, completed, completedAt)
	return err
}

// GetLessonProgress gets lesson progress for a user
func GetLessonProgress(db *sql.DB, userID, courseID, lessonID int) (*LessonProgress, error) {
	query := `
	SELECT id, user_id, course_id, lesson_id, completed, progress, time_spent, started_at, updated_at, completed_at
	FROM lesson_progress
	WHERE user_id = $1 AND course_id = $2 AND lesson_id = $3
	`
	row := db.QueryRow(query, userID, courseID, lessonID)

	var lp LessonProgress
	var completedAt sql.NullTime
	err := row.Scan(&lp.ID, &lp.UserID, &lp.CourseID, &lp.LessonID, &lp.Completed, &lp.Progress, &lp.TimeSpent, &lp.StartedAt, &lp.UpdatedAt, &completedAt)
	if err != nil {
		return nil, err
	}

	if completedAt.Valid {
		lp.CompletedAt = &completedAt.Time
	}

	return &lp, nil
}

// GetCourseProgress gets overall course progress for a user
func GetCourseProgress(db *sql.DB, userID, courseID int) (*CourseProgress, error) {
	query := `
	SELECT id, user_id, course_id, current_step, overall_progress, lessons_completed, total_lessons, 
	       quizzes_completed, total_quizzes, time_spent, started_at, updated_at, completed_at
	FROM course_progress
	WHERE user_id = $1 AND course_id = $2
	`
	row := db.QueryRow(query, userID, courseID)

	var cp CourseProgress
	var completedAt sql.NullTime
	err := row.Scan(&cp.ID, &cp.UserID, &cp.CourseID, &cp.CurrentStep, &cp.OverallProgress, &cp.LessonsCompleted, &cp.TotalLessons, &cp.QuizzesCompleted, &cp.TotalQuizzes, &cp.TimeSpent, &cp.StartedAt, &cp.UpdatedAt, &completedAt)
	if err != nil {
		return nil, err
	}

	if completedAt.Valid {
		cp.CompletedAt = &completedAt.Time
	}

	return &cp, nil
}

// UpdateCourseProgress updates overall course progress
func UpdateCourseProgress(db *sql.DB, userID, courseID int) error {
	// Calculate progress based on lesson completion
	query := `
	WITH lesson_stats AS (
		SELECT 
			COUNT(*) as total_lessons,
			COUNT(CASE WHEN completed = true THEN 1 END) as completed_lessons,
			COALESCE(SUM(time_spent), 0) as total_time
		FROM lesson_progress
		WHERE user_id = $1 AND course_id = $2
	)
	INSERT INTO course_progress (user_id, course_id, current_step, overall_progress, lessons_completed, total_lessons, time_spent, updated_at)
	SELECT 
		$1, $2, 'intro',
		CASE WHEN total_lessons > 0 THEN (completed_lessons * 100 / total_lessons) ELSE 0 END,
		completed_lessons,
		total_lessons,
		total_time,
		CURRENT_TIMESTAMP
	FROM lesson_stats
	ON CONFLICT (user_id, course_id)
	DO UPDATE SET
		overall_progress = CASE WHEN EXCLUDED.total_lessons > 0 THEN (EXCLUDED.lessons_completed * 100 / EXCLUDED.total_lessons) ELSE 0 END,
		lessons_completed = EXCLUDED.lessons_completed,
		total_lessons = EXCLUDED.total_lessons,
		time_spent = EXCLUDED.time_spent,
		updated_at = CURRENT_TIMESTAMP,
		completed_at = CASE WHEN EXCLUDED.overall_progress = 100 THEN CURRENT_TIMESTAMP ELSE course_progress.completed_at END
	`
	_, err := db.Exec(query, userID, courseID)
	if err != nil {
		return err
	}

	// Check if course is now completed and trigger certificate generation
	courseProgress, err := GetCourseProgress(db, userID, courseID)
	if err == nil && courseProgress.OverallProgress == 100 {
		// Check if certificate already exists
		existingCert, _ := GetCertificateForCourse(db, userID, courseID)
		if existingCert == nil {
			// Auto-generate certificate
			err = AutoGenerateCertificate(db, userID, courseID)
			if err != nil {
				// Log error but don't fail the progress update
				// In production, you might want to use a proper logger
			}
		}
	}

	return nil
}

// UpdateCourseOverallProgress updates course progress with step-based calculation
func UpdateCourseOverallProgress(db *sql.DB, userID, courseID, overallProgress, totalTimeSpent int, completedAt *string) error {
	var completedTime *time.Time
	if completedAt != nil && *completedAt != "" {
		if t, err := time.Parse(time.RFC3339, *completedAt); err == nil {
			completedTime = &t
		}
	}

	query := `
	INSERT INTO course_progress (user_id, course_id, current_step, overall_progress, time_spent, completed_at, updated_at)
	VALUES ($1, $2, 'intro', $3, $4, $5, CURRENT_TIMESTAMP)
	ON CONFLICT (user_id, course_id)
	DO UPDATE SET
		overall_progress = GREATEST(course_progress.overall_progress, EXCLUDED.overall_progress),
		time_spent = GREATEST(course_progress.time_spent, EXCLUDED.time_spent),
		completed_at = CASE 
			WHEN EXCLUDED.overall_progress = 100 AND EXCLUDED.completed_at IS NOT NULL THEN EXCLUDED.completed_at
			WHEN EXCLUDED.overall_progress = 100 AND course_progress.completed_at IS NULL THEN CURRENT_TIMESTAMP
			ELSE course_progress.completed_at
		END,
		updated_at = CURRENT_TIMESTAMP
	`
	_, err := db.Exec(query, userID, courseID, overallProgress, totalTimeSpent, completedTime)
	return err
}

// UpdateCurrentStep updates the current step for a course
func UpdateCurrentStep(db *sql.DB, userID, courseID int, currentStep string) error {
	query := `
	INSERT INTO course_progress (user_id, course_id, current_step, updated_at)
	VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
	ON CONFLICT (user_id, course_id)
	DO UPDATE SET
		current_step = EXCLUDED.current_step,
		updated_at = CURRENT_TIMESTAMP
	`
	_, err := db.Exec(query, userID, courseID, currentStep)
	return err
}

// GetUserCourseProgressList gets all course progress for a user
func GetUserCourseProgressList(db *sql.DB, userID int) ([]CourseProgress, error) {
	query := `
	SELECT cp.id, cp.user_id, cp.course_id, cp.current_step, cp.overall_progress, cp.lessons_completed, 
	       cp.total_lessons, cp.quizzes_completed, cp.total_quizzes, cp.time_spent, 
	       cp.started_at, cp.updated_at, cp.completed_at
	FROM course_progress cp
	WHERE cp.user_id = $1
	ORDER BY cp.updated_at DESC
	`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var progressList []CourseProgress
	for rows.Next() {
		var cp CourseProgress
		var completedAt sql.NullTime
		err := rows.Scan(&cp.ID, &cp.UserID, &cp.CourseID, &cp.CurrentStep, &cp.OverallProgress, &cp.LessonsCompleted, &cp.TotalLessons, &cp.QuizzesCompleted, &cp.TotalQuizzes, &cp.TimeSpent, &cp.StartedAt, &cp.UpdatedAt, &completedAt)
		if err != nil {
			return nil, err
		}

		if completedAt.Valid {
			cp.CompletedAt = &completedAt.Time
		}

		progressList = append(progressList, cp)
	}

	return progressList, nil
}