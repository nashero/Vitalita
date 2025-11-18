# Staff Management API Implementation

Complete Express.js API endpoints for staff management in the Vitalita staff portal.

## Overview

This implementation provides comprehensive RESTful endpoints for managing staff, roles, AVIS centers, and audit logs with full RBAC support, validation, and audit logging.

## Created Files

### Controllers
- `src/controllers/staff.controller.ts` - Staff user management (CRUD operations)
- `src/controllers/roles.controller.ts` - Role management and assignment
- `src/controllers/centers.controller.ts` - AVIS center management
- `src/controllers/audit.controller.ts` - Audit log queries and exports

### Routes
- `src/routes/staff.routes.ts` - Route definitions with RBAC middleware
- `src/routes/staff.routes.md` - Complete API documentation

### Documentation
- `API_ENDPOINTS_SUMMARY.md` - Quick reference guide
- `STAFF_MANAGEMENT_API.md` - This file

## Endpoints Summary

### Staff User Management (6 endpoints)
1. `GET /api/staff/users` - List users with filtering, pagination, search
2. `GET /api/staff/users/:id` - Get user details with roles/permissions
3. `POST /api/staff/users` - Create new staff member
4. `PUT /api/staff/users/:id` - Update staff member
5. `DELETE /api/staff/users/:id` - Deactivate staff member
6. `PATCH /api/staff/users/:id/status` - Approve/suspend user

### Role Management (4 endpoints)
1. `GET /api/staff/roles` - List all roles
2. `GET /api/staff/roles/:id/permissions` - Get role permissions
3. `POST /api/staff/users/:id/roles` - Assign role to user
4. `DELETE /api/staff/users/:id/roles/:roleId` - Remove role from user

### AVIS Centers (4 endpoints)
1. `GET /api/staff/centers` - List centers (hierarchical, filtered by access)
2. `GET /api/staff/centers/:id` - Get center details with hierarchy
3. `GET /api/staff/centers/:id/staff` - Get staff at a center
4. `PUT /api/staff/centers/:id` - Update center information

### Audit Logs (2 endpoints)
1. `GET /api/staff/audit-logs` - Get audit logs with filtering
2. `GET /api/staff/audit-logs/export` - Export logs as CSV

## Features Implemented

### ✅ Query Parameters
- **Pagination**: `?page=1&limit=20`
- **Filtering**: `?role=NURSE&status=active&center=uuid`
- **Sorting**: `?sort=lastName&order=asc`
- **Search**: `?search=mario`

### ✅ Request Validation
- Express-validator for all inputs
- UUID validation
- Email validation
- Required field validation
- SQL injection prevention via parameterized queries

### ✅ Response Format
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### ✅ Access Control
- RBAC-based permissions
- Users can update own profile
- Admins can manage all users
- Center admins can manage users in their center
- Hierarchical organizational access

### ✅ Audit Logging
- All CRUD operations logged
- Includes user ID, action, resource type, changes
- Automatic via middleware integration
- IP address and user agent tracking

### ✅ Error Handling
- Consistent error response format
- Proper HTTP status codes
- Validation error details
- Security-conscious error messages

## Access Control Matrix

| Operation | Permission Required | Notes |
|-----------|-------------------|-------|
| List Users | `staff:view` | Filtered by user's access level |
| Get User | `staff:view` | Can view own profile |
| Create User | `staff:manage` | Admin only |
| Update User | Own profile OR `staff:manage` | Limited fields for own profile |
| Delete User | `staff:manage` | Cannot delete self |
| Approve User | `staff:manage` | Admin only |
| List Roles | `roles:view` | All roles |
| Assign Role | `staff:assign_roles` | Admin only |
| List Centers | `centers:view` | Filtered by hierarchy |
| Update Center | `centers:update` | Center admin or higher |
| View Audit Logs | `audit:view` | Admin only |
| Export Audit Logs | `audit:export` | Admin only |

## Hierarchical Access Control

The system respects organizational hierarchy:

- **National Level**: Can access all centers
- **Regional Level**: Can access centers in their region
- **Provincial Level**: Can access centers in their province
- **Municipal Level**: Can only access their own center

This is enforced via the `canUserAccessCenter` middleware function.

## Validation Rules

### Create User
- Email: Valid email format, normalized
- Password: Min 8 chars, uppercase, lowercase, number
- First/Last Name: 1-100 characters
- Phone: Optional, trimmed
- Center ID: Valid UUID
- Organizational Level: One of: National, Regional, Provincial, Municipal

### Update User
- All fields optional
- Same validation rules as create
- Users cannot change `avis_center_id` or `organizational_level` on own profile

### Assign Role
- Role ID: Valid UUID
- Expires At: Optional ISO 8601 date

## Audit Log Details

All operations log:
- **User ID**: Who performed the action
- **Action**: What was done (e.g., `create_user`, `update_user`)
- **Resource Type**: Type of resource (e.g., `users`, `roles`)
- **Resource ID**: ID of the affected resource
- **Details**: JSONB with changes, before/after states
- **IP Address**: Request origin
- **User Agent**: Browser/client info
- **Status**: `success`, `failure`, `error`, `warning`
- **Timestamp**: Automatic

## Example Requests

### List Users with Filters
```bash
GET /api/staff/users?page=1&limit=20&role=NURSE&status=active&search=mario
```

### Create User
```bash
POST /api/staff/users
{
  "email": "mario.rossi@avis.it",
  "password": "SecurePass123!",
  "first_name": "Mario",
  "last_name": "Rossi",
  "avis_center_id": "uuid",
  "organizational_level": "Municipal"
}
```

### Assign Role
```bash
POST /api/staff/users/:id/roles
{
  "role_id": "uuid",
  "expires_at": "2024-12-31T23:59:59Z" // Optional
}
```

### Export Audit Logs
```bash
GET /api/staff/audit-logs/export?start_date=2024-01-01&end_date=2024-01-31
```

## Dependencies Added

- `date-fns` - Date formatting for CSV export

## Integration

The routes are integrated into the main server:

```typescript
// src/server.ts
import staffRoutes from './routes/staff.routes.js';
app.use('/api/staff', staffRoutes);
```

## Testing

To test the endpoints:

1. Start the API server:
   ```bash
   cd staff-portal-api
   npm run dev
   ```

2. Authenticate to get a JWT token:
   ```bash
   POST /api/staff/login
   ```

3. Use the token in subsequent requests (httpOnly cookie or Authorization header)

4. Test endpoints with appropriate permissions

## Security Features

1. **SQL Injection Prevention**: All queries use parameterized statements
2. **Input Sanitization**: express-validator sanitizes all inputs
3. **RBAC Enforcement**: Middleware checks permissions before execution
4. **Audit Trail**: All operations logged for compliance
5. **Hierarchical Access**: Users can only access data within their scope
6. **Self-Protection**: Users cannot deactivate themselves

## Next Steps

1. Add unit tests for controllers
2. Add integration tests for routes
3. Implement rate limiting per endpoint
4. Add request/response logging
5. Implement caching for frequently accessed data
6. Add WebSocket support for real-time updates

## Documentation

See `src/routes/staff.routes.md` for complete API documentation with examples.

