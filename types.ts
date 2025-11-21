export enum AppointmentStatus {
  Pendente = 'Pendente',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluído',
  Cancelado = 'Cancelado',
  Personalizado = 'Personalizado'
}

export enum UserRole {
  Administrador = 'Administrador',
  Gerente = 'Gerente',
  Atendente = 'Atendente',
  Cliente = 'Cliente',
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface User {
  id:string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Professional extends User {
    specialties: string[];
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    lastAppointment?: Date;
    consentLgpd: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: Service;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  attendant: User;
  source: 'whatsapp' | 'admin';
}

export interface Plan {
    id: string;
    name: string;
    price: string;
    frequency: string;
    features: string[];
    isPopular: boolean;
    description?: string;
}

export type Page = 
  | 'dashboard' 
  | 'agendamentos' 
  | 'servicos'
  | 'profissionais'
  | 'clientes'
  | 'empresas'
  | 'planos'
  | 'relatorios'
  | 'configuracoes'
  | 'faq'
  | 'manualUsuario'
  | 'manualAdmin';