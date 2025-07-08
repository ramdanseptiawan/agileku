package models

import (
	"database/sql"
	"time"
)

// StageLock represents a locked stage in a course
type StageLock struct {
	ID          int            `json:"id"`
	CourseID    int            `json:"courseId"`
	StageName   string         `json:"stageName"`
	IsLocked    bool           `json:"isLocked"`
	LockMessage string         `json:"lockMessage"`
	LockedBy    sql.NullInt64  `json:"lockedBy"`
	LockedAt    *time.Time     `json:"lockedAt"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
}

// GetStageLocksByCourse retrieves all stage locks for a specific course
func GetStageLocksByCourse(db *sql.DB, courseID int) ([]StageLock, error) {
	query := `
		SELECT id, course_id, stage_name, is_locked, lock_message, 
		       locked_by, locked_at, created_at, updated_at
		FROM course_stage_locks
		WHERE course_id = $1
		ORDER BY stage_name
	`

	rows, err := db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stageLocks []StageLock
	for rows.Next() {
		var lock StageLock
		err := rows.Scan(
			&lock.ID, &lock.CourseID, &lock.StageName, &lock.IsLocked,
			&lock.LockMessage, &lock.LockedBy, &lock.LockedAt,
			&lock.CreatedAt, &lock.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		stageLocks = append(stageLocks, lock)
	}

	return stageLocks, nil
}

// GetStageLock retrieves a specific stage lock
func GetStageLock(db *sql.DB, courseID int, stageName string) (*StageLock, error) {
	query := `
		SELECT id, course_id, stage_name, is_locked, lock_message,
		       locked_by, locked_at, created_at, updated_at
		FROM course_stage_locks
		WHERE course_id = $1 AND stage_name = $2
	`

	var lock StageLock
	err := db.QueryRow(query, courseID, stageName).Scan(
		&lock.ID, &lock.CourseID, &lock.StageName, &lock.IsLocked,
		&lock.LockMessage, &lock.LockedBy, &lock.LockedAt,
		&lock.CreatedAt, &lock.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &lock, nil
}

// UpsertStageLock creates or updates a stage lock
func UpsertStageLock(db *sql.DB, stageLock *StageLock) error {
	query := `
		INSERT INTO course_stage_locks (course_id, stage_name, is_locked, lock_message, locked_by, locked_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (course_id, stage_name)
		DO UPDATE SET
			is_locked = EXCLUDED.is_locked,
			lock_message = EXCLUDED.lock_message,
			locked_by = EXCLUDED.locked_by,
			locked_at = EXCLUDED.locked_at,
			updated_at = CURRENT_TIMESTAMP
		RETURNING id, created_at, updated_at
	`

	var lockedAt *time.Time
	if stageLock.IsLocked {
		now := time.Now()
		lockedAt = &now
	}

	// Handle NULL values for locked_by
	var lockedBy interface{}
	if stageLock.LockedBy.Valid {
		lockedBy = stageLock.LockedBy.Int64
	} else {
		lockedBy = nil
	}

	err := db.QueryRow(query,
		stageLock.CourseID,
		stageLock.StageName,
		stageLock.IsLocked,
		stageLock.LockMessage,
		lockedBy,
		lockedAt,
	).Scan(&stageLock.ID, &stageLock.CreatedAt, &stageLock.UpdatedAt)

	return err
}

// IsStageLockedForUser checks if a stage is locked for a user
func IsStageLockedForUser(db *sql.DB, courseID int, stageName string, userRole string) (bool, string, error) {
	// Admin users can always access locked stages
	if userRole == "admin" {
		return false, "", nil
	}

	query := `
		SELECT is_locked, lock_message
		FROM course_stage_locks
		WHERE course_id = $1 AND stage_name = $2
	`

	var isLocked bool
	var lockMessage string
	err := db.QueryRow(query, courseID, stageName).Scan(&isLocked, &lockMessage)

	if err != nil {
		if err == sql.ErrNoRows {
			// No lock record found, stage is not locked
			return false, "", nil
		}
		return false, "", err
	}

	return isLocked, lockMessage, nil
}

// GetAllStageNames returns all possible stage names
func GetAllStageNames() []string {
	return []string{
		"intro",
		"pretest",
		"lessons",
		"posttest",
		"postwork",
		"finalproject",
	}
}