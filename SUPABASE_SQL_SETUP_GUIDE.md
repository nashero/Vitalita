# Supabase SQL Script Setup Guide

Complete guide for running SQL scripts in Supabase for the Vitalita Staff Portal.

## Prerequisites

1. **Supabase Project** - You need an active Supabase project
2. **Database Access** - Admin access to your Supabase database
3. **Connection Details** - Database connection string or Supabase dashboard access

## Method 1: Supabase Dashboard SQL Editor (Recommended)

This is the easiest method for most users.

### Step 1: Access SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New query"** to create a new SQL query

### Step 2: Run Scripts in Order

Run the scripts in this exact order:

#### 1. Create Staff Portal Schema
```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20250115000000_create_staff_portal_schema.sql
```

**Steps:**
1. Open `supabase/migrations/20250115000000_create_staff_portal_schema.sql`
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for success message

#### 2. Seed Staff Portal Data
```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20250115000002_seed_staff_portal_data.sql
```

**Steps:**
1. Open `supabase/migrations/20250115000002_seed_staff_portal_data.sql`
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**
5. Verify success

#### 3. Create Analytics Views
```sql
-- Copy and paste the entire contents of:
-- staff-portal-api/src/database/analytics_views.sql
```

**Steps:**
1. Open `staff-portal-api/src/database/analytics_views.sql`
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**

#### 4. Create Analytics Indexes
```sql
-- Copy and paste the entire contents of:
-- staff-portal-api/src/database/analytics_indexes.sql
```

**Steps:**
1. Open `staff-portal-api/src/database/analytics_indexes.sql`
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**

#### 5. Create Analytics Functions
```sql
-- Copy and paste the entire contents of:
-- staff-portal-api/src/database/analytics_functions.sql
```

**Steps:**
1. Open `staff-portal-api/src/database/analytics_functions.sql`
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**

### Step 3: Verify Installation

Run this verification query:

```sql
-- Verify schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'staff_portal';

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'staff_portal'
ORDER BY table_name;

-- Verify roles exist
SELECT role_name, role_code 
FROM staff_portal.roles 
ORDER BY role_category, role_name;

-- Verify permissions exist
SELECT COUNT(*) as permission_count 
FROM staff_portal.permissions;

-- Verify materialized views exist
SELECT schemaname, matviewname 
FROM pg_matviews 
WHERE schemaname = 'staff_portal';
```

### Step 4: Refresh Materialized Views (Initial)

After creating views, refresh them:

```sql
SELECT staff_portal.refresh_analytics_views();
```

---

## Method 2: Supabase CLI (For Developers)

If you have Supabase CLI installed, you can use migrations.

### Step 1: Install Supabase CLI

```bash
# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using npm
npm install -g supabase
```

### Step 2: Link Your Project

```bash
# Navigate to your project directory
cd "C:\Sudha\Cursor Projects\Vitalita"

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

Get your project ref from: Supabase Dashboard → Settings → General → Reference ID

### Step 3: Run Migrations

```bash
# Push all migrations to Supabase
supabase db push

# Or push specific migration
supabase migration up 20250115000000_create_staff_portal_schema
```

### Step 4: Run Additional Scripts

For scripts not in migrations folder, use SQL Editor or psql:

```bash
# Using Supabase CLI
supabase db execute -f staff-portal-api/src/database/analytics_views.sql
supabase db execute -f staff-portal-api/src/database/analytics_indexes.sql
supabase db execute -f staff-portal-api/src/database/analytics_functions.sql
```

---

## Method 3: Using psql (Advanced)

For direct database connection using PostgreSQL client.

### Step 1: Get Connection String

1. Go to Supabase Dashboard
2. Click **"Settings"** → **"Database"**
3. Scroll to **"Connection string"**
4. Copy the connection string (use "URI" format)

### Step 2: Connect to Database

```bash
# Using connection string
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Or using individual parameters
psql -h db.[PROJECT-REF].supabase.co -U postgres -d postgres
```

### Step 3: Run Scripts

```bash
# Run schema script
psql "postgresql://..." -f supabase/migrations/20250115000000_create_staff_portal_schema.sql

# Run seed data
psql "postgresql://..." -f supabase/migrations/20250115000002_seed_staff_portal_data.sql

# Run analytics views
psql "postgresql://..." -f staff-portal-api/src/database/analytics_views.sql

# Run analytics indexes
psql "postgresql://..." -f staff-portal-api/src/database/analytics_indexes.sql

