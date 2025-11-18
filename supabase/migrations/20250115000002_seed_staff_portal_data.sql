/*
  # Seed Staff Portal Data for AVIS Organization

  This migration populates the staff_portal schema with comprehensive AVIS roles,
  permissions, and role-permission mappings based on typical AVIS organizational
  structure and responsibilities.

  Run this migration after creating the staff_portal schema.
*/

-- Set search path to include staff_portal schema
SET search_path TO staff_portal, public;

/*
  ============================================================================
  INSERT AVIS ROLES
  ============================================================================
  Comprehensive list of AVIS organizational roles organized by category
*/

-- Executive Leadership Roles
INSERT INTO staff_portal.roles (role_name, role_code, description, role_category, is_system_role) VALUES
  (
    'President',
    'PRESIDENT',
    'Strategic direction and external representation. Ultimate authority for AVIS operations and policy decisions. Represents organization in public forums and coordinates with national/international blood donation organizations.',
    'Executive',
    true
  ),
  (
    'Vice President',
    'VP',
    'Second-in-command supporting the President. Assumes presidential duties when President is unavailable. Oversees strategic initiatives and cross-functional projects.',
    'Executive',
    true
  ),
  (
    'Secretary',
    'SECRETARY',
    'Manages documentation, official communications, and meeting records. Maintains organizational records and ensures proper documentation of decisions and policies.',
    'Executive',
    true
  ),
  (
    'Treasurer',
    'TREASURER',
    'Financial oversight and budget management. Monitors financial health, approves expenditures, and ensures compliance with financial regulations and reporting requirements.',
    'Executive',
    true
  ),
  (
    'Executive Committee Member',
    'EXEC_COMMITTEE',
    'Member of the executive committee participating in high-level decision making, policy development, and strategic planning for AVIS operations.',
    'Executive',
    true
  )
ON CONFLICT (role_code) DO UPDATE
SET 
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description,
  role_category = EXCLUDED.role_category,
  updated_at = now();

-- Medical Staff Roles
INSERT INTO staff_portal.roles (role_name, role_code, description, role_category, is_system_role) VALUES
  (
    'Health Care Director',
    'HCD',
    'Ultimate medical responsibility for all health care policies and procedures. Oversees medical staff, ensures compliance with health regulations, and maintains medical standards across all AVIS operations.',
    'Medical',
    true
  ),
  (
    'Selection Physician',
    'SELECTION_PHYSICIAN',
    'Conducts donor eligibility assessments and medical evaluations. Makes final decisions on donor suitability based on medical history, physical examination, and test results.',
    'Medical',
    true
  ),
  (
    'Registered Nurse',
    'REGISTERED_NURSE',
    'Provides direct donor care during blood collection. Monitors donor vital signs, manages collection process, and ensures donor safety throughout the donation procedure.',
    'Medical',
    true
  ),
  (
    'Nurse Coordinator',
    'NURSE_COORDINATOR',
    'Coordinates nursing staff schedules, assignments, and training. Ensures adequate staffing levels and maintains nursing standards and protocols.',
    'Medical',
    true
  ),
  (
    'Phlebotomist',
    'PHLEBOTOMIST',
    'Specialized in blood collection techniques. Performs venipuncture, ensures proper collection procedures, and maintains sterile techniques during blood draws.',
    'Medical',
    true
  ),
  (
    'Laboratory Technician',
    'LAB_TECH',
    'Processes collected blood units, performs testing, and ensures quality control. Handles blood typing, infectious disease screening, and maintains laboratory equipment.',
    'Medical',
    true
  )
ON CONFLICT (role_code) DO UPDATE
SET 
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description,
  role_category = EXCLUDED.role_category,
  updated_at = now();

-- Operational Roles
INSERT INTO staff_portal.roles (role_name, role_code, description, role_category, is_system_role) VALUES
  (
    'Volunteer Coordinator',
    'VOL_COORDINATOR',
    'Recruits, trains, and manages volunteers. Coordinates volunteer schedules, assigns tasks, and maintains volunteer engagement and recognition programs.',
    'Operational',
    true
  ),
  (
    'Quality Assurance Officer',
    'QA_OFFICER',
    'Ensures compliance with quality standards and regulations. Conducts audits, reviews procedures, and implements quality improvement initiatives.',
    'Operational',
    true
  ),
  (
    'Donor Ambassador',
    'DONOR_AMBASSADOR',
    'Manages donor intake process, conducts initial screenings, and provides donor education. First point of contact for new and returning donors.',
    'Operational',
    true
  ),
  (
    'Youth Committee Member',
    'YOUTH_COMMITTEE',
    'Focuses on recruiting and engaging young donors. Organizes youth-focused events, educational programs, and maintains relationships with schools and youth organizations.',
    'Operational',
    true
  ),
  (
    'Mobile Unit Coordinator',
    'MOBILE_COORDINATOR',
    'Manages mobile blood collection operations. Coordinates mobile unit schedules, locations, staffing, and ensures mobile units meet all operational and safety requirements.',
    'Operational',
    true
  )
