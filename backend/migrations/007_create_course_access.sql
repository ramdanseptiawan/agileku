-- Migration: Create course_access table
-- This table manages which courses users can access/enroll in

CREATE TABLE IF NOT EXISTS course_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    has_access BOOLEAN NOT NULL DEFAULT true,
    restricted_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Admin who restricted access
    restricted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination of user and course
    UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_access_user_id ON course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course_id ON course_access(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_has_access ON course_access(has_access);
CREATE INDEX IF NOT EXISTS idx_course_access_restricted_by ON course_access(restricted_by);

-- Add comments for documentation
COMMENT ON TABLE course_access IS 'Manages user access control for courses';
COMMENT ON COLUMN course_access.user_id IS 'ID of the user';
COMMENT ON COLUMN course_access.course_id IS 'ID of the course';
COMMENT ON COLUMN course_access.has_access IS 'Whether user has access to the course (true=allowed, false=restricted)';
COMMENT ON COLUMN course_access.restricted_by IS 'ID of admin who restricted access (null if access is allowed)';
COMMENT ON COLUMN course_access.restricted_at IS 'Timestamp when access was restricted';