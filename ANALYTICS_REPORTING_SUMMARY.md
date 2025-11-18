# Analytics and Reporting System Summary

Comprehensive analytics and reporting system for the Vitalita staff portal.

## Overview

This implementation provides:
- **Real-time analytics** - Dashboard metrics with trends
- **Custom reports** - Flexible report generation
- **Performance optimization** - Materialized views and caching
- **Permission-based access** - Role-based data visibility
- **Multiple export formats** - CSV, Excel, PDF

## Backend Implementation

### API Endpoints Created

1. **GET /api/staff/analytics/dashboard** - Overall dashboard metrics
2. **GET /api/staff/analytics/donations** - Donation trends and patterns
3. **GET /api/staff/analytics/donors** - Donor statistics
4. **GET /api/staff/analytics/centers** - Center performance comparison
5. **GET /api/staff/analytics/staff** - Staff productivity metrics
6. **POST /api/staff/reports/generate** - Generate custom report
7. **GET /api/staff/reports/:id/download** - Download report

### Files Created

**Backend:**
- `staff-portal-api/src/controllers/analytics.controller.ts` - Analytics endpoints
- `staff-portal-api/src/controllers/reports.controller.ts` - Report generation
- `staff-portal-api/src/routes/analytics.routes.ts` - Route definitions
- `staff-portal-api/src/database/analytics_views.sql` - Materialized views
- `staff-portal-api/src/database/refresh_analytics_cron.sql` - Cron setup

**Frontend:**
- `staff-portal/src/components/analytics/DashboardMetrics.tsx` - KPI dashboard
- `staff-portal/src/components/analytics/ReportsGenerator.tsx` - Report generator
- `staff-portal/src/components/analytics/ComparativeAnalysis.tsx` - Comparisons
- `staff-portal/src/components/analytics/DonationCharts.tsx` - Chart visualizations
- `staff-portal/src/hooks/useAnalytics.ts` - React Query hooks

## Metrics Tracked

### Donation Metrics
- Total donations (by type, date range, center)
- Donation trends over time (daily/weekly/monthly)
- Success rate (completed vs cancelled/no-show)
- Average donations per donor
- Peak donation times/days
- Donation type distribution

### Donor Metrics
- Total active donors
- New donors registered
- Donor retention rate
- Donors by eligibility status
- Repeat donation rate
- Average donations per donor

### Operational Metrics
- Appointment utilization rate
- Average time per donation
- Staff productivity (appointments handled)
- No-show rate
- Success rate by center

### Financial Metrics (Authorized Roles)
- Budget vs actual spending
- Cost per donation
- Fundraising performance
- Expense categories

## Performance Optimization

### Materialized Views
Pre-computed aggregations for fast queries:
- `daily_donation_stats` - Daily donation aggregations
- `monthly_donor_stats` - Monthly donor statistics
- `center_performance_stats` - Center performance metrics
- `staff_productivity_stats` - Staff productivity data

### Indexes
Optimized indexes for analytics queries:
- `idx_donation_history_date_center` - Date and center lookups
- `idx_donation_history_type_date` - Type and date filtering
- `idx_appointments_datetime_status` - Appointment queries
- `idx_donors_last_donation_active` - Donor eligibility queries

### Refresh Strategy
- Materialized views refreshed daily (2 AM via cron)
- Real-time metrics for current day
- Caching with Redis (to be implemented)

## Features

### Dashboard Metrics
- KPI cards with trend indicators
- Period comparison (current vs previous)
- Target vs actual indicators
- Quick date range filters
- Center filtering

### Report Generation
- Multiple report types (donations, donors, operational, financial)
- Custom date range selection
- Center/region filtering
- Format selection (CSV, Excel, PDF)
- Include charts option
- Email delivery (to be implemented)
- Scheduled reports (to be implemented)

### Charts and Visualizations
- Line charts (trends over time)
- Bar charts (comparisons)
- Pie charts (distributions)
- Peak time analysis
- Peak day analysis

### Comparative Analysis
- Center vs center comparison
- Regional benchmarking
- Year-over-year comparison
- Performance rankings

## SQL Queries

