# Automatic Appointment Completion Trigger System

This system automatically handles the migration of completed appointments to the `donation_history` table in real-time when staff members change appointment status to "COMPLETED" in the Vitalita Staff Portal.

## 🎯 Overview

When an appointment status is updated to "COMPLETED", the trigger automatically fires and:

1. **Copies appointment data** to the `donation_history` table
2. **Adds completion metadata** including comments and timestamps
3. **Removes the completed appointment** from the `appointments` table
4. **Logs all actions** in the audit system for compliance

## 🚀 Key Features

- **Immediate execution** - as soon as status changes to "COMPLETED"
- **Data consistency** - ensures no completed appointments remain in the appointments table
- **Transaction safety** - all operations wrapped in database transactions
- **Audit logging** - comprehensive tracking of all completion activities
- **Error handling** - robust error handling with rollback capabilities

## 📋 Data Migration Mapping

| Appointments Field | DonationHistory Field | Notes |
|-------------------|----------------------|-------|
| `donor_hash_id` | `donor_hash_id` | Direct copy |
| `appointment_id` | `appointment_id` | For reference linking |
| `appointment_datetime` | `donation_date` | When donation was completed |
| `donation_type` | `donation_type` | Normalized to lowercase |
| `donation_center_id` | `donation_center_id` | Direct copy |
| `staff_id` | `staff_id` | Who completed the donation |
| - | `donation_volume` | Calculated based on donation type |
| - | `status` | Set to 'COMPLETED' |
| - | `notes` | 'Donation successfully completed.' |
| - | `completion_timestamp` | Current timestamp |

## 🛠️ Installation & Setup

### Step 1: Run the Setup Script

Execute the SQL setup script in your Supabase SQL Editor:

```sql
-- Copy and paste: setup-appointment-completion-complete.sql
```

This script will:
- Create the trigger function `handle_appointment_completion()`
- Create the trigger `appointment_completion_trigger`
- Create a migration function for existing data
- Grant necessary permissions
- Verify the setup

### Step 2: Verify Installation

Check that the trigger system is properly installed:

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'appointment_completion_trigger';

-- Check if function exists
SELECT proname, prosrc FROM pg_proc 
WHERE proname = 'handle_appointment_completion';
```

## 🧪 Testing the System

### Test Script

Run the comprehensive test script:

```bash
node test-appointment-completion.js
```

This will:
1. Create a test appointment
2. Change its status to "COMPLETED"
3. Verify the trigger execution
4. Clean up test data

### Manual Testing

1. **Create test appointment** with status other than "COMPLETED"
2. **Change status to "COMPLETED"** via StaffDonorsDashboard
3. **Verify results**:
   - Appointment disappears from appointments table
   - New record appears in donation_history table
   - Audit logs are created

## 📊 Monitoring & Verification

### Check Current Status

```sql
-- Count appointments by status
SELECT status, COUNT(*) as count 
FROM appointments 
GROUP BY status;

-- Count donation history records
SELECT COUNT(*) as total_donations 
FROM donation_history;

-- Check recent completions
SELECT * FROM donation_history 
ORDER BY completion_timestamp DESC 
LIMIT 10;
```

### Audit Log Review

```sql
-- View appointment completion logs
SELECT * FROM audit_logs 
WHERE action = 'appointment_completed' 
ORDER BY timestamp DESC;
```

## 🔧 Troubleshooting

### Common Issues

1. **Trigger not firing**
   - Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'appointment_completion_trigger';`
   - Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_appointment_completion';`

2. **Permission errors**
   - Ensure function has SECURITY DEFINER
   - Check RLS policies on donation_history table

3. **Data not migrating**
   - Verify appointment status is exactly "COMPLETED" (uppercase)
   - Check for constraint violations in donation_history table

### Debug Commands

```sql
-- Test trigger function manually
SELECT handle_appointment_completion();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'donation_history';

-- Verify table structure
\d donation_history
\d appointments
```

## 📈 Performance Considerations

### Indexes

The system includes optimized indexes for:
- `donation_history.donor_hash_id` - Fast donor lookups
- `donation_history.appointment_id` - Appointment linking
- `donation_history.completion_timestamp` - Chronological queries

### Transaction Handling

- All operations wrapped in database transactions
- Automatic rollback on errors
- Minimal lock contention through efficient trigger design

## 🔒 Security Features

- **SECURITY DEFINER** - Function runs with creator's privileges
- **RLS bypass** - Trigger function can insert into protected tables
- **Audit logging** - All actions tracked for compliance
- **Input validation** - Data sanitization and type checking

## 📝 Usage Examples

### Staff Portal Integration

In your StaffDonorsDashboard component:

```typescript
const handleStatusChange = async (appointmentId: string, newStatus: string) => {
  if (newStatus === 'COMPLETED') {
    // This will automatically trigger the completion process
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'COMPLETED' })
      .eq('appointment_id', appointmentId);
    
    if (!error) {
      // Status updated - trigger will handle the rest automatically
      showSuccessMessage('Appointment marked as completed');
    }
  }
};
```

### Migration of Existing Data

If you have existing completed appointments:

```sql
-- Run the migration function
SELECT migrate_existing_completed_appointments();

-- This will process all existing COMPLETED appointments
-- and migrate them to donation_history
```

## 🚨 Important Notes

1. **Status Consistency** - Always use "COMPLETED" (uppercase) for completion status
2. **Data Backup** - The system automatically preserves all data in donation_history
3. **Rollback Prevention** - Once an appointment is completed, it cannot be undone
4. **Audit Trail** - All completion activities are logged for compliance

## 🔄 System Maintenance

### Regular Checks

- Monitor trigger execution through audit logs
- Verify data consistency between tables
- Check for any failed completions

### Updates

- The trigger system is designed to be self-maintaining
- No manual intervention required for normal operation
- System automatically handles errors and rollbacks

## 📞 Support

If you encounter issues:

1. Check the audit logs for error details
2. Verify trigger and function existence
3. Test with the provided test script
4. Review RLS policies and permissions

## 🎉 Success Indicators

The system is working correctly when:

- ✅ Appointments disappear from appointments table when completed
- ✅ New records appear in donation_history table
- ✅ Audit logs show successful completion activities
- ✅ No data loss occurs during the migration process
- ✅ Staff can complete appointments without errors

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Compatibility**: Supabase PostgreSQL 14+
