# Staff Management API Endpoints Documentation

Complete API documentation for staff management endpoints.

## Base URL
```
/api/staff
```

All endpoints require authentication via JWT token (httpOnly cookie or Authorization header).

---

## Staff User Management

### GET /api/staff/users
List all staff members with filtering, pagination, and search.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 100) - Items per page
- `role` (optional) - Filter by role code (e.g., 'NURSE', 'PRESIDENT')
- `status` (optional) - Filter by status: 'active' or 'inactive'
- `center` (optional) - Filter by center UUID
- `organizational_level` (optional) - Filter by level: 'National', 'Regional', 'Provincial', 'Municipal'
- `search` (optional) - Search in name or email
- `sort` (optional, default: 'created_at') - Sort field: 'first_name', 'last_name', 'email', 'created_at', 'last_login_at'
- `order` (optional, default: 'desc') - Sort order: 'asc' or 'desc'

**Required Permission:** `staff:view`

**Example Request:**
```bash
GET /api/staff/users?page=1&limit=20&role=NURSE&status=active&search=mario
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "email": "mario.rossi@avis.it",
      "first_name": "Mario",
      "last_name": "Rossi",
      "phone_number": "+39123456789",
      "avis_center_id": "uuid",
      "organizational_level": "Municipal",
      "is_active": true,
      "is_email_verified": true,
      "last_login_at": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "center_name": "AVIS Milano",
      "center_code": "AVIS-MIL-001",
      "roles": [
        {
          "role_id": "uuid",
          "role_name": "Nurse",
          "role_code": "NURSE",
          "role_category": "Medical"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### GET /api/staff/users/:id
Get specific staff member details with roles and permissions.

**Required Permission:** `staff:view`

**Example Request:**
```bash
GET /api/staff/users/123e4567-e89b-12d3-a456-426614174000
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "uuid",
      "email": "mario.rossi@avis.it",
      "first_name": "Mario",
      "last_name": "Rossi",
      "phone_number": "+39123456789",
      "avis_center_id": "uuid",
      "organizational_level": "Municipal",
      "is_active": true,
      "is_email_verified": true,
      "mfa_enabled": false,
      "last_login_at": "2024-01-15T10:00:00Z",
      "roles": [...],
      "permissions": [...],
      "center": {
        "center_id": "uuid",
        "name": "AVIS Milano",
        "center_code": "AVIS-MIL-001",
        ...
      }
    }
  }
}
```

---

### POST /api/staff/users
Create new staff member (admin only).

**Required Permission:** `staff:manage`

**Request Body:**
```json
{
  "email": "newuser@avis.it",
  "password": "SecurePass123!",
  "first_name": "Giuseppe",
  "last_name": "Verdi",
  "phone_number": "+39123456789",
  "avis_center_id": "uuid",
  "organizational_level": "Municipal"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "uuid",
      "email": "newuser@avis.it",
      "first_name": "Giuseppe",
      "last_name": "Verdi",
      "avis_center_id": "uuid",
      "organizational_level": "Municipal",
      "is_active": false
    }
  }
}
```

---

### PUT /api/staff/users/:id
Update staff member. Users can update their own profile, admins can update anyone.

**Request Body (all fields optional):**
```json
{
  "first_name": "Mario",
  "last_name": "Rossi",
  "phone_number": "+39123456789",
  "avis_center_id": "uuid",
  "organizational_level": "Provincial"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "uuid",
      "email": "mario.rossi@avis.it",
      "first_name": "Mario",
      "last_name": "Rossi",
      ...
    }
  }
}
```

---

### DELETE /api/staff/users/:id
Deactivate staff member (soft delete).

**Required Permission:** `staff:manage`

**Example Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

### PATCH /api/staff/users/:id/status
Approve or suspend user.

**Required Permission:** `staff:manage`

**Request Body:**
```json
{
  "status": "active",
  "role_ids": ["role-uuid-1", "role-uuid-2"]
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "User approved successfully"
}
```

---

## Role Management

### GET /api/staff/roles
List all available roles.

**Query Parameters:**
- `category` (optional) - Filter by category: 'Executive', 'Medical', 'Administrative', 'Operational', 'Volunteer'

**Required Permission:** `roles:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "role_id": "uuid",
        "role_name": "President",
        "role_code": "PRESIDENT",
        "role_category": "Executive",
        "description": "...",
        "is_system_role": true,
        "user_count": 5
      }
    ]
  }
}
```

---

### GET /api/staff/roles/:id/permissions
Get permissions for a specific role.

**Required Permission:** `roles:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "role": {
      "role_id": "uuid",
      "role_name": "Nurse",
      ...
    },
    "permissions": [
      {
        "permission_id": "uuid",
        "permission_name": "donors:view",
        "resource": "donors",
        "action": "view",
        ...
      }
    ]
  }
}
```

---

### POST /api/staff/users/:id/roles
Assign role to user.

**Required Permission:** `staff:assign_roles`

**Request Body:**
```json
{
  "role_id": "uuid",
  "expires_at": "2024-12-31T23:59:59Z" // Optional
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Role assigned successfully"
}
```

---

### DELETE /api/staff/users/:id/roles/:roleId
Remove role from user.

**Required Permission:** `staff:assign_roles`

**Example Response:**
```json
{
  "success": true,
  "message": "Role removed successfully"
}
```

---

## AVIS Centers

### GET /api/staff/centers
List AVIS centers (hierarchical, filtered by user access).

**Query Parameters:**
- `type` (optional) - Filter by type: 'National', 'Regional', 'Provincial', 'Municipal'
- `parent_id` (optional) - Filter by parent center UUID
- `region` (optional) - Filter by region name
- `province` (optional) - Filter by province name
- `active_only` (optional, default: 'true') - Show only active centers

**Required Permission:** `centers:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "centers": [
      {
        "center_id": "uuid",
        "center_code": "AVIS-NAZ-001",
        "name": "AVIS Nazionale",
        "center_type": "National",
        "staff_count": 25,
        ...
      }
    ]
  }
}
```

---

### GET /api/staff/centers/:id
Get center details with hierarchy.

**Required Permission:** `centers:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "center": {
      "center_id": "uuid",
      "center_code": "AVIS-REG-001",
      "name": "AVIS Lombardia",
      "center_type": "Regional",
      "parent": {
        "center_id": "uuid",
        "name": "AVIS Nazionale",
        ...
      },
      "children": [
        {
          "center_id": "uuid",
          "name": "AVIS Milano",
          ...
        }
      ],
      ...
    }
  }
}
```

---

### GET /api/staff/centers/:id/staff
Get staff members at a specific center.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Required Permission:** `staff:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "user_id": "uuid",
        "email": "user@avis.it",
        "first_name": "Mario",
        "last_name": "Rossi",
        "roles": [...]
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### PUT /api/staff/centers/:id
Update center information.

