import React, { useState, useEffect } from 'react';
import { 
  History, 
  Filter, 
  Search, 
  Download, 
  RefreshCw, 
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Loader,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStaffAuth } from '../hooks/useStaffAuth';

interface AuditLog {
  log_id: string;
  timestamp: string;
  user_id: string | null;
  user_type: string;
  action: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  resource_type: string | null;
  resource_id: string | null;
  status: string;
}

interface LogFilters {
  startDate: string;
  endDate: string;
  userType: string;
  action: string;
  status: string;
  searchTerm: string;
}

type SortField = 'timestamp' | 'user_type' | 'action' | 'status';
type SortDirection = 'asc' | 'desc';

export default function SystemLogsViewer() {
  const { staff } = useStaffAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    startDate: '',
    endDate: '',
    userType: '',
    action: '',
    status: '',
    searchTerm: '',
  });
  
  // Detail view
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const userTypes = [
    { value: 'staff', label: 'Staff', icon: User, color: 'bg-blue-100 text-blue-800' },
    { value: 'donor', label: 'Donor', icon: User, color: 'bg-green-100 text-green-800' },
    { value: 'system', label: 'System', icon: Monitor, color: 'bg-purple-100 text-purple-800' },
    { value: 'admin', label: 'Admin', icon: User, color: 'bg-red-100 text-red-800' },
    { value: 'anonymous', label: 'Anonymous', icon: User, color: 'bg-gray-100 text-gray-800' },
  ];

  const statusTypes = [
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'failure', label: 'Failure', icon: XCircle, color: 'bg-red-100 text-red-800' },
    { value: 'error', label: 'Error', icon: AlertCircle, color: 'bg-red-100 text-red-800' },
    { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800' },
  ];

  useEffect(() => {
    fetchLogs();
  }, [currentPage, sortField, sortDirection, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('timestamp', new Date(filters.startDate).toISOString());
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('timestamp', endDate.toISOString());
      }
      if (filters.userType) {
        query = query.eq('user_type', filters.userType);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.action) {
        query = query.ilike('action', `%${filters.action}%`);
      }
      if (filters.searchTerm) {
        query = query.or(`details.ilike.%${filters.searchTerm}%,action.ilike.%${filters.searchTerm}%,user_id.ilike.%${filters.searchTerm}%`);
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load system logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (key: keyof LogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      userType: '',
      action: '',
      status: '',
      searchTerm: '',
    });
    setCurrentPage(1);
  };

  const exportLogs = async () => {
    try {
      // For demo purposes, we'll create a CSV export
      const csvContent = [
        ['Timestamp', 'User ID', 'User Type', 'Action', 'Status', 'Resource Type', 'Resource ID', 'IP Address', 'Details'].join(','),
        ...logs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          log.user_id || '',
          log.user_type,
          log.action,
          log.status,
          log.resource_type || '',
          log.resource_id || '',
          log.ip_address || '',
          `"${(log.details || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting logs:', err);
      setError('Failed to export logs');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      full: date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const getUserTypeConfig = (userType: string) => {
    return userTypes.find(type => type.value === userType) || userTypes[0];
  };

  const getStatusConfig = (status: string) => {
    return statusTypes.find(type => type.value === status) || statusTypes[0];
  };

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown' };
    
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
    
    return { device, browser };
  };

  const renderFilters = () => (
    <div className={`bg-white rounded-lg border border-gray-200 transition-all duration-200 ${showFilters ? 'p-6' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLogs}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                value={filters.userType}
                onChange={(e) => handleFilterChange('userType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All User Types</option>
                {userTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <input
                type="text"
                placeholder="Filter by action..."
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {statusTypes.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLogRow = (log: AuditLog) => {
    const timestamp = formatTimestamp(log.timestamp);
    const userTypeConfig = getUserTypeConfig(log.user_type);
    const statusConfig = getStatusConfig(log.status);
    const UserTypeIcon = userTypeConfig.icon;
    const StatusIcon = statusConfig.icon;
    const userAgentInfo = parseUserAgent(log.user_agent);

    return (
      <tr key={log.log_id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{timestamp.date}</div>
          <div className="text-xs text-gray-500">{timestamp.time}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className={`p-1 rounded-full ${userTypeConfig.color} mr-2`}>
              <UserTypeIcon className="w-3 h-3" />
            </div>
            <div>
              <div className="text-sm text-gray-900">
                {log.user_id ? `${log.user_id.substring(0, 8)}...` : 'System'}
              </div>
              <div className="text-xs text-gray-500">{userTypeConfig.label}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 font-medium">{log.action}</div>
          {log.resource_type && (
            <div className="text-xs text-gray-500">
              {log.resource_type}: {log.resource_id?.substring(0, 8)}...
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <Globe className="w-3 h-3 text-gray-400 mr-1" />
            <span className="text-sm text-gray-900">{log.ip_address || 'Unknown'}</span>
          </div>
          {log.user_agent && (
            <div className="flex items-center mt-1">
              {userAgentInfo.device === 'Mobile' ? (
                <Smartphone className="w-3 h-3 text-gray-400 mr-1" />
              ) : (
                <Monitor className="w-3 h-3 text-gray-400 mr-1" />
              )}
              <span className="text-xs text-gray-500">
                {userAgentInfo.device} • {userAgentInfo.browser}
              </span>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 max-w-xs truncate">
            {log.details || '-'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => {
              setSelectedLog(log);
              setShowDetailModal(true);
            }}
            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  };

  const renderDetailModal = () => {
    if (!selectedLog || !showDetailModal) return null;

    const timestamp = formatTimestamp(selectedLog.timestamp);
    const userTypeConfig = getUserTypeConfig(selectedLog.user_type);
    const statusConfig = getStatusConfig(selectedLog.status);
    const userAgentInfo = parseUserAgent(selectedLog.user_agent);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Log Entry Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                <p className="text-sm text-gray-900">{timestamp.full}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Log ID</label>
                <p className="text-sm text-gray-900 font-mono">{selectedLog.log_id}</p>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedLog.user_id || 'System'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userTypeConfig.color}`}>
                  <userTypeConfig.icon className="w-3 h-3 mr-1" />
                  {userTypeConfig.label}
                </span>
              </div>
            </div>

            {/* Action Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <p className="text-sm text-gray-900 font-medium">{selectedLog.action}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <statusConfig.icon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Resource Information */}
            {(selectedLog.resource_type || selectedLog.resource_id) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                  <p className="text-sm text-gray-900">{selectedLog.resource_type || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.resource_id || '-'}</p>
                </div>
              </div>
            )}

            {/* Network Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <p className="text-sm text-gray-900">{selectedLog.ip_address || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Info</label>
                <p className="text-sm text-gray-900">
                  {userAgentInfo.device} • {userAgentInfo.browser}
                </p>
              </div>
            </div>

            {/* Details */}
            {selectedLog.details && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLog.details}</p>
                </div>
              </div>
            )}

            {/* User Agent */}
            {selectedLog.user_agent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Agent</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-mono break-all">{selectedLog.user_agent}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalCount / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
      <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalCount} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Complete audit trail of all system activities</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total: {totalCount.toLocaleString()} entries
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {renderFilters()}

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading system logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('timestamp')}
                    >
                      <div className="flex items-center">
                        Timestamp
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('user_type')}
                    >
                      <div className="flex items-center">
                        User
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('action')}
                    >
                      <div className="flex items-center">
                        Action
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network Info
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map(log => renderLogRow(log))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {renderDetailModal()}
    </div>
  );
}