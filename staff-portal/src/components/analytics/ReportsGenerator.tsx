/**
 * Reports Generator Component
 * Custom report generation with scheduling
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGenerateReport, useDownloadReport } from '../../hooks/useAnalytics';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Download, FileText, Mail, Clock, Loader } from 'lucide-react';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

interface ReportFormData {
  report_type: 'donations' | 'donors' | 'operational' | 'financial';
  start_date: string;
  end_date: string;
  center_id?: string;
  format: 'csv' | 'excel' | 'pdf';
  include_charts: boolean;
  schedule_recurring?: boolean;
  email_delivery?: boolean;
}

export default function ReportsGenerator() {
  const { hasPermission } = useAuth();
  const generateReport = useGenerateReport();
  const downloadReport = useDownloadReport();
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReportFormData>({
    defaultValues: {
      report_type: 'donations',
      start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      format: 'csv',
      include_charts: false,
    },
  });

  const reportType = watch('report_type');
  const canGenerateFinancial = hasPermission('financial:view');

  const onSubmit = async (data: ReportFormData) => {
    try {
      const result = await generateReport.mutateAsync(data);
      setGeneratedReportId(result.data.report_id);
      toast.success('Report generated successfully');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDownload = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!generatedReportId) return;
    await downloadReport.mutateAsync({ reportId: generatedReportId, format });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Report Generator</h2>
        <p className="text-gray-600 mt-1">Generate custom reports with flexible filters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...register('report_type', { required: true })}
                      value="donations"
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Donations</p>
                      <p className="text-sm text-gray-600">Donation history and trends</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...register('report_type', { required: true })}
                      value="donors"
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Donors</p>
                      <p className="text-sm text-gray-600">Donor statistics</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...register('report_type', { required: true })}
                      value="operational"
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Operational</p>
                      <p className="text-sm text-gray-600">Appointments and operations</p>
                    </div>
                  </label>
                  {canGenerateFinancial && (
                    <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        {...register('report_type', { required: true })}
                        value="financial"
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Financial</p>
                        <p className="text-sm text-gray-600">Budget and expenses</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...register('start_date', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    End Date
                  </label>
                  <input
                    type="date"
                    {...register('end_date', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...register('format', { required: true })}
                      value="csv"
                      className="text-red-600 focus:ring-red-500"
                    />
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">CSV</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...register('format', { required: true })}
                      value="excel"
                      className="text-red-600 focus:ring-red-500"
                    />
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Excel</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...register('format', { required: true })}
                      value="pdf"
                      className="text-red-600 focus:ring-red-500"
                    />
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">PDF</span>
                  </label>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('include_charts')}
                    className="text-red-600 focus:ring-red-500 rounded"
                  />
                  <span className="text-sm text-gray-700">Include charts and visualizations</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('email_delivery')}
                    className="text-red-600 focus:ring-red-500 rounded"
                  />
                  <span className="text-sm text-gray-700">Email report when ready</span>
                </label>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={generateReport.isPending}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {generateReport.isPending ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Generated Report Actions */}
        {generatedReportId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Ready</h3>
            <p className="text-sm text-gray-600 mb-4">
              Report ID: <span className="font-mono">{generatedReportId.substring(0, 8)}...</span>
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleDownload('csv')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
                <span>Download CSV</span>
              </button>
              <button
                onClick={() => handleDownload('excel')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
                <span>Download Excel</span>
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

