package seed

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
	"lms-backend/config"
	"lms-backend/models"
	"golang.org/x/crypto/bcrypt"
)

// SeedData populates the database with initial data based on CourseData.js
func SeedData() {
	fmt.Println("Seeding database...")

	// Get database connection
	db := config.GetDB()

	// Check if data already exists
	var courseCount int64
	db.Model(&models.Course{}).Count(&courseCount)
	if courseCount > 0 {
		fmt.Println("Database already seeded")
		return
	}

	// Create admin user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("123"), bcrypt.DefaultCost)
	adminUser := models.User{
		Username: "admin",
		Email:    "admin@lms.com",
		Password: string(hashedPassword),
		Role:     "admin",
	}
	db.Create(&adminUser)

	// Create student user
	studentPassword, _ := bcrypt.GenerateFromPassword([]byte("123"), bcrypt.DefaultCost)
	studentUser := models.User{
		Username: "student",
		Email:    "student@lms.com",
		Password: string(studentPassword),
		Role:     "student",
	}
	db.Create(&studentUser)

	// Create courses based on CourseData.js
	courses := []models.Course{
		{
			Title:       "Introduction to React",
			Description: "Learn the fundamentals of React development",
			Category:    "Programming",
			Level:       "Beginner",
			Duration:    "4 weeks",
			Instructor:  "John Doe",
			Rating:      4.8,
			Students:    1234,
			Image:       "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop&crop=center",
		},
		{
			Title:       "Advanced JavaScript",
			Description: "Master advanced JavaScript concepts and patterns",
			Category:    "Programming",
			Level:       "Advanced",
			Duration:    "6 weeks",
			Instructor:  "Jane Smith",
			Rating:      4.9,
			Students:    856,
			Image:       "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop&crop=center",
		},
		{
			Title:       "Python for Data Science",
			Description: "Learn Python programming for data analysis and machine learning",
			Category:    "Data Science",
			Level:       "Intermediate",
			Duration:    "8 weeks",
			Instructor:  "Dr. Michael Johnson",
			Rating:      4.7,
			Students:    2341,
			Image:       "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=300&h=200&fit=crop&crop=center",
		},
		{
			Title:       "UI/UX Design Fundamentals",
			Description: "Master the principles of user interface and user experience design",
			Category:    "Design",
			Level:       "Beginner",
			Duration:    "5 weeks",
			Instructor:  "Sarah Wilson",
			Rating:      4.6,
			Students:    1876,
			Image:       "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop&crop=center",
		},
		{
			Title:       "Digital Marketing Strategy",
			Description: "Learn effective digital marketing strategies and tools",
			Category:    "Marketing",
			Level:       "Intermediate",
			Duration:    "6 weeks",
			Instructor:  "Mark Davis",
			Rating:      4.5,
			Students:    1543,
			Image:       "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop&crop=center",
		},
	}

	for i, courseData := range courses {
		// Create course
		db.Create(&courseData)

		// Create lessons for each course
		lessons := []models.Lesson{
			{
				CourseID: courseData.ID,
				Title:    fmt.Sprintf("Pengenalan %s", courseData.Title),
				Type:     "reading",
				Content:  fmt.Sprintf("# Pengenalan %s\n\nSelamat datang di kursus %s. Dalam pelajaran ini, Anda akan mempelajari dasar-dasar dan konsep fundamental.", courseData.Title, courseData.Title),
				Order:    1,
			},
			{
				CourseID: courseData.ID,
				Title:    fmt.Sprintf("Video Tutorial %s", courseData.Title),
				Type:     "video",
				Content:  fmt.Sprintf("Video tutorial komprehensif untuk %s", courseData.Title),
				Order:    2,
			},
			{
				CourseID: courseData.ID,
				Title:    fmt.Sprintf("Praktik %s", courseData.Title),
				Type:     "assignment",
				Content:  fmt.Sprintf("Tugas praktik untuk menguji pemahaman Anda tentang %s", courseData.Title),
				Order:    3,
			},
		}

		for _, lesson := range lessons {
			db.Create(&lesson)
		}

		// Create pre-test and post-test quizzes
		preTest := models.Quiz{
			CourseID: courseData.ID,
			Title:    fmt.Sprintf("Pre-Test: %s", courseData.Title),
			Type:     "preTest",
		}
		db.Create(&preTest)

		postTest := models.Quiz{
			CourseID: courseData.ID,
			Title:    fmt.Sprintf("Post-Test: %s", courseData.Title),
			Type:     "postTest",
		}
		db.Create(&postTest)

		// Create questions for pre-test
		preTestQuestions := getPreTestQuestions(i)
		for j, q := range preTestQuestions {
			optionsJSON, _ := json.Marshal(q.Options)
			question := models.Question{
				QuizID:   preTest.ID,
				Question: q.Question,
				Options:  string(optionsJSON),
				Correct:  q.Correct,
				Order:    j + 1,
			}
			db.Create(&question)
		}

		// Create questions for post-test
		postTestQuestions := getPostTestQuestions(i)
		for j, q := range postTestQuestions {
			optionsJSON, _ := json.Marshal(q.Options)
			question := models.Question{
				QuizID:   postTest.ID,
				Question: q.Question,
				Options:  string(optionsJSON),
				Correct:  q.Correct,
				Order:    j + 1,
			}
			db.Create(&question)
		}
	}

	// Create sample enrollments
	enrollments := []models.Enrollment{
		{
			UserID:   studentUser.ID,
			CourseID: 1,
			Progress: 65,
			StartedAt: time.Now(),
		},
		{
			UserID:   studentUser.ID,
			CourseID: 2,
			Progress: 30,
			StartedAt: time.Now(),
		},
	}

	for _, enrollment := range enrollments {
		db.Create(&enrollment)
	}

	fmt.Println("Database seeded successfully!")
	log.Println("Default users created:")
	log.Println("Admin - Username: admin, Password: admin123")
	log.Println("Student - Username: student, Password: student123")
}

