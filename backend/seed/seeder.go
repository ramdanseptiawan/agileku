package seed

import (
	"database/sql"
	"encoding/json"
	"log"

	"lms-backend/models"
)

// SeedData populates the database with initial data
func SeedData(db *sql.DB) {
	log.Println("Starting database seeding...")

	// Create tables first
	createNewTables(db)

	// Seed users
	seedUsers(db)

	// Seed courses
	seedCourses(db)

	// Seed quizzes from course data
	seedQuizzes(db)

	// Seed stage locks for all courses
	seedStageLocks(db)

	log.Println("Database seeding completed")
}

// createNewTables creates the new tables for progress, quiz, and submission features
func createNewTables(db *sql.DB) {
	log.Println("Creating new tables...")

	// Create lesson progress table
	if err := models.CreateLessonProgressTable(db); err != nil {
		log.Printf("Error creating lesson_progress table: %v", err)
	} else {
		log.Println("Created lesson_progress table")
	}

	// Create course progress table
	if err := models.CreateCourseProgressTable(db); err != nil {
		log.Printf("Error creating course_progress table: %v", err)
	} else {
		log.Println("Created course_progress table")
	}

	// Create quiz table
	if err := models.CreateQuizTable(db); err != nil {
		log.Printf("Error creating quizzes table: %v", err)
	} else {
		log.Println("Created quizzes table")
	}

	// Create quiz attempt tableg
	if err := models.CreateQuizAttemptTable(db); err != nil {
		log.Printf("Error creating quiz_attempts table: %v", err)
	} else {
		log.Println("Created quiz_attempts table")
	}

	// Create postwork submission table
	if err := models.CreatePostWorkSubmissionTable(db); err != nil {
		log.Printf("Error creating postwork_submissions table: %v", err)
	} else {
		log.Println("Created postwork_submissions table")
	}

	// Create final project submission table
	if err := models.CreateFinalProjectSubmissionTable(db); err != nil {
		log.Printf("Error creating final_project_submissions table: %v", err)
	} else {
		log.Println("Created final_project_submissions table")
	}

	// Create file upload table
	if err := models.CreateFileUploadTable(db); err != nil {
		log.Printf("Error creating file_uploads table: %v", err)
	} else {
		log.Println("Created file_uploads table")
	}

	// Create certificates table
	if err := createCertificatesTable(db); err != nil {
		log.Printf("Error creating certificates table: %v", err)
	} else {
		log.Println("Created certificates table")
	}

	// Create grades table
	if err := createGradesTable(db); err != nil {
		log.Printf("Error creating grades table: %v", err)
	} else {
		log.Println("Created grades table")
	}

	// Create course stage locks table
	if err := createCourseStageLocks(db); err != nil {
		log.Printf("Error creating course_stage_locks table: %v", err)
	} else {
		log.Println("Created course_stage_locks table")
	}

	log.Println("New tables creation completed")
}

func seedUsers(db *sql.DB) {
	// Check if users already exist
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Printf("Error checking users: %v", err)
		return
	}

	if count > 0 {
		log.Println("Users already exist, skipping user seeding")
		return
	}

	// Create default users
	users := []*models.User{
		{
			Username: "admin",
			Email:    "admin@agileku.com",
			Password: "123",
			FullName: "Administrator",
			Role:     "admin",
		},
		{
			Username: "user",
			Email:    "user@agileku.com",
			Password: "123",
			FullName: "Default User",
			Role:     "user",
		},
	}

	for _, user := range users {
		err := models.CreateUser(db, user)
		if err != nil {
			log.Printf("Error creating user %s: %v", user.Username, err)
		} else {
			log.Printf("Created user: %s", user.Username)
		}
	}
}

