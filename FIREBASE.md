# Firebase Integration

This document provides information about the Firebase integration in the Psycortex application.

## Configuration

Firebase configuration is loaded from environment variables. Create a `.env.local` file based on the `.env.local.example` template and fill in your Firebase project credentials:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Backend API
NEXT_PUBLIC_BACKEND_URL=your-backend-api-url
```

## Authentication Flow

The application implements the following authentication flow:

1. **Login/Registration**: Users can sign in using email/password or Google authentication
2. **Profile Completion**: After authentication, if the user doesn't have a profile in the backend database, they're redirected to complete their profile
3. **Profile Management**: Users can view and update their profile information

## Implementation

### Firebase Configuration (`/src/firebase/firebaseConfig.ts`)

This file initializes the Firebase SDK and exports the Auth instance.

### Authentication Context (`/src/context/AuthContext.tsx`)

The `AuthContext` provides:

- Current Firebase user state
- Backend user data
- Authentication functions (login, register, logout)
- Loading states

### Login/Register Page (`/src/app/login/page.tsx`)

Features:
- Email/password login
- Google authentication
- Registration
- Password reset

### Profile Completion Page (`/src/app/complete-profile/page.tsx`)

For new users who need to provide additional information after authentication.

### Profile Page (`/src/app/profile/page.tsx`)

Displays user information from both Firebase Auth and the backend database.

## API Integration

The application integrates with a backend API for storing additional user data:

- After Firebase authentication, user details are fetched from the backend
- If the user doesn't exist in the backend, they're prompted to complete their profile
- Profile data is stored in the backend database

## Authentication Functions

The following authentication functions are available:

- `login(email, password)`: Email/password authentication
- `loginWithGoogle()`: Google authentication
- `register(name, email, password)`: User registration
- `logout()`: Sign out
- `resetPassword(email)`: Password reset

## Protected Routes

Routes are protected based on authentication state:

- Unauthenticated users are redirected to the login page
- Authenticated users without a complete profile are redirected to the profile completion page
- Authenticated users with a complete profile can access all areas of the application

## User Data Structure

The application handles two types of user data:

1. **Firebase User**: Basic authentication information
   - UID
   - Email
   - Display name
   - Photo URL
   - Email verification status

2. **Backend User (Me)**: Extended user information
   - Personal information (name, email, phone, date of birth, gender)
   - Account information
   - Usage statistics and history 