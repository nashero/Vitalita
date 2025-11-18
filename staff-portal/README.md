# Vitalita Staff Portal

Secure administrative dashboard for Vitalita staff members with role-based access control.

## Features

- **Secure Authentication**: Staff login with username and password
- **Role-Based Access Control**: Different permissions for different roles (Administrator, Manager, Staff, Nurse, Receptionist)
- **Permission System**: Granular permissions for various operations
- **Protected Routes**: Routes are protected based on user permissions
- **Dynamic Navigation**: Navigation items shown based on user permissions
- **Dashboard**: Role-specific dashboard with relevant statistics and quick actions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `staff-portal` directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

The staff portal will be available at `http://localhost:5175`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Database Setup

The staff portal requires the following database tables:
- `staff` - Staff member information
- `roles` - Role definitions
- `permissions` - Permission definitions
- `role_permissions` - Junction table linking roles to permissions

### Default Roles

- **Administrator**: Full system access with all permissions
- **Manager**: Management access to oversee operations and staff
- **Staff**: Standard staff access for daily operations
- **Nurse**: Medical staff with donor care responsibilities
- **Receptionist**: Front desk and appointment management access

### Common Permissions

- `view_dashboard` - Access to main dashboard
- `view_appointments` - View appointment schedules
- `manage_appointments` - Create, update, and cancel appointments
- `view_donors` - View donor profiles
- `manage_donors` - Add, edit, and manage donor information
- `view_centers` - View donation center information
- `manage_centers` - Manage donation centers
- `view_slots` - View availability schedules
- `manage_slots` - Create and manage availability slots
- `view_staff` - View staff profiles
- `manage_staff` - Manage staff accounts
- `generate_reports` - Access to reporting and analytics
- `audit_logs` - View system audit logs

## Usage

### Login

Staff members can log in using their username and password. The system will:
1. Verify credentials against the `staff` table
2. Fetch role information from the `roles` table
3. Load permissions from `role_permissions` and `permissions` tables
4. Store session information in localStorage

### Protected Routes

Use the `ProtectedRoute` component to protect routes:

```tsx
<ProtectedRoute requiredPermission="manage_appointments">
  <AppointmentsPage />
</ProtectedRoute>
```

Options:
- `requiredPermission`: Single permission required
- `requiredPermissions`: Array of permissions (requires any by default)
- `requireAll`: If true, requires all permissions in the array
- `requiredRole`: Specific role required
- `allowIfNoPermissions`: Allow access if permissions system isn't set up

### Permission Checking

Use the `usePermissions` hook to check permissions:

```tsx
const { hasPermission, hasRole, isAdmin } = usePermissions();

if (hasPermission('manage_donors')) {
  // Show manage donors button
}
```

### Conditional Rendering

Use the `PermissionGate` component for conditional rendering:

```tsx
<PermissionGate permission="manage_appointments">
  <button>Create Appointment</button>
</PermissionGate>
```

## Subdomain Setup

For production deployment, configure your web server to serve this application on a subdomain (e.g., `staff.vitalita.com`). The application is configured to work independently and can be deployed separately from the main application.

## Security Notes

- Passwords are hashed using SHA-256 with salt
- Staff must be active (`is_active = true`) to log in
- All routes are protected and require authentication
- Permissions are checked on both the client and should be verified on the server
- Administrator role bypasses all permission checks
