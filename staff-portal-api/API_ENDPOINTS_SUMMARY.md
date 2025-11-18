# Staff Management API Endpoints Summary

Complete summary of all staff management API endpoints.

## Endpoints Overview

### Staff User Management (6 endpoints)
- `GET /api/staff/users` - List users
- `GET /api/staff/users/:id` - Get user details
- `POST /api/staff/users` - Create user
- `PUT /api/staff/users/:id` - Update user
- `DELETE /api/staff/users/:id` - Deactivate user
- `PATCH /api/staff/users/:id/status` - Approve/suspend user

### Role Management (4 endpoints)
- `GET /api/staff/roles` - List roles
- `GET /api/staff/roles/:id/permissions` - Get role permissions
- `POST /api/staff/users/:id/roles` - Assign role
- `DELETE /api/staff/users/:id/roles/:roleId` - Remove role

### AVIS Centers (4 endpoints)
- `GET /api/staff/centers` - List centers
- `GET /api/staff/centers/:id` - Get center details
- `GET /api/staff/centers/:id/staff` - Get center staff
- `PUT /api/staff/centers/:id` - Update center

### Audit Logs (2 endpoints)
- `GET /api/staff/audit-logs` - Get audit logs
- `GET /api/staff/audit-logs/export` - Export logs as CSV

## Features

✅ **Pagination** - All list endpoints support pagination  
✅ **Filtering** - Filter by role, status, center, organizational level  
✅ **Search** - Full-text search in names and emails  
✅ **Sorting** - Sort by various fields  
✅ **Validation** - Comprehensive input validation  
✅ **Access Control** - RBAC-based permissions  
✅ **Audit Logging** - All operations logged  
✅ **Hierarchical Access** - Center-based access control  
✅ **Error Handling** - Consistent error responses  

## Quick Reference

### List Users
```bash
GET /api/staff/users?page=1&limit=20&role=NURSE&status=active
```

### Create User
```bash
POST /api/staff/users
{
  "email": "user@avis.it",
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
  "role_id": "uuid"
}
```

### Export Audit Logs
```bash
GET /api/staff/audit-logs/export?start_date=2024-01-01&end_date=2024-01-31
```

See `src/routes/staff.routes.md` for complete documentation.

