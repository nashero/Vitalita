/**
 * Administrative Dashboard - for Admin Staff, IT, Communications
 */

import { useState } from 'react';
import { useAppointments, useAlerts } from '../../hooks/useDashboardData';
import DataTable, { Column } from './DataTable';
import QuickActions, { QuickAction } from './QuickActions';
import AlertsList, { Alert } from './AlertsList';
import { Search, Users, FileText, Package, Bell, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastDonation: string;
  totalDonations: number;
}

interface Appointment {
  id: string;
  donorName: string;
  date: string;
  time: string;
  type: 'blood' | 'plasma';
  status: string;
}

interface Supply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  unit: string;
}

export default function AdministrativeDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();

  // Mock data - replace with actual API calls
  const donors: Donor[] = [];
  const appointments: Appointment[] = appointmentsData?.data?.appointments || [];
  const supplies: Supply[] = [
    {
      id: '1',
      name: 'Blood Collection Bags',
      category: 'Supplies',
      quantity: 45,
      threshold: 50,
      unit: 'units',
    },
    {
      id: '2',
      name: 'Needles',
      category: 'Supplies',
      quantity: 120,
      threshold: 100,
      unit: 'units',
    },
  ];
  const alerts: Alert[] = alertsData?.data?.alerts || [];

  // Donor Columns
  const donorColumns: Column<Donor>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    {
      key: 'lastDonation',
      label: 'Last Donation',
      sortable: true,
      render: (value) => (value ? format(new Date(value), 'MMM d, yyyy') : 'Never'),
    },
    { key: 'totalDonations', label: 'Total Donations', sortable: true },
  ];

  // Appointment Columns
  const appointmentColumns: Column<Appointment>[] = [
    { key: 'donorName', label: 'Donor', sortable: true },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM d, yyyy'),
    },
    {
      key: 'time',
      label: 'Time',
      sortable: true,
      render: (value) => format(new Date(value), 'HH:mm'),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === 'blood' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{value}</span>
      ),
    },
  ];

  // Supply Columns
  const supplyColumns: Column<Supply>[] = [
    { key: 'name', label: 'Item', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (value, row) => {
        const isLow = value < row.threshold;
        return (
          <span className={isLow ? 'text-red-600 font-medium' : ''}>
            {value} {row.unit}
          </span>
        );
      },
    },
    {
      key: 'threshold',
      label: 'Threshold',
      sortable: true,
      render: (value) => `${value} units`,
    },
  ];

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'manage-appointments',
      label: 'Manage Appointments',
      icon: Calendar,
      onClick: () => console.log('Manage appointments'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'search-donors',
      label: 'Search Donors',
      icon: Search,
      onClick: () => console.log('Search donors'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'manage-supplies',
      label: 'Manage Supplies',
      icon: Package,
      onClick: () => console.log('Manage supplies'),
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      id: 'staff-directory',
      label: 'Staff Directory',
      icon: Users,
      onClick: () => console.log('Staff directory'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      onClick: () => console.log('Documents'),
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      onClick: () => console.log('Notifications'),
      color: 'bg-red-600 hover:bg-red-700',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administrative Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage appointments, donors, and system operations</p>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Donor Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Database Search</h3>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Search
          </button>
        </div>
        {searchTerm && (
          <div className="mt-4">
            <DataTable data={donors} columns={donorColumns} searchable={false} />
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Management */}
        <div>
          <DataTable
            data={appointments}
            columns={appointmentColumns}
            title="Recent Appointments"
            loading={appointmentsLoading}
            onRowClick={(row) => console.log('View appointment:', row)}
          />
        </div>

        {/* Supply Inventory */}
        <div>
          <DataTable
            data={supplies}
            columns={supplyColumns}
            title="Supply Inventory"
            loading={false}
            onRowClick={(row) => console.log('View supply:', row)}
          />
        </div>
      </div>

      {/* System Notifications */}
      <AlertsList alerts={alerts} loading={alertsLoading} />
    </div>
  );
}

