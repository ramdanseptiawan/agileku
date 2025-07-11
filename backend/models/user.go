package models

import (
	"database/sql"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Don't include in JSON responses
	FullName  string    `json:"fullName"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"fullName"`
}

type LoginResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

// HashPassword hashes the user's password
func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword verifies the user's password
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// CreateUser creates a new user in the database
func CreateUser(db *sql.DB, user *User) error {
	// Hash the password before storing
	err := user.HashPassword()
	if err != nil {
		return err
	}

	query := `
		INSERT INTO users (username, email, password_hash, full_name, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	err = db.QueryRow(query, user.Username, user.Email, user.Password, user.FullName, user.Role).Scan(
		&user.ID, &user.CreatedAt, &user.UpdatedAt,
	)

	return err
}

// GetUserByUsername retrieves a user by username
func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, email, password_hash, full_name, role, created_at, updated_at
		FROM users
		WHERE username = $1
	`

	err := db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password,
		&user.FullName, &user.Role, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func GetUserByID(db *sql.DB, id int) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, email, password_hash, full_name, role, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err := db.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password,
		&user.FullName, &user.Role, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

// UpdateUser updates user information
func UpdateUser(db *sql.DB, user *User) error {
	query := `
		UPDATE users
		SET username = $1, email = $2, full_name = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
		RETURNING updated_at
	`

	err := db.QueryRow(query, user.Username, user.Email, user.FullName, user.ID).Scan(&user.UpdatedAt)
	return err
}

// UpdatePassword updates user password
func UpdatePassword(db *sql.DB, userID int, newPassword string) error {
	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	query := `
		UPDATE users
		SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`

	_, err = db.Exec(query, string(hashedPassword), userID)
	return err
}