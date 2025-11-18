# Staff Portal Seed Data Documentation

## Overview

The seed data script (`20250115000002_seed_staff_portal_data.sql`) populates the staff portal with comprehensive AVIS roles, permissions, and role-permission mappings.

## Roles Created

### Executive Leadership (5 roles)

1. **President** (`PRESIDENT`)
   - Strategic direction and external representation
   - Full system access

2. **Vice President** (`VP`)
   - Second-in-command
   - Nearly full access (except system admin)

3. **Secretary** (`SECRETARY`)
   - Documentation and communications
   - View and manage appointments, donors, reports

4. **Treasurer** (`TREASURER`)
   - Financial oversight
   - Budget management, expense approval, financial reports

5. **Executive Committee Member** (`EXEC_COMMITTEE`)
   - Strategic decision making
   - View access to key operational data

### Medical Staff (6 roles)

1. **Health Care Director** (`HCD`)
   - Ultimate medical responsibility
   - Full medical and operational access

2. **Selection Physician** (`SELECTION_PHYSICIAN`)
   - Donor eligibility assessments
   - View and update donor medical information

3. **Registered Nurse** (`REGISTERED_NURSE`)
   - Direct donor care during collection
   - View and update donor information, manage appointments

4. **Nurse Coordinator** (`NURSE_COORDINATOR`)
   - Staff coordination and scheduling
   - Manage appointments, view staff schedules

5. **Phlebotomist** (`PHLEBOTOMIST`)
   - Blood collection specialist
   - View appointments and update donor records

6. **Laboratory Technician** (`LAB_TECH`)
   - Blood processing and testing
   - View and update donor medical information

### Operational Staff (5 roles)

1. **Volunteer Coordinator** (`VOL_COORDINATOR`)
   - Manages volunteers
   - View appointments, donors, and staff

2. **Quality Assurance Officer** (`QA_OFFICER`)
   - Compliance and quality control
   - View all data, generate compliance reports, audit access

3. **Donor Ambassador** (`DONOR_AMBASSADOR`)
   - Donor intake process
   - Create and update donor records, manage appointments

4. **Youth Committee Member** (`YOUTH_COMMITTEE`)
   - Youth donor recruitment
   - Create donors, view appointments and reports

5. **Mobile Unit Coordinator** (`MOBILE_COORDINATOR`)
   - Mobile operations management
   - Full appointment management, view centers and settings

### Administrative Staff (4 roles)

1. **Administrative Assistant** (`ADMIN_ASSISTANT`)
   - Clerical tasks and data entry
   - Create and update appointments and donors

2. **IT Specialist** (`IT_SPECIALIST`)
   - Technology infrastructure
   - System configuration, audit access, technical support

3. **Communications Officer** (`COMM_OFFICER`)
   - Public relations and marketing
   - View analytics, generate reports, center information

4. **Training Coordinator** (`TRAINING_COORD`)
   - Staff training and development
   - Manage staff, view training-related data

## Permissions Created

### Appointments (5 permissions)
- `appointments:view` - View schedules
- `appointments:create` - Create appointments
- `appointments:update` - Update details
- `appointments:cancel` - Cancel appointments
- `appointments:manage` - Full management

### Donors (7 permissions)
- `donors:view_list` - View donor list
- `donors:view_details` - View detailed profiles
- `donors:view_medical` - View medical history (restricted)
- `donors:update` - Update donor information
- `donors:create` - Create new donors
- `donors:delete` - Delete records (restricted)
- `donors:manage` - Full management

### Financial (4 permissions)
- `financial:view` - View financial data
- `financial:manage_budget` - Budget management
- `financial:approve_expenses` - Expense approval
- `financial:manage` - Full financial access

### Staff (4 permissions)
- `staff:view` - View staff profiles
- `staff:manage` - Manage staff accounts
- `staff:assign_roles` - Assign roles
- `staff:view_schedules` - View schedules

### Analytics (3 permissions)
- `analytics:view` - View dashboards
- `analytics:export` - Export data
- `analytics:generate` - Generate reports

### Settings (3 permissions)
- `settings:view` - View settings
- `settings:manage_center` - Manage center settings
- `settings:manage_system` - System settings (restricted)

### Audit (2 permissions)
- `audit:view` - View audit logs
- `audit:export` - Export audit data

### Additional Permissions
- Users, Roles, Permissions, Centers, Reports, System administration

## Permission Mappings

### Full Access Roles
- **President**: All permissions
- **Vice President**: All except system admin

### Medical Access Roles
- **Health Care Director**: Full medical and operational access
- **Selection Physician**: Medical evaluations and donor eligibility
- **Registered Nurse**: Donor care and monitoring
- **Nurse Coordinator**: Staff coordination with medical access
- **Phlebotomist**: Blood collection operations
- **Laboratory Technician**: Blood processing access

### Financial Access Roles
- **Treasurer**: Full financial management

### Operational Access Roles
- **Quality Assurance Officer**: Compliance and audit access
- **Mobile Unit Coordinator**: Mobile operations management
- **Volunteer Coordinator**: Volunteer management
- **Donor Ambassador**: Donor intake
- **Youth Committee Member**: Youth recruitment

### Administrative Access Roles
- **IT Specialist**: System configuration
- **Training Coordinator**: Staff management
- **Communications Officer**: Analytics and reporting
- **Administrative Assistant**: Data entry and basic operations
- **Secretary**: Documentation and reporting

## Running the Seed Script

### Prerequisites
1. Staff portal schema must be created first
2. Run `20250115000000_create_staff_portal_schema.sql` before this script

### Execution

```bash
# Using Supabase CLI
supabase db push

# Or manually with psql
psql -h your-host -U postgres -d postgres -f supabase/migrations/20250115000002_seed_staff_portal_data.sql
```

### Idempotency
The script uses `ON CONFLICT` clauses to ensure it can be run multiple times safely:
- Roles are updated if they exist
- Permissions are updated if they exist
- Role-permission mappings are skipped if they already exist

## Verification Queries

### Check all roles
```sql
SELECT role_code, role_name, role_category, description
FROM staff_portal.roles
ORDER BY role_category, role_name;
```

### Check all permissions
```sql
SELECT permission_name, resource, action, description
FROM staff_portal.permissions
ORDER BY resource, action;
```

### Check role-permission mappings
```sql
SELECT 
  r.role_code,
  r.role_name,
  COUNT(rp.permission_id) as permission_count
FROM staff_portal.roles r
LEFT JOIN staff_portal.role_permissions rp ON r.role_id = rp.role_id
GROUP BY r.role_id, r.role_code, r.role_name
ORDER BY permission_count DESC;
```

### Get permissions for a specific role
```sql
SELECT p.permission_name, p.resource, p.action, p.description
FROM staff_portal.roles r
JOIN staff_portal.role_permissions rp ON r.role_id = rp.role_id
JOIN staff_portal.permissions p ON rp.permission_id = p.permission_id
WHERE r.role_code = 'PRESIDENT'
ORDER BY p.resource, p.action;
```

## Customization

To customize role-permission mappings:

1. **Add new permissions**: Insert into `staff_portal.permissions`
2. **Modify mappings**: Update the DO block in the seed script
3. **Add new roles**: Insert into `staff_portal.roles` and add mapping logic

## Notes

- All roles are marked as `is_system_role = true` to prevent accidental deletion
- Permission names follow the format `resource:action`
- Role codes are uppercase with underscores (e.g., `PRESIDENT`, `SELECTION_PHYSICIAN`)
- The script is idempotent and can be safely re-run

