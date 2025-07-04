package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"lms-backend/config"
	"lms-backend/middleware"
	"lms-backend/routes"
	"lms-backend/seed"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Initialize database connection
	db, err := config.InitDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Seed initial data if in development mode
	if os.Getenv("ENVIRONMENT") == "development" {
		seed.SeedData(db)
	}

	// Initialize router
	router := routes.SetupRoutes(db)

	// Setup CORS
	handler := middleware.SetupCORS(router)

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	fmt.Printf("Server running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}