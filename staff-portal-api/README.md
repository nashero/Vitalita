# Vitalita Staff Portal API

Backend API for the Vitalita Staff Portal authentication system built with Node.js, Express, and TypeScript.

## Features

- 🔐 JWT-based authentication with access and refresh tokens
- 🔒 Password hashing with bcrypt
- 📧 Email notifications for registration approval and password reset
- 🛡️ Role-based access control (RBAC)
- 📊 Comprehensive audit logging
- ⚡ Rate limiting for security
- 🍪 Secure cookie-based token storage
- ✅ Input validation
- 📝 Request logging

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** with `pg` library
- **JWT** for authentication
- **bcrypt** for password hashing
- **nodemailer** for email notifications
- **express-validator** for input validation
- **express-rate-limit** for rate limiting
- **helmet** for security headers

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database with `staff_portal` schema
- SMTP server for email (Gmail, SendGrid, etc.)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3001
   NODE_ENV=development

   # Database
   DATABASE_URL=postgresql://postgres:password@localhost:5432/vitalita
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vitalita
   DB_USER=postgres
   DB_PASSWORD=password

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@vitalita.it

   # Frontend
   FRONTEND_URL=http://localhost:5175

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

#### POST `/api/staff/register`
Register a new staff member (pending approval).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+39123456789",
  "avis_center_id": "uuid",
  "organizational_level": "Municipal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Your account is pending approval.",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "status": "pending"
  }
}
```

#### POST `/api/staff/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "roles": [...],
      "permissions": [...]
    },
    "access_token": "jwt-token"
  }
}
```

**Cookies Set:**
- `access_token` (httpOnly, 15 minutes)
- `refresh_token` (httpOnly, 7 days)

#### POST `/api/staff/logout`
Logout and clear cookies.

#### POST `/api/staff/refresh-token`
Refresh access token using refresh token.

**Request:**
- Cookie: `refresh_token` OR
- Body: `{ "refresh_token": "..." }`

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new-jwt-token"
  }
}
```

#### POST `/api/staff/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/staff/reset-password`
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "new_password": "NewSecurePass123"
}
```

#### GET `/api/staff/me`
Get current user profile with roles and permissions.

**Headers:**
- Cookie: `access_token` OR
- Authorization: `Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "roles": [...],
      "permissions": [...]
    }
  }
}
```

## Authentication Flow

1. **Registration:**
   - User submits registration → Status: `pending`
   - Email sent to center administrators
   - Admin approves → Status: `active`, roles assigned
   - Welcome email sent to user

2. **Login:**
   - User provides email/password
   - Server validates credentials
   - JWT tokens generated (access + refresh)
   - Tokens stored in httpOnly cookies
   - User data with roles/permissions returned

3. **Token Refresh:**
   - Client sends refresh token
   - Server validates and generates new token pair
   - New tokens stored in cookies

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Account Locking
- Account locked after 5 failed login attempts
- Lock duration: 30 minutes
- Automatically unlocked after duration

### Rate Limiting
- General: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Password reset: 3 requests per hour
- Registration: 3 attempts per hour

### Token Security
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry
- Stored in httpOnly cookies
- Secure flag in production
- SameSite: strict

## Middleware

### Authentication
- `authenticate`: Verifies JWT token and loads user
- `optionalAuthenticate`: Optional authentication

### Permissions
- `requirePermission(...permissions)`: Check user has permission
- `requireRole(...roles)`: Check user has role
- `requireOrganizationalLevel(...levels)`: Check organizational level

### Rate Limiting
- `generalRateLimiter`: General API rate limiting
- `authRateLimiter`: Authentication endpoints
- `passwordResetRateLimiter`: Password reset
- `registrationRateLimiter`: Registration

### Logging
- `requestLogger`: Logs all requests
- `errorLogger`: Logs errors
- Audit logs stored in `staff_portal.audit_logs` table

## Database Schema

The API uses the `staff_portal` schema with the following tables:
- `users`: Staff members
- `roles`: AVIS roles
- `permissions`: Granular permissions
- `user_roles`: User-role mapping
- `role_permissions`: Role-permission mapping
- `avis_centers`: AVIS center hierarchy
- `audit_logs`: Audit trail

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400
  }
}
```

## Development

### Project Structure
```
staff-portal-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # Route definitions
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── dist/               # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Type check without emitting

## Testing

Example using curl:

```bash
# Register
curl -X POST http://localhost:3001/api/staff/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "first_name": "Test",
    "last_name": "User",
    "avis_center_id": "uuid",
    "organizational_level": "Municipal"
  }'

# Login
curl -X POST http://localhost:3001/api/staff/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }' \
  -c cookies.txt

# Get current user
curl -X GET http://localhost:3001/api/staff/me \
  -b cookies.txt
```

## License

MIT