ON CONFLICT (role_code) DO UPDATE
SET 
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description,
  role_category = EXCLUDED.role_category,
  updated_at = now();

-- Administrative Roles
INSERT INTO staff_portal.roles (role_name, role_code, description, role_category, is_system_role) VALUES
  (
    'Administrative Assistant',
    'ADMIN_ASSISTANT',
    'Handles clerical tasks, data entry, and administrative support. Manages documents, schedules meetings, and provides general office support.',
    'Administrative',
    true
  ),
  (
    'IT Specialist',
    'IT_SPECIALIST',
    'Manages technology infrastructure, system maintenance, and technical support. Ensures system security, data backup, and resolves technical issues.',
    'Administrative',
    true
  ),
  (
    'Communications Officer',
    'COMM_OFFICER',
    'Manages public relations, marketing, and communications. Develops communication strategies, manages social media, and coordinates public awareness campaigns.',
    'Administrative',
    true
  ),
  (
    'Training Coordinator',
    'TRAINING_COORD',
    'Develops and delivers staff training programs. Maintains training records, ensures staff competency, and coordinates continuing education requirements.',
    'Administrative',
    true
  )
ON CONFLICT (role_code) DO UPDATE
SET 
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description,
  role_category = EXCLUDED.role_category,
  updated_at = now();

/*
  ============================================================================
  INSERT COMPREHENSIVE PERMISSIONS
  ============================================================================
  Granular permissions for all resources and actions
*/

-- Appointments Permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('appointments:view', 'appointments', 'view', 'View appointment schedules and details'),
  ('appointments:create', 'appointments', 'create', 'Create new appointments for donors'),
  ('appointments:update', 'appointments', 'update', 'Update existing appointment details and times'),
  ('appointments:cancel', 'appointments', 'cancel', 'Cancel appointments when necessary'),
  ('appointments:manage', 'appointments', 'manage', 'Full appointment management including all CRUD operations')
ON CONFLICT (permission_name) DO UPDATE
SET 
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  updated_at = now();

-- Donors Permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('donors:view_list', 'donors', 'view_list', 'View list of donors with basic information'),
  ('donors:view_details', 'donors', 'view_details', 'View detailed donor profile information'),
  ('donors:view_medical', 'donors', 'view_medical', 'View donor medical history and eligibility information (restricted access)'),
  ('donors:update', 'donors', 'update', 'Update donor information and records'),
  ('donors:create', 'donors', 'create', 'Create new donor records'),
  ('donors:delete', 'donors', 'delete', 'Delete donor records (typically restricted)'),
  ('donors:manage', 'donors', 'manage', 'Full donor management including all operations')
ON CONFLICT (permission_name) DO UPDATE
SET 
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  updated_at = now();

-- Financial Permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('financial:view', 'financial', 'view', 'View financial reports and budget information'),
  ('financial:manage_budget', 'financial', 'manage_budget', 'Create and modify budget allocations'),
  ('financial:approve_expenses', 'financial', 'approve_expenses', 'Approve expense requests and reimbursements'),
  ('financial:manage', 'financial', 'manage', 'Full financial management access')
ON CONFLICT (permission_name) DO UPDATE
SET 
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  updated_at = now();

-- Staff Permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('staff:view', 'staff', 'view', 'View staff member profiles and information'),
  ('staff:manage', 'staff', 'manage', 'Create, update, and manage staff accounts'),
  ('staff:assign_roles', 'staff', 'assign_roles', 'Assign and modify roles for staff members'),
  ('staff:view_schedules', 'staff', 'view_schedules', 'View staff schedules and assignments')
ON CONFLICT (permission_name) DO UPDATE
SET 
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  updated_at = now();

