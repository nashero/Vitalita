# Dashboard Components Documentation

Role-specific dashboard components for the Vitalita Staff Portal.

## Overview

The dashboard system provides customized views based on user roles:
- **Executive Dashboard**: For President, VP, Treasurer, Secretary
- **Medical Dashboard**: For Nurses, Physicians, Phlebotomists
- **Administrative Dashboard**: For Admin Staff, IT, Communications
- **Operational Dashboard**: For Coordinators, QA Officers

## Components

### Main Dashboards

1. **ExecutiveDashboard** (`ExecutiveDashboard.tsx`)
   - KPI cards (donations, donors, appointments, no-show rate)
   - Financial summary charts
   - Performance comparison
   - Critical alerts
   - Export functionality

2. **MedicalDashboard** (`MedicalDashboard.tsx`)
   - Today's appointment schedule (calendar view)
   - Donor check-in queue
   - Pending eligibility reviews
   - Quick action buttons
   - Medical inventory alerts

3. **AdministrativeDashboard** (`AdministrativeDashboard.tsx`)
   - Appointment management
   - Donor database search
   - Supply inventory tracking
   - Staff directory access
   - System notifications

4. **OperationalDashboard** (`OperationalDashboard.tsx`)
   - Volunteer schedule
   - Training completion tracking
   - Quality metrics and compliance
   - Recruitment pipeline

### Reusable Components

1. **KPICard** - Metric display with trend indicators
2. **AppointmentCalendar** - Calendar view with appointments
3. **AlertsList** - Filterable alerts list
4. **QuickActions** - Role-specific action buttons
5. **DataTable** - Sortable, filterable tables
6. **ChartCard** - Wrapper for charts with actions

## Data Fetching

Uses React Query for data fetching with:
- Automatic refetching
- Cache management
- Optimistic updates
- Error handling

### Custom Hooks

Located in `src/hooks/useDashboardData.ts`:
- `useKPIData()` - KPI metrics
- `useAppointments()` - Appointment data
- `useFinancialData()` - Financial data
- `useAlerts()` - System alerts
- `useDonorQueue()` - Donor queue
- `usePerformanceMetrics()` - Performance data
- `useVolunteerSchedule()` - Volunteer schedule
- `useTrainingCompletion()` - Training data
- `useQualityMetrics()` - Quality metrics

## Features

### Real-time Updates
- Polling intervals configured per data type
- KPI data: 60 seconds
- Appointments: 30 seconds
- Donor queue: 10 seconds
- Alerts: 30 seconds

### Permission-Based Rendering
- Components check permissions before rendering
- Financial charts only shown with `financial:view` permission
- Role-based dashboard routing

### Loading States
- Skeleton loaders for all components
- Spinner animations
- Progressive loading

### Error Handling
- Error boundaries for component errors
- React Query error states
- User-friendly error messages

### Responsive Design
- Mobile-friendly grid layouts
- Responsive tables
- Touch-friendly buttons

## Usage

The dashboard is automatically routed based on user role:

```typescript
// DashboardRouter automatically selects the right dashboard
<DashboardRouter />
```

Or use specific dashboard:

```typescript
import ExecutiveDashboard from './components/dashboard/ExecutiveDashboard';

<ProtectedRoute requiredRole="PRESIDENT">
  <ExecutiveDashboard />
</ProtectedRoute>
```

## API Endpoints Required

The dashboards expect these API endpoints:

- `GET /api/staff/dashboard/kpi` - KPI metrics
- `GET /api/staff/appointments` - Appointments
- `GET /api/staff/dashboard/financial` - Financial data
- `GET /api/staff/dashboard/alerts` - Alerts
- `GET /api/staff/dashboard/donor-queue` - Donor queue
- `GET /api/staff/dashboard/performance` - Performance metrics
- `GET /api/staff/dashboard/volunteer-schedule` - Volunteer schedule
- `GET /api/staff/dashboard/training-completion` - Training data
- `GET /api/staff/dashboard/quality-metrics` - Quality metrics

## Charts

Uses Recharts library for visualizations:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions

## Date Range Filters

Executive dashboard includes date range filters:
- Default: Last 30 days
- Customizable start/end dates
- Updates all related data

## Export Functionality

Charts and tables include export buttons:
- Export to CSV
- Export to PDF (to be implemented)
- Print functionality

## Customization

To customize dashboards:

1. **Add new KPI**: Update `useKPIData` hook and add `KPICard`
2. **Add new chart**: Use `ChartCard` wrapper with Recharts
3. **Add new table**: Use `DataTable` component
4. **Add new action**: Add to `QuickActions` array

## Performance

- React Query caching reduces API calls
- Memoized calculations
- Lazy loading for heavy components
- Optimized re-renders

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