type QuestionData struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
	Correct  int      `json:"correct"`
}

func getPreTestQuestions(courseIndex int) []QuestionData {
	switch courseIndex {
	case 0: // React
		return []QuestionData{
			{
				Question: "React dikembangkan oleh?",
				Options:  []string{"Google", "Facebook", "Microsoft", "Apple"},
				Correct:  1,
			},
			{
				Question: "Apa kepanjangan dari JSX?",
				Options:  []string{"JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"},
				Correct:  0,
			},
			{
				Question: "React adalah?",
				Options:  []string{"Framework", "Library", "Database", "Server"},
				Correct:  1,
			},
			{
				Question: "Apa itu component dalam React?",
				Options:  []string{"Fungsi atau class yang mengembalikan JSX", "Database", "CSS file", "HTML file"},
				Correct:  0,
			},
		}
	case 1: // JavaScript
		return []QuestionData{
			{
				Question: "JavaScript adalah bahasa pemrograman?",
				Options:  []string{"Compiled", "Interpreted", "Assembly", "Machine"},
				Correct:  1,
			},
			{
				Question: "Apa itu closure dalam JavaScript?",
				Options:  []string{"Function yang memiliki akses ke scope luar", "Loop", "Variable", "Object"},
				Correct:  0,
			},
			{
				Question: "Event loop berfungsi untuk?",
				Options:  []string{"Styling", "Menangani asynchronous operations", "Database", "Networking"},
				Correct:  1,
			},
		}
	case 2: // Python
		return []QuestionData{
			{
				Question: "Python dikembangkan oleh?",
				Options:  []string{"Guido van Rossum", "Linus Torvalds", "Dennis Ritchie", "Bjarne Stroustrup"},
				Correct:  0,
			},
			{
				Question: "Library Python untuk data science yang populer?",
				Options:  []string{"Django", "Pandas", "Flask", "Requests"},
				Correct:  1,
			},
			{
				Question: "Apa itu NumPy?",
				Options:  []string{"Web framework", "Library untuk numerical computing", "Database", "Text editor"},
				Correct:  1,
			},
		}
	case 3: // UI/UX
		return []QuestionData{
			{
				Question: "UI adalah singkatan dari?",
				Options:  []string{"User Interface", "Universal Internet", "Unique Identifier", "User Information"},
				Correct:  0,
			},
			{
				Question: "UX fokus pada?",
				Options:  []string{"Visual design", "User experience", "Programming", "Database"},
				Correct:  1,
			},
			{
				Question: "Wireframe adalah?",
				Options:  []string{"Final design", "Blueprint atau sketsa layout", "Color palette", "Typography"},
				Correct:  1,
			},
		}
	case 4: // Digital Marketing
		return []QuestionData{
			{
				Question: "SEO adalah singkatan dari?",
				Options:  []string{"Search Engine Optimization", "Social Engine Optimization", "System Engine Operation", "Search Engine Operation"},
				Correct:  0,
			},
			{
				Question: "Platform media sosial yang cocok untuk B2B marketing?",
				Options:  []string{"TikTok", "LinkedIn", "Instagram", "Snapchat"},
				Correct:  1,
			},
			{
				Question: "CTR adalah singkatan dari?",
				Options:  []string{"Click Through Rate", "Cost To Revenue", "Customer Target Rate", "Content Transfer Rate"},
				Correct:  0,
			},
		}
	default:
		return []QuestionData{}
	}
}

