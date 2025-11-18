# Appointments Integration Summary

Complete integration of the Vitalita donor appointment system with the staff portal.

## Overview

This implementation provides comprehensive appointment management functionality with:
- Full CRUD operations
- Calendar view with drag-and-drop rescheduling
- Real-time updates via Server-Sent Events (SSE)
- Italian donation rules validation
- Center capacity management
- Export functionality

## Backend Implementation

### API Endpoints Created

1. **GET /api/staff/appointments** - List appointments with filters
2. **GET /api/staff/appointments/:id** - Get appointment details
3. **GET /api/staff/appointments/calendar** - Calendar view data
4. **POST /api/staff/appointments** - Create appointment
5. **PUT /api/staff/appointments/:id** - Update appointment
6. **PATCH /api/staff/appointments/:id/status** - Update status
7. **GET /api/staff/appointments/stats** - Statistics
8. **GET /api/staff/appointments/export** - Export to CSV
9. **GET /api/staff/appointments/stream** - SSE real-time updates

### Files Created

**Backend:**
- `staff-portal-api/src/controllers/appointments.controller.ts` - Main controller
- `staff-portal-api/src/routes/appointments.routes.ts` - Route definitions
- `staff-portal-api/src/routes/appointments.sse.ts` - SSE endpoint
- `staff-portal-api/APPOINTMENTS_API.md` - API documentation

**Frontend:**
- `staff-portal/src/components/appointments/AppointmentCalendar.tsx` - FullCalendar integration
- `staff-portal/src/components/appointments/AppointmentList.tsx` - Table view with filters
- `staff-portal/src/components/appointments/AppointmentDetails.tsx` - Detailed view
- `staff-portal/src/components/appointments/AppointmentForm.tsx` - Manual booking form
- `staff-portal/src/hooks/useAppointments.ts` - React Query hooks
- `staff-portal/src/hooks/useAppointmentStream.ts` - SSE hook

## Features

### ✅ Appointment Management
- List with pagination, filtering, sorting, search
- Create manual appointments
- Update appointment details
- Status management (scheduled → confirmed → arrived → completed)
- Cancel appointments
- Mark no-shows

### ✅ Calendar View
- FullCalendar integration (day/week/month views)
- Color-coded by status
- Drag-and-drop rescheduling (permission-based)
- Click to view details
- Real-time updates

### ✅ Business Logic
- **Italian Donation Rules:**
  - Whole blood: 90 days between, max 4/year
  - Plasma: 14 days between, max 12L/year
- Center capacity checking
- Double-booking prevention
- Donor eligibility validation

### ✅ Real-Time Updates
- Server-Sent Events (SSE) for live updates
- Automatic cache invalidation
- New arrival notifications
- Status change broadcasts

### ✅ Data Export
- CSV export with filters
- Includes all appointment details
- Formatted for Excel compatibility

## Dependencies Added

**Backend:**
- `date-fns` (already added)

**Frontend:**
- `@fullcalendar/react` - Calendar component
- `@fullcalendar/daygrid` - Month view
- `@fullcalendar/timegrid` - Week/Day views
- `@fullcalendar/interaction` - Drag-and-drop

## Integration Points

### Database
- Uses existing `appointments` table in `public` schema
- Joins with `donors`, `donation_centers`, `staff_portal.users`
- Compatible with AI voice/chatbot bookings

### Permissions
- `appointments:view` - View appointments
- `appointments:create` - Create appointments
- `appointments:update` - Update appointments
- `appointments:export` - Export data

### Real-Time Updates
- SSE endpoint: `/api/staff/appointments/stream`
- Automatic reconnection on disconnect
- Broadcasts to all connected clients
- Special notifications for arrivals

## Usage Examples

### Create Appointment
```typescript
const createAppointment = useCreateAppointment();
await createAppointment.mutateAsync({
  donor_hash_id: 'abc123...',
  donation_center_id: 'uuid',
  appointment_datetime: '2024-01-15T10:00:00Z',
  donation_type: 'whole_blood',
});
```

### Update Status
```typescript
const updateStatus = useUpdateAppointmentStatus();
await updateStatus.mutateAsync({
  id: 'appointment-id',
  status: 'arrived',
  notes: 'Donor arrived on time',
});
```

### Real-Time Stream
```typescript
useAppointmentStream(); // Automatically connects and handles updates
```

## Validation Rules

### Whole Blood
- Minimum 90 days since last donation
- Maximum 4 donations per year
- Donor account must be active

### Plasma
- Minimum 14 days since last donation
- Maximum 12 liters per year
- Donor account must be active

### Center Capacity
- Checks existing appointments in 30-minute window
- Prevents exceeding center capacity
- Validates time slot availability

## Error Handling

- Comprehensive validation with express-validator
- Business rule violations return 400 with clear messages
- Capacity conflicts return 409
- Permission errors return 403
- All errors logged to audit system

## Next Steps

1. **Add Center Selection** - Load centers from API in AppointmentForm
2. **Availability API** - Implement dedicated availability check endpoint
3. **Donor Search** - Add donor search/autocomplete in form
4. **Notifications** - Enhanced notification system for arrivals
5. **PDF Export** - Add PDF export option
6. **Bulk Operations** - Implement bulk status updates
7. **Appointment Reminders** - Automated reminder system

## Testing

To test the implementation:

1. **Start Backend:**
   ```bash
   cd staff-portal-api
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd staff-portal
   npm run dev
   ```

3. **Test Endpoints:**
   - Login to staff portal
   - Navigate to appointments
   - Create, view, update appointments
   - Test calendar view
   - Verify real-time updates

## Documentation

- **API Documentation:** `staff-portal-api/APPOINTMENTS_API.md`
- **Component Usage:** See component files for props and usage
- **Hooks Documentation:** See `useAppointments.ts` for hook details

## Notes

- Appointments table is shared with donor portal
- All validation rules apply to both staff and donor bookings
- Real-time updates work across all connected clients
- Audit logging tracks all appointment operations

