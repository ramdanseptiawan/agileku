-- Migration: Create course_stage_locks table
-- This table stores the lock status for each stage of a course

CREATE TABLE IF NOT EXISTS course_stage_locks (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    stage_name VARCHAR(50) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_message TEXT DEFAULT '',
    locked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    locked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination of course_id and stage_name
    UNIQUE(course_id, stage_name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_course_stage_locks_course_id ON course_stage_locks(course_id);
CREATE INDEX IF NOT EXISTS idx_course_stage_locks_stage_name ON course_stage_locks(stage_name);
CREATE INDEX IF NOT EXISTS idx_course_stage_locks_is_locked ON course_stage_locks(is_locked);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_stage_locks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_stage_locks_updated_at
    BEFORE UPDATE ON course_stage_locks
    FOR EACH ROW
    EXECUTE FUNCTION update_course_stage_locks_updated_at();