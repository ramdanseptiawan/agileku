# LMS Backend API

Backend API untuk Learning Management System (LMS) yang dibangun dengan Go, Gorilla Mux, dan PostgreSQL.

## 🏗️ Arsitektur

Proyek ini menggunakan arsitektur yang terstruktur dengan pemisahan concerns:

```
backend/
├── main.go              # Entry point aplikasi
├── config/              # Konfigurasi database dan environment
│   └── database.go
├── models/              # Model database dan schema
│   └── models.go
├── handlers/            # HTTP handlers untuk setiap endpoint
│   ├── auth.go
│   ├── courses.go
│   ├── enrollments.go
│   ├── quizzes.go
│   ├── submissions.go
│   ├── certificates.go
│   └── uploads.go
├── middleware/          # Middleware untuk authentication, CORS, dll
│   ├── auth.go
│   └── cors.go
├── routes/              # Definisi routing API
│   └── routes.go
├── utils/               # Utility functions
│   ├── jwt.go
│   ├── response.go
│   └── file.go
├── uploads/             # Directory untuk file uploads
├── docker-compose.yml   # Docker setup untuk development
├── init.sql            # Database initialization
├── Makefile            # Development commands
└── README.md           # Dokumentasi ini
```

## 🚀 Fitur

### Authentication & Authorization
- ✅ User registration dan login
- ✅ JWT token authentication
- ✅ Role-based access control (student/admin)
- ✅ Password hashing dengan bcrypt

### Course Management
- ✅ CRUD operations untuk courses
- ✅ Course enrollment system
- ✅ Learning progress tracking
- ✅ Lesson management

### Assessment System
- ✅ Pre-test dan Post-test
- ✅ Quiz dengan multiple choice questions
- ✅ Survey system
- ✅ Automatic grading

### Assignment System
- ✅ Post-work submissions
- ✅ Final project submissions
- ✅ File upload support
- ✅ Grading system

### Certificate System
- ✅ Automatic certificate generation
- ✅ Certificate verification
- ✅ Grade calculation based on all assessments

### File Management
- ✅ Secure file upload
- ✅ File validation (type, size)
- ✅ File serving

## 🛠️ Setup Development

### Prerequisites
- Go 1.21+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Environment Variables
Buat file `.env` di root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=test
DB_PASSWORD=test
DB_NAME=lms
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=8080

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Quick Start dengan Docker

```bash
# Start services dengan Docker Compose
make docker-up

# Setup database
make db-setup

# Build dan run aplikasi
make build
make run
```

### Manual Setup

```bash
# Install dependencies
go mod tidy

# Setup PostgreSQL database
createdb lms
psql -d lms -f init.sql

# Build aplikasi
go build -o lms-backend

# Run aplikasi
./lms-backend
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get course by ID
- `POST /api/courses` - Create course (admin only)
- `PUT /api/courses/{id}` - Update course (admin only)
- `DELETE /api/courses/{id}` - Delete course (admin only)

### Enrollments
- `POST /api/courses/{id}/enroll` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `PUT /api/courses/{courseId}/lessons/{lessonId}/progress` - Update lesson progress
- `GET /api/courses/{id}/progress` - Get course progress

### Quizzes & Surveys
- `GET /api/courses/{courseId}/quizzes` - Get course quizzes
- `GET /api/quizzes/{id}` - Get quiz details
- `POST /api/quizzes/{id}/submit` - Submit quiz
- `GET /api/quizzes/{id}/attempts` - Get quiz attempts
- `POST /api/courses/{courseId}/surveys` - Submit survey

### Submissions
- `POST /api/courses/{courseId}/postwork` - Submit post-work
- `POST /api/courses/{courseId}/finalproject` - Submit final project
- `GET /api/submissions` - Get user submissions
- `PUT /api/submissions/postwork/{id}/grade` - Grade post-work (admin)
- `PUT /api/submissions/finalproject/{id}/grade` - Grade final project (admin)

### Certificates
- `POST /api/courses/{courseId}/certificate` - Generate certificate
- `GET /api/certificates` - Get user certificates
- `GET /api/certificates/{id}` - Get certificate details
- `GET /api/certificates/{id}/verify` - Verify certificate

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/files/{id}` - Get file
- `DELETE /api/files/{id}` - Delete file
- `GET /api/files` - Get user files

### Health Check
- `GET /health` - Health check endpoint

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts dan profiles
- `courses` - Course information
- `lessons` - Course lessons/materials
- `enrollments` - User course enrollments
- `lesson_progress` - Individual lesson progress

### Assessment Tables
- `intro_materials` - Course introduction materials
- `quizzes` - Pre-test dan Post-test
- `questions` - Quiz questions
- `quiz_attempts` - User quiz submissions
- `survey_responses` - Survey responses

### Assignment Tables
- `post_works` - Post-work assignments
- `final_projects` - Final project assignments
- `submissions` - File submissions

### Certificate & File Tables
- `certificates` - Generated certificates
- `file_uploads` - Uploaded files metadata

## 🧪 Testing

```bash
# Run tests
make test

# Run tests dengan coverage
make test-coverage

# Run linting
make lint
```

## 📦 Deployment

### Docker Production

```bash
# Build production image
docker build -t lms-backend:latest .

# Run dengan environment variables
docker run -p 8080:8080 --env-file .env lms-backend:latest
```

## 🔧 Development Commands

Gunakan Makefile untuk development:

```bash
make help          # Show available commands
make build         # Build aplikasi
make run           # Run aplikasi
make test          # Run tests
make clean         # Clean build files
make docker-up     # Start Docker services
make docker-down   # Stop Docker services
make db-setup      # Setup database
make db-reset      # Reset database
```