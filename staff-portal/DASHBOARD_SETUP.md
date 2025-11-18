# Dashboard Setup Guide

Quick setup guide for the role-specific dashboard components.

## Installation

1. **Install dependencies:**
   ```bash
   cd staff-portal
   npm install
   ```

2. **Verify dependencies are installed:**
   - `@tanstack/react-query` - Data fetching
   - `recharts` - Charts
   - `date-fns` - Date utilities
   - `lucide-react` - Icons

## Component Structure

```
src/components/dashboard/
├── ExecutiveDashboard.tsx      # Executive roles
├── MedicalDashboard.tsx        # Medical staff
├── AdministrativeDashboard.tsx # Admin staff
├── OperationalDashboard.tsx    # Coordinators
├── DashboardRouter.tsx          # Routes to correct dashboard
├── KPICard.tsx                 # Reusable KPI component
├── AppointmentCalendar.tsx     # Calendar view
├── AlertsList.tsx              # Alerts component
├── QuickActions.tsx           # Action buttons
├── DataTable.tsx              # Table component
├── ChartCard.tsx              # Chart wrapper
├── LoadingSkeleton.tsx        # Loading states
└── EmptyState.tsx             # Empty states
```

## Dashboard Routing

The `DashboardRouter` automatically selects the dashboard based on user role:

- **Executive**: President, VP, Treasurer, Secretary, Executive Committee
- **Medical**: HCD, Selection Physician, Nurses, Phlebotomists, Lab Techs
- **Operational**: Volunteer Coordinators, QA Officers, Mobile Coordinators
- **Administrative**: Default for other roles

## API Integration

The dashboards use React Query hooks from `useDashboardData.ts`. You need to implement these API endpoints:

### Required Endpoints

1. **KPI Data**
   ```
   GET /api/staff/dashboard/kpi?start=2024-01-01&end=2024-01-31
   Response: { success: true, data: { kpis: {...} } }
   ```

2. **Appointments**
   ```
   GET /api/staff/appointments?date=2024-01-15
   Response: { success: true, data: { appointments: [...] } }
   ```

3. **Financial Data** (permission-based)
   ```
   GET /api/staff/dashboard/financial?start=2024-01-01&end=2024-01-31
   Response: { success: true, data: { chartData: [...] } }
   ```

4. **Alerts**
   ```
   GET /api/staff/dashboard/alerts
   Response: { success: true, data: { alerts: [...] } }
   ```

5. **Donor Queue**
   ```
   GET /api/staff/dashboard/donor-queue
   Response: { success: true, data: { queue: [...] } }
   ```

6. **Performance Metrics**
   ```
   GET /api/staff/dashboard/performance?center_id=uuid
   Response: { success: true, data: { chartData: [...] } }
   ```

7. **Volunteer Schedule**
   ```
   GET /api/staff/dashboard/volunteer-schedule?date=2024-01-15
   Response: { success: true, data: { volunteers: [...] } }
   ```

8. **Training Completion**
   ```
   GET /api/staff/dashboard/training-completion
   Response: { success: true, data: { trainings: [...] } }
   ```

9. **Quality Metrics**
   ```
   GET /api/staff/dashboard/quality-metrics
   Response: { success: true, data: { metrics: [...] } }
   ```

## Data Format Examples

### KPI Data
```json
{
  "success": true,
  "data": {
    "kpis": {
      "donationsThisMonth": 245,
      "activeDonors": 1234,
      "appointments": 89,
      "noShowRate": 5.2
    }
  }
}
```

### Appointments
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "donor_name": "John Doe",
        "time": "2024-01-15T10:00:00Z",
        "type": "blood",
        "status": "scheduled"
      }
    ]
  }
}
```

### Financial Chart Data
```json
{
  "success": true,
  "data": {
    "chartData": [
      { "date": "2024-01-01", "revenue": 5000, "expenses": 3000 },
      { "date": "2024-01-02", "revenue": 5500, "expenses": 3200 }
    ]
  }
}
```

### Alerts
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "type": "critical",
        "title": "Low Inventory",
        "message": "Blood collection bags below threshold",
        "timestamp": "2024-01-15T10:00:00Z",
        "actionUrl": "/inventory",
        "actionLabel": "View Inventory"
      }
    ]
  }
}
```

## Testing

1. **Start API server:**
   ```bash
   cd staff-portal-api
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd staff-portal
   npm run dev
   ```

3. **Login and navigate to dashboard:**
   - Login with a user account
   - Navigate to `/dashboard`
   - Dashboard will automatically route based on user role

## Customization

### Adding New Dashboard

1. Create new dashboard component
2. Add role check in `DashboardRouter.tsx`
3. Create data fetching hook in `useDashboardData.ts`
4. Add API endpoint in backend

### Modifying Existing Dashboard

1. Edit the dashboard component file
2. Add/remove components as needed
3. Update data fetching hooks if needed
4. Update API endpoints if needed

## Troubleshooting

### Charts Not Rendering
- Check if Recharts is installed: `npm list recharts`
- Verify data format matches expected structure
- Check browser console for errors

### Data Not Loading
- Check API endpoints are implemented
- Verify API base URL in `.env`
- Check network tab for failed requests
- Verify user has required permissions

### Dashboard Not Showing
- Check user has assigned roles
- Verify `DashboardRouter` role matching logic
- Check browser console for errors

## Performance Tips

1. **Reduce Refetch Intervals**: Adjust in `useDashboardData.ts` if needed
2. **Enable Caching**: React Query caches by default
3. **Lazy Load Charts**: Load heavy charts on demand
4. **Paginate Tables**: For large datasets

## Next Steps

1. Implement all API endpoints
2. Add real data to dashboards
3. Customize based on user feedback
4. Add export functionality
5. Add WebSocket for real-time updates (optional)

