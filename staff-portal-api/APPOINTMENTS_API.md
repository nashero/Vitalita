# Appointments API Documentation

Complete API documentation for appointment management endpoints.

## Overview

The appointments API provides comprehensive endpoints for managing donor appointments in the Vitalita staff portal, including CRUD operations, calendar views, statistics, and real-time updates via Server-Sent Events (SSE).

## Endpoints

### List Appointments
**GET** `/api/staff/appointments`

List appointments with filtering, pagination, and search.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 100) - Items per page
- `status` (optional) - Filter by status: `scheduled`, `confirmed`, `arrived`, `in-progress`, `completed`, `cancelled`, `no-show`
- `donation_type` (optional) - Filter by type: `whole_blood`, `plasma`
- `center_id` (optional) - Filter by center UUID
- `start_date` (optional) - ISO 8601 date
- `end_date` (optional) - ISO 8601 date
- `search` (optional) - Search in donor hash ID
- `sort` (optional, default: `appointment_datetime`) - Sort field
- `order` (optional, default: `asc`) - Sort order: `asc` or `desc`

**Required Permission:** `appointments:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [...]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### Get Appointment Details
**GET** `/api/staff/appointments/:id`

Get detailed appointment information with donor history.

**Required Permission:** `appointments:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "appointment": {...},
    "donation_history": [...]
  }
}
```

---

### Get Calendar Data
**GET** `/api/staff/appointments/calendar`

Get appointments for calendar view.

**Query Parameters:**
- `start` (required) - ISO 8601 date
- `end` (required) - ISO 8601 date
- `center_id` (optional) - Filter by center UUID

**Required Permission:** `appointments:view`

---

### Create Appointment
**POST** `/api/staff/appointments`

Create a new appointment (manual booking).

**Request Body:**
```json
{
  "donor_hash_id": "string",
  "donation_center_id": "uuid",
  "appointment_datetime": "2024-01-15T10:00:00Z",
  "donation_type": "whole_blood" | "plasma",
  "notes": "string (optional)"
}
```

**Required Permission:** `appointments:create`

**Business Rules:**
- Validates Italian donation rules (90 days for whole blood, 14 days for plasma)
- Checks center capacity
- Prevents double-booking
- Validates donor eligibility

---

### Update Appointment
**PUT** `/api/staff/appointments/:id`

Update appointment details.

**Request Body (all fields optional):**
```json
{
  "appointment_datetime": "2024-01-15T10:00:00Z",
  "donation_type": "whole_blood" | "plasma",
  "donation_center_id": "uuid",
  "notes": "string"
}
```

**Required Permission:** `appointments:update`

---

### Update Appointment Status
**PATCH** `/api/staff/appointments/:id/status`

Update appointment status.

**Request Body:**
```json
{
  "status": "scheduled" | "confirmed" | "arrived" | "in-progress" | "completed" | "cancelled" | "no-show",
  "notes": "string (optional)"
}
```

**Required Permission:** `appointments:update`

**Special Behavior:**
- When status is `completed`, automatically updates donor stats
- Broadcasts real-time notification when status is `arrived`

---

### Get Appointment Statistics
**GET** `/api/staff/appointments/stats`

Get appointment statistics.

**Query Parameters:**
- `start_date` (optional) - ISO 8601 date
- `end_date` (optional) - ISO 8601 date
- `center_id` (optional) - Filter by center UUID

**Required Permission:** `appointments:view`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 156,
      "scheduled": 45,
      "confirmed": 30,
      "arrived": 5,
      "completed": 70,
      "cancelled": 3,
      "no_show": 3,
      "whole_blood": 120,
      "plasma": 36
    }
  }
}
```

---

### Export Appointments
**GET** `/api/staff/appointments/export`

Export appointments to CSV.

**Query Parameters:** Same as list appointments (except page/limit)

**Required Permission:** `appointments:export`

**Response:** CSV file download

---

### Real-Time Updates (SSE)
**GET** `/api/staff/appointments/stream`

Server-Sent Events endpoint for real-time appointment updates.

**Required Permission:** `appointments:view`

**Event Types:**
- `appointment_created` - New appointment created
- `appointment_updated` - Appointment details updated
- `appointment_status_changed` - Status changed
- `appointment_cancelled` - Appointment cancelled

**Example Event:**
```
data: {"type":"appointment_status_changed","appointment":{"appointment_id":"...","status":"arrived",...}}
```

## Italian Donation Rules

The API enforces Italian blood donation regulations:

### Whole Blood
- **Minimum interval:** 90 days between donations
- **Maximum per year:** 4 donations
- **Volume:** ~450ml per donation

### Plasma
- **Minimum interval:** 14 days between donations
- **Maximum per year:** 12 liters
- **Volume:** ~650ml per donation

### Validation
- Checks days since last donation
- Checks total donations this year
- Validates donor account is active
- Prevents scheduling if rules violated

## Center Capacity

- Each center has a maximum capacity
- Prevents double-booking (30-minute time window)
- Checks availability before creating/updating appointments

## Real-Time Updates

The SSE endpoint provides real-time notifications for:
- New appointments
- Status changes
- New arrivals (special notification)
- Cancellations

All connected clients receive updates automatically.

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400,
    "details": [...]
  }
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors, rule violations)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (capacity exceeded, double-booking)
- `500` - Internal Server Error

## Integration Notes

- Appointments table is in the `public` schema (shared with donor portal)
- Maintains compatibility with AI voice/chatbot bookings
- Same validation rules apply to all booking channels
- Audit logging for all operations

