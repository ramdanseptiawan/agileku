-- Migration: Add course configuration fields
-- Date: 2024-01-01
-- Description: Add fields for dynamic course configuration (hasPostWork, hasFinalProject, certificateDelay, stepWeights)

-- Add new columns to courses table
ALTER TABLE courses 
ADD COLUMN has_post_work BOOLEAN DEFAULT true,
ADD COLUMN has_final_project BOOLEAN DEFAULT true,
ADD COLUMN certificate_delay INTEGER DEFAULT 0,
ADD COLUMN step_weights JSONB DEFAULT NULL;

-- Update existing courses with default values
UPDATE courses 
SET 
    has_post_work = CASE 
        WHEN post_work IS NOT NULL AND post_work != 'null' THEN true 
        ELSE false 
    END,
    has_final_project = CASE 
        WHEN final_project IS NOT NULL AND final_project != 'null' THEN true 
        ELSE false 
    END,
    certificate_delay = 0,
    step_weights = '{
        "intro": 10,
        "pretest": 15,
        "lessons": 40,
        "posttest": 35,
        "postwork": 0,
        "finalproject": 0
    }'::jsonb
WHERE has_post_work IS NULL;

-- Create index for better performance on course configuration queries
CREATE INDEX IF NOT EXISTS idx_courses_config ON courses(has_post_work, has_final_project, certificate_delay);

-- Add comments for documentation
COMMENT ON COLUMN courses.has_post_work IS 'Whether this course includes post work assignments';
COMMENT ON COLUMN courses.has_final_project IS 'Whether this course includes final project';
COMMENT ON COLUMN courses.certificate_delay IS 'Certificate issuance delay in days (0 = immediate)';
COMMENT ON COLUMN courses.step_weights IS 'JSON object containing step weights for progress calculation';