package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/rs/cors"
)

// SetupCORS configures CORS middleware
func SetupCORS(handler http.Handler) http.Handler {
	// Get allowed origins from environment variable
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	var origins []string
	
	if allowedOrigins == "" {
		// Default to allow all origins for development
		origins = []string{"*"}
	} else {
		// Split origins by comma
		origins = strings.Split(allowedOrigins, ",")
		for i, origin := range origins {
			origins[i] = strings.TrimSpace(origin)
		}
	}

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins: origins,
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Requested-With",
		},
		ExposedHeaders: []string{
			"Link",
		},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})

	return c.Handler(handler)
}

// JSONMiddleware sets JSON content type for responses
func JSONMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("[LOG] %s %s %s\n", r.Method, r.URL.Path, r.RemoteAddr)
		if r.Method == "POST" && r.URL.Path == "/api/protected/submissions/postwork" {
			fmt.Printf("[MIDDLEWARE DEBUG] POST submission request detected\n")
		}
		next.ServeHTTP(w, r)
	})
}