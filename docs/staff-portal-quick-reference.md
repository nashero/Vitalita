# Staff Portal Schema - Quick Reference

## Schema: `staff_portal`

## Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `avis_centers` | Hierarchical AVIS center structure | `center_id`, `center_type`, `parent_center_id` |
| `roles` | AVIS organizational roles | `role_id`, `role_code`, `role_category` |
| `permissions` | Granular permissions | `permission_id`, `permission_name` (format: `resource:action`) |
| `users` | Staff members | `user_id`, `email`, `avis_center_id`, `organizational_level` |
| `user_roles` | User ↔ Role mapping (many-to-many) | `user_id`, `role_id`, `is_active`, `expires_at` |
| `role_permissions` | Role ↔ Permission mapping (many-to-many) | `role_id`, `permission_id` |
| `audit_logs` | Audit trail | `log_id`, `user_id`, `action`, `timestamp` |

## Center Hierarchy

```
National (parent_center_id = NULL)
  └── Regional
      └── Provincial
          └── Municipal
```

## Common Queries

### Get user permissions
```sql
SELECT DISTINCT p.permission_name
FROM staff_portal.users u
JOIN staff_portal.user_roles ur ON u.user_id = ur.user_id
JOIN staff_portal.role_permissions rp ON ur.role_id = rp.role_id
JOIN staff_portal.permissions p ON rp.permission_id = p.permission_id
WHERE u.email = 'user@example.com' AND ur.is_active = true;
```

### Get centers in hierarchy
```sql
WITH RECURSIVE hierarchy AS (
  SELECT center_id, name, center_type, parent_center_id, 0 as level
  FROM staff_portal.avis_centers WHERE center_code = 'AVIS-NAZ-001'
  UNION ALL
  SELECT c.center_id, c.name, c.center_type, c.parent_center_id, h.level + 1
  FROM staff_portal.avis_centers c
  JOIN hierarchy h ON c.parent_center_id = h.center_id
)
SELECT * FROM hierarchy;
```

### Check if user has permission
```sql
SELECT EXISTS(
  SELECT 1
  FROM staff_portal.users u
  JOIN staff_portal.user_roles ur ON u.user_id = ur.user_id
  JOIN staff_portal.role_permissions rp ON ur.role_id = rp.role_id
  JOIN staff_portal.permissions p ON rp.permission_id = p.permission_id
  WHERE u.user_id = $1
    AND p.permission_name = 'donors:manage'
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
) as has_permission;
```

## Predefined Roles

- `PRESIDENT` - President
- `VP` - Vice President
- `HCD` - Health Care Director
- `MD` - Medical Director
- `NURSE` - Nurse
- `ADMIN_DIR` - Administrative Director
- `CENTER_MGR` - Center Manager
- `RECEPTIONIST` - Receptionist
- `DATA_CLERK` - Data Entry Clerk
- `VOL_COORD` - Volunteer Coordinator
- `SYSTEM_ADMIN` - System Administrator

## Permission Format

All permissions follow: `resource:action`

Examples:
- `users:view`, `users:create`, `users:manage`
- `donors:view`, `donors:update`, `donors:delete`
- `appointments:create`, `appointments:cancel`
- `centers:manage`
- `reports:generate`
- `audit:view`
- `system:admin`

## Migration Files

- **Create:** `supabase/migrations/20250115000000_create_staff_portal_schema.sql`
- **Rollback:** `supabase/migrations/20250115000001_rollback_staff_portal_schema.sql`

## Important Notes

1. All primary keys use UUID
2. All tables have `created_at` and `updated_at` timestamps
3. RLS is enabled on all tables
4. RLS policies use `auth.uid()` (Supabase Auth) - adjust if using different auth
5. Audit logs are immutable (no updates/deletes allowed)

