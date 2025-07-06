package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// QuizQuestion represents a single quiz question
type QuizQuestion struct {
	ID            int      `json:"id"`
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	CorrectAnswer int      `json:"correctAnswer"`
	Explanation   string   `json:"explanation,omitempty"`
	Points        int      `json:"points"`
}

// QuizEnhanced represents an enhanced quiz structure
type QuizEnhanced struct {
	ID           int            `json:"id"`
	CourseID     int            `json:"courseId"`
	Title        string         `json:"title"`
	Description  string         `json:"description"`
	Questions    []QuizQuestion `json:"questions"`
	TimeLimit    int            `json:"timeLimit"` // in minutes
	MaxAttempts  int            `json:"maxAttempts"`
	PassingScore int            `json:"passingScore"` // percentage
	QuizType     string         `json:"quizType"`     // pretest, posttest
	IsActive     bool           `json:"isActive"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
}

// QuizAttemptEnhanced represents an enhanced quiz attempt
type QuizAttemptEnhanced struct {
	ID            int                    `json:"id"`
	QuizID        int                    `json:"quizId"`
	UserID        int                    `json:"userId"`
	Answers       map[string]interface{} `json:"answers"`
	Score         int                    `json:"score"`         // percentage
	CorrectCount  int                    `json:"correctCount"`  // number of correct answers
	TotalCount    int                    `json:"totalCount"`    // total number of questions
	TimeSpent     int                    `json:"timeSpent"`     // in seconds
	Completed     bool                   `json:"completed"`
	Passed        bool                   `json:"passed"`
	AttemptNumber int                    `json:"attemptNumber"`
	StartedAt     time.Time              `json:"startedAt"`
	SubmittedAt   *time.Time             `json:"submittedAt,omitempty"`
	CreatedAt     time.Time              `json:"createdAt"`
}

// QuizSubmissionEnhanced represents an enhanced quiz submission
type QuizSubmissionEnhanced struct {
	AttemptID int                    `json:"attemptId"`
	Answers   map[string]interface{} `json:"answers"`
	TimeSpent int                    `json:"timeSpent"`
}

// QuizResultEnhanced represents an enhanced quiz result
type QuizResultEnhanced struct {
	AttemptID      int                    `json:"attemptId"`
	Score          int                    `json:"score"`
	CorrectCount   int                    `json:"correctCount"`
	TotalCount     int                    `json:"totalCount"`
	Passed         bool                   `json:"passed"`
	TimeSpent      int                    `json:"timeSpent"`
	AttemptNumber  int                    `json:"attemptNumber"`
	CanRetake      bool                   `json:"canRetake"`
	Answers        map[string]interface{} `json:"answers"`
	CorrectAnswers map[string]int         `json:"correctAnswers"`
	Explanations   map[string]string      `json:"explanations"`
}

// GetQuizEnhancedByTypeAndCourse gets an enhanced quiz by type and course
func GetQuizEnhancedByTypeAndCourse(db *sql.DB, courseID int, quizType string) (*QuizEnhanced, error) {
	query := `
	SELECT id, course_id, title, description, questions, time_limit,
	       max_attempts, passing_score, quiz_type, is_active, created_at, updated_at
	FROM quizzes
	WHERE course_id = $1 AND quiz_type = $2 AND is_active = TRUE
	LIMIT 1
	`

	
	row := db.QueryRow(query, courseID, quizType)

	var quiz QuizEnhanced
	var questionsJSON json.RawMessage
	err := row.Scan(&quiz.ID, &quiz.CourseID, &quiz.Title, &quiz.Description, 
		&questionsJSON, &quiz.TimeLimit, &quiz.MaxAttempts, &quiz.PassingScore, 
		&quiz.QuizType, &quiz.IsActive, &quiz.CreatedAt, &quiz.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Parse questions JSON
	err = json.Unmarshal(questionsJSON, &quiz.Questions)
	if err != nil {
		return nil, fmt.Errorf("failed to parse questions: %v", err)
	}

	return &quiz, nil
}

// StartQuizAttemptEnhanced creates a new enhanced quiz attempt
func StartQuizAttemptEnhanced(db *sql.DB, userID, quizID int) (*QuizAttemptEnhanced, error) {
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
		return nil, fmt.Errorf("maximum attempts (%d) reached", maxAttempts)
	}

	// Create new attempt
	query := `
	INSERT INTO quiz_attempts (quiz_id, user_id, attempt_number, started_at, created_at)
	VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING id, quiz_id, user_id, score, time_spent, completed, passed, attempt_number, started_at, created_at
	`
	row := db.QueryRow(query, quizID, userID, attemptCount+1)

	var attempt QuizAttemptEnhanced
	err = row.Scan(&attempt.ID, &attempt.QuizID, &attempt.UserID, &attempt.Score, 
		&attempt.TimeSpent, &attempt.Completed, &attempt.Passed, &attempt.AttemptNumber, 
		&attempt.StartedAt, &attempt.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Initialize empty answers
	attempt.Answers = make(map[string]interface{})

	return &attempt, nil
}

// SubmitQuizAttemptEnhanced submits an enhanced quiz attempt
func SubmitQuizAttemptEnhanced(db *sql.DB, submission QuizSubmissionEnhanced) (*QuizResultEnhanced, error) {
	// Get attempt and quiz info
	var attempt QuizAttemptEnhanced
	var quiz QuizEnhanced
	var questionsJSON json.RawMessage
	
	query := `
	SELECT qa.id, qa.quiz_id, qa.user_id, qa.attempt_number, qa.started_at,
	       q.questions, q.passing_score, q.max_attempts, q.title
	FROM quiz_attempts qa
	JOIN quizzes q ON qa.quiz_id = q.id
	WHERE qa.id = $1 AND qa.completed = FALSE
	`
	row := db.QueryRow(query, submission.AttemptID)
	err := row.Scan(&attempt.ID, &attempt.QuizID, &attempt.UserID, &attempt.AttemptNumber, 
		&attempt.StartedAt, &questionsJSON, &quiz.PassingScore, &quiz.MaxAttempts, &quiz.Title)
	if err != nil {
		return nil, fmt.Errorf("attempt not found or already completed: %v", err)
	}

	// Parse questions
	err = json.Unmarshal(questionsJSON, &quiz.Questions)
	if err != nil {
		return nil, fmt.Errorf("failed to parse questions: %v", err)
	}

	// Calculate score
	correctCount := 0
	totalCount := len(quiz.Questions)
	correctAnswers := make(map[string]int)
	explanations := make(map[string]string)

	for _, question := range quiz.Questions {
		questionIDStr := fmt.Sprintf("%d", question.ID)
		correctAnswers[questionIDStr] = question.CorrectAnswer
		explanations[questionIDStr] = question.Explanation
		
		if userAnswer, exists := submission.Answers[questionIDStr]; exists {
			if userAnswerInt, ok := userAnswer.(float64); ok {
				if int(userAnswerInt) == question.CorrectAnswer {
					correctCount++
				}
			}
		}
	}

	score := 0
	if totalCount > 0 {
		score = (correctCount * 100) / totalCount
	}
	passed := score >= quiz.PassingScore

	// Convert answers to JSON
	answersJSON, err := json.Marshal(submission.Answers)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal answers: %v", err)
	}

	// Update attempt
	updateQuery := `
	UPDATE quiz_attempts 
	SET answers = $1, score = $2, time_spent = $3, completed = TRUE, passed = $4, submitted_at = CURRENT_TIMESTAMP
	WHERE id = $5
	`
	_, err = db.Exec(updateQuery, answersJSON, score, submission.TimeSpent, passed, submission.AttemptID)
	if err != nil {
		return nil, fmt.Errorf("failed to update attempt: %v", err)
	}

	// Check if can retake
	var totalAttempts int
	err = db.QueryRow("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2", 
		attempt.UserID, attempt.QuizID).Scan(&totalAttempts)
	if err != nil {
		return nil, err
	}

	canRetake := totalAttempts < quiz.MaxAttempts && !passed

	return &QuizResultEnhanced{
		AttemptID:      submission.AttemptID,
		Score:          score,
		CorrectCount:   correctCount,
		TotalCount:     totalCount,
		Passed:         passed,
		TimeSpent:      submission.TimeSpent,
		AttemptNumber:  attempt.AttemptNumber,
		CanRetake:      canRetake,
		Answers:        submission.Answers,
		CorrectAnswers: correctAnswers,
		Explanations:   explanations,
	}, nil
}

// GetQuizAttemptsEnhanced gets all enhanced attempts for a quiz by a user
func GetQuizAttemptsEnhanced(db *sql.DB, userID, quizID int) ([]QuizAttemptEnhanced, error) {
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

	var attempts []QuizAttemptEnhanced
	for rows.Next() {
		var attempt QuizAttemptEnhanced
		var submittedAt sql.NullTime
		var answersJSON sql.NullString
		
		err := rows.Scan(&attempt.ID, &attempt.QuizID, &attempt.UserID, &answersJSON, 
			&attempt.Score, &attempt.TimeSpent, &attempt.Completed, &attempt.Passed, 
			&attempt.AttemptNumber, &attempt.StartedAt, &submittedAt, &attempt.CreatedAt)
		if err != nil {
			return nil, err
		}

		// Parse answers
		if answersJSON.Valid {
			err = json.Unmarshal([]byte(answersJSON.String), &attempt.Answers)
			if err != nil {
				attempt.Answers = make(map[string]interface{})
			}
		} else {
			attempt.Answers = make(map[string]interface{})
		}

		if submittedAt.Valid {
			attempt.SubmittedAt = &submittedAt.Time
		}

		attempts = append(attempts, attempt)
	}

	return attempts, nil
}