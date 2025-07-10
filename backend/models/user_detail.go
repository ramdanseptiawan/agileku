package models

import (
	"database/sql"
	"fmt"
	"log"
	"time"
)

type UserDetail struct {
	ID                 int       `json:"id"`
	UserID             int       `json:"userId"`
	Phone              *string   `json:"phone"`
	Location           *string   `json:"location"`
	Occupation         *string   `json:"occupation"`
	Education          *string   `json:"education"`
	Bio                *string   `json:"bio"`
	LearningStyle      *string   `json:"learning_style"`
	SkillLevel         *string   `json:"skill_level"`
	EmailNotifications bool      `json:"email_notifications"`
	PushNotifications  bool      `json:"push_notifications"`
	WeeklyReports      bool      `json:"weekly_reports"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// GetUserDetailByUserID retrieves user detail by user ID
func GetUserDetailByUserID(db *sql.DB, userID int) (*UserDetail, error) {
	log.Printf("[USER_DETAIL] Getting user detail for user ID: %d", userID)
	
	userDetail := &UserDetail{}
	query := `
		SELECT id, user_id, phone, location, occupation, education, bio, 
		       learning_style, skill_level, email_notifications, push_notifications, 
		       weekly_reports, created_at, updated_at
		FROM user_details
		WHERE user_id = $1
	`

	err := db.QueryRow(query, userID).Scan(
		&userDetail.ID, &userDetail.UserID, &userDetail.Phone, &userDetail.Location,
		&userDetail.Occupation, &userDetail.Education, &userDetail.Bio,
		&userDetail.LearningStyle, &userDetail.SkillLevel, &userDetail.EmailNotifications,
		&userDetail.PushNotifications, &userDetail.WeeklyReports,
		&userDetail.CreatedAt, &userDetail.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[USER_DETAIL] No user detail found for user ID: %d", userID)
			return nil, nil // Return nil instead of error for no rows
		}
		log.Printf("[USER_DETAIL] Error getting user detail: %v", err)
		return nil, err
	}

	log.Printf("[USER_DETAIL] Successfully retrieved user detail for user ID: %d", userID)
	return userDetail, nil
}

// CreateUserDetail creates a new user detail record
func CreateUserDetail(db *sql.DB, userDetail *UserDetail) error {
	log.Printf("[USER_DETAIL] Creating user detail for user ID: %d", userDetail.UserID)
	
	query := `
		INSERT INTO user_details (user_id, phone, location, occupation, education, bio, 
		                         learning_style, skill_level, email_notifications, 
		                         push_notifications, weekly_reports)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at
	`

	err := db.QueryRow(query, userDetail.UserID, userDetail.Phone, userDetail.Location,
		userDetail.Occupation, userDetail.Education, userDetail.Bio,
		userDetail.LearningStyle, userDetail.SkillLevel, userDetail.EmailNotifications,
		userDetail.PushNotifications, userDetail.WeeklyReports).Scan(
		&userDetail.ID, &userDetail.CreatedAt, &userDetail.UpdatedAt,
	)

	if err != nil {
		log.Printf("[USER_DETAIL] Error creating user detail: %v", err)
		return fmt.Errorf("failed to create user detail: %v", err)
	}

	log.Printf("[USER_DETAIL] Successfully created user detail with ID: %d", userDetail.ID)
	return nil
}

// UpdateUserDetail updates an existing user detail record
func UpdateUserDetail(db *sql.DB, userDetail *UserDetail) error {
	log.Printf("[USER_DETAIL] Updating user detail for user ID: %d", userDetail.UserID)
	
	query := `
		UPDATE user_details
		SET phone = $1, location = $2, occupation = $3, education = $4, bio = $5,
		    learning_style = $6, skill_level = $7, email_notifications = $8,
		    push_notifications = $9, weekly_reports = $10, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $11
		RETURNING updated_at
	`

	err := db.QueryRow(query, userDetail.Phone, userDetail.Location, userDetail.Occupation,
		userDetail.Education, userDetail.Bio, userDetail.LearningStyle, userDetail.SkillLevel,
		userDetail.EmailNotifications, userDetail.PushNotifications, userDetail.WeeklyReports,
		userDetail.UserID).Scan(&userDetail.UpdatedAt)

	if err != nil {
		log.Printf("[USER_DETAIL] Error updating user detail: %v", err)
		return fmt.Errorf("failed to update user detail: %v", err)
	}

	log.Printf("[USER_DETAIL] Successfully updated user detail for user ID: %d", userDetail.UserID)
	return nil
}

// DeleteUserDetail deletes a user detail record
func DeleteUserDetail(db *sql.DB, userID int) error {
	log.Printf("[USER_DETAIL] Deleting user detail for user ID: %d", userID)
	
	query := `DELETE FROM user_details WHERE user_id = $1`
	
	result, err := db.Exec(query, userID)
	if err != nil {
		log.Printf("[USER_DETAIL] Error deleting user detail: %v", err)
		return fmt.Errorf("failed to delete user detail: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("[USER_DETAIL] Error getting rows affected: %v", err)
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		log.Printf("[USER_DETAIL] No user detail found to delete for user ID: %d", userID)
		return fmt.Errorf("no user detail found for user ID: %d", userID)
	}

	log.Printf("[USER_DETAIL] Successfully deleted user detail for user ID: %d", userID)
	return nil
}

// GetAllUserDetails retrieves all user details (for admin)
func GetAllUserDetails(db *sql.DB) ([]UserDetail, error) {
	log.Println("[USER_DETAIL] Getting all user details")
	
	query := `
		SELECT id, user_id, phone, location, occupation, education, bio, 
		       learning_style, skill_level, email_notifications, push_notifications, 
		       weekly_reports, created_at, updated_at
		FROM user_details
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("[USER_DETAIL] Error querying all user details: %v", err)
		return nil, fmt.Errorf("failed to query user details: %v", err)
	}
	defer rows.Close()

	var userDetails []UserDetail
	for rows.Next() {
		var userDetail UserDetail
		err := rows.Scan(
			&userDetail.ID, &userDetail.UserID, &userDetail.Phone, &userDetail.Location,
			&userDetail.Occupation, &userDetail.Education, &userDetail.Bio,
			&userDetail.LearningStyle, &userDetail.SkillLevel, &userDetail.EmailNotifications,
			&userDetail.PushNotifications, &userDetail.WeeklyReports,
			&userDetail.CreatedAt, &userDetail.UpdatedAt,
		)
		if err != nil {
			log.Printf("[USER_DETAIL] Error scanning user detail row: %v", err)
			return nil, fmt.Errorf("failed to scan user detail: %v", err)
		}
		userDetails = append(userDetails, userDetail)
	}

	if err = rows.Err(); err != nil {
		log.Printf("[USER_DETAIL] Error iterating user detail rows: %v", err)
		return nil, fmt.Errorf("failed to iterate user details: %v", err)
	}

	log.Printf("[USER_DETAIL] Successfully retrieved %d user details", len(userDetails))
	return userDetails, nil
}