-- Analytics Permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('analytics:view', 'analytics', 'view', 'View analytics dashboards and reports'),
  ('analytics:export', 'analytics', 'export', 'Export analytics data and reports'),
  ('analytics:generate', 'analytics', 'generate', 'Generate custom analytics reports')
ON CONFLICT (permission_name) DO UPDATE
SET 
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  updated_at = now();

-- Settings Permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('settings:view', 'settings', 'view', 'View center and system settings'),
  ('settings:manage_center', 'settings', 'manage_center', 'Modify center-specific settings and configurations'),
  ('settings:manage_system', 'settings', 'manage_system', 'Modify system-wide settings (restricted access)')
ON CONFLICT (permission_name) DO UPDATE
SET 
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  updated_at = now();

-- Audit Permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('audit:view', 'audit', 'view', 'View audit logs and activity history'),
  ('audit:export', 'audit', 'export', 'Export audit log data for compliance reporting')
ON CONFLICT (permission_name) DO UPDATE
SET 
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description,
  updated_at = now();

-- Additional Permissions (from original schema)
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  ('users:view', 'users', 'view', 'View user profiles'),
  ('users:create', 'users', 'create', 'Create new user accounts'),
  ('users:update', 'users', 'update', 'Update user information'),
  ('users:delete', 'users', 'delete', 'Delete user accounts'),
  ('users:manage', 'users', 'manage', 'Full user management access'),
  ('roles:view', 'roles', 'view', 'View role definitions'),
  ('roles:create', 'roles', 'create', 'Create new roles'),
  ('roles:update', 'roles', 'update', 'Update role information'),
  ('roles:delete', 'roles', 'delete', 'Delete roles'),
  ('roles:manage', 'roles', 'manage', 'Full role management access'),
  ('permissions:view', 'permissions', 'view', 'View permission definitions'),
  ('permissions:manage', 'permissions', 'manage', 'Full permission management access'),
  ('centers:view', 'centers', 'view', 'View AVIS center information'),
  ('centers:create', 'centers', 'create', 'Create new AVIS centers'),
  ('centers:update', 'centers', 'update', 'Update center information'),
  ('centers:delete', 'centers', 'delete', 'Delete centers'),
  ('centers:manage', 'centers', 'manage', 'Full center management access'),
  ('reports:view', 'reports', 'view', 'View reports and analytics'),
  ('reports:generate', 'reports', 'generate', 'Generate custom reports'),
  ('reports:export', 'reports', 'export', 'Export report data'),
  ('system:admin', 'system', 'admin', 'Full system administration access'),
  ('system:config', 'system', 'config', 'Configure system settings')
ON CONFLICT (permission_name) DO NOTHING;

/*
  ============================================================================
  MAP PERMISSIONS TO ROLES
  ============================================================================
  Assign permissions to roles based on typical responsibilities
*/

DO $$
DECLARE
  -- Role IDs
  president_id uuid;
  vp_id uuid;
  secretary_id uuid;
  treasurer_id uuid;
  exec_committee_id uuid;
  hcd_id uuid;
  selection_physician_id uuid;
  registered_nurse_id uuid;
  nurse_coordinator_id uuid;
  phlebotomist_id uuid;
  lab_tech_id uuid;
  vol_coordinator_id uuid;
  qa_officer_id uuid;
  donor_ambassador_id uuid;
  youth_committee_id uuid;
  mobile_coordinator_id uuid;
  admin_assistant_id uuid;
  it_specialist_id uuid;
  comm_officer_id uuid;
  training_coord_id uuid;
  
  -- Permission IDs
  appointments_view_id uuid;
  appointments_create_id uuid;
  appointments_update_id uuid;
  appointments_cancel_id uuid;
  appointments_manage_id uuid;
  donors_view_list_id uuid;
  donors_view_details_id uuid;
  donors_view_medical_id uuid;
  donors_update_id uuid;
  donors_create_id uuid;
  donors_manage_id uuid;
  financial_view_id uuid;
  financial_manage_budget_id uuid;
  financial_approve_expenses_id uuid;
  financial_manage_id uuid;
  staff_view_id uuid;
  staff_manage_id uuid;
  staff_assign_roles_id uuid;
  staff_view_schedules_id uuid;
  analytics_view_id uuid;
  analytics_export_id uuid;
  analytics_generate_id uuid;
  settings_view_id uuid;
  settings_manage_center_id uuid;
  settings_manage_system_id uuid;
  audit_view_id uuid;
  audit_export_id uuid;
  centers_view_id uuid;
  centers_manage_id uuid;
  reports_view_id uuid;
  reports_generate_id uuid;
  reports_export_id uuid;
  system_admin_id uuid;
  system_config_id uuid;
