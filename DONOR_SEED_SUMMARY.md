# 🩸 Donor Seed Data Summary

## 📋 Donor Information for Login

| Field | Value |
|-------|-------|
| **First Name** | Alessandro |
| **Last Name** | Moretti |
| **Date of Birth** | 1988-06-12 |
| **AVIS Donor Center** | AVIS Casalmaggiore |
| **Email** | alessandro.moretti@example.com |
| **Phone** | +39 333 123 4567 |

## 🔑 Login Credentials

Use these **exact** values to log in as the donor:

```
First Name: Alessandro
Last Name: Moretti
Date of Birth: 1988-06-12
AVIS Donor Center: AVIS Casalmaggiore
```

## 📊 Donor Profile Details

- **Account Status**: ✅ Active and verified
- **Email Verification**: ✅ Verified
- **Account Activation**: ✅ Activated by staff
- **Total Donations This Year**: 2
- **Last Donation**: 30 days ago
- **Preferred Language**: English
- **Communication Channel**: Email
- **Initial Vetting**: ✅ Completed

## 📅 Available Appointment Slots

- **Duration**: Next 14 days
- **Time Slots**: 9 AM, 12 PM, 3 PM daily
- **Donation Types**: Blood and Plasma
- **Capacity**: 8 donors per slot
- **Current Bookings**: Random (0-2 per slot)

## 📋 Sample Appointment Created

- **Type**: Blood donation
- **Status**: Scheduled
- **Booking Channel**: Online
- **Confirmation**: ✅ Sent
- **Reminder**: Not sent yet

## 🏥 Donation Center Information

- **Name**: AVIS Casalmaggiore
- **Address**: Via Roma 123, Casalmaggiore, Italy
- **Contact**: +39 0375 123456
- **Email**: info@aviscasalmaggiore.it
- **Status**: ✅ Active

## 📁 Files Created

1. **`donor-seed-script.js`** - Main JavaScript seed script
2. **`update-related-tables.sql`** - SQL script for updating related tables
3. **`run-donor-seed.bat`** - Windows batch script runner
4. **`run-donor-seed.sh`** - Unix/Linux/Mac shell script runner
5. **`DONOR_SEED_README.md`** - Comprehensive documentation
6. **`DONOR_SEED_SUMMARY.md`** - This summary file

## 🚀 Quick Start

### Windows Users:
```bash
run-donor-seed.bat
```

### Unix/Linux/Mac Users:
```bash
./run-donor-seed.sh
```

### Manual Run:
```bash
node donor-seed-script.js
```

## ✅ What You Can Do After Login

1. **View Profile**: See donation history and preferences
2. **Browse Slots**: View available appointment times
3. **Schedule Appointments**: Book new blood donation appointments
4. **View Bookings**: See existing appointments
5. **Update Preferences**: Change language and communication settings

## 🔍 Verification

After running the script, you can verify the data with these quick queries:

```sql
-- Check donor exists
SELECT email, email_verified, account_activated, is_active 
FROM donors 
WHERE email = 'alessandro.moretti@example.com';

-- Check available slots
SELECT COUNT(*) as available_slots 
FROM availability_slots as2
JOIN donation_centers dc ON as2.center_id = dc.center_id
WHERE dc.name = 'AVIS Casalmaggiore' 
  AND as2.is_available = true 
  AND as2.slot_datetime > now();
```

---

**Note**: This is test data for development purposes. The donor account is pre-verified and activated for immediate use. 