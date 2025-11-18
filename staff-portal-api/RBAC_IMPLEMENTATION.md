# RBAC Implementation Summary

Comprehensive Role-Based Access Control (RBAC) middleware implementation for the Vitalita Staff Portal API.

## Overview

The RBAC system provides fine-grained access control based on:
- **Authentication**: JWT token verification
- **Roles**: AVIS organizational roles
- **Permissions**: Granular resource:action permissions
- **Organizational Levels**: National, Regional, Provincial, Municipal
- **Center Hierarchy**: Hierarchical center-based access control

## Files Created

### Core Middleware
- **`src/middleware/rbac.middleware.ts`** - Main RBAC middleware implementation
  - `requireAuth()` - Authentication verification
  - `requireRole(...roles)` - Role checking
  - `requirePermission(...permissions)` - Permission checking
  - `requireOrgLevel(...levels)` - Organizational level checking
  - `requireSameCenter(centerIdParam?)` - Center-based access control
  - `canUserAccessCenter()` - Hierarchical center access validation

### Testing
- **`src/tests/rbac.middleware.unit.test.ts`** - Unit tests with mocked dependencies
- **`src/tests/rbac.middleware.integration.test.ts`** - Integration tests with database
- **`src/tests/setup.ts`** - Jest test configuration

### Documentation & Examples
- **`src/middleware/README.md`** - Comprehensive middleware documentation
- **`src/examples/rbac.usage.examples.ts`** - Usage examples for all patterns

### Configuration
- **`jest.config.js`** - Jest test configuration
- **`package.json`** - Updated with Jest dependencies and test scripts

## Features Implemented

### 1. Authentication Middleware (`requireAuth`)

✅ Verifies JWT token from cookies or Authorization header  
✅ Loads user with roles and permissions from database  
✅ Validates user account is active  
✅ Detects stale tokens (permissions/roles mismatch)  
✅ Comprehensive error handling and audit logging

### 2. Role-Based Access (`requireRole`)

✅ Checks if user has at least one of the specified roles  
✅ System admin bypass for all role checks  
✅ Audit logging for authorization failures  
✅ Clear error messages

### 3. Permission-Based Access (`requirePermission`)

✅ Aggregates permissions from all user roles  
✅ Checks if user has at least one of the specified permissions  
✅ System admin bypass for all permission checks  
✅ Caches permissions in JWT token for performance  
✅ Audit logging for authorization failures

### 4. Organizational Level Access (`requireOrgLevel`)

✅ Validates user's organizational level  
✅ Supports multiple level requirements  
✅ Audit logging for failures

### 5. Center-Based Access Control (`requireSameCenter`)

✅ Hierarchical access control:
  - **National**: Can access all centers
  - **Regional**: Can access centers in same region
  - **Provincial**: Can access centers in same province
  - **Municipal**: Can only access own center

✅ Flexible center_id parameter lookup:
  - URL parameters (`req.params`)
  - Query string (`req.query`)
  - Request body (`req.body`)

✅ Recursive hierarchy checking using CTEs

### 6. Audit Logging

✅ All authorization failures logged to `staff_portal.audit_logs`  
✅ Includes:
  - User ID (if authenticated)
  - Action attempted
  - Failure reason
  - IP address
  - User agent
  - Timestamp
  - Resource details

### 7. Error Handling

✅ Consistent error responses:
  - `401 Unauthorized` - Not authenticated
  - `403 Forbidden` - Insufficient permissions

✅ Security-conscious error messages (no system details exposed)

### 8. Combined Middleware Helpers

✅ `requireAuthAndPermission(...permissions)`  
✅ `requireAuthAndRole(...roles)`  
✅ `requireAuthRoleAndPermission(roles, permissions)`

## Usage Examples

### Basic Authentication
```typescript
router.get('/profile', requireAuth, getProfile);
```

### Permission-Based Access
```typescript
router.get('/appointments', 
  requireAuth, 
  requirePermission('appointments:view'),
  getAppointments
);
```

### Role-Based Access
```typescript
router.put('/financial/:id', 
  requireAuth, 
  requireRole('Treasurer', 'President'),
  updateBudget
);
```

### Combined Requirements
```typescript
router.post('/centers/:center_id/staff',
  requireAuth,
  requireOrgLevel('National', 'Regional', 'Provincial'),
  requireRole('CENTER_MGR', 'PRESIDENT'),
  requirePermission('staff:manage'),
  requireSameCenter('center_id'),
  createStaff
);
```

### Using Combined Helpers
```typescript
router.get('/donors', 
  ...requireAuthAndPermission('donors:view'),
  getDonors
);
```

## Hierarchical Access Control

The system implements a hierarchical access model:

```
National (can access all centers)
  └── Regional (can access all in same region)
      └── Provincial (can access all in same province)
          └── Municipal (can only access own center)
```

**Implementation:**
- Uses recursive CTE to check center hierarchy
- Validates region and province matching
- Efficient database queries

## Performance Optimizations

1. **Token Caching**: Permissions cached in JWT to reduce DB queries
2. **Stale Token Detection**: Warns if token permissions don't match current user
3. **Efficient Hierarchy Checks**: Uses optimized recursive CTEs
4. **Async Audit Logging**: Doesn't block request processing

## Testing

### Unit Tests
- Mock all dependencies
- Test middleware logic in isolation
- Fast execution
- Run: `npm test`

### Integration Tests
- Use test database
- Test with real data
- Verify hierarchical access
- Run: `npm test -- integration`

### Test Coverage
- Authentication scenarios
- Role checking
- Permission checking
- Organizational level validation
- Center access control
- Error handling
- Audit logging

## Security Features

1. **Token Validation**: Every request validates JWT token
2. **Permission Aggregation**: All permissions from all roles aggregated
3. **System Admin Bypass**: Controlled bypass for system admins
4. **Audit Logging**: All failures logged for security monitoring
5. **Error Messages**: No system internals exposed
6. **Hierarchical Validation**: Prevents unauthorized center access

## Migration from Old Middleware

The old middleware files (`auth.middleware.ts`, `permissions.middleware.ts`) are still available but deprecated. New code should use `rbac.middleware.ts`.

**Migration Steps:**
1. Replace `authenticate` with `requireAuth`
2. Replace old `requirePermission` with new one
3. Replace old `requireRole` with new one
4. Add `requireOrgLevel` and `requireSameCenter` where needed

## Best Practices

1. **Always use `requireAuth` first** - Other middleware depends on it
2. **Combine related checks** - Use multiple middleware for complex requirements
3. **Use combined helpers** - For common patterns
4. **Specify center access** - When dealing with center-specific data
5. **Order matters** - Auth first, then permissions/roles

## Documentation

- **Main Documentation**: `src/middleware/README.md`
- **Usage Examples**: `src/examples/rbac.usage.examples.ts`
- **API Documentation**: See main `README.md`

## Next Steps

1. **Update existing routes** to use new RBAC middleware
2. **Add more tests** for edge cases
3. **Monitor audit logs** for security insights
4. **Optimize queries** based on usage patterns
5. **Add caching** for frequently accessed permissions

## Support

For questions or issues:
1. Check `src/middleware/README.md` for detailed documentation
2. Review `src/examples/rbac.usage.examples.ts` for usage patterns
3. Check test files for implementation examples