func seedStageLocks(db *sql.DB) {
	// Check if stage locks already exist
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM course_stage_locks").Scan(&count)
	if err != nil {
		log.Printf("Error checking stage locks: %v", err)
		return
	}

	if count > 0 {
		log.Println("Stage locks already exist, skipping stage lock seeding")
		return
	}

	// Get all courses
	query := `SELECT id FROM courses`
	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error getting courses for stage lock seeding: %v", err)
		return
	}
	defer rows.Close()

	// Default stages for all courses
	defaultStages := []string{
		"intro",
		"pretest",
		"lessons",
		"posttest",
		"postwork",
		"finalproject",
	}

	for rows.Next() {
		var courseID int
		err := rows.Scan(&courseID)
		if err != nil {
			log.Printf("Error scanning course ID: %v", err)
			continue
		}

		// Create stage locks for each stage
		for _, stageName := range defaultStages {
			insertQuery := `
				INSERT INTO course_stage_locks (course_id, stage_name, is_locked, lock_message, created_at, updated_at)
				VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			`
			_, err := db.Exec(insertQuery, courseID, stageName, false, "")
			if err != nil {
				log.Printf("Error creating stage lock for course %d, stage %s: %v", courseID, stageName, err)
			} else {
				log.Printf("Created stage lock for course %d, stage: %s", courseID, stageName)
			}
		}
	}
}


// createCertificatesTable creates the certificates table
func createCertificatesTable(db *sql.DB) error {
	query := `
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
		status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
		approved_by INTEGER REFERENCES users(id),
		approved_at TIMESTAMP,
		rejection_reason TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(user_id, course_id)
	);
	
	-- Create indexes for better query performance
	CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
	CREATE INDEX IF NOT EXISTS idx_certificates_user_course_status ON certificates(user_id, course_id, status);
	`
	_, err := db.Exec(query)
	return err
}

// createGradesTable creates the grades table
func createGradesTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS grades (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		submission_id INTEGER NOT NULL,
		grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 100),
		feedback TEXT,
		graded_by INTEGER NOT NULL REFERENCES users(id),
		graded_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(submission_id, course_id)
	);
	`
	_, err := db.Exec(query)
	return err
}

// createCourseStageLocks creates the course_stage_locks table
func createCourseStageLocks(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS course_stage_locks (
		id SERIAL PRIMARY KEY,
		course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
		stage_name VARCHAR(50) NOT NULL,
		is_locked BOOLEAN NOT NULL DEFAULT FALSE,
		lock_message TEXT DEFAULT '',
		locked_by INTEGER REFERENCES users(id),
		locked_at TIMESTAMP,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(course_id, stage_name)
	);
	
	CREATE INDEX IF NOT EXISTS idx_course_stage_locks_course_id ON course_stage_locks(course_id);
	CREATE INDEX IF NOT EXISTS idx_course_stage_locks_stage_name ON course_stage_locks(stage_name);
	
	CREATE OR REPLACE FUNCTION update_course_stage_locks_updated_at()
	RETURNS TRIGGER AS $$
	BEGIN
		NEW.updated_at = CURRENT_TIMESTAMP;
		RETURN NEW;
	END;
	$$ language 'plpgsql';
	
	DROP TRIGGER IF EXISTS update_course_stage_locks_updated_at ON course_stage_locks;
	CREATE TRIGGER update_course_stage_locks_updated_at
		BEFORE UPDATE ON course_stage_locks
		FOR EACH ROW
		EXECUTE FUNCTION update_course_stage_locks_updated_at();
	`
	_, err := db.Exec(query)
	return err
}

