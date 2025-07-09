-- Add status and approval fields to certificates table
ALTER TABLE certificates 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_by INTEGER REFERENCES users(id),
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN rejection_reason TEXT;

-- Create index for status column for better query performance
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_user_course_status ON certificates(user_id, course_id, status);

-- Update existing certificates to approved status for backward compatibility
UPDATE certificates SET status = 'approved', approved_at = issued_at WHERE status = 'pending';