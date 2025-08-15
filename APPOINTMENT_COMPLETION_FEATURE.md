# Appointment Completion Feature

## Overview

This feature automatically handles the completion of appointments in the Vitalita system. When an appointment status is changed to "COMPLETED", the system:

1. **Disables the status field** - No further changes can be made to completed appointments
2. **Automatically migrates data** - Appointment data is copied to the `donation_history` table
3. **Removes the appointment** - The completed appointment is deleted from the `appointments` table
4. **Creates audit trail** - All actions are logged for compliance and tracking

## How It Works

### Frontend (StaffDonorsDashboard)
- Status field becomes disabled when appointment status is "COMPLETED"
- Edit button is hidden for completed appointments
- Success message shown when appointment is completed
- Automatic refresh of appointments list after completion

### Backend (Database Trigger)
- `handle_appointment_completion()` function monitors status changes
- When status changes to "COMPLETED", automatically:
  - Copies appointment data to `donation_history`
  - Sets appropriate donation volume based on donation type
  - Adds completion timestamp and notes
  - Deletes the appointment record
- All operations wrapped in transaction for data safety
- **SECURITY DEFINER** ensures RLS policies are bypassed

## Setup Instructions

### 1. Complete Setup (Recommended)

Use the comprehensive setup script that handles all RLS policy issues:

```bash
# Copy and paste the contents of: setup-appointment-completion-complete.sql
# Run this in your Supabase SQL Editor
```

This script will:
- ✅ Remove conflicting triggers and functions
- ✅ Fix RLS policies on donation_history table
- ✅ Create the trigger function with SECURITY DEFINER
- ✅ Set up proper permissions
- ✅ Test the configuration automatically

### 2. Alternative: Manual Setup

If you prefer to run individual scripts:

```bash
# First, fix RLS policies
# Copy and paste: fix-rls-policies.sql

# Then, set up the trigger
# Copy and paste: migrate-completed-appointments.sql
```

### 3. Verify Setup

Run the test script to verify everything is working:

```bash
node test-appointment-completion.js
```

Expected output:
```
✅ Trigger function exists
✅ donation_history table exists
✅ Appointment status updated to COMPLETED
✅ Appointment migrated to donation_history
✅ Appointment removed from appointments table
```

## Common Issues and Solutions

### ❌ RLS Policy Error
**Error**: `new row violates row-level security policy for table "donation_history"`

**Solution**: This is the most common issue. The setup script automatically fixes it by:
1. Creating permissive RLS policies
2. Using `SECURITY DEFINER` on the trigger function
3. Granting proper permissions to the function

**Quick Fix**: Run the complete setup script in your Supabase SQL Editor.

### ❌ Trigger Function Not Found
**Error**: `function "handle_appointment_completion" does not exist`

**Solution**: Run the migration script to create the function.

### ❌ Permission Denied
**Error**: `permission denied for table donation_history`

**Solution**: The setup script automatically grants necessary permissions.

## Usage

### For Staff Members

1. **Navigate to Staff Portal** → Donors section
2. **Search for a donor** using their Donor ID
3. **View appointments** by selecting "Appointments" filter
4. **Edit appointment status** by clicking the edit button (pencil icon)
5. **Change status to "COMPLETED"** from the dropdown
6. **Save changes** - The system will automatically:
   - Migrate the appointment to donation history
   - Remove it from the appointments list
   - Show a success message

### Status Field Behavior

- **Before Completion**: Status field is editable with dropdown options
- **After Completion**: Status field is disabled and shows "(Status locked - appointment completed)"
- **Edit Button**: Hidden for completed appointments
- **No Further Changes**: Completed appointments cannot be modified

## Data Flow

```
Appointment Status Change → "COMPLETED"
           ↓
   Trigger Function Executes (SECURITY DEFINER)
           ↓
   Data Copied to donation_history (bypasses RLS)
           ↓
   Appointment Deleted from appointments
           ↓
   Success Message Displayed
           ↓
   Appointments List Refreshed
```

## Database Schema

### Trigger Function: `handle_appointment_completion()`

**Purpose**: Automatically handles appointment completion
**Trigger**: `AFTER UPDATE` on `appointments` table
**Security**: `SECURITY DEFINER` - bypasses RLS policies
**Actions**:
- Copies appointment data to `donation_history`
- Sets donation volume based on type
- Adds completion metadata
- Returns `NULL` to prevent appointment update (triggers deletion)

### Data Mapping

| Appointment Field | Donation History Field | Notes |
|------------------|------------------------|-------|
| `appointment_id` | `appointment_id` | Preserved for reference |
| `donor_hash_id` | `donor_hash_id` | Donor identifier |
| `staff_id` | `staff_id` | Staff who performed donation |
| `donation_center_id` | `donation_center_id` | Center where donation occurred |
| `appointment_datetime` | `donation_date` | When donation was completed |
| `donation_type` | `donation_type` | Type of donation |
| - | `donation_volume` | Auto-calculated based on type |
| - | `status` | Set to 'completed' |
| - | `notes` | 'Donation successfully completed.' |
| - | `completion_timestamp` | Current timestamp |

