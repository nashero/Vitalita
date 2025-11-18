/**
 * Hook for Server-Sent Events (SSE) real-time appointment updates
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useAppointmentStream() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user) return;

    // Create EventSource connection
    const eventSource = new EventSource(`${API_BASE_URL}/api/staff/appointments/stream`, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    // Handle connection
    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    // Handle messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connected':
            console.log('Connected to appointment stream');
            break;

          case 'appointment_created':
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
            toast.success('New appointment created');
            break;

          case 'appointment_updated':
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointment', data.appointment.appointment_id] });
            queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
            break;

          case 'appointment_status_changed':
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointment', data.appointment.appointment_id] });
            queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
            queryClient.invalidateQueries({ queryKey: ['appointments-stats'] });

            // Show notification for arrivals
            if (data.appointment.status === 'arrived' && data.appointment.notification) {
              toast.success(`New arrival: ${data.appointment.center_name}`, {
                duration: 5000,
              });
            }
            break;

          case 'appointment_cancelled':
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
            toast.info('Appointment cancelled');
            break;

          default:
            console.log('Unknown event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // EventSource will automatically attempt to reconnect
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [user, queryClient]);

  return eventSourceRef.current;
}

