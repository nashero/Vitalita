/**
 * Cron Job Setup for Analytics Refresh
 * 
 * This script sets up a cron job to refresh materialized views daily
 * Run this using pg_cron extension or external scheduler
 */

-- Example: Refresh views daily at 2 AM
-- SELECT cron.schedule('refresh-analytics-views', '0 2 * * *', 'SELECT staff_portal.refresh_analytics_views()');

-- Alternative: Use PostgreSQL's pg_cron extension
-- Requires: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Manual refresh (for testing)
-- SELECT staff_portal.refresh_analytics_views();

-- For production, set up using:
-- 1. pg_cron extension (PostgreSQL)
-- 2. External cron job (crontab)
-- 3. Node.js cron library (node-cron)

