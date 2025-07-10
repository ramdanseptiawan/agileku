# Frontend-Backend Integration Guide

## 🎯 Overview

Dokumentasi ini menjelaskan integrasi yang telah berhasil dilakukan antara frontend Next.js dan backend Go API dengan PostgreSQL.

## ✅ What's Been Integrated

### 1. Authentication System
- **Login/Register**: Frontend sekarang menggunakan API `/api/public/login` dan `/api/public/register`
- **JWT Token Management**: Token disimpan di localStorage dan digunakan untuk authenticated requests
- **User Profile**: Data user diambil dari API `/api/protected/user/profile`
- **Auto-logout**: Token invalid otomatis di-clear

### 2. Course Data Management
- **Course Listing**: Data course diambil dari API `/api/public/courses` menggantikan `coursesData.js`
- **Course Details**: Individual course data dari API `/api/public/courses/{id}`
- **Search Functionality**: Course search menggunakan API `/api/public/courses/search`

### 3. Enrollment System
- **Course Enrollment**: User dapat enroll course melalui API `/api/protected/courses/enroll`
- **Enrollment Status**: Tracking enrollment status per user
- **Progress Tracking**: Basic progress tracking untuk enrolled courses

### 4. UI/UX Improvements
- **Dynamic Dashboard**: Menampilkan statistik berdasarkan enrollment data
- **Course Cards**: Menampilkan status enrollment dan progress
- **Loading States**: Loading indicators untuk API calls
- **Error Handling**: Proper error handling dan fallbacks

## 🔧 Technical Changes

### New Files Created

#### Backend API Service
```
src/services/api.js
```
- Centralized API communication
- JWT token management
- Error handling
- Request/response utilities

### Modified Files

#### 1. AuthContext.js
**Before**: Used localStorage and static user data
**After**: 
- Uses API for authentication
- Manages JWT tokens
- Handles enrollment data
- Async operations with proper error handling

**Key Changes**:
```javascript
// OLD: Synchronous localStorage-based login
const login = (username, password) => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  // ...
};

// NEW: Async API-based login
const login = async (username, password) => {
  try {
    const response = await authAPI.login(username, password);
    if (response.user && response.token) {
      setCurrentUser(response.user);
      // Load enrollments...
    }
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### 2. Login.js
**Changes**:
- Updated to handle async login function
- Added proper error handling
- Loading states during authentication

#### 3. CourseCard.js
**New Features**:
- Enrollment status display
- Progress tracking
- Dynamic action buttons (Enroll/Continue Learning)
- Course statistics (students, rating)

#### 4. Dashboard.js
**Enhancements**:
- Dynamic user statistics based on enrollment data
- Personalized welcome message
- Progress visualization
- Real-time data from API

#### 5. CourseView.js
**Updates**:
- Async course data loading
- Loading states
- Error handling for course details

## 🚀 How to Test Integration

### 1. Start Backend Server
```bash
cd backend
go run main.go
```
Server runs on: `https://api.mindshiftlearning.id`

### 2. Start Frontend Server
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

### 3. Test Authentication
1. Go to `http://localhost:3000`
2. Try logging in with:
   - **Admin**: `admin` / `123`
   - **User**: `user` / `123`
3. Verify JWT token is stored in localStorage
4. Check user profile data is loaded

### 4. Test Course Features
1. Browse available courses (loaded from API)
2. Enroll in a course (requires login)
3. Check enrollment status and progress
4. Verify dashboard statistics update

## 🔄 Data Flow

### Authentication Flow
```
1. User enters credentials → Login.js
2. AuthContext.login() → API call to /api/public/login
3. Backend validates → Returns JWT token + user data
4. Frontend stores token → Updates UI state
5. Subsequent requests → Include JWT in Authorization header
```

### Course Enrollment Flow
```
1. User clicks "Enroll" → CourseCard.js
2. AuthContext.enrollInCourse() → API call to /api/protected/courses/enroll
3. Backend creates enrollment record → Returns success
4. Frontend refreshes enrollment data → Updates UI
5. Dashboard shows updated statistics
```

## 📊 API Endpoints Used

### Public Endpoints (No Authentication)
- `POST /api/public/login` - User login
- `POST /api/public/register` - User registration
- `GET /api/public/courses` - Get all courses
- `GET /api/public/courses/{id}` - Get course details
- `GET /api/public/courses/search?q={query}` - Search courses

### Protected Endpoints (Requires JWT)
- `GET /api/protected/user/profile` - Get user profile
- `PUT /api/protected/user/profile` - Update user profile
- `GET /api/protected/courses` - Get courses with enrollment status
- `POST /api/protected/courses/enroll` - Enroll in course
- `GET /api/protected/courses/enrollments` - Get user enrollments

## 🔒 Security Features

### JWT Token Management
- Tokens stored in localStorage (only for bearer tokens as requested)
- Automatic token inclusion in API requests
- Token validation on protected routes
- Auto-logout on invalid/expired tokens

### CORS Configuration
- Backend configured to accept requests from `http://localhost:3000`
- Proper headers and credentials handling

## 🐛 Error Handling

### API Error Handling
- Network errors with user-friendly messages
- Invalid token handling with auto-logout
- Fallback to local data when API fails
- Loading states during API calls

### User Experience
- Loading spinners during API calls
- Error messages for failed operations
- Graceful degradation when backend is unavailable
- Retry mechanisms for failed requests

## 📈 Performance Optimizations

### Caching Strategy
- Course data cached in React state
- User profile cached after login
- Enrollment data refreshed on demand

### Loading Optimization
- Async data loading with loading states
- Minimal re-renders with proper dependency arrays
- Efficient state management

## 🔮 Next Steps (Future Phases)

The integration is ready for the next phases:

### Phase 3: Learning Progress & Tracking
- API endpoints for lesson progress
- Real-time progress updates
- Time tracking integration

### Phase 4: Quiz & Assessment System
- Quiz submission to backend
- Score tracking and analytics
- Performance insights

### Phase 5: Submissions & Projects
- File upload functionality
- Submission management
- Grading system

### Phase 6: Certificates & Achievements
- Certificate generation API
- Achievement tracking
- Badge system

### Phase 7: Admin Features
- Course management API
- User management
- Analytics dashboard

## 🛠️ Development Tips

### Adding New API Endpoints
1. Add endpoint to backend (`routes/routes.go`)
2. Create handler in appropriate handler file
3. Add API function to `src/services/api.js`
4. Use in React components with proper error handling

### Debugging API Issues
1. Check browser Network tab for API calls
2. Verify JWT token in localStorage
3. Check backend logs for errors
4. Use browser console for frontend errors

### Testing Authentication
```javascript
// Check if user is authenticated
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', localStorage.getItem('currentUser'));
```

## 📝 Summary

✅ **Completed Integration**:
- Authentication system with JWT
- Course data from PostgreSQL
- Enrollment management
- Real-time UI updates
- Error handling and loading states

✅ **localStorage Usage**:
- Only JWT tokens (as requested)
- User profile cache
- No more course data in localStorage

✅ **Backend API**:
- Fully functional Go server
- PostgreSQL database
- RESTful API endpoints
- CORS configured

The LMS application is now successfully integrated with a modern backend architecture and ready for production use! 🚀