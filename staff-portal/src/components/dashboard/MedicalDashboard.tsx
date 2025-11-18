/**
 * Medical Dashboard - for Nurses, Physicians, Phlebotomists
 */

import { useState } from 'react';
import { useAppointments, useDonorQueue, useAlerts } from '../../hooks/useDashboardData';
import AppointmentCalendar from './AppointmentCalendar';
import DataTable, { Column } from './DataTable';
import AlertsList, { Alert } from './AlertsList';
import QuickActions, { QuickAction } from './QuickActions';
import { CheckCircle, AlertTriangle, Package, Heart, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Donor {
  id: string;
  name: string;
  appointmentTime: string;
  status: 'waiting' | 'in-progress' | 'completed';
  donationType: 'blood' | 'plasma';
}

interface EligibilityReview {
  id: string;
  donorName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  submittedAt: string;
}

export default function MedicalDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments(
    format(selectedDate, 'yyyy-MM-dd')
  );
  const { data: queueData, isLoading: queueLoading } = useDonorQueue();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();

  const appointments = appointmentsData?.data?.appointments || [];
  const donorQueue: Donor[] = queueData?.data?.queue || [];
  const eligibilityReviews: EligibilityReview[] = [
    // Mock data - replace with actual API
    {
      id: '1',
      donorName: 'John Doe',
      reason: 'Recent travel to high-risk area',
      priority: 'high',
      submittedAt: '2024-01-15T10:00:00',
    },
  ];
  const alerts: Alert[] = alertsData?.data?.alerts || [];

  // Donor Queue Columns
  const queueColumns: Column<Donor>[] = [
    {
      key: 'name',
      label: 'Donor Name',
      sortable: true,
    },
    {
      key: 'appointmentTime',
      label: 'Appointment Time',
      sortable: true,
      render: (value) => format(new Date(value), 'HH:mm'),
    },
    {
      key: 'donationType',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${value === 'blood' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          waiting: { color: 'bg-yellow-100 text-yellow-800', label: 'Waiting' },
          'in-progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
          completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
        };
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.waiting;
        return (
          <span className={`px-2 py-1 rounded text-xs ${config.color}`}>{config.label}</span>
        );
      },
    },
  ];

  // Eligibility Reviews Columns
  const eligibilityColumns: Column<EligibilityReview>[] = [
    {
      key: 'donorName',
      label: 'Donor',
      sortable: true,
    },
    {
      key: 'reason',
      label: 'Reason',
      sortable: false,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => {
        const priorityConfig = {
          high: { color: 'bg-red-100 text-red-800', label: 'High' },
          medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
          low: { color: 'bg-green-100 text-green-800', label: 'Low' },
        };
        const config = priorityConfig[value as keyof typeof priorityConfig] || priorityConfig.medium;
        return <span className={`px-2 py-1 rounded text-xs ${config.color}`}>{config.label}</span>;
      },
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM d, HH:mm'),
    },
  ];

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'mark-arrived',
      label: 'Mark Arrived',
      icon: CheckCircle,
      onClick: () => console.log('Mark arrived'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'record-donation',
      label: 'Record Donation',
      icon: Heart,
      onClick: () => console.log('Record donation'),
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      id: 'report-adverse',
      label: 'Report Adverse Event',
      icon: AlertTriangle,
      onClick: () => console.log('Report adverse event'),
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      id: 'check-inventory',
      label: 'Check Inventory',
      icon: Package,
      onClick: () => console.log('Check inventory'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Medical Dashboard</h1>
        <p className="text-gray-600 mt-1">Today's schedule and donor management</p>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Calendar */}
        <div className="lg:col-span-2">
          <AppointmentCalendar
            appointments={appointments}
            onDateSelect={setSelectedDate}
            loading={appointmentsLoading}
          />
        </div>

        {/* Donor Check-in Queue */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Check-in Queue</h3>
            {queueLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : donorQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No donors in queue</div>
            ) : (
              <div className="space-y-3">
                {donorQueue.map((donor) => (
                  <div
                    key={donor.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{donor.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(donor.appointmentTime), 'HH:mm')} - {donor.donationType}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Eligibility Reviews */}
        <div className="lg:col-span-1">
          <DataTable
            data={eligibilityReviews}
            columns={eligibilityColumns}
            title="Pending Eligibility Reviews"
            loading={false}
            onRowClick={(row) => console.log('Review eligibility:', row)}
          />
        </div>

        {/* Medical Inventory Alerts */}
        <div className="lg:col-span-2">
          <AlertsList
            alerts={alerts.filter((a) => a.type === 'warning' || a.type === 'critical')}
            loading={alertsLoading}
          />
        </div>
      </div>
    </div>
  );
}

