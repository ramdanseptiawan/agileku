package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"lms-backend/seed"
	"lms-backend/config"
	"lms-backend/middleware"
	"lms-backend/routes"
)



func main() {
	// Initialize database
	config.InitDB()

	// Seed initial data
	seed.SeedData()

	// Setup routes
	r := routes.SetupRoutes()

	// Setup CORS
	c := middleware.SetupCORS()

	// Wrap router with CORS
	handler := c.Handler(r)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 LMS Backend Server starting on port %s\n", port)
	fmt.Printf("📚 API Documentation: http://localhost:%s/\n", port)
	fmt.Printf("🏥 Health Check: http://localhost:%s/health\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}