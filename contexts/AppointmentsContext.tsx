import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Appointment, AppointmentStatus, Service, User, UserRole } from '../types';

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

const mockServices: Service[] = [
  { id: '1', name: 'Corte de Cabelo', duration: 45, price: 50.0 },
  { id: '2', name: 'Manicure', duration: 60, price: 40.0 },
  { id: '3', name: 'Limpeza de Pele', duration: 90, price: 120.0 },
];

const mockAttendants: User[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=8B5CF6&color=fff' },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Bruno+Costa&background=3B82F6&color=fff' },
];

const initialAppointments: Appointment[] = [
  { id: 'A1', clientName: 'Carlos Pereira', clientPhone: '(11) 98765-4321', service: mockServices[0], startTime: new Date(new Date().setHours(10, 0, 0, 0)), endTime: new Date(new Date().setHours(10, 45, 0, 0)), status: AppointmentStatus.Pendente, attendant: mockAttendants[0], source: 'admin' },
  { id: 'A2', clientName: 'Fernanda Lima', clientPhone: '(21) 91234-5678', service: mockServices[1], startTime: new Date(new Date().setHours(11, 0, 0, 0)), endTime: new Date(new Date().setHours(12, 0, 0, 0)), status: AppointmentStatus.EmAndamento, attendant: mockAttendants[1], source: 'whatsapp' },
  { id: 'A3', clientName: 'Ricardo Alves', clientPhone: '(31) 99999-8888', service: mockServices[2], startTime: new Date(new Date().setHours(9, 0, 0, 0)), endTime: new Date(new Date().setHours(10, 30, 0, 0)), status: AppointmentStatus.Concluido, attendant: mockAttendants[0], source: 'admin' },
  { id: 'A4', clientName: 'Juliana Souza', clientPhone: '(41) 98888-7777', service: mockServices[0], startTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 45, 0, 0)), status: AppointmentStatus.Pendente, attendant: mockAttendants[1], source: 'whatsapp' },
];

export const AppointmentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      id: `A${Date.now()}`,
      ...appointmentData,
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );
  };

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, updateAppointmentStatus }}>
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