### Complex Analytics Query Example
```sql
-- Daily donation statistics with trends
SELECT 
  DATE_TRUNC('day', donation_date) as date,
  donation_center_id,
  COUNT(*) as donation_count,
  COUNT(*) FILTER (WHERE donation_type = 'whole_blood') as whole_blood_count,
  COUNT(*) FILTER (WHERE donation_type = 'plasma') as plasma_count,
  COUNT(DISTINCT donor_hash_id) as unique_donors,
  AVG(donation_volume) as avg_volume
FROM donation_history
WHERE donation_date >= $1 AND donation_date <= $2
GROUP BY DATE_TRUNC('day', donation_date), donation_center_id
ORDER BY date DESC;
```

### Retention Rate Calculation
```sql
SELECT 
  COUNT(DISTINCT donor_hash_id) FILTER (WHERE donation_count > 1) as repeat_donors,
  COUNT(DISTINCT donor_hash_id) as total_donors,
  (COUNT(DISTINCT donor_hash_id) FILTER (WHERE donation_count > 1)::float / 
   COUNT(DISTINCT donor_hash_id)::float * 100) as retention_rate
FROM (
  SELECT donor_hash_id, COUNT(*) as donation_count
  FROM donation_history
  GROUP BY donor_hash_id
) subquery;
```

## Permission-Based Access

- **Executive:** All analytics and reports
- **Center Staff:** Only their center data
- **Regional:** All centers in their region
- **Medical:** Medical-specific metrics only
- **Financial Reports:** Requires `financial:view` permission

## Export Functionality

### CSV Export
- Raw data export
- Formatted for Excel compatibility
- Includes metadata (generation date, filters)

### Excel Export (To be implemented)
- Multiple sheets
- Charts and visualizations
- Formatted tables

### PDF Export (To be implemented)
- Professional formatting
- Charts and graphs
- Summary sections

## Advanced Analytics (Future)

- **Predictive Analytics:** Forecast future donations
- **Donor Churn Risk:** Identify at-risk donors
- **Optimal Scheduling:** AI-powered recommendations
- **Resource Allocation:** Optimization algorithms
- **Seasonal Trends:** Pattern recognition

## Usage Examples

### Get Dashboard Metrics
```typescript
const { data } = useDashboardMetrics({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  center_id: 'uuid',
});
```

### Generate Report
```typescript
const generateReport = useGenerateReport();
await generateReport.mutateAsync({
  report_type: 'donations',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  format: 'csv',
  include_charts: true,
});
```

### Get Donation Trends
```typescript
const { data } = useDonationTrends({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  group_by: 'week',
});
```

## Setup

### Database Views
Run the SQL script to create materialized views:
```bash
psql -h your-db-host -U postgres -d postgres -f staff-portal-api/src/database/analytics_views.sql
```

### Cron Job
Set up daily refresh (2 AM):
```sql
SELECT cron.schedule('refresh-analytics-views', '0 2 * * *', 
  'SELECT staff_portal.refresh_analytics_views()');
```

Or use external cron:
```bash
0 2 * * * psql -h localhost -U postgres -d postgres -c "SELECT staff_portal.refresh_analytics_views()"
```

## Performance Tips

1. **Use Materialized Views** - Pre-computed aggregations
2. **Cache Frequently Accessed Data** - Redis caching (to be implemented)
3. **Limit Date Ranges** - Avoid querying entire history
4. **Use Indexes** - All analytics queries use indexed columns
5. **Batch Updates** - Refresh views during off-peak hours

## Next Steps

1. **Implement Redis Caching** - Cache frequently accessed reports
2. **PDF/Excel Export** - Complete export functionality
3. **Email Delivery** - Automated report emails
4. **Scheduled Reports** - Recurring report generation
5. **Predictive Analytics** - ML-based forecasting
6. **Real-time Dashboards** - WebSocket updates
7. **Advanced Visualizations** - Heat maps, geographical maps

## Documentation

- **API Documentation:** See controller files for endpoint details
- **Component Usage:** See component files for props and usage
- **Hooks Documentation:** See `useAnalytics.ts` for hook details
- **SQL Queries:** See `analytics_views.sql` for database setup

