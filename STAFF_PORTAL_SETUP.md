# Staff Portal Login Issue - Fix Guide

## Problem Summary
The staff portal cannot be accessed because:
1. **No staff accounts exist** in the database
2. **RLS policies are too restrictive** - they require authentication that doesn't exist yet
3. **Missing service role key** to bypass RLS during initial setup

## Quick Fix Options

### Option 1: Use Service Role Key (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `pxvimagfvonwxygmtgpi`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (starts with `eyJ...`)
5. Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=https://pxvimagfvonwxygmtgpi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

6. Run: `node create-staff-accounts.js`

### Option 2: Manual Database Setup
1. Go to Supabase dashboard → **Table Editor**
2. Navigate to **roles** table
3. Click **Insert Row** and add:
   - `role_name`: `Administrator`
   - `description`: `Full system access with all administrative privileges`
4. Add another role:
   - `role_name`: `Staff`
   - `description`: `Standard staff access for daily operations`
5. Navigate to **staff** table
6. Click **Insert Row** and add:
   - `username`: `admin`
   - `password_hash`: `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3` (hash of "admin123" + "admin_salt")
   - `salt`: `admin_salt`
   - `role_id`: (copy the Administrator role_id from step 3)
   - `first_name`: `Admin`
   - `last_name`: `User`
   - `email`: `admin@vitalita.com`
   - `phone_number`: `+39 123 456 789`
   - `is_active`: `true`
   - `mfa_enabled`: `false`

### Option 3: Temporarily Disable RLS
1. Go to Supabase dashboard → **Authentication** → **Policies**
2. Find the **roles** table
3. Click **Disable RLS** button
4. Find the **staff** table
5. Click **Disable RLS** button
6. Run: `node create-basic-tables.js`
7. Re-enable RLS after accounts are created

## Login Credentials
Once setup is complete, use these credentials:

- **Admin Account:**
  - Username: `admin`
  - Password: `admin123`

- **Staff Account:**
  - Username: `staff1`
  - Password: `staff123`

## Troubleshooting

### "Invalid username or password" Error
- Check that staff accounts exist in the database
- Verify password hashes are correct
- Ensure RLS policies allow staff to read their own data

### RLS Policy Violation
- The roles and staff tables have restrictive policies
- Use service role key or temporarily disable RLS
- Create permissive policies for initial setup

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check that tables exist and are accessible
- Ensure migrations have been applied

## Security Notes
- The service role key bypasses all RLS policies
- Only use it for initial setup or administrative tasks
- Re-enable RLS after creating necessary accounts
- Change default passwords in production

## Next Steps
After fixing the login issue:
1. Test staff portal access
2. Create additional staff accounts as needed
3. Configure role-based permissions
4. Set up proper audit logging
5. Implement password change functionality 