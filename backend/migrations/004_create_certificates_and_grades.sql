-- Migration: Create certificates and grades tables

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    cert_number VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    completion_date TIMESTAMP NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    submission_id INTEGER NOT NULL,
    grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 100),
    feedback TEXT,
    graded_by INTEGER NOT NULL REFERENCES users(id),
    graded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON certificates(cert_number);
CREATE INDEX IF NOT EXISTS idx_grades_user_id ON grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_submission_id ON grades(submission_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();