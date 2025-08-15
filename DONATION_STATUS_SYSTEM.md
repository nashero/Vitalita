# Blood Donation Status System

## Overview

This document describes the comprehensive status system implemented for blood donation appointments and donation history tracking. The system provides standardized status codes and descriptions for all stages of the blood donation process.

## Database Structure

### Tables Created

1. **`donation_status_categories`** - Organizes statuses into logical groups
2. **`donation_statuses`** - Contains all individual status definitions with abbreviations

### Status Categories

#### 1. Pre-Donation Statuses
Statuses that occur before the actual donation process begins:

| Status Code | Status Name | Description |
|-------------|-------------|-------------|
| `SCHEDULED` | Scheduled | The donor has successfully booked an appointment |
| `CONFIRMED` | Confirmed | The donor has confirmed their appointment, often through a reminder or follow-up notification |
| `REMINDER_SENT` | Reminder Sent | A reminder notification for the upcoming appointment has been sent to the donor |
| `CANCELLED` | Cancelled | The donor has proactively cancelled their appointment before the scheduled time |
| `NO_SHOW` | No-Show | The donor failed to attend their scheduled appointment without prior cancellation |
| `LATE_ARRIVAL` | Late Arrival | The donor arrived after their scheduled appointment time, which may or may not be acceptable depending on your clinic's policy |
| `RESCHEDULED` | Rescheduled | The donor has changed their appointment to a new date and/or time |
| `WAITLIST` | Waitlist | The donor is on a waiting list for a specific date and time that is currently full |

#### 2. In-Progress and Post-Donation Statuses
Statuses that occur during and after the donation process:

| Status Code | Status Name | Description |
|-------------|-------------|-------------|
| `IN_PROGRESS` | In Progress | The donor has arrived and has begun the donation process (e.g., check-in, pre-screening) |
| `COMPLETED` | Completed | The donor has successfully finished the entire donation process |
| `DEFERRED` | Deferred | The donor was unable to donate for a specific reason (e.g., low iron, recent travel, medication). This can be further specified with sub-statuses like Deferred - Temporary or Deferred - Permanent |
| `SELF_DEFERRED` | Self-Deferred | The donor arrived but decided not to donate for personal reasons before the screening process began |
| `INCOMPLETE` | Incomplete | The donation process was started but couldn't be finished (e.g., the donor felt unwell during the donation) |
| `ELIGIBILITY_EXPIRED` | Eligibility Expired | The donor's eligibility to donate has expired and they need to complete an updated health screening questionnaire |
| `POST_DONATION_FOLLOWUP` | Post-Donation Follow-up | The donor is being followed up with after their donation (e.g., to check on their well-being, to notify them of test results) |
| `TEST_RESULTS_READY` | Test Results Ready | The results of the blood tests conducted on the donated blood are available |
| `UNIT_USED` | Unit Used | The donated blood unit has been processed and sent for use |
| `UNIT_DISCARDED` | Unit Discarded | The donated blood unit was found to be unusable for any number of reasons (e.g., contamination, failed screening tests) and was discarded |

## Usage in Existing Tables

### Appointments Table
The `appointments.status` column now uses the following status codes:
- `SCHEDULED` (default)
- `CONFIRMED`, `REMINDER_SENT`, `CANCELLED`, `NO_SHOW`
- `LATE_ARRIVAL`, `RESCHEDULED`, `WAITLIST`
- `IN_PROGRESS`, `COMPLETED`, `DEFERRED`
- `SELF_DEFERRED`, `INCOMPLETE`, `ELIGIBILITY_EXPIRED`

### Donation History Table
The `donation_history.status` column now uses the following status codes:
- `COMPLETED` (default)
- `DEFERRED`, `SELF_DEFERRED`, `INCOMPLETE`
- `ELIGIBILITY_EXPIRED`, `POST_DONATION_FOLLOWUP`
- `TEST_RESULTS_READY`, `UNIT_USED`, `UNIT_DISCARDED`

## Database Functions

### 1. `get_donation_status(p_status_code VARCHAR)`
Returns detailed information about a specific status code.

**Usage:**
```sql
SELECT * FROM get_donation_status('SCHEDULED');
```

**Returns:**
- `status_id`, `status_code`, `status_name`, `description`, `category_name`, `is_active`

### 2. `get_donation_statuses_by_category(p_category_name VARCHAR DEFAULT NULL)`
Returns all statuses, optionally filtered by category.

**Usage:**
```sql
-- Get all statuses
SELECT * FROM get_donation_statuses_by_category();

-- Get only pre-donation statuses
SELECT * FROM get_donation_statuses_by_category('Pre-Donation Statuses');
```

### 3. `get_appointment_statuses()`
Returns only the statuses that are valid for appointments.

**Usage:**
```sql
SELECT * FROM get_appointment_statuses();
```

### 4. `get_donation_history_statuses()`
Returns only the statuses that are valid for donation history.

**Usage:**
```sql
SELECT * FROM get_donation_history_statuses();
```

## Migration Details

### What Changed
1. **New Tables Created:**
   - `donation_status_categories`
   - `donation_statuses`

2. **Existing Tables Updated:**
   - `appointments.status` - Updated constraints and default values
   - `donation_history.status` - Updated constraints and default values

3. **Data Migration:**
   - Existing status values were automatically converted to new codes
   - Old lowercase statuses (e.g., 'scheduled') → New uppercase codes (e.g., 'SCHEDULED')

### Constraints Added
- Check constraints ensure only valid status codes can be used
- Foreign key relationships maintain data integrity
- Default values ensure proper initialization

## Benefits

1. **Standardization:** Consistent status codes across the entire system
2. **Flexibility:** Easy to add new statuses or modify existing ones
3. **Data Integrity:** Constraints prevent invalid status values
4. **Reporting:** Structured data enables better analytics and reporting
5. **Maintenance:** Centralized status management reduces code duplication

## Adding New Statuses

To add a new status, insert into the `donation_statuses` table:

```sql
INSERT INTO donation_statuses (status_code, status_name, description, category_id, sort_order) 
VALUES (
  'NEW_STATUS_CODE', 
  'New Status Name', 
  'Description of the new status', 
  (SELECT category_id FROM donation_status_categories WHERE category_name = 'Category Name'),
  99
);
```

## Frontend Integration

When building UI components, use the provided functions to:
1. Populate status dropdowns
2. Display status descriptions
3. Validate status transitions
4. Show status history

Example React component usage:
```typescript
const [appointmentStatuses, setAppointmentStatuses] = useState([]);

useEffect(() => {
  // Fetch appointment statuses from the database
  const fetchStatuses = async () => {
    const { data, error } = await supabase.rpc('get_appointment_statuses');
    if (data) setAppointmentStatuses(data);
  };
  fetchStatuses();
}, []);
```

## Security

- All lookup tables have Row Level Security enabled
- Read access is granted to all users (public)
- Write access is restricted to prevent unauthorized modifications
- Status codes are validated at the database level

## Audit Trail

The system automatically logs when status lookup tables are created, providing a complete audit trail of system changes. 