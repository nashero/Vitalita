# How to Run SQL Scripts in Supabase

Step-by-step instructions for running the Vitalita staff portal SQL scripts.

## 🎯 Recommended Method: Supabase Dashboard SQL Editor

This is the **easiest and most reliable** method.

### Step-by-Step Instructions

#### 1. Access Your Supabase Project

1. Go to **https://supabase.com/dashboard**
2. Sign in to your account
3. Select your **Vitalita project**

#### 2. Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click the **"New query"** button (top right)
3. You'll see a blank SQL editor

#### 3. Run Scripts in This Exact Order

**⚠️ IMPORTANT: Run scripts in order, one at a time!**

---

### Script 1: Create Schema (MUST RUN FIRST)

**File:** `supabase/migrations/20250115000000_create_staff_portal_schema.sql`

**Steps:**
1. Open the file in your code editor
2. Select all content (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
4. Paste into Supabase SQL Editor
5. Click the **"Run"** button (or press Ctrl+Enter)
6. Wait for the success message: ✅ "Success. No rows returned"

**What it does:**
- Creates `staff_portal` schema
- Creates all tables (users, roles, permissions, etc.)
- Creates indexes and triggers
- Sets up Row Level Security

**Expected time:** 5-10 seconds

---

### Script 2: Seed Data

**File:** `supabase/migrations/20250115000002_seed_staff_portal_data.sql`

**Steps:**
1. Open the file
2. Copy entire contents
3. Paste into SQL Editor (new query or clear previous)
4. Click **"Run"**
5. Wait for success

**What it does:**
- Inserts 20 AVIS roles
- Inserts 40+ permissions
- Creates role-permission mappings

**Expected time:** 3-5 seconds

---

### Script 3: Analytics Views

**File:** `staff-portal-api/src/database/analytics_views.sql`

**Steps:**
1. Open the file
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**

**What it does:**
- Creates 4 materialized views for analytics
- Creates refresh function

**Expected time:** 2-3 seconds

---

### Script 4: Analytics Indexes

**File:** `staff-portal-api/src/database/analytics_indexes.sql`

**Steps:**
1. Open the file
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**

**What it does:**
- Creates performance indexes for analytics queries

**Expected time:** 1-2 seconds

---

### Script 5: Analytics Functions

**File:** `staff-portal-api/src/database/analytics_functions.sql`

**Steps:**
1. Open the file
2. Copy entire contents
3. Paste into SQL Editor
4. Click **"Run"**

**What it does:**
- Creates helper functions for analytics calculations

**Expected time:** 1-2 seconds

---

## ✅ Verification

After running all scripts, verify everything worked:

### Quick Check Query

Copy and paste this into SQL Editor:

```sql
-- Verify installation
SELECT 
  'Schema exists' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.schemata 
    WHERE schema_name = 'staff_portal'
  ) THEN '✅ YES' ELSE '❌ NO' END as result

UNION ALL

SELECT 
  'Roles table',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'staff_portal' AND table_name = 'roles'
  ) THEN '✅ YES' ELSE '❌ NO' END

UNION ALL

SELECT 
  'Roles count (should be 20+)',
  CASE WHEN (SELECT COUNT(*) FROM staff_portal.roles) >= 20 
    THEN '✅ ' || COUNT(*)::text 
    ELSE '❌ Only ' || COUNT(*)::text 
  END
FROM staff_portal.roles

UNION ALL

SELECT 
  'Permissions count (should be 40+)',
  CASE WHEN (SELECT COUNT(*) FROM staff_portal.permissions) >= 40 
    THEN '✅ ' || COUNT(*)::text 
    ELSE '❌ Only ' || COUNT(*)::text 
  END
FROM staff_portal.permissions

UNION ALL

SELECT 
  'Materialized views',
  CASE WHEN (SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'staff_portal') >= 4 
    THEN '✅ ' || COUNT(*)::text || ' views' 
    ELSE '❌ Missing views' 
  END
FROM pg_matviews WHERE schemaname = 'staff_portal';
```

All items should show ✅ YES or ✅ with counts.

---

## 🔄 Initial View Refresh

After creating materialized views, refresh them:

```sql
SELECT staff_portal.refresh_analytics_views();
```

This may take a few seconds if you have existing data.

---

## 📸 Visual Guide

### Finding SQL Editor in Supabase Dashboard

```
Supabase Dashboard
├── Project Selector (top)
├── Left Sidebar:
│   ├── Table Editor
│   ├── SQL Editor ← Click here!
│   ├── Database
│   └── ...
└── Main Area:
    └── SQL Editor Interface
        ├── Query input area
        ├── Run button (or Ctrl+Enter)
        └── Results area
```

### Running a Script

1. **New Query Button** (top right of SQL Editor)
2. **Paste SQL** into the editor
3. **Click "Run"** button (or press Ctrl+Enter / Cmd+Enter)
4. **Check Results** - Should show "Success. No rows returned" or data

---

## 🛠️ Alternative Methods

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link your project
cd "C:\Sudha\Cursor Projects\Vitalita"
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Run additional scripts
supabase db execute -f staff-portal-api/src/database/analytics_views.sql
supabase db execute -f staff-portal-api/src/database/analytics_indexes.sql
supabase db execute -f staff-portal-api/src/database/analytics_functions.sql
```

### Method 3: psql Command Line

```bash
# Get connection string from Supabase Dashboard
# Settings → Database → Connection string

# Run scripts
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/20250115000000_create_staff_portal_schema.sql

psql "postgresql://..." -f supabase/migrations/20250115000002_seed_staff_portal_data.sql
psql "postgresql://..." -f staff-portal-api/src/database/analytics_views.sql
psql "postgresql://..." -f staff-portal-api/src/database/analytics_indexes.sql
psql "postgresql://..." -f staff-portal-api/src/database/analytics_functions.sql
```

---

## ⚠️ Troubleshooting

### Error: "schema staff_portal does not exist"
**Cause:** Script 1 (schema) hasn't been run yet  
**Fix:** Run `20250115000000_create_staff_portal_schema.sql` first

### Error: "relation already exists"
**Cause:** Table/view already created  
**Fix:** Either skip (if already set up) or drop first:
```sql
DROP SCHEMA IF EXISTS staff_portal CASCADE;
-- Then re-run script 1
```

### Error: "permission denied"
**Cause:** Not using admin user  
**Fix:** Make sure you're logged in as project owner/admin in Supabase

### Error: "syntax error"
**Cause:** Script may have been partially copied  
**Fix:** Make sure you copied the entire file, check for missing parts

### Materialized Views Show Old Data
**Fix:** Refresh them:
```sql
SELECT staff_portal.refresh_analytics_views();
```

---

## 📋 Complete Checklist

After setup, verify:

- [ ] Schema `staff_portal` exists
- [ ] Table `staff_portal.roles` has 20 rows
- [ ] Table `staff_portal.permissions` has 40+ rows
- [ ] Table `staff_portal.avis_centers` exists
- [ ] Table `staff_portal.users` exists
- [ ] Table `staff_portal.audit_logs` exists
- [ ] Materialized views exist (4 views)
- [ ] Can query `SELECT * FROM staff_portal.roles LIMIT 5;`
- [ ] Refresh function works: `SELECT staff_portal.refresh_analytics_views();`

---

## 🎯 Quick Reference

**Script Order:**
1. Schema (creates everything)
2. Seed Data (adds roles/permissions)
3. Analytics Views (creates views)
4. Analytics Indexes (creates indexes)
5. Analytics Functions (creates functions)

**Total Time:** ~2-3 minutes

**Files Location:**
- Schema: `supabase/migrations/20250115000000_create_staff_portal_schema.sql`
- Seed: `supabase/migrations/20250115000002_seed_staff_portal_data.sql`
- Views: `staff-portal-api/src/database/analytics_views.sql`
- Indexes: `staff-portal-api/src/database/analytics_indexes.sql`
- Functions: `staff-portal-api/src/database/analytics_functions.sql`

---

## 🚀 Next Steps

After SQL setup:

1. **Start Backend API:**
   ```bash
   cd staff-portal-api
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd staff-portal
   npm install
   npm run dev
   ```

3. **Register First Admin User:**
   - Use the registration endpoint
   - Or create directly in database (with hashed password)

4. **Test API Endpoints:**
   - Login
   - Access dashboard
   - Test permissions

---

## 💡 Pro Tips

1. **Save Queries:** In SQL Editor, you can save frequently used queries
2. **Check Logs:** If errors occur, check Dashboard → Logs → Postgres Logs
3. **Backup First:** Always backup before major changes
4. **Test Environment:** Test in development before production
5. **One Script at a Time:** Don't combine multiple scripts in one query

---

## 📞 Support

If you encounter issues:

1. Check the error message carefully
2. Verify script order
3. Check Supabase project status
4. Review Postgres logs in dashboard
5. Ensure you have admin access

**You're all set!** 🎉