func getPostTestQuestions(courseIndex int) []QuestionData {
	switch courseIndex {
	case 0: // React
		return []QuestionData{
			{
				Question: "Virtual DOM dalam React berfungsi untuk?",
				Options:  []string{"Styling", "Meningkatkan performa", "Database", "Testing"},
				Correct:  1,
			},
			{
				Question: "useState adalah?",
				Options:  []string{"Hook untuk mengelola state", "Component", "Props", "Event handler"},
				Correct:  0,
			},
			{
				Question: "useEffect digunakan untuk?",
				Options:  []string{"Side effects dan lifecycle methods", "Styling", "State management", "Routing"},
				Correct:  0,
			},
			{
				Question: "Props dalam React digunakan untuk?",
				Options:  []string{"Mengirim data dari parent ke child component", "Styling", "Database connection", "Routing"},
				Correct:  0,
			},
		}
	case 1: // JavaScript
		return []QuestionData{
			{
				Question: "Promise digunakan untuk?",
				Options:  []string{"Synchronous operations", "Asynchronous operations", "Styling", "Database"},
				Correct:  1,
			},
			{
				Question: "Async/await adalah?",
				Options:  []string{"Syntactic sugar untuk Promise", "Loop", "Variable declaration", "Function type"},
				Correct:  0,
			},
			{
				Question: "Destructuring assignment digunakan untuk?",
				Options:  []string{"Menghapus variable", "Mengekstrak nilai dari array/object", "Membuat loop", "Error handling"},
				Correct:  1,
			},
		}
	case 2: // Python
		return []QuestionData{
			{
				Question: "Matplotlib digunakan untuk?",
				Options:  []string{"Web development", "Data visualization", "Database", "Networking"},
				Correct:  1,
			},
			{
				Question: "Scikit-learn adalah library untuk?",
				Options:  []string{"Web scraping", "Machine learning", "GUI development", "Game development"},
				Correct:  1,
			},
			{
				Question: "Jupyter Notebook digunakan untuk?",
				Options:  []string{"Text editing", "Interactive data analysis", "Web hosting", "Database management"},
				Correct:  1,
			},
		}
	case 3: // UI/UX
		return []QuestionData{
			{
				Question: "Prinsip design yang baik meliputi?",
				Options:  []string{"Kompleksitas", "Simplicity dan clarity", "Banyak warna", "Text yang kecil"},
				Correct:  1,
			},
			{
				Question: "User persona adalah?",
				Options:  []string{"Real user", "Fictional character representing target user", "Developer", "Designer"},
				Correct:  1,
			},
			{
				Question: "A/B testing digunakan untuk?",
				Options:  []string{"Bug testing", "Comparing two versions of design", "Performance testing", "Security testing"},
				Correct:  1,
			},
		}
	case 4: // Digital Marketing
		return []QuestionData{
			{
				Question: "Conversion rate adalah?",
				Options:  []string{"Jumlah visitor", "Persentase visitor yang melakukan action", "Jumlah page views", "Bounce rate"},
				Correct:  1,
			},
			{
				Question: "Google Analytics digunakan untuk?",
				Options:  []string{"Social media management", "Website traffic analysis", "Email marketing", "Content creation"},
				Correct:  1,
			},
			{
				Question: "ROI adalah singkatan dari?",
				Options:  []string{"Return on Investment", "Rate of Interest", "Revenue of Income", "Ratio of Investment"},
				Correct:  0,
			},
		}
	default:
		return []QuestionData{}
	}
}