# Run analytics functions
psql "postgresql://..." -f staff-portal-api/src/database/analytics_functions.sql
```

---

## Script Execution Order

**IMPORTANT:** Run scripts in this exact order:

1. ✅ **Schema Creation** (`20250115000000_create_staff_portal_schema.sql`)
   - Creates the `staff_portal` schema
   - Creates all tables, indexes, triggers
   - **Must run first!**

2. ✅ **Seed Data** (`20250115000002_seed_staff_portal_data.sql`)
   - Inserts roles and permissions
   - Creates role-permission mappings
   - **Requires schema to exist**

3. ✅ **Analytics Views** (`analytics_views.sql`)
   - Creates materialized views
   - Creates refresh function
   - **Requires donation_history and appointments tables**

4. ✅ **Analytics Indexes** (`analytics_indexes.sql`)
   - Creates performance indexes
   - **Can run after views**

5. ✅ **Analytics Functions** (`analytics_functions.sql`)
   - Creates helper functions
   - **Can run anytime after schema**

---

## Troubleshooting

### Error: "schema staff_portal does not exist"
**Solution:** Run the schema creation script first (`20250115000000_create_staff_portal_schema.sql`)

### Error: "relation already exists"
**Solution:** The table/view already exists. You can either:
- Drop it first: `DROP TABLE IF EXISTS staff_portal.table_name CASCADE;`
- Or skip if you're re-running scripts

### Error: "permission denied"
**Solution:** 
- Make sure you're using the admin/postgres user
- Check your connection string has correct credentials
- Verify you have database admin privileges

### Error: "function does not exist"
**Solution:** 
- Make sure you ran `analytics_functions.sql`
- Check if the function is in the correct schema: `staff_portal.function_name`

### Materialized Views Not Updating
**Solution:** 
- Manually refresh: `SELECT staff_portal.refresh_analytics_views();`
- Set up cron job (see below)

---

## Setting Up Automated Refresh

### Option 1: Supabase Dashboard (pg_cron)

1. Go to SQL Editor
2. Run this to enable pg_cron:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily refresh at 2 AM
SELECT cron.schedule(
  'refresh-analytics-views',
  '0 2 * * *',  -- 2 AM daily
  $$SELECT staff_portal.refresh_analytics_views()$$
);
```

### Option 2: External Cron Job

If pg_cron is not available, use external cron:

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `psql`
6. Arguments: `-h db.[PROJECT-REF].supabase.co -U postgres -d postgres -c "SELECT staff_portal.refresh_analytics_views();"`

**Linux/Mac (crontab):**
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * psql "postgresql://..." -c "SELECT staff_portal.refresh_analytics_views();"
```

### Option 3: Node.js Cron (Recommended)

Add to your backend server:

```javascript
// In staff-portal-api/src/server.ts or create separate cron service
import cron from 'node-cron';
import { query } from './config/database.js';

// Schedule daily refresh at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    await query('SELECT staff_portal.refresh_analytics_views()');
    console.log('Analytics views refreshed successfully');
  } catch (error) {
    console.error('Error refreshing analytics views:', error);
  }
});
```

---

## Verification Checklist

After running all scripts, verify:

- [ ] Schema `staff_portal` exists
- [ ] All tables created (users, roles, permissions, avis_centers, audit_logs, etc.)
- [ ] Roles seeded (20 roles)
- [ ] Permissions seeded (40+ permissions)
- [ ] Materialized views created (4 views)
- [ ] Analytics functions created (4 functions)
- [ ] Indexes created
- [ ] Can query `staff_portal.roles` table
- [ ] Can query `staff_portal.users` table
- [ ] Materialized views can be refreshed

### Quick Verification Query

```sql
-- Run this to verify everything
SELECT 
  'Schema' as check_type,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'staff_portal')
    THEN '✅ Exists' ELSE '❌ Missing' END as status
UNION ALL
SELECT 
  'Roles Table',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'staff_portal' AND table_name = 'roles')
    THEN '✅ Exists' ELSE '❌ Missing' END
UNION ALL
SELECT 
  'Roles Count',
  CASE WHEN (SELECT COUNT(*) FROM staff_portal.roles) >= 20
    THEN '✅ ' || COUNT(*)::text || ' roles' ELSE '❌ Missing data' END
FROM staff_portal.roles
UNION ALL
SELECT 
  'Materialized Views',
  CASE WHEN (SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'staff_portal') >= 4
    THEN '✅ ' || COUNT(*)::text || ' views' ELSE '❌ Missing views' END
FROM pg_matviews WHERE schemaname = 'staff_portal';
```

---

## Quick Start Commands

### For Supabase Dashboard (Easiest)

1. Open Supabase Dashboard → SQL Editor
2. Run each script in order (copy-paste entire file)
3. Click "Run" after each script
4. Verify with checklist above

### For Supabase CLI

```bash
# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Run additional scripts
supabase db execute -f staff-portal-api/src/database/analytics_views.sql
supabase db execute -f staff-portal-api/src/database/analytics_indexes.sql
supabase db execute -f staff-portal-api/src/database/analytics_functions.sql
```

### For psql

```bash
# Set connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run scripts
psql $DATABASE_URL -f supabase/migrations/20250115000000_create_staff_portal_schema.sql
psql $DATABASE_URL -f supabase/migrations/20250115000002_seed_staff_portal_data.sql
psql $DATABASE_URL -f staff-portal-api/src/database/analytics_views.sql
psql $DATABASE_URL -f staff-portal-api/src/database/analytics_indexes.sql
psql $DATABASE_URL -f staff-portal-api/src/database/analytics_functions.sql
```

---

## Important Notes

1. **Backup First:** Always backup your database before running migrations
2. **Test Environment:** Test scripts in a development environment first
3. **Run in Order:** Scripts must be run in the specified order
4. **Check Errors:** Review any error messages carefully
5. **Verify Results:** Always verify with the checklist after running scripts

## Getting Help

If you encounter issues:

1. Check the error message in Supabase SQL Editor
2. Verify you're running scripts in the correct order
3. Check that all prerequisites are met
4. Review the script files for any syntax errors
5. Check Supabase logs: Dashboard → Logs → Postgres Logs

---

## Next Steps After Setup

1. **Create Admin User:** Register first admin user via API
2. **Assign Roles:** Assign roles to users via API
3. **Test API:** Test all endpoints with Postman or frontend
4. **Set Up Cron:** Configure automated view refresh
5. **Monitor:** Check analytics views are refreshing correctly