func seedCourses(db *sql.DB) {
	// Check if courses already exist
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM courses").Scan(&count)
	if err != nil {
		log.Printf("Error checking courses: %v", err)
		return
	}

	if count > 0 {
		log.Println("Courses already exist, skipping course seeding")
		return
	}

	// Course data matching frontend structure
	courses := []map[string]interface{}{
		{
			"title":       "Introduction to React",
			"description": "Learn the fundamentals of React development",
			"category":    "Programming",
			"level":       "Beginner",
			"duration":    "4 weeks",
			"instructor":  "John Doe",
			"rating":      4.8,
			"students":    1234,
			"image":       "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop&crop=center",
			"introMaterial": map[string]interface{}{
				"title": "Selamat Datang di Kursus React",
				"content": []map[string]interface{}{
					{
						"type":    "text",
						"content": "Selamat datang di kursus **Introduction to React**! Dalam kursus ini, Anda akan mempelajari dasar-dasar pengembangan aplikasi web menggunakan React, salah satu library JavaScript paling populer saat ini.",
					},
					{
						"type": "list",
						"items": []string{
							"Konsep dasar React dan JSX",
							"Component-based architecture",
							"State management dan Props",
							"Event handling dan lifecycle methods",
							"Hooks dan functional components",
							"Best practices dalam React development",
						},
					},
					{
						"type":     "video",
						"title":    "Pengantar React - Overview",
						"src":      "https://www.youtube.com/embed/Ke90Tje7VS0",
						"duration": "15:30",
						"description": "Video pengantar yang menjelaskan apa itu React dan mengapa React penting untuk dipelajari.",
					},
					{
						"type":        "pdf",
						"title":       "React Cheat Sheet",
						"filename":    "react-cheat-sheet.pdf",
						"embedUrl":    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
						"downloadUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
						"description": "Panduan ringkas berisi sintaks dan konsep penting React yang dapat dijadikan referensi cepat.",
					},
				},
			},
			"lessons": []map[string]interface{}{
				{
					"id":    1,
					"title": "Pengenalan React",
					"type":  "reading",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "# Pengenalan React\n\nReact adalah library JavaScript yang dikembangkan oleh Facebook untuk membangun user interface yang interaktif dan efisien.",
						},
					},
				},
				{
					"id":    2,
					"title": "Video Tutorial React Basics",
					"type":  "video",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "# Video Tutorial React Basics\n\nDalam video tutorial ini, Anda akan mempelajari dasar-dasar React melalui demonstrasi langsung.",
						},
						{
							"type":     "video",
							"title":    "React Basics Tutorial",
							"src":      "https://www.youtube.com/embed/Ke90Tje7VS0",
							"duration": "20:15",
						},
					},
				},
			},
			"preTest": map[string]interface{}{
				"id":    "pre1",
				"title": "Pre-Test: React Fundamentals",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "React dikembangkan oleh?",
						"options":  []string{"Google", "Facebook", "Microsoft", "Apple"},
						"correct":  1,
					},
					{
						"id":       2,
						"question": "Apa kepanjangan dari JSX?",
						"options":  []string{"JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"},
						"correct":  0,
					},
				},
			},
			"postTest": map[string]interface{}{
				"id":    "post1",
				"title": "Post-Test: React Fundamentals",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "Virtual DOM dalam React berfungsi untuk?",
						"options":  []string{"Styling", "Meningkatkan performa", "Database", "Testing"},
						"correct":  1,
					},
				},
			},
		},
		{
			"title":       "Advanced JavaScript",
			"description": "Master advanced JavaScript concepts and patterns",
			"category":    "Programming",
			"level":       "Advanced",
			"duration":    "6 weeks",
			"instructor":  "Jane Smith",
			"rating":      4.9,
			"students":    856,
			"image":       "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=300&h=200&fit=crop&crop=center",
			"introMaterial": map[string]interface{}{
				"title": "Menguasai JavaScript Tingkat Lanjut",
				"content": []map[string]interface{}{
					{
						"type":    "text",
						"content": "Selamat datang di kursus Advanced JavaScript! Kursus ini dirancang untuk developer yang sudah memiliki pemahaman dasar JavaScript dan ingin menguasai konsep-konsep advanced.",
					},
				},
			},
			"lessons": []map[string]interface{}{
				{
					"id":    1,
					"title": "Closures dan Scope",
					"type":  "reading",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "# Closures dan Scope\n\nClosure adalah fungsi yang memiliki akses ke variabel di scope luar bahkan setelah fungsi luar selesai dieksekusi.",
						},
					},
				},
			},
			"preTest": map[string]interface{}{
				"id":    "pre2",
				"title": "Pre-Test: Advanced JavaScript",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "Apa itu closure dalam JavaScript?",
						"options":  []string{"Fungsi yang memiliki akses ke scope luar", "Tipe data", "Method", "Variable"},
						"correct":  0,
					},
				},
			},
			"postTest": map[string]interface{}{
				"id":    "post2",
				"title": "Post-Test: Advanced JavaScript",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "Prototype dalam JavaScript digunakan untuk?",
						"options":  []string{"Inheritance", "Styling", "Database", "Testing"},
						"correct":  0,
					},
				},
			},
		},
		{
			"title":       "UI/UX Design Fundamentals",
			"description": "Learn the principles of user interface and user experience design",
			"category":    "Design",
			"level":       "Beginner",
			"duration":    "5 weeks",
			"instructor":  "Sarah Wilson",
			"rating":      4.7,
			"students":    2156,
			"image":       "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop&crop=center",
			"introMaterial": map[string]interface{}{
				"title": "Dasar-dasar UI/UX Design",
				"content": []map[string]interface{}{
					{
						"type":    "text",
						"content": "Selamat datang di kursus UI/UX Design Fundamentals! Dalam kursus ini, Anda akan mempelajari prinsip-prinsip dasar desain antarmuka pengguna dan pengalaman pengguna.",
					},
				},
			},
			"lessons": []map[string]interface{}{
				{
					"id":    1,
					"title": "Pengenalan UI/UX",
					"type":  "reading",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "# Pengenalan UI/UX\n\nUI (User Interface) dan UX (User Experience) adalah dua aspek penting dalam desain produk digital.",
						},
					},
				},
			},
			"preTest": map[string]interface{}{
				"id":    "pre3",
				"title": "Pre-Test: UI/UX Design",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "Apa kepanjangan dari UI?",
						"options":  []string{"User Interface", "User Integration", "Universal Interface", "Unique Interface"},
						"correct":  0,
					},
				},
			},
			"postTest": map[string]interface{}{
				"id":    "post3",
				"title": "Post-Test: UI/UX Design",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "UX Design berfokus pada?",
						"options":  []string{"Pengalaman pengguna", "Warna", "Font", "Layout"},
						"correct":  0,
					},
				},
			},
		},
		{
			"title":       "Backend Development with Node.js",
			"description": "Build robust backend applications using Node.js and Express",
			"category":    "Programming",
			"level":       "Intermediate",
			"duration":    "8 weeks",
			"instructor":  "Mike Johnson",
			"rating":      4.6,
			"students":    987,
			"image":       "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop&crop=center",
			"introMaterial": map[string]interface{}{
				"title": "Backend Development dengan Node.js",
				"content": []map[string]interface{}{
					{
						"type":    "text",
						"content": "Selamat datang di kursus Backend Development with Node.js! Dalam kursus ini, Anda akan mempelajari cara membangun aplikasi backend yang robust menggunakan Node.js dan Express.",
					},
				},
			},
			"lessons": []map[string]interface{}{
				{
					"id":    1,
					"title": "Pengenalan Node.js",
					"type":  "reading",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "# Pengenalan Node.js\n\nNode.js adalah runtime environment untuk JavaScript yang memungkinkan kita menjalankan JavaScript di server.",
						},
					},
				},
			},
			"preTest": map[string]interface{}{
				"id":    "pre4",
				"title": "Pre-Test: Backend Development",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "Node.js adalah?",
						"options":  []string{"Runtime environment untuk JavaScript", "Database", "Framework", "Library"},
						"correct":  0,
					},
				},
			},
			"postTest": map[string]interface{}{
				"id":    "post4",
				"title": "Post-Test: Backend Development",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "Express.js digunakan untuk?",
						"options":  []string{"Web framework untuk Node.js", "Database", "Frontend", "Testing"},
						"correct":  0,
					},
				},
			},
		},
		{
			"title":       "Agile Project Management Fundamentals",
			"description": "Master the principles and practices of Agile project management methodology including Scrum, Kanban, and Lean practices",
			"category":    "Project Management",
			"level":       "Intermediate",
			"duration":    "8 weeks",
			"instructor":  "Michael Chen",
			"rating":      4.9,
			"students":    3247,
			"image":       "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop&crop=center",
			"introMaterial": map[string]interface{}{
				"title": "Welcome to Agile Project Management",
				"content": []map[string]interface{}{
					{
						"type":    "text",
						"content": "Welcome to Agile Project Management Fundamentals! This comprehensive course covers Agile methodologies, Scrum, Kanban, and modern project management practices.",
					},
					{
						"type":        "pdf",
						"title":       "Agile Manifesto and Principles Guide",
						"filename":    "agile-manifesto-guide.pdf",
						"embedUrl":    "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
						"downloadUrl": "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
						"description": "Comprehensive guide to Agile manifesto and its 12 principles.",
					},
					{
						"type":        "video",
						"title":       "Introduction to Agile Project Management",
						"url":         "https://www.youtube.com/watch?v=Z9QbYZh1YXY",
						"duration":    "15:30",
						"description": "Overview of Agile principles and why they matter in modern project management",
					},
					{
						"type":        "external_link",
						"title":       "Agile Alliance Official Website",
						"url":         "https://www.agilealliance.org/",
						"description": "Comprehensive resource for Agile practices, events, and community",
					},
				},
			},
			"lessons": []map[string]interface{}{
				{
					"id":    1,
					"title": "Agile Fundamentals and History",
					"type":  "mixed",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "Agile methodology emerged as a response to traditional waterfall project management limitations. It emphasizes iterative development, collaboration, and adaptability.",
						},
						{
							"type":        "pdf",
							"title":       "History of Agile Development",
							"filename":    "agile-history.pdf",
							"size":        "2.1 MB",
							"embedUrl":    "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
							"downloadUrl": "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
						},
						{
							"type":        "video",
							"title":       "Agile vs Waterfall Comparison",
							"url":         "https://www.youtube.com/watch?v=GE6lbPLEAzc",
							"duration":    "12:45",
							"description": "Detailed comparison between Agile and traditional project management approaches",
						},
						{
							"type":        "external_link",
							"title":       "Agile Manifesto Original Document",
							"url":         "https://agilemanifesto.org/",
							"description": "Read the original Agile Manifesto and its 12 principles",
						},
					},
				},
				{
					"id":    2,
					"title": "Scrum Framework Deep Dive",
					"type":  "mixed",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "Scrum is the most popular Agile framework, providing structure through roles, events, and artifacts while maintaining flexibility.",
						},
						{
							"type":        "pdf",
							"title":       "Scrum Guide 2020",
							"filename":    "scrum-guide-2020.pdf",
							"size":        "1.8 MB",
							"embedUrl":    "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
							"downloadUrl": "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
						},
						{
							"type":        "video",
							"title":       "Scrum Roles and Responsibilities",
							"url":         "https://www.youtube.com/watch?v=gy1c4_YixCo",
							"duration":    "18:20",
							"description": "Understanding Product Owner, Scrum Master, and Development Team roles",
						},
						{
							"type":        "external_link",
							"title":       "Scrum.org Official Resources",
							"url":         "https://www.scrum.org/resources",
							"description": "Official Scrum resources, assessments, and certification information",
						},
					},
				},
				{
					"id":    3,
					"title": "Kanban and Visual Management",
					"type":  "mixed",
					"content": []map[string]interface{}{
						{
							"type":    "text",
							"content": "Kanban focuses on visualizing work, limiting work in progress, and optimizing flow to improve team efficiency and delivery.",
						},
						{
							"type":        "pdf",
							"title":       "Kanban Implementation Guide",
							"filename":    "kanban-implementation.pdf",
							"size":        "1.5 MB",
							"embedUrl":    "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
							"downloadUrl": "http://repo.darmajaya.ac.id/4274/1/Embedded%20Systems%20Architecture%20for%20Agile%20Development_%20A%20Layers-Based%20Model%20%28%20PDFDrive%20%29.pdf",
						},
						{
							"type":        "video",
							"title":       "Building Effective Kanban Boards",
							"url":         "https://www.youtube.com/watch?v=iVaFVa7HYj4",
							"duration":    "14:15",
							"description": "Step-by-step guide to creating and managing Kanban boards",
						},
						{
							"type":        "external_link",
							"title":       "Kanban University Resources",
							"url":         "https://kanban.university/",
							"description": "Comprehensive Kanban learning resources and certification programs",
						},
					},
				},
			},
			"preTest": map[string]interface{}{
				"id":    "pre5",
				"title": "Pre-Test: Agile Project Management",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "What are the four core values of the Agile Manifesto?",
						"options":  []string{"Individuals and Interactions Over Processes and Tools", "Speed over quality", "Processes over individuals", "Quality over speed"},
						"correct":  0,
					},
				},
			},
			"postTest": map[string]interface{}{
				"id":    "post5",
				"title": "Post-Test: Agile Project Management",
				"questions": []map[string]interface{}{
					{
						"id":       1,
						"question": "Which estimation technique uses relative sizing?",
						"options":  []string{"Planning Poker", "T-shirt sizing", "Ideal hours", "Function points"},
						"correct":  0,
					},
				},
			},
		},
	}

	for _, courseData := range courses {
		// Convert complex fields to JSON
		introMaterialJSON, _ := json.Marshal(courseData["introMaterial"])
		lessonsJSON, _ := json.Marshal(courseData["lessons"])
		preTestJSON, _ := json.Marshal(courseData["preTest"])
		postTestJSON, _ := json.Marshal(courseData["postTest"])

		// Insert course
		query := `
			INSERT INTO courses (
				title, description, category, level, duration, instructor,
				rating, students, image, intro_material, lessons, pre_test, post_test
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		`

		_, err := db.Exec(query,
			courseData["title"], courseData["description"], courseData["category"],
			courseData["level"], courseData["duration"], courseData["instructor"],
			courseData["rating"], courseData["students"], courseData["image"],
			introMaterialJSON, lessonsJSON, preTestJSON, postTestJSON,
		)

		if err != nil {
			log.Printf("Error creating course %s: %v", courseData["title"], err)
		} else {
			log.Printf("Created course: %s", courseData["title"])
		}
	}
}

