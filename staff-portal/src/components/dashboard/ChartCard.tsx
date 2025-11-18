/**
 * Chart Card component - wrapper for charts with title and actions
 */

import { ReactNode } from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  onExport?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

export default function ChartCard({
  title,
  children,
  onExport,
  onRefresh,
  loading = false,
  className = '',
}: ChartCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Refresh chart"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Export chart"
            >
              <Download className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Content */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

