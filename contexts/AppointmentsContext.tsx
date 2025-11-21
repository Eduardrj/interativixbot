import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Appointment as AppointmentType, AppointmentStatus } from '../types';
import { Service, Professional } from '../types';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

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
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  // Carregar agendamentos do Supabase
  useEffect(() => {
    if (!user || !currentCompany) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    const loadAppointments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('company_id', currentCompany.id);

        if (error) throw error;

        // Converter dados do Supabase para o formato do app
        const formattedAppointments = (data || []).map(apt => {
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
        console.error('Erro ao carregar agendamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    // Inscrever-se em mudanças em tempo real
    const subscription = supabase
      .channel(`appointments:${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `company_id=eq.${currentCompany.id}`,
        },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentCompany]);

  const addAppointment = async (appointmentData: Omit<AppointmentType, 'id'>): Promise<AppointmentType> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            client_name: appointmentData.clientName,
            client_phone: appointmentData.clientPhone,
            service_id: appointmentData.service.id,
            start_time: appointmentData.startTime.toISOString(),
            end_time: appointmentData.endTime.toISOString(),
            status: appointmentData.status,
            attendant_id: appointmentData.attendant.id,
            source: appointmentData.source,
            company_id: currentCompany.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newAppointment: AppointmentType = {
        id: data.id,
        ...appointmentData,
      };

      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<void> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev =>
        prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
      );
    } catch (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
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
    throw new Error('useAppointments deve ser usado dentro de um AppointmentsProvider');
  }
  return context;
};

export { mockServices, mockAttendants };
