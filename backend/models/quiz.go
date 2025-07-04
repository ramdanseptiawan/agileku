package models

import (
	"database/sql"
	"encoding/json"
	"time"
)

// Quiz represents a quiz in the system
type Quiz struct {
	ID          int             `json:"id"`
	CourseID    int             `json:"courseId"`
	LessonID    *int            `json:"lessonId,omitempty"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Questions   json.RawMessage `json:"questions"`
	TimeLimit   int             `json:"timeLimit"` // in minutes
	MaxAttempts int             `json:"maxAttempts"`
	PassingScore int            `json:"passingScore"` // percentage
	QuizType    string          `json:"quizType"` // pretest, posttest, lesson
	IsActive    bool            `json:"isActive"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// QuizAttempt represents a quiz attempt by a user
type QuizAttempt struct {
	ID          int             `json:"id"`
	QuizID      int             `json:"quizId"`
	UserID      int             `json:"userId"`
	Answers     json.RawMessage `json:"answers"`
	Score       int             `json:"score"` // percentage
	TimeSpent   int             `json:"timeSpent"` // in seconds
	Completed   bool            `json:"completed"`
	Passed      bool            `json:"passed"`
	AttemptNumber int           `json:"attemptNumber"`
	StartedAt   time.Time       `json:"startedAt"`
	SubmittedAt *time.Time      `json:"submittedAt,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
}

// QuizSubmission represents a quiz submission request
type QuizSubmission struct {
	QuizID    int             `json:"quizId"`
	Answers   json.RawMessage `json:"answers"`
	TimeSpent int             `json:"timeSpent"`
}

// QuizResult represents the result of a quiz attempt
type QuizResult struct {
	AttemptID     int     `json:"attemptId"`
	Score         int     `json:"score"`
	Passed        bool    `json:"passed"`
	TimeSpent     int     `json:"timeSpent"`
	CorrectAnswers int    `json:"correctAnswers"`
	TotalQuestions int    `json:"totalQuestions"`
	AttemptNumber int     `json:"attemptNumber"`
	CanRetake     bool    `json:"canRetake"`
}

// CreateQuizTable creates the quizzes table
func CreateQuizTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS quizzes (
		id SERIAL PRIMARY KEY,
		course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
		lesson_id INTEGER,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		questions JSONB NOT NULL,
		time_limit INTEGER DEFAULT 30,
		max_attempts INTEGER DEFAULT 3,
		passing_score INTEGER DEFAULT 70,
		quiz_type VARCHAR(50) DEFAULT 'lesson',
		is_active BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(query)
	return err
}

// CreateQuizAttemptTable creates the quiz_attempts table
func CreateQuizAttemptTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS quiz_attempts (
		id SERIAL PRIMARY KEY,
		quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		answers JSONB,
		score INTEGER DEFAULT 0,
		time_spent INTEGER DEFAULT 0,
		completed BOOLEAN DEFAULT FALSE,
		passed BOOLEAN DEFAULT FALSE,
		attempt_number INTEGER DEFAULT 1,
		started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		submitted_at TIMESTAMP,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(query)
	return err
}

// GetQuizByID gets a quiz by ID
func GetQuizByID(db *sql.DB, quizID int) (*Quiz, error) {
	query := `
	SELECT id, course_id, lesson_id, title, description, questions, time_limit, 
	       max_attempts, passing_score, quiz_type, is_active, created_at, updated_at
	FROM quizzes
	WHERE id = $1 AND is_active = TRUE
	`
	row := db.QueryRow(query, quizID)

	var quiz Quiz
	var lessonID sql.NullInt64
	err := row.Scan(&quiz.ID, &quiz.CourseID, &lessonID, &quiz.Title, &quiz.Description, &quiz.Questions, &quiz.TimeLimit, &quiz.MaxAttempts, &quiz.PassingScore, &quiz.QuizType, &quiz.IsActive, &quiz.CreatedAt, &quiz.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if lessonID.Valid {
		lessonIDInt := int(lessonID.Int64)
		quiz.LessonID = &lessonIDInt
	}

	return &quiz, nil
}

// GetQuizzesByCourse gets all quizzes for a course
func GetQuizzesByCourse(db *sql.DB, courseID int) ([]Quiz, error) {
	query := `
	SELECT id, course_id, lesson_id, title, description, questions, time_limit, 
	       max_attempts, passing_score, quiz_type, is_active, created_at, updated_at
	FROM quizzes
	WHERE course_id = $1 AND is_active = TRUE
	ORDER BY created_at ASC
	`
	rows, err := db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quizzes []Quiz
	for rows.Next() {
		var quiz Quiz
		var lessonID sql.NullInt64
		err := rows.Scan(&quiz.ID, &quiz.CourseID, &lessonID, &quiz.Title, &quiz.Description, &quiz.Questions, &quiz.TimeLimit, &quiz.MaxAttempts, &quiz.PassingScore, &quiz.QuizType, &quiz.IsActive, &quiz.CreatedAt, &quiz.UpdatedAt)
		if err != nil {
			return nil, err
		}

		if lessonID.Valid {
			lessonIDInt := int(lessonID.Int64)
			quiz.LessonID = &lessonIDInt
		}

		quizzes = append(quizzes, quiz)
	}

	return quizzes, nil
}

// GetQuizByTypeAndCourse gets a quiz by type and course
func GetQuizByTypeAndCourse(db *sql.DB, courseID int, quizType string) (*Quiz, error) {
	query := `
	SELECT id, course_id, lesson_id, title, description, questions, time_limit, 
	       max_attempts, passing_score, quiz_type, is_active, created_at, updated_at
	FROM quizzes
	WHERE course_id = $1 AND quiz_type = $2 AND is_active = TRUE
	LIMIT 1
	`
	row := db.QueryRow(query, courseID, quizType)

	var quiz Quiz
	var lessonID sql.NullInt64
	err := row.Scan(&quiz.ID, &quiz.CourseID, &lessonID, &quiz.Title, &quiz.Description, &quiz.Questions, &quiz.TimeLimit, &quiz.MaxAttempts, &quiz.PassingScore, &quiz.QuizType, &quiz.IsActive, &quiz.CreatedAt, &quiz.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if lessonID.Valid {
		lessonIDInt := int(lessonID.Int64)
		quiz.LessonID = &lessonIDInt
	}

	return &quiz, nil
}

// StartQuizAttempt creates a new quiz attempt
func StartQuizAttempt(db *sql.DB, userID, quizID int) (*QuizAttempt, error) {
	// Check how many attempts user has made
	var attemptCount int
	err := db.QueryRow("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2", userID, quizID).Scan(&attemptCount)
	if err != nil {
		return nil, err
	}

	// Check max attempts
	var maxAttempts int
	err = db.QueryRow("SELECT max_attempts FROM quizzes WHERE id = $1", quizID).Scan(&maxAttempts)
	if err != nil {
		return nil, err
	}

	if attemptCount >= maxAttempts {
		return nil, sql.ErrNoRows // or custom error
	}

	// Create new attempt
	query := `
	INSERT INTO quiz_attempts (quiz_id, user_id, attempt_number, started_at, created_at)
	VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING id, quiz_id, user_id, answers, score, time_spent, completed, passed, attempt_number, started_at, submitted_at, created_at
	`
	row := db.QueryRow(query, quizID, userID, attemptCount+1)

	var attempt QuizAttempt
	var submittedAt sql.NullTime
	err = row.Scan(&attempt.ID, &attempt.QuizID, &attempt.UserID, &attempt.Answers, &attempt.Score, &attempt.TimeSpent, &attempt.Completed, &attempt.Passed, &attempt.AttemptNumber, &attempt.StartedAt, &submittedAt, &attempt.CreatedAt)
	if err != nil {
		return nil, err
	}

	if submittedAt.Valid {
		attempt.SubmittedAt = &submittedAt.Time
	}

	return &attempt, nil
}

// SubmitQuizAttempt submits a quiz attempt
func SubmitQuizAttempt(db *sql.DB, attemptID int, answers json.RawMessage, timeSpent int) (*QuizResult, error) {
	// Get attempt and quiz info
	var attempt QuizAttempt
	var quiz Quiz
	query := `
	SELECT qa.id, qa.quiz_id, qa.user_id, qa.attempt_number, qa.started_at,
	       q.questions, q.passing_score, q.max_attempts
	FROM quiz_attempts qa
	JOIN quizzes q ON qa.quiz_id = q.id
	WHERE qa.id = $1 AND qa.completed = FALSE
	`
	row := db.QueryRow(query, attemptID)
	err := row.Scan(&attempt.ID, &attempt.QuizID, &attempt.UserID, &attempt.AttemptNumber, &attempt.StartedAt, &quiz.Questions, &quiz.PassingScore, &quiz.MaxAttempts)
	if err != nil {
		return nil, err
	}

	// Calculate score (simplified - you'd implement proper scoring logic)
	score, correctAnswers, totalQuestions := calculateQuizScore(quiz.Questions, answers)
	passed := score >= quiz.PassingScore

	// Update attempt
	updateQuery := `
	UPDATE quiz_attempts 
	SET answers = $1, score = $2, time_spent = $3, completed = TRUE, passed = $4, submitted_at = CURRENT_TIMESTAMP
	WHERE id = $5
	`
	_, err = db.Exec(updateQuery, answers, score, timeSpent, passed, attemptID)
	if err != nil {
		return nil, err
	}

	// Check if can retake
	var totalAttempts int
	err = db.QueryRow("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2", attempt.UserID, attempt.QuizID).Scan(&totalAttempts)
	if err != nil {
		return nil, err
	}

	canRetake := totalAttempts < quiz.MaxAttempts && !passed

	return &QuizResult{
		AttemptID:      attemptID,
		Score:          score,
		Passed:         passed,
		TimeSpent:      timeSpent,
		CorrectAnswers: correctAnswers,
		TotalQuestions: totalQuestions,
		AttemptNumber:  attempt.AttemptNumber,
		CanRetake:      canRetake,
	}, nil
}

// GetQuizAttempts gets all attempts for a quiz by a user
func GetQuizAttempts(db *sql.DB, userID, quizID int) ([]QuizAttempt, error) {
	query := `
	SELECT id, quiz_id, user_id, answers, score, time_spent, completed, passed, 
	       attempt_number, started_at, submitted_at, created_at
	FROM quiz_attempts
	WHERE user_id = $1 AND quiz_id = $2
	ORDER BY attempt_number DESC
	`
	rows, err := db.Query(query, userID, quizID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []QuizAttempt
	for rows.Next() {
		var attempt QuizAttempt
		var submittedAt sql.NullTime
		err := rows.Scan(&attempt.ID, &attempt.QuizID, &attempt.UserID, &attempt.Answers, &attempt.Score, &attempt.TimeSpent, &attempt.Completed, &attempt.Passed, &attempt.AttemptNumber, &attempt.StartedAt, &submittedAt, &attempt.CreatedAt)
		if err != nil {
			return nil, err
		}

		if submittedAt.Valid {
			attempt.SubmittedAt = &submittedAt.Time
		}

		attempts = append(attempts, attempt)
	}

	return attempts, nil
}

// calculateQuizScore calculates the score for a quiz submission
// This is a simplified implementation - you'd implement proper scoring logic based on your quiz format
func calculateQuizScore(questions, answers json.RawMessage) (score, correctAnswers, totalQuestions int) {
	// Parse questions and answers
	var questionsData []map[string]interface{}
	var answersData map[string]interface{}

	json.Unmarshal(questions, &questionsData)
	json.Unmarshal(answers, &answersData)

	totalQuestions = len(questionsData)
	correctAnswers = 0

	// Simple scoring logic - you'd implement based on your question format
	for _, question := range questionsData {
		questionID := question["id"]
		correctAnswer := question["correctAnswer"]
		userAnswer := answersData[questionID.(string)]

		if userAnswer == correctAnswer {
			correctAnswers++
		}
	}

	if totalQuestions > 0 {
		score = (correctAnswers * 100) / totalQuestions
	}

	return score, correctAnswers, totalQuestions
}

// CreateQuiz creates a new quiz
func CreateQuiz(db *sql.DB, quiz *Quiz) error {
	query := `
	INSERT INTO quizzes (course_id, lesson_id, title, description, questions, time_limit, max_attempts, passing_score, quiz_type, is_active, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING id, created_at, updated_at
	`
	row := db.QueryRow(query, quiz.CourseID, quiz.LessonID, quiz.Title, quiz.Description, quiz.Questions, quiz.TimeLimit, quiz.MaxAttempts, quiz.PassingScore, quiz.QuizType, quiz.IsActive)
	return row.Scan(&quiz.ID, &quiz.CreatedAt, &quiz.UpdatedAt)
}

// UpdateQuiz updates an existing quiz
func UpdateQuiz(db *sql.DB, quiz *Quiz) error {
	query := `
	UPDATE quizzes 
	SET title = $1, description = $2, questions = $3, time_limit = $4, max_attempts = $5, passing_score = $6, quiz_type = $7, updated_at = CURRENT_TIMESTAMP
	WHERE id = $8
	RETURNING updated_at
	`
	return db.QueryRow(query, quiz.Title, quiz.Description, quiz.Questions, quiz.TimeLimit, quiz.MaxAttempts, quiz.PassingScore, quiz.QuizType, quiz.ID).Scan(&quiz.UpdatedAt)
}

// DeleteQuiz soft deletes a quiz by setting is_active to false
func DeleteQuiz(db *sql.DB, quizID int) error {
	query := `UPDATE quizzes SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err := db.Exec(query, quizID)
	return err
}

// GetAllQuizzes gets all quizzes (admin only)
func GetAllQuizzes(db *sql.DB) ([]Quiz, error) {
	query := `
	SELECT id, course_id, lesson_id, title, description, questions, time_limit, 
	       max_attempts, passing_score, quiz_type, is_active, created_at, updated_at
	FROM quizzes
	ORDER BY created_at DESC
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quizzes []Quiz
	for rows.Next() {
		var quiz Quiz
		var lessonID sql.NullInt64
		err := rows.Scan(&quiz.ID, &quiz.CourseID, &lessonID, &quiz.Title, &quiz.Description, &quiz.Questions, &quiz.TimeLimit, &quiz.MaxAttempts, &quiz.PassingScore, &quiz.QuizType, &quiz.IsActive, &quiz.CreatedAt, &quiz.UpdatedAt)
		if err != nil {
			return nil, err
		}

		if lessonID.Valid {
			lessonIDInt := int(lessonID.Int64)
			quiz.LessonID = &lessonIDInt
		}

		quizzes = append(quizzes, quiz)
	}

	return quizzes, nil
}