func seedQuizzes(db *sql.DB) {
	// Check if quizzes already exist
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM quizzes").Scan(&count)
	if err != nil {
		log.Printf("Error checking quizzes: %v", err)
		return
	}

	if count > 0 {
		log.Println("Quizzes already exist, skipping quiz seeding")
		return
	}

	// Get courses with pre_test and post_test data
	query := `SELECT id, title, pre_test, post_test FROM courses WHERE pre_test IS NOT NULL OR post_test IS NOT NULL`
	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error getting courses for quiz seeding: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var courseID int
		var courseTitle string
		var preTestJSON, postTestJSON sql.NullString

		err := rows.Scan(&courseID, &courseTitle, &preTestJSON, &postTestJSON)
		if err != nil {
			log.Printf("Error scanning course data: %v", err)
			continue
		}

		// Create pre-test quiz if exists
		if preTestJSON.Valid {
			var preTestData map[string]interface{}
			if err := json.Unmarshal([]byte(preTestJSON.String), &preTestData); err == nil {
				questions, _ := json.Marshal(preTestData["questions"])
				title := preTestData["title"].(string)

				insertQuery := `
					INSERT INTO quizzes (course_id, title, description, questions, quiz_type, time_limit, max_attempts, passing_score, is_active, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				`
				_, err := db.Exec(insertQuery, courseID, title, "Pre-test for "+courseTitle, questions, "pretest", 30, 3, 70, true)
				if err != nil {
					log.Printf("Error creating pre-test for course %s: %v", courseTitle, err)
				} else {
					log.Printf("Created pre-test quiz for course: %s", courseTitle)
				}
			}
		}

		// Create post-test quiz if exists
		if postTestJSON.Valid {
			var postTestData map[string]interface{}
			if err := json.Unmarshal([]byte(postTestJSON.String), &postTestData); err == nil {
				questions, _ := json.Marshal(postTestData["questions"])
				title := postTestData["title"].(string)

				insertQuery := `
					INSERT INTO quizzes (course_id, title, description, questions, quiz_type, time_limit, max_attempts, passing_score, is_active, created_at, updated_at)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				`
				_, err := db.Exec(insertQuery, courseID, title, "Post-test for "+courseTitle, questions, "posttest", 30, 3, 70, true)
				if err != nil {
					log.Printf("Error creating post-test for course %s: %v", courseTitle, err)
				} else {
					log.Printf("Created post-test quiz for course: %s", courseTitle)
				}
			}
		}
	}
}