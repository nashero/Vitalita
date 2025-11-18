# RBAC Middleware Documentation

Comprehensive Role-Based Access Control middleware for the Vitalita Staff Portal API.

## Overview

The RBAC middleware provides fine-grained access control based on:
- **Authentication**: JWT token verification
- **Roles**: AVIS organizational roles (President, VP, Nurse, etc.)
- **Permissions**: Granular permissions (donors:view, appointments:create, etc.)
- **Organizational Level**: National, Regional, Provincial, Municipal
- **Center Access**: Hierarchical center-based access control

## Middleware Functions

### `requireAuth()`

Base authentication middleware. Verifies JWT token and loads user with roles and permissions.

**Usage:**
```typescript
router.get('/protected', requireAuth, handler);
```

**What it does:**
- Extracts JWT token from cookies or Authorization header
- Verifies token validity
- Loads user with roles and permissions from database
- Checks if user account is active
- Attaches `user` and `token` to request object

**Error Responses:**
- `401 Unauthorized`: No token, invalid token, or user not found
- `403 Forbidden`: Account is inactive

---

### `requireRole(...roles)`

Requires user to have at least one of the specified roles.

**Usage:**
```typescript
router.get('/financial', requireAuth, requireRole('Treasurer', 'President'), handler);
```

**Parameters:**
- `...roles`: Array of role codes (e.g., 'PRESIDENT', 'VP', 'NURSE')

**What it does:**
- Checks if user has any of the required roles
- System admins (`SYSTEM_ADMIN`) bypass all role checks
- Logs authorization failures to audit log

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have required role

**Example:**
```typescript
// User must be either Treasurer OR President
router.put('/budget', requireAuth, requireRole('Treasurer', 'President'), updateBudget);
```

---

### `requirePermission(...permissions)`

Requires user to have at least one of the specified permissions.

**Usage:**
```typescript
router.get('/donors', requireAuth, requirePermission('donors:view'), handler);
```

**Parameters:**
- `...permissions`: Array of permission names (e.g., 'donors:view', 'appointments:create')

**What it does:**
- Aggregates all permissions from user's roles
- Checks if user has any of the required permissions
- System admins (`system:admin`) bypass all permission checks
- Logs authorization failures to audit log

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User doesn't have required permission

**Example:**
```typescript
// User must have either donors:view OR donors:manage
router.get('/donors', 
  requireAuth, 
  requirePermission('donors:view', 'donors:manage'), 
  getDonors
);
```

---

### `requireOrgLevel(...levels)`

Requires user to be at one of the specified organizational levels.

**Usage:**
```typescript
router.get('/national-reports', requireAuth, requireOrgLevel('National', 'Regional'), handler);
```

**Parameters:**
- `...levels`: Array of organizational levels ('National', 'Regional', 'Provincial', 'Municipal')

**What it does:**
- Checks user's organizational level
- Logs authorization failures to audit log

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User is not at required level

**Example:**
```typescript
// Only National or Regional level users
router.get('/reports', requireAuth, requireOrgLevel('National', 'Regional'), getReports);
```

---

### `requireSameCenter(centerIdParam?)`

Ensures user can only access data from their center or hierarchical children.

**Usage:**
```typescript
router.get('/centers/:center_id/appointments', 
  requireAuth, 
  requireSameCenter('center_id'), 
  handler
);
```

**Parameters:**
- `centerIdParam` (optional): Parameter name to look for center_id (default: 'center_id')
  - Checks `req.params[centerIdParam]`
  - Falls back to `req.query[centerIdParam]`
  - Falls back to `req.body[centerIdParam]`

**What it does:**
- Gets center_id from params, query, or body
- If no center_id specified, allows request (for list endpoints)
- Checks hierarchical access:
  - **National**: Can access all centers
  - **Regional**: Can access centers in same region
  - **Provincial**: Can access centers in same province
  - **Municipal**: Can only access own center
- Logs authorization failures to audit log

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User cannot access requested center

**Example:**
```typescript
// Center ID from URL parameter
router.get('/centers/:center_id/data', 
  requireAuth, 
  requireSameCenter('center_id'), 
  getCenterData
);

// Center ID from query string
router.get('/appointments', 
  requireAuth, 
  requireSameCenter('center_id'), // Checks ?center_id=xxx
  getAppointments
);

// Center ID from request body
router.post('/appointments', 
  requireAuth, 
  requireSameCenter('center_id'), // Checks req.body.center_id
  createAppointment
);
```

---

## Combined Middleware Helpers

For convenience, these helpers combine multiple middleware:

### `requireAuthAndPermission(...permissions)`

