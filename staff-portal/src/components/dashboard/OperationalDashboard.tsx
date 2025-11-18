/**
 * Operational Dashboard - for Coordinators, QA Officers
 */

import { useState } from 'react';
import { useVolunteerSchedule, useTrainingCompletion, useQualityMetrics } from '../../hooks/useDashboardData';
import DataTable, { Column } from './DataTable';
import ChartCard from './ChartCard';
import QuickActions, { QuickAction } from './QuickActions';
import { Users, CheckCircle, MapPin, Calendar, TrendingUp, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import {
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

interface Volunteer {
  id: string;
  name: string;
  role: string;
  availability: string[];
  hoursThisMonth: number;
  status: 'active' | 'inactive';
}

interface Training {
  id: string;
  staffName: string;
  course: string;
  completed: boolean;
  completionDate?: string;
  dueDate: string;
}

interface QualityMetric {
  category: string;
  score: number;
  target: number;
  status: 'pass' | 'fail' | 'warning';
}

export default function OperationalDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: volunteerData, isLoading: volunteerLoading } = useVolunteerSchedule(
    format(selectedDate, 'yyyy-MM-dd')
  );
  const { data: trainingData, isLoading: trainingLoading } = useTrainingCompletion();
  const { data: qualityData, isLoading: qualityLoading } = useQualityMetrics();

  // Mock data - replace with actual API
  const volunteers: Volunteer[] = volunteerData?.data?.volunteers || [];
  const trainings: Training[] = trainingData?.data?.trainings || [];
  const qualityMetrics: QualityMetric[] = qualityData?.data?.metrics || [];

  // Training Columns
  const trainingColumns: Column<Training>[] = [
    { key: 'staffName', label: 'Staff Member', sortable: true },
    { key: 'course', label: 'Course', sortable: true },
    {
      key: 'completed',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value ? 'Completed' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'completionDate',
      label: 'Completed',
      sortable: true,
      render: (value) => (value ? format(new Date(value), 'MMM d, yyyy') : '-'),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM d, yyyy'),
    },
  ];

  // Volunteer Columns
  const volunteerColumns: Column<Volunteer>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'availability',
      label: 'Availability',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.map((day: string) => (
            <span key={day} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {day}
            </span>
          ))}
        </div>
      ),
    },
    { key: 'hoursThisMonth', label: 'Hours This Month', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  // Quality Metrics Chart Data
  const qualityChartData = qualityMetrics.map((m) => ({
    name: m.category,
    score: m.score,
    target: m.target,
  }));

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'manage-volunteers',
      label: 'Manage Volunteers',
      icon: Users,
      onClick: () => console.log('Manage volunteers'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'track-training',
      label: 'Track Training',
      icon: CheckCircle,
      onClick: () => console.log('Track training'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'mobile-units',
      label: 'Mobile Units',
      icon: MapPin,
      onClick: () => console.log('Mobile units'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'quality-checklist',
      label: 'Quality Checklist',
      icon: FileCheck,
      onClick: () => console.log('Quality checklist'),
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Operational Dashboard</h1>
        <p className="text-gray-600 mt-1">Volunteer management, training, and quality metrics</p>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volunteer Schedule */}
        <div>
          <DataTable
            data={volunteers}
            columns={volunteerColumns}
            title="Volunteer Schedule"
            loading={volunteerLoading}
            onRowClick={(row) => console.log('View volunteer:', row)}
          />
        </div>

        {/* Training Completion */}
        <div>
          <DataTable
            data={trainings}
            columns={trainingColumns}
            title="Training Completion"
            loading={trainingLoading}
            onRowClick={(row) => console.log('View training:', row)}
          />
        </div>

        {/* Quality Metrics Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Quality Metrics"
            loading={qualityLoading}
            onExport={() => console.log('Export quality metrics')}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qualityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#ef4444" name="Current Score" />
                <Bar dataKey="target" fill="#94a3b8" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Compliance Checklist */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Checklist</h3>
            <div className="space-y-3">
              {qualityMetrics.map((metric) => (
                <div
                  key={metric.category}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    {metric.status === 'pass' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    ) : (
                      <FileCheck className="h-5 w-5 text-yellow-600 mr-3" />
                    )}
                    <span className="font-medium text-gray-900">{metric.category}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Score: {metric.score}% / Target: {metric.target}%
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-xs ${
                        metric.status === 'pass'
                          ? 'bg-green-100 text-green-800'
                          : metric.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {metric.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

