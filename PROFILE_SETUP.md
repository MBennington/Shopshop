# Profile Setup and Testing Guide

## Overview

This document provides comprehensive setup and testing instructions for the user profile functionality, which allows both buyers and sellers to view and update their profile information including profile pictures.

## Features Implemented

### ✅ Core Profile Features

- **Profile Display**: View user information (name, email, role, business details for sellers)
- **Profile Update**: Update personal information and profile picture
- **Role-based UI**: Different fields shown for buyers vs sellers
- **Profile Picture Upload**: Upload, preview, and remove profile pictures
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Loading indicators for better UX
- **Auto-dismiss Messages**: Success/error messages auto-dismiss after 5 seconds

### ✅ UI/UX Improvements

- **Modern Design**: Clean, professional interface following Pinterest-inspired design
- **Responsive Layout**: Works on desktop and mobile devices
- **Interactive Elements**: Hover effects, transitions, and visual feedback
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- **Visual Feedback**: Loading spinners, success indicators, and error states

### ✅ Security Features

- **JWT Authentication**: Secure token-based authentication
- **File Validation**: Image type and size validation (5MB limit)
- **Input Sanitization**: Server-side validation and sanitization
- **CORS Protection**: Proper CORS configuration
- **Role-based Access**: Different permissions for different user roles

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
HTTP_PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Start Backend Server

```bash
npm run dev
```

The backend will start on `http://localhost:5000`

## Frontend Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Frontend Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Profile Endpoints

#### GET /api/profile

**Purpose**: Fetch user profile information
**Authentication**: Required (Bearer token)
**Response**:

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "seller",
    "profilePicture": "https://res.cloudinary.com/...",
    "businessName": "John's Store",
    "phone": "+1234567890",
    "businessType": "retail"
  }
}
```

#### PUT /api/profile

**Purpose**: Update user profile information
**Authentication**: Required (Bearer token)
**Content-Type**: `multipart/form-data`
**Request Body**:

- `name` (string, optional): User's full name
- `businessName` (string, optional): Business name (for sellers)
- `phone` (string, optional): Phone number (for sellers)
- `businessType` (string, optional): Business type (for sellers)
- `profilePicture` (file, optional): Profile picture image file

**Response**:

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "seller",
    "profilePicture": "https://res.cloudinary.com/...",
    "businessName": "John's Store",
    "phone": "+1234567890",
    "businessType": "retail"
  }
}
```

## Testing Instructions

### 1. User Registration and Login

1. Navigate to `/auth`
2. Create a new account (buyer or seller)
3. Login with your credentials

### 2. Profile Access

1. After login, click on your profile picture/name in the navbar
2. Select "Profile Settings" from the dropdown
3. You should be redirected to `/profile`

### 3. Profile Display Testing

- **Buyer Profile**: Should show name, email, and basic information
- **Seller Profile**: Should show name, email, business name, phone, and business type
- **Profile Picture**: Should display current profile picture or default avatar

### 4. Profile Update Testing

1. **Update Personal Information**:

   - Change your name
   - For sellers: update business name, phone, and business type
   - Click "Save Changes"
   - Verify changes are saved

2. **Update Profile Picture**:

   - Click the camera icon on your profile picture
   - Select an image file (JPG, PNG, etc.)
   - Verify preview is shown
   - Click "Save Changes"
   - Verify new profile picture is uploaded

3. **Form Validation**:
   - Try submitting empty required fields
   - Verify error messages appear
   - Try uploading non-image files
   - Verify file type validation works
   - Try uploading files larger than 5MB
   - Verify file size validation works

### 5. Error Handling Testing

1. **Network Errors**:

   - Disconnect internet
   - Try to save changes
   - Verify error message is shown

2. **Invalid Token**:

   - Clear localStorage
   - Try to access profile
   - Verify redirect to login page

3. **Server Errors**:
   - Stop backend server
   - Try to save changes
   - Verify error message is shown

### 6. Navigation Testing

1. **Seller Dashboard Access**:

   - Login as a seller
   - Click "Seller Dashboard" button
   - Verify redirect to `/sell`

2. **Home Navigation**:
   - Click "Back to Home" button
   - Verify redirect to `/`

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── profile/
│   │       └── route.ts              # Profile API proxy
│   ├── profile/
│   │   └── page.tsx                  # Profile page component
│   └── components/
│       └── Navbar.tsx                # Navigation with profile dropdown
├── contexts/
│   └── AuthContext.tsx               # Authentication context
└── lib/
    └── utils.ts                      # Utility functions

backend/
├── src/
│   ├── modules/
│   │   └── users/
│   │       ├── user.controller.js    # Profile API controllers
│   │       ├── user.service.js       # Business logic
│   │       ├── user.model.js         # User data model
│   │       ├── user.router.js        # API routes
│   │       ├── user.schema.js        # Validation schemas
│   │       └── user.permission.js    # Route permissions
│   └── services/
│       ├── cloudinary.service.js     # Image upload service
│       ├── multer.service.js         # File upload middleware
│       └── token.service.js          # JWT authentication
└── server.js                         # Main server file
```

## Troubleshooting

### Common Issues

1. **Profile Picture Not Uploading**:

   - Check Cloudinary credentials in `.env`
   - Verify file size is under 5MB
   - Check file type is supported (JPG, PNG, etc.)

2. **Authentication Errors**:

   - Verify JWT_SECRET is set in backend `.env`
   - Check token expiration (7 days)
   - Clear localStorage and re-login

3. **Database Connection Issues**:

   - Verify DATABASE_URL is correct
   - Check MongoDB connection string format
   - Ensure MongoDB service is running

4. **CORS Errors**:
   - Verify FRONTEND_URL in backend `.env`
   - Check that frontend is running on correct port
   - Ensure backend CORS configuration is correct

### Debug Steps

1. **Check Browser Console**:

   - Look for JavaScript errors
   - Check network requests
   - Verify API responses

2. **Check Backend Logs**:

   - Monitor server console output
   - Check for error messages
   - Verify database connections

3. **Check Environment Variables**:
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure proper formatting

## Performance Considerations

1. **Image Optimization**:

   - Profile pictures are automatically optimized by Cloudinary
   - Images are converted to efficient formats
   - Quality is set to 'auto:good' for optimal file size

2. **Caching**:

   - Profile data is cached in AuthContext
   - Images are served from Cloudinary CDN
   - API responses include appropriate cache headers

3. **Loading States**:
   - Loading indicators prevent multiple submissions
   - Form is disabled during save operations
   - Progressive loading for better UX

## Security Considerations

1. **Input Validation**:

   - Client-side validation for immediate feedback
   - Server-side validation for security
   - File type and size validation

2. **Authentication**:

   - JWT tokens with 7-day expiration
   - Secure token storage in localStorage
   - Automatic token refresh on API calls

3. **File Upload Security**:
   - File type validation
   - File size limits
   - Secure upload to Cloudinary
   - Automatic cleanup of old files

## Future Enhancements

1. **Profile Picture Cropping**: Add image cropping functionality
2. **Two-Factor Authentication**: Implement 2FA for enhanced security
3. **Profile Privacy Settings**: Allow users to control profile visibility
4. **Profile Verification**: Add verification badges for sellers
5. **Social Media Integration**: Link social media accounts
6. **Profile Analytics**: Track profile views and engagement

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review browser console and backend logs
3. Verify all environment variables are set correctly
4. Test with different browsers and devices
5. Check network connectivity and firewall settings
