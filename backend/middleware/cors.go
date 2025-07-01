package middleware

import (
	"net/http"
	"strings"

	"github.com/rs/cors"
)

// SetupCORS configures CORS middleware
func SetupCORS() *cors.Cors {
	allowedOrigins := strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"), ",")
	allowedMethods := strings.Split(getEnv("CORS_ALLOWED_METHODS", "GET,POST,PUT,DELETE,OPTIONS"), ",")
	allowedHeaders := strings.Split(getEnv("CORS_ALLOWED_HEADERS", "Content-Type,Authorization,X-Requested-With"), ",")

	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   allowedMethods,
		AllowedHeaders:   allowedHeaders,
		AllowCredentials: true,
		Debug:           getEnv("CORS_DEBUG", "false") == "true",
	})

	return c
}

// CORSMiddleware is a simple CORS middleware
func CORSMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	}
}