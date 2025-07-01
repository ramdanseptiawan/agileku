package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"unique;not null"`
	Email     string    `json:"email" gorm:"unique;not null"`
	Password  string    `json:"-" gorm:"not null"`
	Name      string    `json:"name"`
	Role      string    `json:"role" gorm:"default:student"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Enrollments []Enrollment `json:"enrollments,omitempty" gorm:"foreignKey:UserID"`
	Certificates []Certificate `json:"certificates,omitempty" gorm:"foreignKey:UserID"`
	Submissions []Submission `json:"submissions,omitempty" gorm:"foreignKey:UserID"`
	QuizAttempts []QuizAttempt `json:"quiz_attempts,omitempty" gorm:"foreignKey:UserID"`
	SurveyResponses []SurveyResponse `json:"survey_responses,omitempty" gorm:"foreignKey:UserID"`
}

// Course represents a course in the system
type Course struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Level       string    `json:"level"`
	Duration    string    `json:"duration"`
	Instructor  string    `json:"instructor"`
	Rating      float64   `json:"rating"`
	Students    int       `json:"students"`
	Image       string    `json:"image"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Lessons     []Lesson     `json:"lessons,omitempty" gorm:"foreignKey:CourseID"`
	Quizzes     []Quiz       `json:"quizzes,omitempty" gorm:"foreignKey:CourseID"`
	Enrollments []Enrollment `json:"enrollments,omitempty" gorm:"foreignKey:CourseID"`
	IntroMaterial *IntroMaterial `json:"intro_material,omitempty" gorm:"foreignKey:CourseID"`
	PostWork    *PostWork    `json:"post_work,omitempty" gorm:"foreignKey:CourseID"`
	FinalProject *FinalProject `json:"final_project,omitempty" gorm:"foreignKey:CourseID"`
}

// Lesson represents a lesson within a course
type Lesson struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CourseID  uint      `json:"course_id"`
	Title     string    `json:"title" gorm:"not null"`
	Type      string    `json:"type"` // reading, video, assignment
	Content   string    `json:"content" gorm:"type:text"`
	Order     int       `json:"order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Course Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}

// IntroMaterial represents introductory material for a course
type IntroMaterial struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CourseID  uint      `json:"course_id" gorm:"unique"`
	Title     string    `json:"title"`
	Content   string    `json:"content" gorm:"type:text"` // JSON content
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Course Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}

// Quiz represents a quiz (preTest, postTest)
type Quiz struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	CourseID  uint       `json:"course_id"`
	Title     string     `json:"title" gorm:"not null"`
	Type      string     `json:"type"` // preTest, postTest
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	// Relationships
	Course    Course        `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Questions []Question    `json:"questions,omitempty" gorm:"foreignKey:QuizID"`
	Attempts  []QuizAttempt `json:"attempts,omitempty" gorm:"foreignKey:QuizID"`
}

// Question represents a question in a quiz
type Question struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	QuizID   uint   `json:"quiz_id"`
	Question string `json:"question" gorm:"not null"`
	Options  string `json:"options" gorm:"type:text"` // JSON array
	Correct  int    `json:"correct"`
	Order    int    `json:"order"`

	// Relationships
	Quiz Quiz `json:"quiz,omitempty" gorm:"foreignKey:QuizID"`
}

// QuizAttempt represents a user's attempt at a quiz
type QuizAttempt struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	QuizID    uint      `json:"quiz_id"`
	Answers   string    `json:"answers" gorm:"type:text"` // JSON object
	Score     int       `json:"score"`
	MaxScore  int       `json:"max_score"`
	Passed    bool      `json:"passed"`
	AttemptAt time.Time `json:"attempt_at"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Quiz Quiz `json:"quiz,omitempty" gorm:"foreignKey:QuizID"`
}

