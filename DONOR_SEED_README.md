# Donor Seed Script for Vitalita Blood Donation System

This document provides instructions for creating a registered donor with all necessary related data for testing blood donation appointment scheduling.

## 📋 Donor Information

The seed script creates a donor with the following information:

| Field | Value |
|-------|-------|
| **First Name** | Alessandro |
| **Last Name** | Moretti |
| **Date of Birth** | 1988-06-12 |
| **AVIS Donor Center** | AVIS Casalmaggiore |
| **Email** | alessandro.moretti@example.com |
| **Phone** | +39 333 123 4567 |

## 🔑 Login Credentials

Use these exact values to log in as the donor:

```
First Name: Alessandro
Last Name: Moretti
Date of Birth: 1988-06-12
AVIS Donor Center: AVIS Casalmaggiore
```

## 📁 Files Included

1. **`donor-seed-script.js`** - Main JavaScript seed script
2. **`update-related-tables.sql`** - SQL script for updating related tables
3. **`DONOR_SEED_README.md`** - This documentation file

## 🚀 How to Run the Seed Script

### Prerequisites

1. Ensure your Supabase environment variables are set:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Make sure you have the required dependencies installed:
   ```bash
   npm install @supabase/supabase-js
   ```

### Step 1: Run the Main Seed Script

```bash
node donor-seed-script.js
```

This script will:
- ✅ Create the donation center if it doesn't exist
- ✅ Create the donor record with all necessary fields
- ✅ Set up email verification and account activation
- ✅ Create availability slots for the next 14 days
- ✅ Create a sample appointment
- ✅ Add audit log entries

### Step 2: Run the SQL Update Script (Optional)

If you need to update related tables or create additional availability slots:

```bash
# Connect to your Supabase database and run:
psql -h your_supabase_host -U postgres -d postgres -f update-related-tables.sql
```

Or run it through the Supabase dashboard SQL editor.

## 📊 What Gets Created

### 1. Donor Profile
- **Account Status**: Active and verified
- **Email Verification**: ✅ Verified
- **Account Activation**: ✅ Activated by staff
- **Total Donations This Year**: 2
- **Last Donation**: 30 days ago
- **Preferred Language**: English
- **Communication Channel**: Email

### 2. Availability Slots
- **Duration**: Next 14 days
- **Time Slots**: 9 AM, 12 PM, 3 PM daily
- **Donation Types**: Blood and Plasma
- **Capacity**: 8 donors per slot
- **Current Bookings**: Random (0-2 per slot)

### 3. Sample Appointment
- **Type**: Blood donation
- **Status**: Scheduled
- **Booking Channel**: Online
- **Confirmation**: Sent
- **Reminder**: Not sent yet

### 4. Donation Center
- **Name**: AVIS Casalmaggiore
- **Address**: Via Roma 123, Casalmaggiore, Italy
- **Contact**: +39 0375 123456
- **Email**: info@aviscasalmaggiore.it
- **Status**: Active

## 🔍 Verification Queries

After running the scripts, you can verify the data with these SQL queries:

### Check Donor Record
```sql
SELECT 
  donor_hash_id,
  email,
  email_verified,
  account_activated,
  is_active,
  total_donations_this_year,
  last_donation_date,
  avis_donor_center
FROM donors 
WHERE email = 'alessandro.moretti@example.com';
```

### Check Availability Slots
```sql
SELECT 
  slot_datetime::date as date,
  slot_datetime::time as time,
  donation_type,
  capacity,
  current_bookings,
  is_available
FROM availability_slots as2
JOIN donation_centers dc ON as2.center_id = dc.center_id
WHERE dc.name = 'AVIS Casalmaggiore'
  AND as2.slot_datetime > now()
ORDER BY slot_datetime
LIMIT 20;
```

### Check Appointments
```sql
SELECT 
  appointment_datetime,
  donation_type,
  status,
  booking_channel,
  confirmation_sent,
  reminder_sent
FROM appointments a
JOIN donors d ON a.donor_hash_id = d.donor_hash_id
WHERE d.email = 'alessandro.moretti@example.com';
```

## 🛠️ Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   ```
   Error: Missing Supabase environment variables
   ```
   **Solution**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.

2. **Donor Already Exists**
   ```
   Error: duplicate key value violates unique constraint
   ```
   **Solution**: The script will handle this gracefully, but you can delete existing records first.

3. **Permission Denied**
   ```
   Error: permission denied for table donors
   ```
   **Solution**: Check your Supabase RLS policies and ensure the anon key has proper permissions.

### Reset Data (if needed)

To start fresh, you can delete the test data:

```sql
-- Delete test donor and related data
DELETE FROM appointments WHERE donor_hash_id IN (
  SELECT donor_hash_id FROM donors WHERE email = 'alessandro.moretti@example.com'
);

DELETE FROM donors WHERE email = 'alessandro.moretti@example.com';

DELETE FROM availability_slots WHERE center_id IN (
  SELECT center_id FROM donation_centers WHERE name = 'AVIS Casalmaggiore'
);

DELETE FROM donation_centers WHERE name = 'AVIS Casalmaggiore';
```

## 📱 Testing the Donor Login

1. Navigate to the donor login page
2. Enter the exact credentials:
   - First Name: `Alessandro`
   - Last Name: `Moretti`
   - Date of Birth: `1988-06-12`
   - AVIS Donor Center: `AVIS Casalmaggiore`

3. You should be able to:
   - ✅ View your donor profile
   - ✅ See your donation history
   - ✅ Browse available appointment slots
   - ✅ Schedule new appointments
   - ✅ View existing appointments

## 🔄 Updating Donor Information

To modify the donor information, edit the `DONOR_INFO` object in `donor-seed-script.js`:

```javascript
const DONOR_INFO = {
  firstName: 'YourFirstName',
  lastName: 'YourLastName',
  dateOfBirth: 'YYYY-MM-DD',
  avisDonorCenter: 'AVIS Center Name',
  email: 'your.email@example.com',
  phone: '+39 XXX XXX XXXX'
};
```

## 📞 Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify your Supabase connection
3. Ensure all required tables exist in your database
4. Check the audit logs for detailed error information

---

**Note**: This seed data is for testing purposes only. In production, ensure proper data validation and security measures are in place. 