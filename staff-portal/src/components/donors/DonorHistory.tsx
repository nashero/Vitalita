/**
 * Donor History Component
 * Timeline of all donations with chart visualization
 */

import { useDonorHistory, DonationHistoryItem } from '../../hooks/useDonors';
import { format } from 'date-fns';
import { Calendar, MapPin, User, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DonorHistoryProps {
  hash: string;
}

export default function DonorHistory({ hash }: DonorHistoryProps) {
  const { data, isLoading } = useDonorHistory(hash);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const history: DonationHistoryItem[] = data?.data?.history || [];

  // Prepare chart data (aggregated by month)
  const chartData = history.reduce((acc: any[], donation) => {
    const month = format(new Date(donation.donation_date), 'MMM yyyy');
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
          <p className="text-sm text-gray-600 mt-1">
            {history.length} donation{history.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            <h4 className="font-semibold text-gray-900">Donation Frequency</h4>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#ef4444" name="Donations" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((donation, index) => (
              <div
                key={donation.donation_id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                  )}
                </div>

                {/* Donation details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {format(new Date(donation.donation_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        donation.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {donation.donation_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Volume</p>
                      <p className="font-medium text-gray-900">{donation.donation_volume}ml</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-600">Center</p>
                        <p className="font-medium text-gray-900">{donation.center_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>

                  {donation.staff_first_name && (
                    <div className="mt-2 flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-600">
                        Processed by: {donation.staff_first_name} {donation.staff_last_name}
                      </p>
                    </div>
                  )}

                  {donation.notes && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Notes</p>
                      <p className="text-sm text-gray-900">{donation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No donation history recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}

