/**
 * Appointment Calendar Component
 * Full calendar view with FullCalendar integration
 */

import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAppointmentsCalendar, useUpdateAppointment } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { Calendar, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface AppointmentEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    appointment_id: string;
    donor_hash_id: string;
    donation_type: string;
    status: string;
    center_name: string;
  };
}

const statusColors: Record<string, { bg: string; border: string }> = {
  scheduled: { bg: '#3b82f6', border: '#2563eb' }, // Blue
  confirmed: { bg: '#10b981', border: '#059669' }, // Green
  arrived: { bg: '#f59e0b', border: '#d97706' }, // Amber
  'in-progress': { bg: '#8b5cf6', border: '#7c3aed' }, // Purple
  completed: { bg: '#6b7280', border: '#4b5563' }, // Gray
  cancelled: { bg: '#ef4444', border: '#dc2626' }, // Red
  'no-show': { bg: '#9ca3af', border: '#6b7280' }, // Light gray
};

export default function AppointmentCalendar() {
  const { hasPermission } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  // Get calendar data
  const startDate = format(selectedDate, 'yyyy-MM-dd');
  const endDate = format(new Date(selectedDate.getTime() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  
  const { data: calendarData, isLoading, refetch } = useAppointmentsCalendar(startDate, endDate);
  const updateAppointment = useUpdateAppointment();

  // Convert appointments to FullCalendar events
  const events: AppointmentEvent[] = (calendarData?.data?.appointments || []).map((apt: any) => ({
    id: apt.appointment_id,
    title: `${apt.donation_type} - ${apt.donor_hash_id.substring(0, 8)}`,
    start: apt.appointment_datetime,
    end: new Date(new Date(apt.appointment_datetime).getTime() + 30 * 60 * 1000).toISOString(),
    backgroundColor: statusColors[apt.status]?.bg || '#6b7280',
    borderColor: statusColors[apt.status]?.border || '#4b5563',
    extendedProps: {
      appointment_id: apt.appointment_id,
      donor_hash_id: apt.donor_hash_id,
      donation_type: apt.donation_type,
      status: apt.status,
      center_name: apt.center_name || 'Unknown',
    },
  }));

  // Handle event click
  const handleEventClick = (clickInfo: any) => {
    setSelectedAppointment(clickInfo.event.id);
  };

  // Handle date change
  const handleDatesSet = (arg: any) => {
    setSelectedDate(new Date(arg.start));
    refetch();
  };

  // Handle event drop (rescheduling)
  const handleEventDrop = async (dropInfo: any) => {
    if (!hasPermission('appointments:update')) {
      toast.error('You do not have permission to reschedule appointments');
      dropInfo.revert();
      return;
    }

    const newStart = dropInfo.event.start;
    const appointmentId = dropInfo.event.extendedProps.appointment_id;

    try {
      await updateAppointment.mutateAsync({
        id: appointmentId,
        data: {
          appointment_datetime: newStart.toISOString(),
        },
      });
      toast.success('Appointment rescheduled successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to reschedule appointment');
      dropInfo.revert();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Appointment Calendar</h2>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={currentView}
            onChange={(e) => {
              setCurrentView(e.target.value);
              calendarRef.current?.getApi().changeView(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="dayGridMonth">Month</option>
            <option value="timeGridWeek">Week</option>
            <option value="timeGridDay">Day</option>
          </select>
        </div>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        events={events}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        eventDrop={handleEventDrop}
        editable={hasPermission('appointments:update')}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        weekends={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          startTime: '08:00',
          endTime: '18:00',
        }}
      />

      {/* Status Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 2 }}
            />
            <span className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Appointment Details Modal (to be implemented) */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
            <p className="text-gray-600">Appointment ID: {selectedAppointment}</p>
            <button
              onClick={() => setSelectedAppointment(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

