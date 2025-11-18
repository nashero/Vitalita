/**
 * Donor List Component
 * Privacy-first: Only displays hash IDs, no PII
 */

import { useState } from 'react';
import { useDonors, Donor, DonorFilters } from '../../hooks/useDonors';
import DataTable, { Column } from '../dashboard/DataTable';
import { Search, Filter, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function DonorList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DonorFilters>({
    page: 1,
    limit: 20,
  });
  const [searchHash, setSearchHash] = useState('');

  const { data, isLoading } = useDonors(filters);

  const donors: Donor[] = data?.data?.donors || [];

  // Columns (privacy: only hash, no PII)
  const columns: Column<Donor>[] = [
    {
      key: 'hash_display',
      label: 'Donor Hash',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'total_donations',
      label: 'Total Donations',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 0}</span>
      ),
    },
    {
      key: 'total_donations_this_year',
      label: 'This Year',
      sortable: true,
      render: (value) => (
        <span className="text-gray-600">{value || 0}</span>
      ),
    },
    {
      key: 'last_donation_date',
      label: 'Last Donation',
      sortable: true,
      render: (value) => (
        value ? (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{format(new Date(value), 'MMM d, yyyy')}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Never</span>
        )
      ),
    },
    {
      key: 'eligibility_status',
      label: 'Eligibility',
      sortable: true,
      render: (value, row) => {
        if (value === 'eligible') {
          return (
            <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              <CheckCircle className="h-3 w-3" />
              <span>Eligible</span>
            </span>
          );
        } else if (value === 'ineligible') {
          return (
            <div className="flex flex-col space-y-1">
              <span className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                <XCircle className="h-3 w-3" />
                <span>Ineligible</span>
              </span>
              {row.next_eligible_date && (
                <span className="text-xs text-gray-500">
                  Eligible: {format(new Date(row.next_eligible_date), 'MMM d')}
                </span>
              )}
            </div>
          );
        } else {
          return (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
              Inactive
            </span>
          );
        }
      },
    },
    {
      key: 'center_name',
      label: 'Center',
      sortable: false,
      render: (value) => (
        <span className="text-sm text-gray-600">{value || 'Unknown'}</span>
      ),
    },
  ];

  const handleSearch = () => {
    if (searchHash.trim().length >= 4) {
      setFilters({ ...filters, search: searchHash.trim(), page: 1 });
    }
  };

  const handleRowClick = (row: Donor) => {
    navigate(`/donors/${row.donor_hash_id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Donor Management</h2>
        <p className="text-gray-600 mt-1">Privacy-first: Only hash-based identification</p>
      </div>

      {/* Search by Hash */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Search className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Search by Donor Hash</h3>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Staff must obtain the donor hash ID from the donor directly. Minimum 4 characters required.
        </p>
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter donor hash (first 4+ characters)..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searchHash.trim().length < 4}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Status</label>
            <select
              value={filters.eligibility_status || ''}
              onChange={(e) => setFilters({ ...filters, eligibility_status: e.target.value || undefined, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All</option>
              <option value="eligible">Eligible</option>
              <option value="ineligible">Ineligible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type</label>
            <select
              value={filters.donation_type || ''}
              onChange={(e) => setFilters({ ...filters, donation_type: e.target.value || undefined, page: 1 })}
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
              value={filters.start_date || ''}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value || undefined, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={donors}
        columns={columns}
        loading={isLoading}
        title="Donors"
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      {data?.meta && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{' '}
            {Math.min((filters.page || 1) * (filters.limit || 20), data.meta.total)} of {data.meta.total} donors
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              disabled={(filters.page || 1) === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {filters.page || 1} of {data.meta.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={(filters.page || 1) >= data.meta.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Privacy Notice:</strong> This interface only displays donor hash IDs for identification.
          No personally identifiable information (PII) is shown. All access to donor records is logged for audit purposes.
        </p>
      </div>
    </div>
  );
}

