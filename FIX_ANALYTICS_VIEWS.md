# Fix for Analytics Views Script

## Issue

The `analytics_views.sql` script was trying to use columns that don't exist in the `donation_centers` table:
- `center_type` ❌ (doesn't exist)
- `region` ❌ (doesn't exist)

## Solution

The script has been fixed to use columns that actually exist:
- `city` ✅ (exists)
- `country` ✅ (exists)

## What Changed

**Before (Error):**
```sql
dc.center_type,  -- ❌ Column doesn't exist
dc.region,       -- ❌ Column doesn't exist
```

**After (Fixed):**
```sql
dc.city,         -- ✅ Column exists
dc.country,     -- ✅ Column exists
```

## How to Fix

### Option 1: Use the Fixed File

1. Open `staff-portal-api/src/database/analytics_views_FIXED.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click "Run"

### Option 2: Update Existing File

The original file `analytics_views.sql` has been updated. Just re-run it:

1. Open `staff-portal-api/src/database/analytics_views.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click "Run"

## Verification

After running the fixed script, verify it worked:

```sql
-- Check if views were created
SELECT schemaname, matviewname 
FROM pg_matviews 
WHERE schemaname = 'staff_portal';

-- Should show 4 views:
-- - daily_donation_stats
-- - monthly_donor_stats
-- - center_performance_stats
-- - staff_productivity_stats
```

## Note

The `donation_centers` table structure:
- ✅ `center_id` (uuid)
- ✅ `name` (varchar)
- ✅ `address` (text)
- ✅ `city` (varchar)
- ✅ `country` (varchar)
- ✅ `contact_phone` (varchar)
- ✅ `email` (varchar)
- ✅ `is_active` (boolean)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

**Does NOT have:**
- ❌ `center_type`
- ❌ `region`

If you need `center_type` and `region`, those are in the `staff_portal.avis_centers` table (different table).

