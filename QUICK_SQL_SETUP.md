# Quick SQL Setup Guide for Supabase

**Fastest way to set up the staff portal database.**

## 🚀 Quick Method (5 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New query"**

### Step 2: Run Scripts (Copy-Paste Each)

#### Script 1: Schema (Run First!)
```
1. Open: supabase/migrations/20250115000000_create_staff_portal_schema.sql
2. Copy entire file (Ctrl+A, Ctrl+C)
3. Paste into SQL Editor
4. Click "Run" (or Ctrl+Enter)
5. Wait for ✅ Success
```

#### Script 2: Seed Data
```
1. Open: supabase/migrations/20250115000002_seed_staff_portal_data.sql
2. Copy entire file
3. Paste into SQL Editor
4. Click "Run"
5. Wait for ✅ Success
```

#### Script 3: Analytics Views
```
1. Open: staff-portal-api/src/database/analytics_views.sql
2. Copy entire file
3. Paste into SQL Editor
4. Click "Run"
5. Wait for ✅ Success
```

#### Script 4: Analytics Indexes
```
1. Open: staff-portal-api/src/database/analytics_indexes.sql
2. Copy entire file
3. Paste into SQL Editor
4. Click "Run"
5. Wait for ✅ Success
```

#### Script 5: Analytics Functions
```
1. Open: staff-portal-api/src/database/analytics_functions.sql
2. Copy entire file
3. Paste into SQL Editor
4. Click "Run"
5. Wait for ✅ Success
```

### Step 3: Verify (Copy-Paste This)

```sql
-- Quick verification
SELECT 
  'Schema' as item,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'staff_portal')
    THEN '✅ OK' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'Roles', CASE WHEN (SELECT COUNT(*) FROM staff_portal.roles) >= 20 THEN '✅ OK' ELSE '❌ MISSING' END
UNION ALL
SELECT 'Permissions', CASE WHEN (SELECT COUNT(*) FROM staff_portal.permissions) >= 40 THEN '✅ OK' ELSE '❌ MISSING' END
UNION ALL
SELECT 'Views', CASE WHEN (SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'staff_portal') >= 4 THEN '✅ OK' ELSE '❌ MISSING' END;
```

All should show ✅ OK!

### Step 4: Initial Refresh (Copy-Paste This)

```sql
-- Refresh materialized views
SELECT staff_portal.refresh_analytics_views();
```

---

## 📋 What Each Script Does

| Script | What It Creates |
|--------|----------------|
| Schema | Creates `staff_portal` schema, all tables, indexes, triggers |
| Seed Data | Inserts 20 roles, 40+ permissions, role-permission mappings |
| Analytics Views | Creates 4 materialized views for fast analytics |
| Analytics Indexes | Creates performance indexes for analytics queries |
| Analytics Functions | Creates helper functions for calculations |

---

## ⚠️ Common Issues

**"schema staff_portal does not exist"**
→ Run Script 1 (Schema) first!

**"relation already exists"**
→ Table already created, you can skip or drop first

**"permission denied"**
→ Make sure you're using admin/postgres user

---

## ✅ Success Checklist

After running all scripts:
- [ ] Schema `staff_portal` exists
- [ ] Can see tables in Database → Tables (filter by `staff_portal`)
- [ ] Roles table has 20+ rows
- [ ] Permissions table has 40+ rows
- [ ] No errors in SQL Editor

---

## 🔄 Daily Refresh Setup (Optional)

To automatically refresh analytics views daily at 2 AM:

```sql
-- Enable pg_cron (if available)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily refresh
SELECT cron.schedule(
  'refresh-analytics',
  '0 2 * * *',
  $$SELECT staff_portal.refresh_analytics_views()$$
);
```

---

## 📞 Need Help?

1. Check error messages in SQL Editor
2. Verify scripts run in order
3. Check Supabase logs: Dashboard → Logs → Postgres Logs

**That's it!** Your staff portal database is now set up. 🎉

