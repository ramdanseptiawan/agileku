package middleware

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"lms-backend/models"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type contextKey string

const UserContextKey contextKey = "user"

// GenerateJWT generates a JWT token for a user
func GenerateJWT(user *models.User) (string, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", fmt.Errorf("JWT_SECRET not set")
	}

	expiryStr := os.Getenv("JWT_EXPIRY")
	if expiryStr == "" {
		expiryStr = "24h"
	}

	expiry, err := time.ParseDuration(expiryStr)
	if err != nil {
		return "", fmt.Errorf("invalid JWT_EXPIRY format: %v", err)
	}

	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "lms-backend",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %v", err)
	}

	return tokenString, nil
}

// ValidateJWT validates a JWT token and returns the claims
func ValidateJWT(tokenString string) (*Claims, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET not set")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %v", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// AuthMiddleware validates JWT tokens for protected routes
func AuthMiddleware(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Printf("[AUTH DEBUG] Processing request: %s %s\n", r.Method, r.URL.Path)
			
			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				fmt.Printf("[AUTH DEBUG] No authorization header\n")
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Check if header starts with "Bearer "
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
				fmt.Printf("[AUTH DEBUG] Invalid authorization header format\n")
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			tokenString := tokenParts[1]
			fmt.Printf("[AUTH DEBUG] Token received, validating...\n")

			// Validate token
			claims, err := ValidateJWT(tokenString)
			if err != nil {
				fmt.Printf("[AUTH DEBUG] Token validation failed: %v\n", err)
				http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
				return
			}

			// Get user from database to ensure user still exists
			user, err := models.GetUserByID(db, claims.UserID)
			if err != nil {
				http.Error(w, "User not found", http.StatusUnauthorized)
				return
			}

			// Add user to request context
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// AdminMiddleware ensures the user has admin role
func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := r.Context().Value(UserContextKey).(*models.User)
		if !ok {
			http.Error(w, "User not found in context", http.StatusInternalServerError)
			return
		}

		if user.Role != "admin" {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// GetUserFromContext extracts user from request context
func GetUserFromContext(r *http.Request) (*models.User, error) {
	user, ok := r.Context().Value(UserContextKey).(*models.User)
	if !ok {
		return nil, fmt.Errorf("user not found in context")
	}
	return user, nil
}

// GetUserIDFromContext extracts user ID from request context
func GetUserIDFromContext(r *http.Request) (int, error) {
	user, err := GetUserFromContext(r)
	if err != nil {
		return 0, err
	}
	return user.ID, nil
}

// ParseIDFromURL extracts ID from URL path
func ParseIDFromURL(r *http.Request, paramName string) (int, error) {
	idStr := r.URL.Query().Get(paramName)
	if idStr == "" {
		// Try to get from path segments
		pathSegments := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		for i, segment := range pathSegments {
			if segment == paramName && i+1 < len(pathSegments) {
				idStr = pathSegments[i+1]
				break
			}
		}
	}

	if idStr == "" {
		return 0, fmt.Errorf("%s parameter not found", paramName)
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %v", paramName, err)
	}

	return id, nil
}