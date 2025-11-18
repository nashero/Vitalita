/**
 * Comparative Analysis Component
 * Center vs center, regional, year-over-year comparisons
 */

import { useState } from 'react';
import { useCenterPerformance, useDonationTrends, AnalyticsFilters } from '../../hooks/useAnalytics';
import ChartCard from '../dashboard/ChartCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subMonths, subYears } from 'date-fns';
import { TrendingUp, Building2, MapPin } from 'lucide-react';

export default function ComparativeAnalysis() {
  const [comparisonType, setComparisonType] = useState<'centers' | 'regional' | 'year-over-year'>('centers');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    start_date: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: centerData, isLoading: centerLoading } = useCenterPerformance(filters);
  const { data: trendsData, isLoading: trendsLoading } = useDonationTrends({
    ...filters,
    group_by: 'month',
  });

  const centers = centerData?.data?.centers || [];
  const trends = trendsData?.data?.trends || [];

  // Prepare center comparison data
  const centerComparisonData = centers.slice(0, 10).map((center: any) => ({
    name: center.center_name?.substring(0, 15) || 'Unknown',
    donations: parseInt(center.total_donations) || 0,
    success_rate: parseFloat(center.success_rate) || 0,
    unique_donors: parseInt(center.unique_donors) || 0,
  }));

  // Prepare year-over-year data
  const currentYear = trends.filter((t: any) => {
    const date = new Date(t.period);
    return date.getFullYear() === new Date().getFullYear();
  });

  const previousYear = trends.filter((t: any) => {
    const date = new Date(t.period);
    return date.getFullYear() === new Date().getFullYear() - 1;
  });

  const yearOverYearData = currentYear.map((current: any) => {
    const month = format(new Date(current.period), 'MMM');
    const prev = previousYear.find((p: any) => format(new Date(p.period), 'MMM') === month);
    return {
      month,
      current: parseInt(current.donation_count) || 0,
      previous: prev ? parseInt(prev.donation_count) || 0 : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comparative Analysis</h2>
          <p className="text-gray-600 mt-1">Compare performance across centers, regions, and time periods</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={comparisonType}
            onChange={(e) => setComparisonType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="centers">Center Comparison</option>
            <option value="regional">Regional Analysis</option>
            <option value="year-over-year">Year-over-Year</option>
          </select>
        </div>
      </div>

      {/* Center Comparison */}
      {comparisonType === 'centers' && (
        <div className="space-y-6">
          <ChartCard title="Center Performance Comparison" loading={centerLoading}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={centerComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donations" fill="#ef4444" name="Total Donations" />
                <Bar dataKey="unique_donors" fill="#3b82f6" name="Unique Donors" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Success Rate by Center" loading={centerLoading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={centerComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success_rate" fill="#10b981" name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Center Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Center Rankings</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Center</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donors</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {centers.slice(0, 10).map((center: any, index: number) => (
                    <tr key={center.center_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{center.center_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseInt(center.total_donations) || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseInt(center.unique_donors) || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          parseFloat(center.success_rate) >= 80 ? 'text-green-600' :
                          parseFloat(center.success_rate) >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {parseFloat(center.success_rate).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Year-over-Year Comparison */}
      {comparisonType === 'year-over-year' && (
        <ChartCard title="Year-over-Year Donation Trends" loading={trendsLoading}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={yearOverYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#ef4444" name="Current Year" strokeWidth={2} />
              <Line type="monotone" dataKey="previous" stroke="#94a3b8" name="Previous Year" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Regional Analysis */}
      {comparisonType === 'regional' && (
        <div className="space-y-6">
          <ChartCard title="Regional Performance (by City)" loading={centerLoading}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={centers.filter((c: any) => c.city).map((c: any) => ({
                name: c.city || 'Unknown',
                donations: parseInt(c.total_donations) || 0,
                centers: 1,
              })).reduce((acc: any[], curr: any) => {
                const existing = acc.find((a) => a.name === curr.name);
                if (existing) {
                  existing.donations += curr.donations;
                  existing.centers += 1;
                } else {
                  acc.push(curr);
                }
                return acc;
              }, [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donations" fill="#ef4444" name="Total Donations" />
                <Bar dataKey="centers" fill="#3b82f6" name="Number of Centers" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

