package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
)

// SetupCORS configures CORS middleware with manual implementation
func SetupCORS(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get origin from request
		origin := r.Header.Get("Origin")
		
		// Get allowed origins from environment variable
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		
		// Check if origin is allowed
		isAllowed := false
		if allowedOrigins == "" {
			// Allow all origins if not specified
			isAllowed = true
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else {
			// Check specific origins
			origins := strings.Split(allowedOrigins, ",")
			for _, allowedOrigin := range origins {
				allowedOrigin = strings.TrimSpace(allowedOrigin)
				if origin == allowedOrigin || allowedOrigin == "*" {
					isAllowed = true
					w.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
			
			// Special handling for Vercel deployments
			if !isAllowed && strings.Contains(origin, "vercel.app") {
				isAllowed = true
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			
			// Special handling for cloud workstations
			if !isAllowed && strings.Contains(origin, "cloudworkstations.dev") {
				isAllowed = true
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
		}
		
		// Set other CORS headers
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "300")
		w.Header().Set("Access-Control-Expose-Headers", "Link")
		
		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		// Continue with the request
		handler.ServeHTTP(w, r)
	})
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