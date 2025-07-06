package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func InitDB() (*sql.DB, error) {
	// Get database configuration from environment variables
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	// Set default values if not provided
	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "5432"
	}
	if user == "" {
		user = "postgres"
	}
	if dbname == "" {
		dbname = "lms"
	}
	if sslmode == "" {
		sslmode = "disable"
	}

	// Create connection string
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// Open database connection
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Test the connection
	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}

	log.Println("Successfully connected to PostgreSQL database")

	// Create tables if they don't exist
	err = createTables(db)
	if err != nil {
		return nil, fmt.Errorf("failed to create tables: %v", err)
	}

	return db, nil
}

func createTables(db *sql.DB) error {
	// Users table
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(50) UNIQUE NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		full_name VARCHAR(100) NOT NULL,
		role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Courses table
	coursesTable := `
	CREATE TABLE IF NOT EXISTS courses (
		id SERIAL PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		category VARCHAR(100),
		level VARCHAR(50),
		duration VARCHAR(50),
		instructor VARCHAR(100),
		rating DECIMAL(3,2) DEFAULT 0.0,
		students INTEGER DEFAULT 0,
		image VARCHAR(500),
		intro_material JSONB,
		lessons JSONB,
		pre_test JSONB,
		post_test JSONB,
		post_work JSONB,
		final_project JSONB,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Course enrollments table
	enrollmentsTable := `
	CREATE TABLE IF NOT EXISTS course_enrollments (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
		enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		progress INTEGER DEFAULT 0,
		completed_at TIMESTAMP,
		UNIQUE(user_id, course_id)
	);`

	// User progress table
	progressTable := `
	CREATE TABLE IF NOT EXISTS user_progress (
		id SERIAL PRIMARY KEY,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
		lesson_id INTEGER NOT NULL,
		completed BOOLEAN DEFAULT FALSE,
		completed_at TIMESTAMP,
		UNIQUE(user_id, course_id, lesson_id)
	);`

	// Announcements table
	announcementsTable := `
	CREATE TABLE IF NOT EXISTS announcements (
		id SERIAL PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		content TEXT NOT NULL,
		priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'medium', 'high')),
		target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'instructors')),
		author VARCHAR(100) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Certificates table
	certificatesTable := `
	CREATE TABLE IF NOT EXISTS certificates (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		cert_number VARCHAR(255) UNIQUE NOT NULL,
		user_name VARCHAR(255) NOT NULL,
		course_name VARCHAR(255) NOT NULL,
		instructor VARCHAR(255) NOT NULL,
		completion_date TIMESTAMP NOT NULL,
		issued_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, course_id)
	);`

	// Quizzes table
	quizzesTable := `
	CREATE TABLE IF NOT EXISTS quizzes (
		id SERIAL PRIMARY KEY,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		questions JSONB NOT NULL,
		time_limit INTEGER DEFAULT 0,
		max_attempts INTEGER DEFAULT 1,
		passing_score INTEGER DEFAULT 70,
		quiz_type VARCHAR(20) DEFAULT 'quiz' CHECK (quiz_type IN ('pretest', 'posttest', 'quiz')),
		is_active BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Quiz attempts table
	quizAttemptsTable := `
	CREATE TABLE IF NOT EXISTS quiz_attempts (
		id SERIAL PRIMARY KEY,
		quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		answers JSONB,
		score INTEGER DEFAULT 0,
		time_spent INTEGER DEFAULT 0,
		completed BOOLEAN DEFAULT FALSE,
		passed BOOLEAN DEFAULT FALSE,
		attempt_number INTEGER DEFAULT 1,
		started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		submitted_at TIMESTAMP,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Submissions tables
	postworkSubmissionsTable := `
	CREATE TABLE IF NOT EXISTS postwork_submissions (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		content TEXT,
		attachments JSONB,
		status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'rejected')),
		score INTEGER,
		feedback TEXT,
		submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		reviewed_at TIMESTAMP,
		reviewed_by INTEGER REFERENCES users(id),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	finalProjectSubmissionsTable := `
	CREATE TABLE IF NOT EXISTS final_project_submissions (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		content TEXT,
		attachments JSONB,
		github_url VARCHAR(500),
		live_url VARCHAR(500),
		status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'rejected')),
		score INTEGER,
		feedback TEXT,
		submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		reviewed_at TIMESTAMP,
		reviewed_by INTEGER REFERENCES users(id),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, course_id)
	);`

	// Grades table
	gradesTable := `
	CREATE TABLE IF NOT EXISTS grades (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		submission_id INTEGER,
		grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 100),
		feedback TEXT,
		graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Survey feedback table
	surveyFeedbackTable := `
	CREATE TABLE IF NOT EXISTS survey_feedback (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
		difficulty INTEGER DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 5),
		clarity INTEGER DEFAULT 0 CHECK (clarity >= 0 AND clarity <= 5),
		usefulness INTEGER DEFAULT 0 CHECK (usefulness >= 0 AND usefulness <= 5),
		feedback TEXT,
		post_test_score INTEGER DEFAULT 0,
		post_test_passed BOOLEAN DEFAULT FALSE,
		submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, course_id)
	);`

	tables := []string{usersTable, coursesTable, enrollmentsTable, progressTable, announcementsTable, certificatesTable, quizzesTable, quizAttemptsTable, postworkSubmissionsTable, finalProjectSubmissionsTable, gradesTable, surveyFeedbackTable}

	for _, table := range tables {
		_, err := db.Exec(table)
		if err != nil {
			return fmt.Errorf("failed to create table: %v", err)
		}
	}

	log.Println("Database tables created successfully")
	return nil
}