### Donation Volume Defaults

| Donation Type | Volume (ml) |
|---------------|-------------|
| `whole_blood` | 450 |
| `plasma` | 600 |
| `platelets` | 200 |
| `double_red` | 400 |
| `power_red` | 400 |
| Other | 450 (default) |

## Error Handling

### Common Issues

1. **RLS Policy Violations** ✅ **FIXED BY SETUP SCRIPT**
   - Solution: Run the complete setup script
   - Error: `new row violates row-level security policy for table "donation_history"`

2. **Trigger Function Not Found**
   - Solution: Run the migration script
   - Error: `function "handle_appointment_completion" does not exist`

3. **Donation History Table Missing**
   - Solution: Run donation history migration first
   - Error: `relation "donation_history" does not exist`

4. **Permission Issues** ✅ **FIXED BY SETUP SCRIPT**
   - Solution: Setup script automatically grants permissions
   - Error: `permission denied for table donation_history`

### Troubleshooting

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_appointment_completion';

-- Check if function exists
SELECT * FROM pg_proc 
WHERE proname = 'handle_appointment_completion';

-- Check trigger on appointments table
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'appointments';

-- Check RLS policies on donation_history
SELECT * FROM pg_policies 
WHERE tablename = 'donation_history';
```

## Testing

### Manual Testing

1. **Create test appointment** with status other than "COMPLETED"
2. **Change status to "COMPLETED"** via StaffDonorsDashboard
3. **Verify**:
   - Success message appears
   - Appointment disappears from appointments list
   - Data appears in donation_history table
   - Status field is disabled

### Automated Testing

Run the test script:

```bash
node test-appointment-completion.js
```

This script will:
- Verify trigger function exists
- Test appointment completion
- Verify data migration
- Clean up test data

## Security Considerations

### Row Level Security (RLS)
- Both `appointments` and `donation_history` tables have RLS enabled
- **Trigger function uses SECURITY DEFINER to bypass RLS** ✅
- Staff members can only access data they're authorized to see
- Donors can only see their own data

### Audit Logging
- All status changes are logged via audit system
- Completion events are tracked with timestamps
- Data integrity maintained through transactions

### Data Validation
- Status changes validated before processing
- Donation volume calculated based on type
- Foreign key constraints ensure data integrity

## Performance Considerations

### Indexes
- `appointments.status` - For filtering by status
- `donation_history.appointment_id` - For migration lookups
- `donation_history.donor_hash_id` - For donor history queries

### Trigger Efficiency
- Trigger only executes on status changes to "COMPLETED"
- Single transaction ensures atomicity
- Minimal overhead for non-completion updates
- SECURITY DEFINER has minimal performance impact

## Maintenance

### Regular Checks

1. **Monitor trigger execution**:
   ```sql
   SELECT * FROM pg_stat_user_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('appointments', 'donation_history');
   ```

2. **Check for orphaned records**:
   ```sql
   SELECT * FROM donation_history dh
   LEFT JOIN appointments a ON dh.appointment_id = a.appointment_id
   WHERE a.appointment_id IS NULL;
   ```

3. **Verify data consistency**:
   ```sql
   SELECT COUNT(*) as appointment_count FROM appointments WHERE status = 'COMPLETED';
   -- Should always be 0
   ```

### Backup Considerations

- `donation_history` table contains critical donation records
- Regular backups recommended
- Consider point-in-time recovery for compliance

## Compliance and Reporting

### Audit Trail
- All completion events logged
- Staff actions tracked
- Data lineage maintained

### Reporting
- Donation history available for reporting
- Completion statistics trackable
- Donor eligibility calculations supported

## Future Enhancements

### Potential Improvements

1. **Batch Processing**: Handle multiple completions simultaneously
2. **Notification System**: Alert staff when appointments are completed
3. **Quality Metrics**: Track completion time and success rates
4. **Integration**: Connect with external blood bank systems

### Configuration Options

- Configurable donation volumes by center
- Custom completion workflows
- Flexible status mappings
- Multi-language support

## Support

### Getting Help

1. **Check logs** for error messages
2. **Run test script** to verify setup
3. **Review database permissions** and RLS policies
4. **Contact system administrator** for complex issues

### Documentation

- This README file
- Database migration scripts
- **Complete setup script** (recommended)
- Test scripts
- API documentation

### Quick Fix for RLS Issues

If you encounter RLS policy errors:

1. **Run the complete setup script** in Supabase SQL Editor:
   ```sql
   -- Copy and paste: setup-appointment-completion-complete.sql
   ```

2. **This automatically fixes**:
   - RLS policy conflicts
   - Permission issues
   - Trigger function setup
   - All security considerations

---

**Last Updated**: December 2024  
**Version**: 1.1 (Includes RLS Policy Fixes)  
**Maintainer**: Vitalita Development Team
