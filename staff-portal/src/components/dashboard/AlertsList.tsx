/**
 * Alerts List component - filterable list of alerts
 */

import { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, Filter } from 'lucide-react';

export type AlertType = 'critical' | 'warning' | 'info' | 'success';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface AlertsListProps {
  alerts: Alert[];
  loading?: boolean;
  onActionClick?: (alert: Alert) => void;
}

export default function AlertsList({ alerts, loading = false, onActionClick }: AlertsListProps) {
  const [filter, setFilter] = useState<AlertType | 'all'>('all');

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((a) => a.type === filter);

  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getBgColor = (type: AlertType) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No alerts at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Filter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AlertType | 'all')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getBgColor(alert.type)} transition-colors hover:shadow-sm`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                {alert.actionUrl && alert.actionLabel && (
                  <button
                    onClick={() => onActionClick?.(alert)}
                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    {alert.actionLabel} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

