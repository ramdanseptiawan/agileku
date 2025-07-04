package routes

import (
	"database/sql"
	"net/http"

	"lms-backend/handlers"
	"lms-backend/middleware"

	"github.com/gorilla/mux"
)

// SetupRoutes configures all API routes
func SetupRoutes(db *sql.DB) *mux.Router {
	router := mux.NewRouter()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db)
	courseHandler := handlers.NewCourseHandler(db)
	progressHandler := handlers.NewProgressHandler(db)
	quizHandler := handlers.NewQuizHandler(db)
	submissionHandler := handlers.NewSubmissionHandler(db)

	// Apply JSON middleware to all routes
	router.Use(middleware.JSONMiddleware)
	router.Use(middleware.LoggingMiddleware)

	// API prefix
	api := router.PathPrefix("/api").Subrouter()

	// Public routes (no authentication required)
	public := api.PathPrefix("/public").Subrouter()

	// Authentication routes
	public.HandleFunc("/register", authHandler.Register).Methods("POST", "OPTIONS")
	public.HandleFunc("/login", authHandler.Login).Methods("POST", "OPTIONS")

	// Public course routes
	public.HandleFunc("/courses", courseHandler.GetAllCourses).Methods("GET", "OPTIONS")
	public.HandleFunc("/courses/{id:[0-9]+}", courseHandler.GetCourseByID).Methods("GET", "OPTIONS")
	public.HandleFunc("/courses/search", courseHandler.SearchCourses).Methods("GET", "OPTIONS")

	// Protected routes (authentication required)
	protected := api.PathPrefix("/protected").Subrouter()
	protected.Use(middleware.AuthMiddleware(db))

	// User profile routes
	protected.HandleFunc("/user/profile", authHandler.GetProfile).Methods("GET", "OPTIONS")
	protected.HandleFunc("/user/profile", authHandler.UpdateProfile).Methods("PUT", "OPTIONS")

	// Course enrollment routes
	protected.HandleFunc("/courses", courseHandler.GetCoursesWithEnrollment).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/enroll", courseHandler.EnrollInCourse).Methods("POST", "OPTIONS")
	protected.HandleFunc("/courses/enrollments", courseHandler.GetUserEnrollments).Methods("GET", "OPTIONS")

	// Progress tracking routes
	protected.HandleFunc("/progress/lesson", progressHandler.UpdateLessonProgressHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/lessons/{lessonId:[0-9]+}/progress", progressHandler.GetLessonProgressHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/progress", progressHandler.GetCourseProgressHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/progress", progressHandler.GetUserProgressListHandler).Methods("GET", "OPTIONS")

	// Quiz routes
	protected.HandleFunc("/quizzes/{id:[0-9]+}", quizHandler.GetQuizHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/quizzes", quizHandler.GetQuizzesByCourseHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/quizzes/{quizId:[0-9]+}/attempts", quizHandler.GetQuizAttemptsHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/quizzes/{quizId:[0-9]+}/start", quizHandler.StartQuizAttemptHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/quizzes/submit", quizHandler.SubmitQuizHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/pretest", quizHandler.GetPreTestHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/posttest", quizHandler.GetPostTestHandler).Methods("GET", "OPTIONS")

	// Submission routes
	protected.HandleFunc("/submissions/postwork", submissionHandler.CreatePostWorkSubmissionHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/submissions/postwork", submissionHandler.GetPostWorkSubmissionsHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/submissions/finalproject", submissionHandler.CreateFinalProjectSubmissionHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/submissions/finalproject/{courseId:[0-9]+}", submissionHandler.GetFinalProjectSubmissionHandler).Methods("GET", "OPTIONS")

	// File upload routes
	protected.HandleFunc("/uploads/file", submissionHandler.UploadFileHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/uploads/file/{id:[0-9]+}", submissionHandler.GetFileHandler).Methods("GET", "OPTIONS")

	// Admin routes (admin role required)
	admin := protected.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.AdminMiddleware)

	// Admin quiz management routes
	admin.HandleFunc("/quizzes", quizHandler.GetAllQuizzesHandler).Methods("GET", "OPTIONS")
	admin.HandleFunc("/quizzes", quizHandler.CreateQuizHandler).Methods("POST", "OPTIONS")
	admin.HandleFunc("/quizzes/{id:[0-9]+}", quizHandler.UpdateQuizHandler).Methods("PUT", "OPTIONS")
	admin.HandleFunc("/quizzes/{id:[0-9]+}", quizHandler.DeleteQuizHandler).Methods("DELETE", "OPTIONS")

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"LMS Backend API is running"}`))
	}).Methods("GET", "OPTIONS")

	// Root endpoint
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Welcome to LMS Backend API","version":"1.0.0","endpoints":{"/api/public":["POST /register","POST /login","GET /courses","GET /courses/{id}","GET /courses/search"],"/api/protected":["GET /user/profile","PUT /user/profile","GET /courses","POST /courses/enroll","GET /courses/enrollments"]}}`))
	}).Methods("GET", "OPTIONS")

	return router
}