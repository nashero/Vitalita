/*
  # Rollback Staff Portal Schema

  This migration rolls back the staff_portal schema creation by:
  1. Dropping all tables in reverse dependency order
  2. Dropping all functions
  3. Dropping the schema

  WARNING: This will permanently delete all data in the staff_portal schema!
  Only run this if you need to completely remove the staff portal system.
*/

-- Set search path to include staff_portal schema
SET search_path TO staff_portal, public;

/*
  ============================================================================
  DROP TABLES (in reverse dependency order)
  ============================================================================
*/

-- Drop audit_logs first (no dependencies)
DROP TABLE IF EXISTS staff_portal.audit_logs CASCADE;

-- Drop junction tables
DROP TABLE IF EXISTS staff_portal.role_permissions CASCADE;
DROP TABLE IF EXISTS staff_portal.user_roles CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS staff_portal.users CASCADE;
DROP TABLE IF EXISTS staff_portal.permissions CASCADE;
DROP TABLE IF EXISTS staff_portal.roles CASCADE;
DROP TABLE IF EXISTS staff_portal.avis_centers CASCADE;

/*
  ============================================================================
  DROP FUNCTIONS
  ============================================================================
*/

DROP FUNCTION IF EXISTS staff_portal.update_updated_at() CASCADE;

/*
  ============================================================================
  DROP SCHEMA
  ============================================================================
*/

DROP SCHEMA IF EXISTS staff_portal CASCADE;

-- Reset search path
RESET search_path;

