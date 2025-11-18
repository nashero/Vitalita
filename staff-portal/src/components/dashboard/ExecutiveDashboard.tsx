/**
 * Executive Dashboard - for President, Vice President, Treasurer
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useKPIData, useFinancialData, useAlerts, usePerformanceMetrics } from '../../hooks/useDashboardData';
import KPICard from './KPICard';
import ChartCard from './ChartCard';
import AlertsList, { Alert } from './AlertsList';
import QuickActions, { QuickAction } from './QuickActions';
import { Download, TrendingUp, Users, Calendar as CalendarIcon, AlertTriangle, DollarSign } from 'lucide-react';
import { format, subDays } from 'date-fns';
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

export default function ExecutiveDashboard() {
  const { user, hasPermission } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: kpiData, isLoading: kpiLoading } = useKPIData(dateRange);
  const { data: financialData, isLoading: financialLoading } = useFinancialData(dateRange);
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceMetrics(user?.avis_center_id);

  const canViewFinancials = hasPermission('financial:view');

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'export-reports',
      label: 'Export Reports',
      icon: Download,
      onClick: () => {
        // Handle export
        console.log('Export reports');
      },
    },
    {
      id: 'view-financials',
      label: 'View Financials',
      icon: DollarSign,
      onClick: () => {
        // Navigate to financials
        console.log('View financials');
      },
      disabled: !canViewFinancials,
    },
  ];

  // Mock data structure - replace with actual API response
  const kpis = kpiData?.data || {
    donationsThisMonth: 0,
    activeDonors: 0,
    appointments: 0,
    noShowRate: 0,
  };

  const alerts: Alert[] = alertsData?.data?.alerts || [];

  const financialChartData = financialData?.data?.chartData || [];
  const performanceChartData = performanceData?.data?.chartData || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.first_name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Donations This Month"
          value={kpis.donationsThisMonth || 0}
          trend={{ value: 12, label: '+12% from last month' }}
          icon={TrendingUp}
        />
        <KPICard
          title="Active Donors"
          value={kpis.activeDonors || 0}
          trend={{ value: 5, label: '+5% from last month' }}
          icon={Users}
        />
        <KPICard
          title="Appointments"
          value={kpis.appointments || 0}
          trend={{ value: -3, label: '-3% from last month' }}
          icon={CalendarIcon}
        />
        <KPICard
          title="No-Show Rate"
          value={`${kpis.noShowRate || 0}%`}
          trend={{ value: -2, label: '-2% from last month' }}
          icon={AlertTriangle}
          iconColor="text-yellow-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary Chart */}
        {canViewFinancials && (
          <ChartCard
            title="Financial Summary"
            loading={financialLoading}
            onExport={() => console.log('Export financial chart')}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Performance Comparison */}
        <ChartCard
          title="Performance vs Regional Average"
          loading={performanceLoading}
          onExport={() => console.log('Export performance chart')}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="center" fill="#ef4444" />
              <Bar dataKey="regional" fill="#94a3b8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsList alerts={alerts} loading={alertsLoading} />
        </div>
        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}

