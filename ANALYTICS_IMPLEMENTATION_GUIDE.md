# Analytics and Reporting Implementation Guide

Complete guide for the Vitalita staff portal analytics and reporting system.

## Quick Start

### 1. Database Setup

Run the SQL scripts to create materialized views and indexes:

```bash
# Create materialized views
psql -h your-db-host -U postgres -d postgres -f staff-portal-api/src/database/analytics_views.sql

# Create additional indexes
psql -h your-db-host -U postgres -d postgres -f staff-portal-api/src/database/analytics_indexes.sql

# Create helper functions
psql -h your-db-host -U postgres -d postgres -f staff-portal-api/src/database/analytics_functions.sql
```

### 2. Set Up Cron Job

Refresh materialized views daily at 2 AM:

**Option A: PostgreSQL pg_cron**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-analytics-views', '0 2 * * *', 
  'SELECT staff_portal.refresh_analytics_views()');
```

**Option B: External Cron**
```bash
# Add to crontab
0 2 * * * psql -h localhost -U postgres -d postgres -c "SELECT staff_portal.refresh_analytics_views()"
```

**Option C: Node.js Cron (Recommended)**
```javascript
// In server.ts or separate cron service
import cron from 'node-cron';
import { query } from './config/database.js';

cron.schedule('0 2 * * *', async () => {
  await query('SELECT staff_portal.refresh_analytics_views()');
});
```

### 3. Install Dependencies

**Backend:**
```bash
cd staff-portal-api
npm install
# uuid already included
```

**Frontend:**
```bash
cd staff-portal
npm install
# Recharts already included
```

## API Endpoints

### Analytics Endpoints

| Endpoint | Method | Description | Permission |
|----------|--------|-------------|------------|
| `/api/staff/analytics/dashboard` | GET | Dashboard metrics | `analytics:view` |
| `/api/staff/analytics/donations` | GET | Donation trends | `analytics:view` |
| `/api/staff/analytics/donors` | GET | Donor statistics | `analytics:view` |
| `/api/staff/analytics/centers` | GET | Center performance | `analytics:view` |
| `/api/staff/analytics/staff` | GET | Staff productivity | `analytics:view` |

### Reports Endpoints

| Endpoint | Method | Description | Permission |
|----------|--------|-------------|------------|
| `/api/staff/reports/generate` | POST | Generate report | `reports:generate` |
| `/api/staff/reports/:id/download` | GET | Download report | `reports:view` |

## Query Parameters

### Analytics Filters
- `start_date` - ISO 8601 date
- `end_date` - ISO 8601 date
- `center_id` - UUID (optional)
- `group_by` - 'day', 'week', or 'month' (for trends)

### Example Requests
```bash
# Dashboard metrics
GET /api/staff/analytics/dashboard?start_date=2024-01-01&end_date=2024-01-31&center_id=uuid

# Donation trends (weekly)
GET /api/staff/analytics/donations?start_date=2024-01-01&end_date=2024-01-31&group_by=week

# Center performance
GET /api/staff/analytics/centers?start_date=2024-01-01&end_date=2024-01-31
```

## Response Formats

### Dashboard Metrics
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_donations": 156,
      "unique_donors": 89,
      "success_rate": 85.5,
      "trends": {
        "total_donations": 12.5,
        "unique_donors": 8.3
      }
    },
    "period": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    }
  }
}
```

