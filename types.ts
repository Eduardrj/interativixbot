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
    // CRM fields
    status?: 'lead' | 'prospect' | 'active' | 'inactive' | 'vip';
    pipelineStage?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
    score?: number; // 0-100
    source?: 'website' | 'referral' | 'social_media' | 'advertising' | 'event' | 'cold_call' | 'other';
    company?: string;
    position?: string;
    birthday?: Date;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        linkedin?: string;
        twitter?: string;
    };
    notes?: string;
    lastContactAt?: Date;
    assignedTo?: string; // user_id
    tags?: ClientTag[];
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

// CRM Types
export interface ClientTag {
    id: string;
    companyId: string;
    name: string;
    color: string;
    description?: string;
    createdAt: Date;
}

export interface ClientInteraction {
    id: string;
    companyId: string;
    clientId: string;
    userId?: string;
    type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'sms' | 'other';
    subject?: string;
    description: string;
    durationMinutes?: number;
    outcome?: 'positive' | 'neutral' | 'negative' | 'pending';
    scheduledAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
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