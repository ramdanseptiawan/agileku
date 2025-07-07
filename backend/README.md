# LMS Backend API

Backend REST API untuk Learning Management System (LMS) menggunakan Go dan PostgreSQL.

## Features

### Phase 1: Authentication & User Management ✅
- User registration dan login
- JWT token authentication
- User profile management
- Role-based access control (user/admin)

### Phase 2: Course Data Management ✅
- Public course listing
- Course details dengan struktur lengkap (intro material, lessons, tests)
- Course enrollment untuk authenticated users
- Search courses
- User enrollment tracking

## Tech Stack

- **Language**: Go 1.21+
- **Database**: PostgreSQL
- **Router**: Gorilla Mux
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **CORS**: rs/cors

## Prerequisites

1. Go 1.21 atau lebih baru
2. PostgreSQL 12+
3. Git

## Setup Instructions

### 1. Clone Repository
```bash
cd /Users/tjphack/new/lms/agileku/backend
```

### 2. Install Dependencies
```bash
go mod tidy
```

### 3. Setup Database

#### Install PostgreSQL (jika belum ada)
```bash
# macOS dengan Homebrew
brew install postgresql
brew services start postgresql

# Atau download dari https://www.postgresql.org/download/
```

#### Create Database
```bash
# Login ke PostgreSQL
psql postgres

# Create database dan user
CREATE DATABASE lms_db;
CREATE USER lms_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q
```

### 4. Environment Configuration

File `.env` sudah dibuat dengan konfigurasi default:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=lms_db
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Server Configuration
PORT=8080
ENVIRONMENT=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**⚠️ PENTING**: Ganti `JWT_SECRET` dan `DB_PASSWORD` untuk production!

### 5. Run Application

```bash
# Development mode (dengan auto-seeding)
go run main.go
```

Server akan berjalan di `https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev`

## API Endpoints

### Public Endpoints (No Authentication)

#### Authentication
- `POST /api/public/register` - User registration
- `POST /api/public/login` - User login

#### Courses
- `GET /api/public/courses` - Get all courses
- `GET /api/public/courses/{id}` - Get course by ID
- `GET /api/public/courses/search?q={query}` - Search courses

### Protected Endpoints (Requires JWT Token)

#### User Profile
- `GET /api/protected/user/profile` - Get current user profile
- `PUT /api/protected/user/profile` - Update user profile

#### Course Enrollment
- `GET /api/protected/courses` - Get courses with enrollment status
- `POST /api/protected/courses/enroll` - Enroll in a course
- `GET /api/protected/courses/enrollments` - Get user enrollments

### Utility Endpoints
- `GET /health` - Health check
- `GET /` - API information

## Authentication

### Register User
```bash
curl -X POST https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/api/public/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Login
```bash
curl -X POST https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/api/public/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Using JWT Token
```bash
# Gunakan token dari response login
curl -X GET https://8080-firebase-agileku-1751862903205.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/api/protected/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    level VARCHAR(50),
    duration VARCHAR(50),
    instructor VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.0,
    students INTEGER DEFAULT 0,
    image VARCHAR(500),
    intro_material JSONB,
    lessons JSONB,
    pre_test JSONB,
    post_test JSONB,
    post_work JSONB,
    final_project JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Course Enrollments Table
```sql
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);
```

## Default Users (Development)

Seeder akan membuat user default:

1. **Admin User**
   - Username: `admin`
   - Password: `123`
   - Role: `admin`
   - Email: `admin@agileku.com`

2. **Regular User**
   - Username: `user`
   - Password: `123`
   - Role: `user`
   - Email: `user@agileku.com`

## Development

### Project Structure
```
backend/
├── main.go              # Entry point
├── go.mod              # Go modules
├── .env                # Environment variables
├── config/
│   └── database.go     # Database configuration
├── models/
│   ├── user.go         # User model
│   └── course.go       # Course model
├── handlers/
│   ├── auth.go         # Authentication handlers
│   └── course.go       # Course handlers
├── middleware/
│   ├── auth.go         # JWT middleware
│   └── cors.go         # CORS middleware
├── routes/
│   └── routes.go       # Route definitions
└── seed/
    └── seeder.go       # Database seeder
```

### Adding New Features

1. **Add Model**: Create struct in `models/`
2. **Add Handler**: Create handler functions in `handlers/`
3. **Add Routes**: Register routes in `routes/routes.go`
4. **Update Database**: Add migration in `config/database.go`

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql

# Check if database exists
psql -l | grep lms_db
```

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in .env file
PORT=8081
```

### CORS Issues
Pastikan frontend URL sudah ditambahkan di `ALLOWED_ORIGINS` dalam file `.env`

## Next Steps (Future Phases)

- [ ] Phase 3: Learning Progress & Tracking
- [ ] Phase 4: Quiz & Assessment System
- [ ] Phase 5: Submissions & Projects
- [ ] Phase 6: Certificates & Achievements
- [ ] Phase 7: Admin Features

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License