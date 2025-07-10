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
	certificateHandler := handlers.NewCertificateHandler(db)
	adminHandler := handlers.NewAdminHandler(db)
	announcementHandler := handlers.NewAnnouncementHandler(db)
	surveyHandler := handlers.NewSurveyHandler(db)
	stageLockHandler := handlers.NewStageLockHandler(db)
	userDetailHandler := handlers.NewUserDetailHandler(db)

	// Set database for enhanced handlers
	handlers.SetEnhancedHandlerDB(db)

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

	// Public certificate verification
	public.HandleFunc("/certificates/verify/{certNumber}", certificateHandler.VerifyCertificate).Methods("GET", "OPTIONS")

	// Protected routes (authentication required)
	protected := api.PathPrefix("/protected").Subrouter()
	protected.Use(middleware.AuthMiddleware(db))

	// User profile routes
	protected.HandleFunc("/user/profile", authHandler.GetProfile).Methods("GET", "OPTIONS")
	protected.HandleFunc("/user/profile", authHandler.UpdateProfile).Methods("PUT", "OPTIONS")

	// User detail routes
	protected.HandleFunc("/user/detail", userDetailHandler.GetUserDetail).Methods("GET", "OPTIONS")
	protected.HandleFunc("/user/detail", userDetailHandler.UpdateUserDetail).Methods("PUT", "OPTIONS")

	// Course enrollment routes
	protected.HandleFunc("/courses", courseHandler.GetCoursesWithEnrollment).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/enroll", courseHandler.EnrollInCourse).Methods("POST", "OPTIONS")
	protected.HandleFunc("/courses/enrollments", courseHandler.GetUserEnrollments).Methods("GET", "OPTIONS")

	// Progress tracking routes
	protected.HandleFunc("/progress/lesson", progressHandler.UpdateLessonProgressHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/lessons/{lessonId:[0-9]+}/progress", progressHandler.GetLessonProgressHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/progress", progressHandler.GetCourseProgressHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/progress", progressHandler.GetUserProgressListHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/progress/sync", progressHandler.SyncProgressHandler).Methods("POST", "OPTIONS")

	// Quiz routes (legacy)
	protected.HandleFunc("/quizzes/{id:[0-9]+}", quizHandler.GetQuizHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/quizzes", quizHandler.GetQuizzesByCourseHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/quizzes/{quizId:[0-9]+}/attempts", quizHandler.GetQuizAttemptsHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/quizzes/{quizId:[0-9]+}/start", quizHandler.StartQuizAttemptHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/quizzes/submit", quizHandler.SubmitQuizHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/pretest", quizHandler.GetPreTestHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/posttest", quizHandler.GetPostTestHandler).Methods("GET", "OPTIONS")

	// Enhanced Quiz routes (new improved system)
	protected.HandleFunc("/courses/{courseId:[0-9]+}/quiz/{type}", handlers.GetQuizEnhancedHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/quiz/{type}/start", handlers.StartQuizAttemptEnhancedHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/quiz/attempts/{attemptId:[0-9]+}/submit", handlers.SubmitQuizEnhancedHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/courses/{courseId:[0-9]+}/quiz/{type}/attempts", handlers.GetQuizAttemptsEnhancedHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/quiz/attempts/{attemptId:[0-9]+}/result", handlers.GetQuizResultEnhancedHandler).Methods("GET", "OPTIONS")

	// Submission routes
	protected.HandleFunc("/submissions/postwork", submissionHandler.CreatePostWorkSubmissionHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/submissions/postwork", submissionHandler.GetPostWorkSubmissionsHandler).Methods("GET", "OPTIONS")
	protected.HandleFunc("/submissions/finalproject", submissionHandler.CreateFinalProjectSubmissionHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/submissions/finalproject/{courseId:[0-9]+}", submissionHandler.GetFinalProjectSubmissionHandler).Methods("GET", "OPTIONS")

	// File upload routes
	protected.HandleFunc("/uploads/file", submissionHandler.UploadFileHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/uploads/file/{id:[0-9]+}", submissionHandler.GetFileHandler).Methods("GET", "OPTIONS")

	// Certificate routes
	protected.HandleFunc("/courses/{courseId:[0-9]+}/certificate", certificateHandler.RequestCertificate).Methods("POST", "OPTIONS")
	protected.HandleFunc("/user/certificates", certificateHandler.GetUserCertificates).Methods("GET", "OPTIONS")

	// Announcement routes for users
	protected.HandleFunc("/announcements", announcementHandler.GetUserAnnouncements).Methods("GET", "OPTIONS")

	// Survey feedback routes
	protected.HandleFunc("/surveys/feedback", surveyHandler.SubmitSurveyFeedbackHandler).Methods("POST", "OPTIONS")
	protected.HandleFunc("/surveys/feedback/{courseId:[0-9]+}", surveyHandler.GetSurveyFeedbackHandler).Methods("GET", "OPTIONS")

	// Admin routes (admin role required)
	admin := protected.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.AdminMiddleware)

	// Admin quiz management routes
	admin.HandleFunc("/quizzes", quizHandler.GetAllQuizzesHandler).Methods("GET", "OPTIONS")
	admin.HandleFunc("/quizzes", quizHandler.CreateQuizHandler).Methods("POST", "OPTIONS")
	admin.HandleFunc("/quizzes/{id:[0-9]+}", quizHandler.UpdateQuizHandler).Methods("PUT", "OPTIONS")
	admin.HandleFunc("/quizzes/{id:[0-9]+}", quizHandler.DeleteQuizHandler).Methods("DELETE", "OPTIONS")

	// Admin quiz access routes (no enrollment check)
	admin.HandleFunc("/courses/{courseId:[0-9]+}/pretest", adminHandler.GetCoursePreTestAdmin).Methods("GET", "OPTIONS")
	admin.HandleFunc("/courses/{courseId:[0-9]+}/posttest", adminHandler.GetCoursePostTestAdmin).Methods("GET", "OPTIONS")

	// Admin course management routes
	admin.HandleFunc("/courses", adminHandler.GetAllCourses).Methods("GET", "OPTIONS")
	admin.HandleFunc("/courses", adminHandler.CreateCourse).Methods("POST", "OPTIONS")
	admin.HandleFunc("/courses/{id:[0-9]+}", adminHandler.UpdateCourse).Methods("PUT", "OPTIONS")
	admin.HandleFunc("/courses/{id:[0-9]+}", adminHandler.DeleteCourse).Methods("DELETE", "OPTIONS")

	// Admin grading system routes
	admin.HandleFunc("/grading", adminHandler.CreateGrade).Methods("POST", "OPTIONS")
	admin.HandleFunc("/grading", adminHandler.GetGrades).Methods("GET", "OPTIONS")

	// Admin submissions review routes
	admin.HandleFunc("/courses/{courseId:[0-9]+}/submissions", adminHandler.GetCourseSubmissions).Methods("GET", "OPTIONS")

	// Admin certificate management
	admin.HandleFunc("/certificates", certificateHandler.GetAllCertificates).Methods("GET", "OPTIONS")
	admin.HandleFunc("/certificates/pending", certificateHandler.GetPendingCertificates).Methods("GET", "OPTIONS")
	admin.HandleFunc("/certificates/{certId:[0-9]+}/approve", certificateHandler.ApproveCertificate).Methods("POST", "OPTIONS")
	admin.HandleFunc("/certificates/{certId:[0-9]+}/reject", certificateHandler.RejectCertificate).Methods("POST", "OPTIONS")

	// Admin user management routes
	admin.HandleFunc("/users", adminHandler.GetAllUsers).Methods("GET", "OPTIONS")
	admin.HandleFunc("/users", adminHandler.CreateUser).Methods("POST", "OPTIONS")
	admin.HandleFunc("/users/{id:[0-9]+}", adminHandler.UpdateUser).Methods("PUT", "OPTIONS")
	admin.HandleFunc("/users/{id:[0-9]+}", adminHandler.DeleteUser).Methods("DELETE", "OPTIONS")

	// Admin user detail management routes
	admin.HandleFunc("/user-details", userDetailHandler.GetAllUserDetails).Methods("GET", "OPTIONS")
	admin.HandleFunc("/user-details/{id:[0-9]+}", userDetailHandler.GetUserDetailByID).Methods("GET", "OPTIONS")
	admin.HandleFunc("/user-details/{id:[0-9]+}", userDetailHandler.UpdateUserDetailByID).Methods("PUT", "OPTIONS")
	admin.HandleFunc("/user-details/{id:[0-9]+}", userDetailHandler.DeleteUserDetailByID).Methods("DELETE", "OPTIONS")

	// Admin announcement management routes
	admin.HandleFunc("/announcements", adminHandler.CreateAnnouncement).Methods("POST", "OPTIONS")
	admin.HandleFunc("/announcements", adminHandler.GetAllAnnouncements).Methods("GET", "OPTIONS")
	admin.HandleFunc("/announcements/{id:[0-9]+}", adminHandler.GetAnnouncementByID).Methods("GET", "OPTIONS")
	admin.HandleFunc("/announcements/{id:[0-9]+}", adminHandler.UpdateAnnouncement).Methods("PUT", "OPTIONS")
	admin.HandleFunc("/announcements/{id:[0-9]+}", adminHandler.DeleteAnnouncement).Methods("DELETE", "OPTIONS")

	// Admin dashboard statistics route
	admin.HandleFunc("/dashboard/stats", adminHandler.GetDashboardStats).Methods("GET", "OPTIONS")

	// Admin test results route
	admin.HandleFunc("/test-results", adminHandler.GetAllTestResults).Methods("GET", "OPTIONS")

	// Admin survey feedback routes
	admin.HandleFunc("/surveys/feedback/{courseId:[0-9]+}", surveyHandler.GetAllSurveyFeedbackHandler).Methods("GET", "OPTIONS")

	// Admin stage lock management routes
	admin.HandleFunc("/courses/{id:[0-9]+}/stage-locks", stageLockHandler.GetStageLocks).Methods("GET", "OPTIONS")
	admin.HandleFunc("/courses/{id:[0-9]+}/stage-locks", stageLockHandler.UpdateStageLock).Methods("PUT", "OPTIONS")

	// Admin course configuration routes
	admin.HandleFunc("/courses/{courseId:[0-9]+}/config", handlers.GetCourseConfigHandler(db)).Methods("GET", "OPTIONS")
	admin.HandleFunc("/courses/{courseId:[0-9]+}/config", handlers.UpdateCourseConfigHandler(db)).Methods("PUT", "OPTIONS")

	// Protected stage access check routes
	protected.HandleFunc("/courses/{courseId:[0-9]+}/stages/{stageName}/access", stageLockHandler.CheckStageAccess).Methods("GET", "OPTIONS")

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