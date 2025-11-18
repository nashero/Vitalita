# Staff Portal Authentication System

Modern React authentication components for the Vitalita Staff Portal using the Express API backend.

## Features

- ✅ JWT-based authentication with httpOnly cookies
- ✅ Role-based access control (RBAC)
- ✅ Permission-based route protection
- ✅ Form validation with React Hook Form
- ✅ Password strength requirements
- ✅ Auto token refresh
- ✅ Responsive design with Tailwind CSS
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Loading states and error handling
- ✅ Toast notifications

## Components

### Authentication Components

1. **Login** (`src/components/auth/Login.tsx`)
   - Email/password login form
   - Form validation
   - Password visibility toggle
   - Error handling

2. **Register** (`src/components/auth/Register.tsx`)
   - Staff registration form
   - AVIS center selection
   - Organizational level selection
   - Password strength validation
   - Success message with pending approval notice

3. **ForgotPassword** (`src/components/auth/ForgotPassword.tsx`)
   - Password reset request form
   - Email validation
   - Success confirmation

4. **ResetPassword** (`src/components/auth/ResetPassword.tsx`)
   - New password entry form
   - Token validation from URL
   - Password strength requirements
   - Password confirmation

5. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
   - Route wrapper with permission checks
   - Role-based access control
   - Organizational level restrictions
   - Automatic redirect for unauthorized access

## Context & Hooks

### AuthContext (`src/contexts/AuthContext.tsx`)

Global authentication state management:
- User data (roles, permissions)
- Login/logout functions
- Token refresh
- Permission checking helpers

**Usage:**
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, hasPermission } = useAuth();
  
  if (hasPermission('donors:view')) {
    // Show donor view
  }
}
```

### Custom Hooks

1. **useAuth()** - Access authentication state and methods
2. **usePermissions()** - Check permissions easily
3. **useApiClient()** - Make authenticated API requests

**Usage:**
```typescript
import { useApiClient } from '../hooks/useApiClient';

function MyComponent() {
  const api = useApiClient();
  
  const fetchData = async () => {
    const data = await api.get('/api/staff/appointments');
  };
}
```

## Form Validation

### Email Validation
- Format validation using regex
- Required field check

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Phone Validation
- Basic format validation
- Optional field

## Security Features

1. **Token Storage**: Tokens stored in httpOnly cookies (not localStorage)
2. **Auto Logout**: Automatic logout on token expiry
3. **Token Refresh**: Auto-refresh before expiry (every 14 minutes)
4. **CSRF Protection**: Using httpOnly cookies
5. **Clear on Logout**: All sensitive data cleared on logout

## API Integration

The components use the Express API backend:

- `POST /api/staff/login` - Login
- `POST /api/staff/register` - Register
- `POST /api/staff/logout` - Logout
- `POST /api/staff/refresh-token` - Refresh token
- `POST /api/staff/forgot-password` - Request password reset
- `POST /api/staff/reset-password` - Reset password
- `GET /api/staff/me` - Get current user

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Usage Examples

### Protected Route with Permission
```typescript
<Route
  path="/appointments"
  element={
    <ProtectedRoute requiredPermission="appointments:view">
      <AppointmentsPage />
    </ProtectedRoute>
  }
/>
```

### Protected Route with Role
```typescript
<Route
  path="/financial"
  element={
    <ProtectedRoute requiredRole="Treasurer">
      <FinancialPage />
    </ProtectedRoute>
  }
/>
```

### Multiple Permissions
```typescript
<ProtectedRoute
  requiredPermissions={['donors:view', 'donors:manage']}
  requireAll={false} // User needs ANY of these
>
  <DonorsPage />
</ProtectedRoute>
```

### Organizational Level
```typescript
<ProtectedRoute
  requiredOrgLevel={['National', 'Regional']}
>
  <ReportsPage />
</ProtectedRoute>
```

## Styling

All components use Tailwind CSS with:
- Responsive design (mobile-friendly)
- Accessibility features (ARIA labels, focus states)
- Consistent color scheme (red theme for Vitalita)
- Loading states and animations

## Registration Flow

1. User fills registration form
2. Submits to `/api/staff/register`
3. Account created with `is_active: false` (pending)
4. Email sent to center administrators
5. Admin approves account
6. Welcome email sent to user
7. User can now login

## Error Handling

- Form validation errors displayed inline
- API errors shown via toast notifications
- Network errors handled gracefully
- 401 errors trigger automatic logout

## Accessibility

- ARIA labels on all form inputs
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Error announcements

## Testing

To test the authentication flow:

1. Start the API server: `cd staff-portal-api && npm run dev`
2. Start the frontend: `cd staff-portal && npm run dev`
3. Navigate to `http://localhost:5175`
4. Try registering a new account
5. Login with credentials
6. Test protected routes

## Troubleshooting

### CORS Errors
- Ensure API server allows frontend origin
- Check `withCredentials: true` in API client

### Token Not Refreshing
- Check cookie settings (httpOnly, secure, sameSite)
- Verify token refresh endpoint is working

### Permission Checks Failing
- Verify user has required roles/permissions in database
- Check token contains correct permissions

## Next Steps

1. Add MFA (Multi-Factor Authentication) support
2. Add session management UI
3. Add user profile editing
4. Add password change functionality
5. Add activity logging UI