Shorthand for `[requireAuth, requirePermission(...permissions)]`

```typescript
router.get('/donors', ...requireAuthAndPermission('donors:view'), getDonors);
```

### `requireAuthAndRole(...roles)`

Shorthand for `[requireAuth, requireRole(...roles)]`

```typescript
router.post('/staff', ...requireAuthAndRole('PRESIDENT', 'VP'), createStaff);
```

### `requireAuthRoleAndPermission(roles, permissions)`

Shorthand for `[requireAuth, requireRole(...roles), requirePermission(...permissions)]`

```typescript
router.delete('/centers/:id',
  ...requireAuthRoleAndPermission(['PRESIDENT'], ['centers:delete']),
  deleteCenter
);
```

---

## Hierarchical Access Control

The system implements hierarchical access control based on organizational structure:

```
National (can access all)
  └── Regional (can access all in same region)
      └── Provincial (can access all in same province)
          └── Municipal (can only access own center)
```

**Rules:**
1. **National level**: Can access all centers
2. **Regional level**: Can access all Provincial and Municipal centers in their region
3. **Provincial level**: Can access all Municipal centers in their province
4. **Municipal level**: Can only access their own center

**Implementation:**
- Uses recursive CTE to check center hierarchy
- Validates region and province matching
- Caches results for performance

---

## Audit Logging

All authorization failures are automatically logged to `staff_portal.audit_logs` with:
- User ID (if authenticated)
- Action attempted
- Resource type
- Failure reason
- IP address
- User agent
- Timestamp

**Example audit log entry:**
```json
{
  "user_id": "uuid",
  "action": "authorization_failure_requirePermission",
  "resource_type": "authorization",
  "details": {
    "middleware": "requirePermission",
    "reason": "Required permissions: donors:manage, User permissions: donors:view",
    "path": "/api/donors",
    "method": "GET"
  },
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0...",
  "status": "failure"
}
```

---

## Error Responses

All middleware returns consistent error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "statusCode": 401
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions",
    "statusCode": 403
  }
}
```

**Note:** Error messages don't expose system details to prevent information leakage.

---

## Best Practices

### 1. Always use `requireAuth` first
```typescript
// ✅ Good
router.get('/data', requireAuth, requirePermission('data:view'), handler);

// ❌ Bad - requirePermission expects req.user
router.get('/data', requirePermission('data:view'), handler);
```

### 2. Combine related checks
```typescript
// ✅ Good - Clear and readable
router.post('/financial',
  requireAuth,
  requireRole('Treasurer'),
  requirePermission('financial:approve_expenses'),
  handler
);
```

### 3. Use combined helpers for common patterns
```typescript
// ✅ Good - Concise
router.get('/donors', ...requireAuthAndPermission('donors:view'), handler);
```

### 4. Specify center access when needed
```typescript
// ✅ Good - Explicit center check
router.get('/centers/:center_id/data',
  requireAuth,
  requireSameCenter('center_id'),
  handler
);
```

### 5. Order matters
```typescript
// ✅ Good - Auth first, then permissions
router.get('/data', requireAuth, requirePermission('data:view'), handler);

// ❌ Bad - Wrong order
router.get('/data', requirePermission('data:view'), requireAuth, handler);
```

---

## Performance Considerations

1. **Token Caching**: Permissions are cached in JWT token to reduce database queries
2. **Stale Token Detection**: System detects if token permissions don't match current user permissions
3. **Hierarchical Checks**: Center hierarchy checks use efficient recursive CTEs
4. **Audit Logging**: Logging is async and doesn't block requests

---

## Testing

See `src/tests/rbac.middleware.integration.test.ts` for integration tests.

Run tests:
```bash
npm test
```

---

## Examples

See `src/examples/rbac.usage.examples.ts` for comprehensive usage examples.

---

## Troubleshooting

### "User not authenticated" error
- Check if token is being sent (cookie or Authorization header)
- Verify token hasn't expired
- Ensure `requireAuth` is used before other middleware

### "Insufficient permissions" error
- Check user's assigned roles
- Verify roles have required permissions
- Check if user is system admin (bypasses all checks)

### Center access denied
- Verify center hierarchy in database
- Check user's organizational level
- Ensure center_id is correctly passed (params, query, or body)

---

## Security Notes

1. **Token Validation**: Tokens are verified on every request
2. **Permission Aggregation**: All permissions from all roles are aggregated
3. **System Admin Bypass**: System admins bypass role and permission checks (use with caution)
4. **Audit Logging**: All failures are logged for security monitoring
5. **Error Messages**: Don't expose system internals in error messages

