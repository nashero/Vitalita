/**
 * Dashboard Metrics Component
 * KPI cards with trends and comparisons
 */

import { useState } from 'react';
import { useDashboardMetrics, AnalyticsFilters } from '../../hooks/useAnalytics';
import KPICard from '../dashboard/KPICard';
import { TrendingUp, TrendingDown, Users, Calendar, CheckCircle, Activity } from 'lucide-react';
import { format, subDays } from 'date-fns';
import ChartCard from '../dashboard/ChartCard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardMetrics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data, isLoading } = useDashboardMetrics(filters);

  const metrics = data?.data?.metrics;
  const trends = metrics?.trends || {};

  const formatTrend = (value: number) => {
    const isPositive = value >= 0;
    return {
      value: Math.abs(value).toFixed(1),
      label: `${isPositive ? '+' : '-'}${Math.abs(value).toFixed(1)}% from previous period`,
      isPositive,
    };
  };

  // Prepare chart data
  const chartData = [
    {
      name: 'Donations',
      current: metrics?.total_donations || 0,
      previous: (metrics?.total_donations || 0) / (1 + (trends.total_donations || 0) / 100),
    },
    {
      name: 'Donors',
      current: metrics?.unique_donors || 0,
      previous: (metrics?.unique_donors || 0) / (1 + (trends.unique_donors || 0) / 100),
    },
    {
      name: 'Success Rate',
      current: metrics?.success_rate || 0,
      previous: (metrics?.success_rate || 0) / (1 + (trends.success_rate || 0) / 100),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive metrics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Donations"
          value={metrics?.total_donations || 0}
          trend={formatTrend(trends.total_donations || 0)}
          icon={Activity}
        />
        <KPICard
          title="Unique Donors"
          value={metrics?.unique_donors || 0}
          trend={formatTrend(trends.unique_donors || 0)}
          icon={Users}
        />
        <KPICard
          title="Success Rate"
          value={`${(metrics?.success_rate || 0).toFixed(1)}%`}
          trend={formatTrend(trends.success_rate || 0)}
          icon={CheckCircle}
        />
        <KPICard
          title="Active Donors"
          value={metrics?.active_donors || 0}
          trend={formatTrend(trends.active_donors || 0)}
          icon={Users}
        />
      </div>

      {/* Comparison Chart */}
      <ChartCard title="Period Comparison" loading={isLoading}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#ef4444" name="Current Period" />
            <Bar dataKey="previous" fill="#94a3b8" name="Previous Period" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Whole Blood</span>
              <span className="font-semibold text-gray-900">{metrics?.whole_blood_donations || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plasma</span>
              <span className="font-semibold text-gray-900">{metrics?.plasma_donations || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Volume</span>
              <span className="font-semibold text-gray-900">
                {metrics?.avg_donation_volume ? `${metrics.avg_donation_volume.toFixed(0)}ml` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{metrics?.completed_appointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-semibold text-red-600">{metrics?.cancelled_appointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">No-Shows</span>
              <span className="font-semibold text-amber-600">{metrics?.no_show_appointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">{metrics?.total_appointments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

