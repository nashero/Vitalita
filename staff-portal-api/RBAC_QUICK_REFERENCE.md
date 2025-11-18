# RBAC Middleware Quick Reference

Quick reference guide for using RBAC middleware in the Vitalita Staff Portal API.

## Import

```typescript
import {
  requireAuth,
  requireRole,
  requirePermission,
  requireOrgLevel,
  requireSameCenter,
  requireAuthAndPermission,
  requireAuthAndRole,
  requireAuthRoleAndPermission,
} from '../middleware/rbac.middleware.js';
```

## Basic Usage Patterns

### 1. Authentication Only
```typescript
router.get('/profile', requireAuth, getProfile);
```

### 2. Permission Required
```typescript
router.get('/appointments', 
  requireAuth, 
  requirePermission('appointments:view'),
  getAppointments
);
```

### 3. Role Required
```typescript
router.post('/financial', 
  requireAuth, 
  requireRole('Treasurer', 'President'),
  createFinancialRecord
);
```

### 4. Organizational Level
```typescript
router.get('/national-reports',
  requireAuth,
  requireOrgLevel('National', 'Regional'),
  getReports
);
```

### 5. Center Access Control
```typescript
router.get('/centers/:center_id/data',
  requireAuth,
  requireSameCenter('center_id'),
  getCenterData
);
```

### 6. Combined Requirements
```typescript
router.put('/financial/:id',
  requireAuth,
  requireRole('Treasurer'),
  requirePermission('financial:manage_budget'),
  updateBudget
);
```

### 7. Using Helpers
```typescript
// Auth + Permission
router.get('/donors', ...requireAuthAndPermission('donors:view'), getDonors);

// Auth + Role
router.post('/staff', ...requireAuthAndRole('PRESIDENT'), createStaff);

// Auth + Role + Permission
router.delete('/centers/:id',
  ...requireAuthRoleAndPermission(['PRESIDENT'], ['centers:delete']),
  deleteCenter
);
```

## Common Patterns

### Medical Staff Access
```typescript
router.get('/donors/:id/medical',
  requireAuth,
  requireRole('SELECTION_PHYSICIAN', 'REGISTERED_NURSE', 'HCD'),
  requirePermission('donors:view_medical'),
  getMedicalRecords
);
```

### Financial Operations
```typescript
router.post('/financial/approve',
  requireAuth,
  requireRole('Treasurer', 'President'),
  requirePermission('financial:approve_expenses'),
  approveExpense
);
```

### Center Management
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

### System Administration
```typescript
router.get('/admin/users',
  requireAuth,
  requireRole('SYSTEM_ADMIN', 'PRESIDENT'),
  requirePermission('users:view'),
  getUsers
);
```

## Error Responses

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

## Important Notes

1. **Always use `requireAuth` first** - Other middleware depends on it
2. **System admins bypass** - Users with `SYSTEM_ADMIN` role or `system:admin` permission bypass checks
3. **Center hierarchy** - National > Regional > Provincial > Municipal
4. **Audit logging** - All failures are automatically logged
5. **Token caching** - Permissions cached in JWT for performance

## Quick Checklist

- [ ] Import middleware from `rbac.middleware.js`
- [ ] Use `requireAuth` as first middleware
- [ ] Add `requirePermission` for permission checks
- [ ] Add `requireRole` for role checks
- [ ] Add `requireOrgLevel` for level restrictions
- [ ] Add `requireSameCenter` for center-based access
- [ ] Test with different user roles
- [ ] Verify audit logs are created

## See Also

- **Full Documentation**: `src/middleware/README.md`
- **Examples**: `src/examples/rbac.usage.examples.ts`
- **Implementation**: `RBAC_IMPLEMENTATION.md`

