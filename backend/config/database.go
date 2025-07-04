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

	tables := []string{usersTable, coursesTable, enrollmentsTable, progressTable}

	for _, table := range tables {
		_, err := db.Exec(table)
		if err != nil {
			return fmt.Errorf("failed to create table: %v", err)
		}
	}

	log.Println("Database tables created successfully")
	return nil
}