### Donation Trends
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2024-01-01T00:00:00Z",
        "donation_count": 45,
        "whole_blood_count": 30,
        "plasma_count": 15
      }
    ],
    "peak_times": [
      { "hour": 10, "donation_count": 25 }
    ],
    "peak_days": [
      { "day_of_week": 1, "day_name": "Monday", "donation_count": 45 }
    ]
  }
}
```

## Frontend Components

### DashboardMetrics
- KPI cards with trends
- Period comparison charts
- Quick date range filters

### ReportsGenerator
- Report type selection
- Date range picker
- Format selection (CSV/Excel/PDF)
- Download generated reports

### ComparativeAnalysis
- Center vs center comparison
- Regional benchmarking
- Year-over-year trends
- Performance rankings

### DonationCharts
- Trend line charts
- Peak time analysis
- Peak day analysis
- Donation type distribution

## Performance Optimization

### Materialized Views
Refresh daily to maintain performance:
- `daily_donation_stats` - Updated daily
- `monthly_donor_stats` - Updated monthly
- `center_performance_stats` - Updated daily
- `staff_productivity_stats` - Updated daily

### Indexing Strategy
- Date-based indexes for time-series queries
- Composite indexes for common filter combinations
- Partial indexes for active records only
- Covering indexes for frequently accessed columns

### Caching (Future)
- Redis caching for frequently accessed reports
- Cache invalidation on data updates
- TTL-based expiration

## SQL Query Examples

### Complex Analytics Query
```sql
-- Donation trends with center breakdown
SELECT 
  DATE_TRUNC('week', dh.donation_date) as week,
  dc.name as center_name,
  COUNT(*) as donation_count,
  COUNT(DISTINCT dh.donor_hash_id) as unique_donors,
  AVG(dh.donation_volume) as avg_volume
FROM donation_history dh
JOIN donation_centers dc ON dh.donation_center_id = dc.center_id
WHERE dh.donation_date >= $1 AND dh.donation_date <= $2
GROUP BY DATE_TRUNC('week', dh.donation_date), dc.name
ORDER BY week DESC, donation_count DESC;
```

### Retention Rate Calculation
```sql
SELECT * FROM staff_portal.calculate_retention_rate(
  '2024-01-01'::TIMESTAMPTZ,
  '2024-01-31'::TIMESTAMPTZ,
  'center-uuid'::UUID  -- Optional
);
```

### Peak Times Analysis
```sql
SELECT * FROM staff_portal.get_peak_donation_times(
  '2024-01-01'::TIMESTAMPTZ,
  '2024-01-31'::TIMESTAMPTZ
);
```

## Permission Requirements

| Feature | Permission | Roles |
|---------|------------|-------|
| View Analytics | `analytics:view` | All staff |
| Generate Reports | `reports:generate` | Admin, Executive |
| View All Reports | `reports:view_all` | Admin only |
| Financial Reports | `financial:view` | Executive, Treasurer |

## Data Access Levels

- **Executive:** All analytics, all centers
- **Regional:** All centers in their region
- **Center Staff:** Only their center
- **Medical:** Medical-specific metrics
- **Administrative:** Operational metrics only

## Export Formats

### CSV
- Raw data export
- Excel-compatible format
- Includes metadata header

### Excel (To be implemented)
- Multiple sheets
- Formatted tables
- Charts embedded

### PDF (To be implemented)
- Professional layout
- Charts and graphs
- Summary sections

## Advanced Features (Future)

1. **Predictive Analytics**
   - Forecast future donations
   - Seasonal pattern recognition
   - Demand forecasting

2. **Donor Churn Analysis**
   - Identify at-risk donors
   - Retention strategies
   - Re-engagement campaigns

3. **Optimal Scheduling**
   - AI-powered recommendations
   - Capacity optimization
   - Peak time analysis

4. **Resource Allocation**
   - Staff scheduling optimization
   - Equipment utilization
   - Cost optimization

## Troubleshooting

### Slow Queries
- Check if materialized views are refreshed
- Verify indexes are created
- Limit date ranges
- Use center filters

### Missing Data
- Verify materialized views are up to date
- Check date range filters
- Verify center access permissions

### Export Issues
- Check file permissions
- Verify report generation completed
- Check disk space

## Monitoring

Monitor analytics performance:
- Query execution times
- Materialized view refresh duration
- Cache hit rates (when implemented)
- Report generation times

## Best Practices

1. **Refresh Views Regularly** - Daily at off-peak hours
2. **Use Appropriate Date Ranges** - Avoid querying entire history
3. **Filter by Center** - When possible, filter to reduce data
4. **Cache Frequently Used Reports** - Implement Redis caching
5. **Monitor Performance** - Track query times and optimize

## Next Steps

1. Implement Redis caching
2. Complete PDF/Excel export
3. Add email delivery
4. Implement scheduled reports
5. Add predictive analytics
6. Create geographical visualizations
7. Add heat maps for donation patterns

