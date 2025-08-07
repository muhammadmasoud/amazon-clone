# Amazon Clone - Authentication System

This project implements a complete authentication system for an Amazon clone with both frontend (React) and backend (Django) components.

## Features

### Authentication
- ✅ Email-based authentication (no username required)
- ✅ JWT token-based authentication
- ✅ Automatic login after signup
- ✅ Protected routes
- ✅ User profile management
- ✅ Secure logout with token blacklisting

### Frontend (React)
- ✅ Modern UI with Tailwind CSS
- ✅ Form validation with Formik and Yup
- ✅ Context-based state management
- ✅ Protected routes with authentication checks
- ✅ Error handling and loading states
- ✅ Responsive design

### Backend (Django)
- ✅ Custom User model with email authentication
- ✅ JWT token authentication with Simple JWT
- ✅ Custom authentication backend
- ✅ RESTful API endpoints
- ✅ CORS configuration
- ✅ Database migrations

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   ```bash
   source ../django-env/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Request/Response Examples

#### Signup
```json
POST /api/auth/signup/
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123!",
  "password_confirm": "securepassword123!"
}
```

#### Login
```json
POST /api/auth/login/
{
  "email": "john@example.com",
  "password": "securepassword123!"
}
```

## Project Structure

```
amazon-clone/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── users/
│   │   ├── models.py
│   │   ├── api/
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── backends.py
│   │   │   └── urls.py
│   │   └── migrations/
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── auth.js
│   │   ├── schemas/
│   │   │   └── index.js
│   │   ├── api/
│   │   │   └── axios.js
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- Django 5.2.4
- Django REST Framework
- Django Simple JWT
- PostgreSQL
- Django CORS Headers

### Frontend
- React 19.1.0
- React Router DOM
- Formik & Yup
- Axios
- Tailwind CSS
- Vite

## Security Features

- JWT token authentication
- Password hashing with Django's built-in password hashers
- CORS configuration for frontend-backend communication
- Token blacklisting for secure logout
- Form validation on both frontend and backend
- Protected routes with authentication checks

## Development Notes

- The User model uses email as the primary identifier
- JWT tokens have a 60-minute access lifetime and 1-day refresh lifetime
- All authentication endpoints are properly configured with CORS
- The frontend automatically handles token storage and authentication state
- Error handling is implemented throughout the application 