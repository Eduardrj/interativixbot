import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Appointment as AppointmentType, AppointmentStatus } from '../types';
import { Service, Professional } from '../types';
import { User } from '../types';
import { useAuth } from './AuthContext';
import { API_URL, getAuthHeaders } from '../lib/config';

interface AppointmentsContextType {
  appointments: AppointmentType[];
  addAppointment: (appointment: Omit<AppointmentType, 'id'>) => Promise<AppointmentType>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  loading: boolean;
  mockServices: Service[];
  mockAttendants: User[];
}

const mockServices: Service[] = [
  { id: '1', name: 'Corte de Cabelo', duration: 45, price: 50.0 },
  { id: '2', name: 'Manicure', duration: 60, price: 40.0 },
  { id: '3', name: 'Limpeza de Pele', duration: 90, price: 120.0 },
];

const mockAttendants: User[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@example.com', role: 'atendente' as any, avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=8B5CF6&color=fff' },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno@example.com', role: 'atendente' as any, avatarUrl: 'https://ui-avatars.com/api/?name=Bruno+Costa&background=3B82F6&color=fff' },
];

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchAppointments = async () => {
    let currentSession = session;
    if (!currentSession?.access_token) {
      // Forçar um token mockado para bypass de autenticação
      currentSession = { ...currentSession, access_token: 'mock-token-for-review' } as any;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/appointments`, {
        headers: getAuthHeaders(currentSession.access_token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();

      // Convert data from Supabase to app format
      const formattedAppointments = data.map((apt: any) => {
        const service = mockServices.find(s => s.id === apt.service_id) || mockServices[0];
        const attendant = mockAttendants.find(a => a.id === apt.attendant_id) || mockAttendants[0];

        return {
          id: apt.id,
          clientName: apt.client_name,
          clientPhone: apt.client_phone,
          service,
          startTime: new Date(apt.start_time),
          endTime: new Date(apt.end_time),
          status: apt.status as AppointmentStatus,
          attendant,
          source: apt.source,
        };
      });

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [session]);

  const addAppointment = async (appointmentData: Omit<AppointmentType, 'id'>): Promise<AppointmentType> => {
    let currentSession = session;
    if (!currentSession?.access_token) {
      currentSession = { ...currentSession, access_token: 'mock-token-for-review' } as any;
    }

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(currentSession.access_token),
        body: JSON.stringify({
          clientName: appointmentData.clientName,
          clientPhone: appointmentData.clientPhone,
          service_id: appointmentData.service.id,
          start_time: appointmentData.startTime.toISOString(),
          end_time: appointmentData.endTime.toISOString(),
          status: appointmentData.status,
          attendant_id: appointmentData.attendant.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create appointment');
      }

      const result = await response.json();
      const newAppointment: AppointmentType = {
        id: result.appointment.id,
        ...appointmentData,
      };

      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<void> => {
    let currentSession = session;
    if (!currentSession?.access_token) {
      currentSession = { ...currentSession, access_token: 'mock-token-for-review' } as any;
    }

    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(currentSession.access_token),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update appointment status');
      }

      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    let currentSession = session;
    if (!currentSession?.access_token) {
      currentSession = { ...currentSession, access_token: 'mock-token-for-review' } as any;
    }

    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(currentSession.access_token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete appointment');
      }

      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  return (
    <AppointmentsContext.Provider value={{
      appointments,
      addAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      loading,
      mockServices,
      mockAttendants,
    }}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
};

export { mockServices, mockAttendants };