// PostWork represents post-work assignments
type PostWork struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	CourseID     uint      `json:"course_id" gorm:"unique"`
	Title        string    `json:"title"`
	Description  string    `json:"description" gorm:"type:text"`
	Instructions string    `json:"instructions" gorm:"type:text"`
	Requirements string    `json:"requirements" gorm:"type:text"`
	FileSettings string    `json:"file_settings" gorm:"type:text"` // JSON
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relationships
	Course      Course       `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Submissions []Submission `json:"submissions,omitempty" gorm:"foreignKey:PostWorkID"`
}

// FinalProject represents final project assignments
type FinalProject struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	CourseID        uint      `json:"course_id" gorm:"unique"`
	Title           string    `json:"title"`
	Description     string    `json:"description" gorm:"type:text"`
	Instructions    string    `json:"instructions" gorm:"type:text"`
	Requirements    string    `json:"requirements" gorm:"type:text"`
	FileSettings    string    `json:"file_settings" gorm:"type:text"` // JSON
	SubmissionFormat string   `json:"submission_format"` // file, link, both
	LinkGuidelines  string    `json:"link_guidelines" gorm:"type:text"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Relationships
	Course      Course       `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Submissions []Submission `json:"submissions,omitempty" gorm:"foreignKey:FinalProjectID"`
}

// Submission represents user submissions for post-work and final projects
type Submission struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	UserID         uint      `json:"user_id"`
	CourseID       uint      `json:"course_id"`
	PostWorkID     *uint     `json:"post_work_id,omitempty"`
	FinalProjectID *uint     `json:"final_project_id,omitempty"`
	Type           string    `json:"type"` // postwork, finalproject
	Description    string    `json:"description" gorm:"type:text"`
	FileID         *uint     `json:"file_id,omitempty"`
	ProjectLink    string    `json:"project_link"`
	Status         string    `json:"status" gorm:"default:submitted"` // submitted, reviewed, approved, rejected
	Grade          *int      `json:"grade,omitempty"`
	Feedback       string    `json:"feedback" gorm:"type:text"`
	SubmittedAt    time.Time `json:"submitted_at"`
	ReviewedAt     *time.Time `json:"reviewed_at,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	// Relationships
	User         User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Course       Course        `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	PostWork     *PostWork     `json:"post_work,omitempty" gorm:"foreignKey:PostWorkID"`
	FinalProject *FinalProject `json:"final_project,omitempty" gorm:"foreignKey:FinalProjectID"`
	File         *FileUpload   `json:"file,omitempty" gorm:"foreignKey:FileID"`
}

// SurveyResponse represents user responses to post-test surveys
type SurveyResponse struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id"`
	CourseID     uint      `json:"course_id"`
	Satisfaction int       `json:"satisfaction"` // 1-5 rating
	Difficulty   int       `json:"difficulty"`   // 1-5 rating
	Usefulness   int       `json:"usefulness"`   // 1-5 rating
	Feedback     string    `json:"feedback" gorm:"type:text"`
	Score        int       `json:"score"` // Quiz score associated with this survey
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relationships
	User   User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Course Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}

// Enrollment represents a user's enrollment in a course
type Enrollment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	CourseID  uint      `json:"course_id"`
	Progress  int       `json:"progress" gorm:"default:0"` // 0-100
	Status    string    `json:"status" gorm:"default:active"` // active, completed, dropped
	StartedAt time.Time `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	User   User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Course Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}

// Certificate represents a certificate earned by a user
type Certificate struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	UserID            uint      `json:"user_id"`
	CourseID          uint      `json:"course_id"`
	CertificateNumber string    `json:"certificate_number" gorm:"unique"`
	Grade             string    `json:"grade"`
	CompletionDate    time.Time `json:"completion_date"`
	IssueDate         time.Time `json:"issue_date"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`

	// Relationships
	User   User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Course Course `json:"course,omitempty" gorm:"foreignKey:CourseID"`
}

// FileUpload represents uploaded files
type FileUpload struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Filename  string    `json:"filename" gorm:"not null"`
	Path      string    `json:"path" gorm:"not null"`
	Size      int64     `json:"size"`
	MimeType  string    `json:"mime_type"`
	UserID    uint      `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// Progress tracking for individual lessons
type LessonProgress struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id"`
	LessonID     uint      `json:"lesson_id"`
	Completed    bool      `json:"completed" gorm:"default:false"`
	TimeSpent    int       `json:"time_spent"` // in minutes
	LastAccessed time.Time `json:"last_accessed"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relationships
	User   User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Lesson Lesson `json:"lesson,omitempty" gorm:"foreignKey:LessonID"`
}

// AutoMigrate runs database migrations
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Course{},
		&Lesson{},
		&IntroMaterial{},
		&Quiz{},
		&Question{},
		&QuizAttempt{},
		&PostWork{},
		&FinalProject{},
		&Submission{},
		&SurveyResponse{},
		&Enrollment{},
		&Certificate{},
		&FileUpload{},
		&LessonProgress{},
	)
}