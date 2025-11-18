/**
 * Donation Charts Component
 * Various chart visualizations for donation data
 */

import { useDonationTrends, AnalyticsFilters } from '../../hooks/useAnalytics';
import ChartCard from '../dashboard/ChartCard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { useState } from 'react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function DonationCharts() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    group_by: 'day',
  });

  const { data, isLoading } = useDonationTrends(filters);

  const trends = data?.data?.trends || [];
  const peakTimes = data?.data?.peak_times || [];
  const peakDays = data?.data?.peak_days || [];

  // Format trends data for charts
  const trendsData = trends.map((t: any) => ({
    date: format(new Date(t.period), 'MMM d'),
    whole_blood: parseInt(t.whole_blood_count) || 0,
    plasma: parseInt(t.plasma_count) || 0,
    total: parseInt(t.donation_count) || 0,
  }));

  // Format peak times
  const peakTimesData = peakTimes.map((pt: any) => ({
    hour: `${pt.hour}:00`,
    count: parseInt(pt.donation_count) || 0,
  }));

  // Format peak days
  const peakDaysData = peakDays.map((pd: any) => ({
    day: pd.day_name.trim(),
    count: parseInt(pd.donation_count) || 0,
  }));

  // Donation type distribution
  const typeDistribution = [
    {
      name: 'Whole Blood',
      value: trends.reduce((sum: number, t: any) => sum + (parseInt(t.whole_blood_count) || 0), 0),
    },
    {
      name: 'Plasma',
      value: trends.reduce((sum: number, t: any) => sum + (parseInt(t.plasma_count) || 0), 0),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation Analytics</h2>
          <p className="text-gray-600 mt-1">Trends, patterns, and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filters.group_by || 'day'}
            onChange={(e) => setFilters({ ...filters, group_by: e.target.value as any })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      {/* Trends Chart */}
      <ChartCard title="Donation Trends Over Time" loading={isLoading}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#ef4444" name="Total Donations" strokeWidth={2} />
            <Line type="monotone" dataKey="whole_blood" stroke="#3b82f6" name="Whole Blood" strokeWidth={2} />
            <Line type="monotone" dataKey="plasma" stroke="#10b981" name="Plasma" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Grid of smaller charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peak Times */}
        <ChartCard title="Peak Donation Times" loading={isLoading}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakTimesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peak Days */}
        <ChartCard title="Peak Donation Days" loading={isLoading}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakDaysData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donation Type Distribution */}
        <ChartCard title="Donation Type Distribution" loading={isLoading}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Donations</span>
              <span className="text-xl font-bold text-gray-900">
                {trends.reduce((sum: number, t: any) => sum + (parseInt(t.donation_count) || 0), 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Whole Blood</span>
              <span className="text-lg font-semibold text-blue-600">
                {typeDistribution[0].value}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plasma</span>
              <span className="text-lg font-semibold text-green-600">
                {typeDistribution[1].value}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Peak Hour</span>
              <span className="text-lg font-semibold text-gray-900">
                {peakTimesData.length > 0
                  ? peakTimesData.reduce((max, pt) => (pt.count > max.count ? pt : max), peakTimesData[0]).hour
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