BEGIN
  -- Get Role IDs
  SELECT role_id INTO president_id FROM staff_portal.roles WHERE role_code = 'PRESIDENT';
  SELECT role_id INTO vp_id FROM staff_portal.roles WHERE role_code = 'VP';
  SELECT role_id INTO secretary_id FROM staff_portal.roles WHERE role_code = 'SECRETARY';
  SELECT role_id INTO treasurer_id FROM staff_portal.roles WHERE role_code = 'TREASURER';
  SELECT role_id INTO exec_committee_id FROM staff_portal.roles WHERE role_code = 'EXEC_COMMITTEE';
  SELECT role_id INTO hcd_id FROM staff_portal.roles WHERE role_code = 'HCD';
  SELECT role_id INTO selection_physician_id FROM staff_portal.roles WHERE role_code = 'SELECTION_PHYSICIAN';
  SELECT role_id INTO registered_nurse_id FROM staff_portal.roles WHERE role_code = 'REGISTERED_NURSE';
  SELECT role_id INTO nurse_coordinator_id FROM staff_portal.roles WHERE role_code = 'NURSE_COORDINATOR';
  SELECT role_id INTO phlebotomist_id FROM staff_portal.roles WHERE role_code = 'PHLEBOTOMIST';
  SELECT role_id INTO lab_tech_id FROM staff_portal.roles WHERE role_code = 'LAB_TECH';
  SELECT role_id INTO vol_coordinator_id FROM staff_portal.roles WHERE role_code = 'VOL_COORDINATOR';
  SELECT role_id INTO qa_officer_id FROM staff_portal.roles WHERE role_code = 'QA_OFFICER';
  SELECT role_id INTO donor_ambassador_id FROM staff_portal.roles WHERE role_code = 'DONOR_AMBASSADOR';
  SELECT role_id INTO youth_committee_id FROM staff_portal.roles WHERE role_code = 'YOUTH_COMMITTEE';
  SELECT role_id INTO mobile_coordinator_id FROM staff_portal.roles WHERE role_code = 'MOBILE_COORDINATOR';
  SELECT role_id INTO admin_assistant_id FROM staff_portal.roles WHERE role_code = 'ADMIN_ASSISTANT';
  SELECT role_id INTO it_specialist_id FROM staff_portal.roles WHERE role_code = 'IT_SPECIALIST';
  SELECT role_id INTO comm_officer_id FROM staff_portal.roles WHERE role_code = 'COMM_OFFICER';
  SELECT role_id INTO training_coord_id FROM staff_portal.roles WHERE role_code = 'TRAINING_COORD';
  
  -- Get Permission IDs
  SELECT permission_id INTO appointments_view_id FROM staff_portal.permissions WHERE permission_name = 'appointments:view';
  SELECT permission_id INTO appointments_create_id FROM staff_portal.permissions WHERE permission_name = 'appointments:create';
  SELECT permission_id INTO appointments_update_id FROM staff_portal.permissions WHERE permission_name = 'appointments:update';
  SELECT permission_id INTO appointments_cancel_id FROM staff_portal.permissions WHERE permission_name = 'appointments:cancel';
  SELECT permission_id INTO appointments_manage_id FROM staff_portal.permissions WHERE permission_name = 'appointments:manage';
  SELECT permission_id INTO donors_view_list_id FROM staff_portal.permissions WHERE permission_name = 'donors:view_list';
  SELECT permission_id INTO donors_view_details_id FROM staff_portal.permissions WHERE permission_name = 'donors:view_details';
  SELECT permission_id INTO donors_view_medical_id FROM staff_portal.permissions WHERE permission_name = 'donors:view_medical';
  SELECT permission_id INTO donors_update_id FROM staff_portal.permissions WHERE permission_name = 'donors:update';
  SELECT permission_id INTO donors_create_id FROM staff_portal.permissions WHERE permission_name = 'donors:create';
  SELECT permission_id INTO donors_manage_id FROM staff_portal.permissions WHERE permission_name = 'donors:manage';
  SELECT permission_id INTO financial_view_id FROM staff_portal.permissions WHERE permission_name = 'financial:view';
  SELECT permission_id INTO financial_manage_budget_id FROM staff_portal.permissions WHERE permission_name = 'financial:manage_budget';
  SELECT permission_id INTO financial_approve_expenses_id FROM staff_portal.permissions WHERE permission_name = 'financial:approve_expenses';
  SELECT permission_id INTO financial_manage_id FROM staff_portal.permissions WHERE permission_name = 'financial:manage';
  SELECT permission_id INTO staff_view_id FROM staff_portal.permissions WHERE permission_name = 'staff:view';
  SELECT permission_id INTO staff_manage_id FROM staff_portal.permissions WHERE permission_name = 'staff:manage';
  SELECT permission_id INTO staff_assign_roles_id FROM staff_portal.permissions WHERE permission_name = 'staff:assign_roles';
  SELECT permission_id INTO staff_view_schedules_id FROM staff_portal.permissions WHERE permission_name = 'staff:view_schedules';
  SELECT permission_id INTO analytics_view_id FROM staff_portal.permissions WHERE permission_name = 'analytics:view';
  SELECT permission_id INTO analytics_export_id FROM staff_portal.permissions WHERE permission_name = 'analytics:export';
  SELECT permission_id INTO analytics_generate_id FROM staff_portal.permissions WHERE permission_name = 'analytics:generate';
  SELECT permission_id INTO settings_view_id FROM staff_portal.permissions WHERE permission_name = 'settings:view';
  SELECT permission_id INTO settings_manage_center_id FROM staff_portal.permissions WHERE permission_name = 'settings:manage_center';
  SELECT permission_id INTO settings_manage_system_id FROM staff_portal.permissions WHERE permission_name = 'settings:manage_system';
  SELECT permission_id INTO audit_view_id FROM staff_portal.permissions WHERE permission_name = 'audit:view';
  SELECT permission_id INTO audit_export_id FROM staff_portal.permissions WHERE permission_name = 'audit:export';
  SELECT permission_id INTO centers_view_id FROM staff_portal.permissions WHERE permission_name = 'centers:view';
  SELECT permission_id INTO centers_manage_id FROM staff_portal.permissions WHERE permission_name = 'centers:manage';
  SELECT permission_id INTO reports_view_id FROM staff_portal.permissions WHERE permission_name = 'reports:view';
  SELECT permission_id INTO reports_generate_id FROM staff_portal.permissions WHERE permission_name = 'reports:generate';
  SELECT permission_id INTO reports_export_id FROM staff_portal.permissions WHERE permission_name = 'reports:export';
  SELECT permission_id INTO system_admin_id FROM staff_portal.permissions WHERE permission_name = 'system:admin';
  SELECT permission_id INTO system_config_id FROM staff_portal.permissions WHERE permission_name = 'system:config';

  /*
    ========================================================================
    EXECUTIVE LEADERSHIP PERMISSIONS
    ========================================================================
  */
  
  -- President: Full access to everything
  IF president_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id)
    SELECT president_id, permission_id FROM staff_portal.permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Vice President: Nearly full access, except system admin
  IF vp_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id)
    SELECT vp_id, permission_id FROM staff_portal.permissions
    WHERE permission_name NOT IN ('system:admin', 'system:config')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Secretary: View and manage documentation, appointments, donors
  IF secretary_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (secretary_id, appointments_view_id),
      (secretary_id, appointments_create_id),
      (secretary_id, appointments_update_id),
      (secretary_id, appointments_cancel_id),
      (secretary_id, donors_view_list_id),
      (secretary_id, donors_view_details_id),
      (secretary_id, donors_update_id),
      (secretary_id, staff_view_id),
      (secretary_id, analytics_view_id),
      (secretary_id, reports_view_id),
      (secretary_id, reports_generate_id),
      (secretary_id, audit_view_id),
      (secretary_id, centers_view_id),
      (secretary_id, settings_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Treasurer: Financial management, view reports and analytics
  IF treasurer_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (treasurer_id, financial_view_id),
      (treasurer_id, financial_manage_budget_id),
      (treasurer_id, financial_approve_expenses_id),
      (treasurer_id, financial_manage_id),
      (treasurer_id, analytics_view_id),
      (treasurer_id, analytics_export_id),
      (treasurer_id, analytics_generate_id),
      (treasurer_id, reports_view_id),
      (treasurer_id, reports_generate_id),
      (treasurer_id, reports_export_id),
      (treasurer_id, audit_view_id),
      (treasurer_id, centers_view_id),
      (treasurer_id, settings_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Executive Committee Member: Strategic view access
  IF exec_committee_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (exec_committee_id, appointments_view_id),
      (exec_committee_id, donors_view_list_id),
      (exec_committee_id, financial_view_id),
      (exec_committee_id, staff_view_id),
      (exec_committee_id, analytics_view_id),
      (exec_committee_id, analytics_export_id),
      (exec_committee_id, reports_view_id),
      (exec_committee_id, reports_generate_id),
      (exec_committee_id, centers_view_id),
      (exec_committee_id, settings_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  /*
    ========================================================================
    MEDICAL STAFF PERMISSIONS
    ========================================================================
  */
  
  -- Health Care Director: Full medical and operational access
  IF hcd_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (hcd_id, appointments_view_id),
      (hcd_id, appointments_create_id),
      (hcd_id, appointments_update_id),
      (hcd_id, appointments_cancel_id),
      (hcd_id, appointments_manage_id),
      (hcd_id, donors_view_list_id),
      (hcd_id, donors_view_details_id),
      (hcd_id, donors_view_medical_id),
      (hcd_id, donors_update_id),
      (hcd_id, donors_create_id),
      (hcd_id, donors_manage_id),
      (hcd_id, staff_view_id),
      (hcd_id, staff_manage_id),
      (hcd_id, analytics_view_id),
      (hcd_id, analytics_export_id),
      (hcd_id, reports_view_id),
      (hcd_id, reports_generate_id),
      (hcd_id, audit_view_id),
      (hcd_id, centers_view_id),
      (hcd_id, settings_view_id),
      (hcd_id, settings_manage_center_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Selection Physician: Medical evaluations and donor eligibility
  IF selection_physician_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (selection_physician_id, appointments_view_id),
      (selection_physician_id, donors_view_list_id),
      (selection_physician_id, donors_view_details_id),
      (selection_physician_id, donors_view_medical_id),
      (selection_physician_id, donors_update_id),
      (selection_physician_id, donors_create_id),
      (selection_physician_id, analytics_view_id),
      (selection_physician_id, reports_view_id),
      (selection_physician_id, audit_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Registered Nurse: Donor care and monitoring
  IF registered_nurse_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (registered_nurse_id, appointments_view_id),
      (registered_nurse_id, appointments_create_id),
      (registered_nurse_id, appointments_update_id),
      (registered_nurse_id, donors_view_list_id),
      (registered_nurse_id, donors_view_details_id),
      (registered_nurse_id, donors_view_medical_id),
      (registered_nurse_id, donors_update_id),
      (registered_nurse_id, analytics_view_id),
      (registered_nurse_id, reports_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Nurse Coordinator: Staff coordination and scheduling
  IF nurse_coordinator_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (nurse_coordinator_id, appointments_view_id),
      (nurse_coordinator_id, appointments_create_id),
      (nurse_coordinator_id, appointments_update_id),
      (nurse_coordinator_id, appointments_cancel_id),
      (nurse_coordinator_id, donors_view_list_id),
      (nurse_coordinator_id, donors_view_details_id),
      (nurse_coordinator_id, donors_view_medical_id),
      (nurse_coordinator_id, donors_update_id),
      (nurse_coordinator_id, staff_view_id),
      (nurse_coordinator_id, staff_view_schedules_id),
      (nurse_coordinator_id, analytics_view_id),
      (nurse_coordinator_id, reports_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Phlebotomist: Blood collection operations
  IF phlebotomist_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (phlebotomist_id, appointments_view_id),
      (phlebotomist_id, appointments_update_id),
      (phlebotomist_id, donors_view_list_id),
      (phlebotomist_id, donors_view_details_id),
      (phlebotomist_id, donors_update_id),
      (phlebotomist_id, analytics_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Laboratory Technician: Blood processing and testing
  IF lab_tech_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (lab_tech_id, donors_view_list_id),
      (lab_tech_id, donors_view_details_id),
      (lab_tech_id, donors_view_medical_id),
      (lab_tech_id, donors_update_id),
      (lab_tech_id, analytics_view_id),
      (lab_tech_id, reports_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  /*
    ========================================================================
    OPERATIONAL STAFF PERMISSIONS
    ========================================================================
  */
  
  -- Volunteer Coordinator: Volunteer management
  IF vol_coordinator_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (vol_coordinator_id, appointments_view_id),
      (vol_coordinator_id, appointments_create_id),
      (vol_coordinator_id, donors_view_list_id),
      (vol_coordinator_id, staff_view_id),
      (vol_coordinator_id, analytics_view_id),
      (vol_coordinator_id, reports_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Quality Assurance Officer: Compliance and quality control
  IF qa_officer_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (qa_officer_id, appointments_view_id),
      (qa_officer_id, donors_view_list_id),
      (qa_officer_id, donors_view_details_id),
      (qa_officer_id, donors_view_medical_id),
      (qa_officer_id, staff_view_id),
      (qa_officer_id, analytics_view_id),
      (qa_officer_id, analytics_export_id),
      (qa_officer_id, reports_view_id),
      (qa_officer_id, reports_generate_id),
      (qa_officer_id, audit_view_id),
      (qa_officer_id, audit_export_id),
      (qa_officer_id, centers_view_id),
      (qa_officer_id, settings_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Donor Ambassador: Donor intake and initial contact
  IF donor_ambassador_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (donor_ambassador_id, appointments_view_id),
      (donor_ambassador_id, appointments_create_id),
      (donor_ambassador_id, donors_view_list_id),
      (donor_ambassador_id, donors_view_details_id),
      (donor_ambassador_id, donors_create_id),
      (donor_ambassador_id, donors_update_id),
      (donor_ambassador_id, analytics_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Youth Committee Member: Youth donor recruitment
  IF youth_committee_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (youth_committee_id, appointments_view_id),
      (youth_committee_id, appointments_create_id),
      (youth_committee_id, donors_view_list_id),
      (youth_committee_id, donors_create_id),
      (youth_committee_id, analytics_view_id),
      (youth_committee_id, reports_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Mobile Unit Coordinator: Mobile operations management
  IF mobile_coordinator_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (mobile_coordinator_id, appointments_view_id),
      (mobile_coordinator_id, appointments_create_id),
      (mobile_coordinator_id, appointments_update_id),
      (mobile_coordinator_id, appointments_cancel_id),
      (mobile_coordinator_id, donors_view_list_id),
      (mobile_coordinator_id, donors_view_details_id),
      (mobile_coordinator_id, staff_view_id),
      (mobile_coordinator_id, analytics_view_id),
      (mobile_coordinator_id, reports_view_id),
      (mobile_coordinator_id, centers_view_id),
      (mobile_coordinator_id, settings_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  /*
    ========================================================================
    ADMINISTRATIVE STAFF PERMISSIONS
    ========================================================================
  */
  
  -- Administrative Assistant: Clerical and data entry
  IF admin_assistant_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (admin_assistant_id, appointments_view_id),
      (admin_assistant_id, appointments_create_id),
      (admin_assistant_id, appointments_update_id),
      (admin_assistant_id, donors_view_list_id),
      (admin_assistant_id, donors_view_details_id),
      (admin_assistant_id, donors_create_id),
      (admin_assistant_id, donors_update_id),
      (admin_assistant_id, staff_view_id),
      (admin_assistant_id, analytics_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- IT Specialist: System administration and technical support
  IF it_specialist_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (it_specialist_id, staff_view_id),
      (it_specialist_id, analytics_view_id),
      (it_specialist_id, audit_view_id),
      (it_specialist_id, audit_export_id),
      (it_specialist_id, centers_view_id),
      (it_specialist_id, settings_view_id),
      (it_specialist_id, settings_manage_system_id),
      (it_specialist_id, system_config_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Communications Officer: Public relations and marketing
  IF comm_officer_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (comm_officer_id, appointments_view_id),
      (comm_officer_id, donors_view_list_id),
      (comm_officer_id, analytics_view_id),
      (comm_officer_id, analytics_export_id),
      (comm_officer_id, reports_view_id),
      (comm_officer_id, reports_generate_id),
      (comm_officer_id, centers_view_id),
      (comm_officer_id, settings_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- Training Coordinator: Staff training and development
  IF training_coord_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id) VALUES
      (training_coord_id, staff_view_id),
      (training_coord_id, staff_manage_id),
      (training_coord_id, appointments_view_id),
      (training_coord_id, donors_view_list_id),
      (training_coord_id, analytics_view_id),
      (training_coord_id, reports_view_id),
      (training_coord_id, centers_view_id),
      (training_coord_id, settings_view_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

END $$;

-- Reset search path
RESET search_path;

