/**
 * Appointment List Component
 * Tabular view with sorting, filtering, and quick actions
 */

import { useState } from 'react';
import { useAppointments, useUpdateAppointmentStatus, Appointment } from '../../hooks/useAppointments';
import DataTable, { Column } from '../dashboard/DataTable';
import { CheckCircle, XCircle, Clock, User, Calendar, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useExportAppointments } from '../../hooks/useAppointments';

const statusBadges: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
  arrived: { label: 'Arrived', className: 'bg-amber-100 text-amber-800' },
  'in-progress': { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  'no-show': { label: 'No Show', className: 'bg-gray-100 text-gray-600' },
};

export default function AppointmentList() {
  const { hasPermission } = useAuth();
  const [filters, setFilters] = useState({
    status: '',
    donation_type: '',
    start_date: '',
    end_date: '',
    search: '',
  });
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAppointments({
    ...filters,
    page,
    limit: 20,
  });

  const updateStatus = useUpdateAppointmentStatus();
  const exportAppointments = useExportAppointments();

  const appointments: Appointment[] = data?.data?.appointments || [];

  // Columns
  const columns: Column<Appointment>[] = [
    {
      key: 'appointment_datetime',
      label: 'Date & Time',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM d, yyyy HH:mm'),
    },
    {
      key: 'donor_hash_id',
      label: 'Donor ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value.substring(0, 12)}...</span>
      ),
    },
    {
      key: 'donation_type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="capitalize">{value.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const badge = statusBadges[value] || statusBadges.scheduled;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      key: 'center_name',
      label: 'Center',
      sortable: false,
      render: (value) => value || 'Unknown',
    },
    {
      key: 'booking_channel',
      label: 'Channel',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 capitalize">{value.replace('_', ' ')}</span>
      ),
    },
  ];

  // Quick actions
  const handleQuickAction = async (appointmentId: string, status: Appointment['status']) => {
    await updateStatus.mutateAsync({ id: appointmentId, status });
  };

  // Bulk actions
  const handleBulkAction = async (status: Appointment['status']) => {
    for (const id of selectedAppointments) {
      await updateStatus.mutateAsync({ id, status });
    }
    setSelectedAppointments([]);
  };

  // Export
  const handleExport = () => {
    exportAppointments.mutate(filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-600 mt-1">Manage and track appointment bookings</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasPermission('appointments:export') && (
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              {Object.keys(statusBadges).map((status) => (
                <option key={status} value={status}>
                  {statusBadges[status].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type</label>
            <select
              value={filters.donation_type}
              onChange={(e) => setFilters({ ...filters, donation_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
              <option value="whole_blood">Whole Blood</option>
              <option value="plasma">Plasma</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Donor ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAppointments.length > 0 && hasPermission('appointments:update') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedAppointments.length} appointment(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('confirmed')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Confirm All
            </button>
            <button
              onClick={() => handleBulkAction('cancelled')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Cancel All
            </button>
            <button
              onClick={() => setSelectedAppointments([])}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={appointments}
        columns={columns}
        loading={isLoading}
        title="Appointments"
        onRowClick={(row) => {
          // Navigate to details or open modal
          console.log('View appointment:', row.appointment_id);
        }}
      />

      {/* Quick Actions (if row selected) */}
      {selectedAppointments.length === 1 && hasPermission('appointments:update') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction(selectedAppointments[0], 'confirmed')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Confirm</span>
            </button>
            <button
              onClick={() => handleQuickAction(selectedAppointments[0], 'arrived')}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <Clock className="h-4 w-4" />
              <span>Mark Arrived</span>
            </button>
            <button
              onClick={() => handleQuickAction(selectedAppointments[0], 'completed')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Complete</span>
            </button>
            <button
              onClick={() => handleQuickAction(selectedAppointments[0], 'cancelled')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XCircle className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.meta.total)} of {data.meta.total} appointments
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {data.meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
              disabled={page >= data.meta.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

