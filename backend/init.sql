-- Initialize LMS Database
-- This file is executed when PostgreSQL container starts for the first time

-- Create database if not exists (handled by docker-compose environment)
-- CREATE DATABASE IF NOT EXISTS lms;

-- Grant privileges to test user
GRANT ALL PRIVILEGES ON DATABASE lms TO test;
GRANT ALL PRIVILEGES ON SCHEMA public TO test;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test;

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance (will be created by GORM, but good to have)
-- These will be created automatically by GORM AutoMigrate

-- Insert initial data (optional, handled by Go seeder)
-- The Go application will handle seeding through the seeder.go file