**Required Permission:** `centers:update`

**Request Body (all fields optional):**
```json
{
  "name": "AVIS Milano Updated",
  "address": "Via Roma 1",
  "city": "Milano",
  "province": "Milano",
  "region": "Lombardia",
  "postal_code": "20100",
  "contact_phone": "+390212345678",
  "contact_email": "milano@avis.it",
  "website_url": "https://avis.milano.it",
  "is_active": true
}
```

---

## Audit Logs

### GET /api/staff/audit-logs
Get audit logs with filtering.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50, max: 500)
- `user_id` (optional) - Filter by user UUID
- `action` (optional) - Filter by action (partial match)
- `resource_type` (optional) - Filter by resource type
- `status` (optional) - Filter by status: 'success', 'failure', 'error', 'warning'
- `start_date` (optional) - ISO 8601 date
- `end_date` (optional) - ISO 8601 date
- `search` (optional) - Search in action, resource_type, or details

**Required Permission:** `audit:view`

**Example Request:**
```bash
GET /api/staff/audit-logs?user_id=uuid&status=success&start_date=2024-01-01&end_date=2024-01-31
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "log_id": "uuid",
        "timestamp": "2024-01-15T10:00:00Z",
        "user_id": "uuid",
        "user_email": "user@avis.it",
        "user_first_name": "Mario",
        "user_last_name": "Rossi",
        "action": "update_user",
        "resource_type": "users",
        "resource_id": "uuid",
        "status": "success",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "details": {
          "changes": {...},
          "previous": {...}
        }
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25
  }
}
```

---

### GET /api/staff/audit-logs/export
Export audit logs as CSV.

**Query Parameters:** Same as GET /api/staff/audit-logs (except page/limit)

**Required Permission:** `audit:export`

**Example Request:**
```bash
GET /api/staff/audit-logs/export?start_date=2024-01-01&end_date=2024-01-31
```

**Response:** CSV file download

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400,
    "details": [...] // Optional validation errors
  }
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## Access Control

### Permission Requirements

- **View Operations**: `staff:view`, `roles:view`, `centers:view`, `audit:view`
- **Manage Operations**: `staff:manage`, `centers:update`
- **Role Assignment**: `staff:assign_roles`
- **Audit Export**: `audit:export`

### Hierarchical Access

- Users can only access centers they have permission for
- Center admins can manage users in their center
- National level can access all centers
- Regional can access centers in their region
- Provincial can access centers in their province
- Municipal can only access their own center

---

## Audit Logging

All operations are automatically logged to `staff_portal.audit_logs` with:
- User ID
- Action performed
- Resource type and ID
- Changes (before/after for updates)
- IP address
- User agent
- Timestamp

---

## Examples

### Create Staff User
```bash
curl -X POST http://localhost:3001/api/staff/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "email": "newuser@avis.it",
    "password": "SecurePass123!",
    "first_name": "Giuseppe",
    "last_name": "Verdi",
    "avis_center_id": "uuid",
    "organizational_level": "Municipal"
  }'
```

### List Staff with Filters
```bash
curl "http://localhost:3001/api/staff/users?role=NURSE&status=active&page=1&limit=20" \
  -b cookies.txt
```

### Assign Role
```bash
curl -X POST http://localhost:3001/api/staff/users/uuid/roles \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "role_id": "role-uuid"
  }'
```

### Export Audit Logs
```bash
curl "http://localhost:3001/api/staff/audit-logs/export?start_date=2024-01-01&end_date=2024-01-31" \
  -b cookies.txt \
  -o audit-logs.csv
```

