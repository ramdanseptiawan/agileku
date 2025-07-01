package routes

import (
	"net/http"

	"github.com/gorilla/mux"

	"lms-backend/handlers"
	"lms-backend/middleware"
)

// SetupRoutes configures all API routes
func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	// API prefix
	api := r.PathPrefix("/api").Subrouter()

	// Public routes (no authentication required)
	public := api.PathPrefix("/public").Subrouter()
	public.HandleFunc("/register", handlers.Register).Methods("POST")
	public.HandleFunc("/login", handlers.Login).Methods("POST")
	public.HandleFunc("/courses", handlers.GetCourses).Methods("GET")
	public.HandleFunc("/courses/{id}", handlers.GetCourse).Methods("GET")
	public.HandleFunc("/certificates/verify/{certNumber}", handlers.VerifyCertificate).Methods("GET")

	// File serving (public)
	api.HandleFunc("/uploads/{filename}", handlers.GetFile).Methods("GET")

	// Protected routes (authentication required)
	protected := api.PathPrefix("/protected").Subrouter()

	// User routes
	user := protected.PathPrefix("/user").Subrouter()
	user.HandleFunc("/profile", middleware.AuthMiddleware(handlers.GetProfile)).Methods("GET")
	user.HandleFunc("/enrollments", middleware.AuthMiddleware(handlers.GetUserEnrollments)).Methods("GET")
	user.HandleFunc("/certificates", middleware.AuthMiddleware(handlers.GetUserCertificates)).Methods("GET")
	user.HandleFunc("/files", middleware.AuthMiddleware(handlers.GetUserFiles)).Methods("GET")

	// Course routes
	courses := protected.PathPrefix("/courses").Subrouter()
	courses.HandleFunc("/enroll", middleware.AuthMiddleware(handlers.EnrollInCourse)).Methods("POST")
	courses.HandleFunc("/{courseId}/progress", middleware.AuthMiddleware(handlers.GetCourseProgress)).Methods("GET")
	courses.HandleFunc("/{courseId}/quizzes", middleware.AuthMiddleware(handlers.GetCourseQuizzes)).Methods("GET")
	courses.HandleFunc("/{courseId}/submissions", middleware.AuthMiddleware(handlers.GetUserSubmissions)).Methods("GET")
	courses.HandleFunc("/{courseId}/certificate", middleware.AuthMiddleware(handlers.GenerateCertificate)).Methods("POST")

	// Quiz routes
	quizzes := protected.PathPrefix("/quizzes").Subrouter()
	quizzes.HandleFunc("/{id}", middleware.AuthMiddleware(handlers.GetQuiz)).Methods("GET")
	quizzes.HandleFunc("/submit", middleware.AuthMiddleware(handlers.SubmitQuiz)).Methods("POST")
	quizzes.HandleFunc("/{quizId}/attempts", middleware.AuthMiddleware(handlers.GetQuizAttempts)).Methods("GET")

	// Progress routes
	progress := protected.PathPrefix("/progress").Subrouter()
	progress.HandleFunc("/lesson", middleware.AuthMiddleware(handlers.UpdateLessonProgress)).Methods("POST")

	// Submission routes
	submissions := protected.PathPrefix("/submissions").Subrouter()
	submissions.HandleFunc("/postwork", middleware.AuthMiddleware(handlers.SubmitPostWork)).Methods("POST")
	submissions.HandleFunc("/finalproject", middleware.AuthMiddleware(handlers.SubmitFinalProject)).Methods("POST")

	// Survey routes
	surveys := protected.PathPrefix("/surveys").Subrouter()
	surveys.HandleFunc("/submit", middleware.AuthMiddleware(handlers.SubmitSurvey)).Methods("POST")

	// File upload routes
	uploads := protected.PathPrefix("/uploads").Subrouter()
	uploads.HandleFunc("/file", middleware.AuthMiddleware(handlers.UploadFile)).Methods("POST")
	uploads.HandleFunc("/file", middleware.AuthMiddleware(handlers.DeleteFile)).Methods("DELETE")

	// Certificate routes
	certificates := protected.PathPrefix("/certificates").Subrouter()
	certificates.HandleFunc("/{id}", middleware.AuthMiddleware(handlers.GetCertificate)).Methods("GET")

	// Admin routes (admin authentication required)
	admin := api.PathPrefix("/admin").Subrouter()

	// Admin course management
	adminCourses := admin.PathPrefix("/courses").Subrouter()
	adminCourses.HandleFunc("", middleware.AdminMiddleware(handlers.CreateCourse)).Methods("POST")
	adminCourses.HandleFunc("/{id}", middleware.AdminMiddleware(handlers.UpdateCourse)).Methods("PUT")
	adminCourses.HandleFunc("/{id}", middleware.AdminMiddleware(handlers.DeleteCourse)).Methods("DELETE")
	adminCourses.HandleFunc("/{courseId}/submissions", middleware.AdminMiddleware(handlers.GetCourseSubmissions)).Methods("GET")
	adminCourses.HandleFunc("/{courseId}/surveys", middleware.AdminMiddleware(handlers.GetCourseSurveys)).Methods("GET")

	// Admin grading
	adminGrading := admin.PathPrefix("/grading").Subrouter()
	adminGrading.HandleFunc("/postwork/{id}", middleware.AdminMiddleware(handlers.GradePostWork)).Methods("POST")
	adminGrading.HandleFunc("/finalproject/{id}", middleware.AdminMiddleware(handlers.GradeFinalProject)).Methods("POST")

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"LMS Backend is running"}`))
	}).Methods("GET")

	// Root endpoint
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Welcome to LMS Backend API","version":"1.0.0"}`))
	}).Methods("GET")

	return r
}