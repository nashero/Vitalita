# Fix for donation_id Error

## Issue

The `analytics_views.sql` script was trying to use `dh.donation_id` which doesn't exist in the `donation_history` table.

## Root Cause

The `donation_history` table uses `history_id` as the primary key, NOT `donation_id`.

**Actual table structure:**
```sql
CREATE TABLE donation_history (
  history_id UUID PRIMARY KEY,  -- ✅ This is the primary key
  donor_hash_id VARCHAR NOT NULL,
  appointment_id UUID NOT NULL,
  donation_date TIMESTAMPTZ NOT NULL,
  donation_type VARCHAR NOT NULL,
  donation_volume INTEGER NOT NULL,
  donation_center_id UUID NOT NULL,
  staff_id UUID,
  status VARCHAR DEFAULT 'completed',
  notes TEXT,
  completion_timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Solution

All references to `dh.donation_id` have been changed to `dh.history_id` in:
1. ✅ `analytics_views.sql` - Materialized views
2. ✅ `analytics.controller.ts` - API queries

## What Changed

**Before (Error):**
```sql
COUNT(DISTINCT dh.donation_id) as total_donations  -- ❌ Column doesn't exist
```

**After (Fixed):**
```sql
COUNT(DISTINCT dh.history_id) as total_donations  -- ✅ Correct column
```

## Files Updated

1. **staff-portal-api/src/database/analytics_views.sql**
   - Line 50: `center_performance_stats` view
   - Line 79: `staff_productivity_stats` view

2. **staff-portal-api/src/controllers/analytics.controller.ts**
   - Line 58-60: Dashboard metrics query
   - Line 343: Center performance query
   - Line 409: Staff productivity query
   - Line 422: HAVING clause

## How to Fix

The files have already been updated. Just re-run the script:

1. Open `staff-portal-api/src/database/analytics_views.sql`
2. Copy the entire file
3. Paste into Supabase SQL Editor
4. Click "Run"

The script should now work without errors!

## Verification

After running, verify the views were created:

```sql
-- Check views
SELECT schemaname, matviewname 
FROM pg_matviews 
WHERE schemaname = 'staff_portal';

-- Should show 4 views:
-- - daily_donation_stats
-- - monthly_donor_stats
-- - center_performance_stats
-- - staff_productivity_stats
```

