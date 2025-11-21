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

// Financial Types
export interface FinancialCategory {
    id: string;
    companyId: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
    icon?: string;
    description?: string;
    isDefault: boolean;
    createdAt: Date;
}

export interface FinancialTransaction {
    id: string;
    companyId: string;
    categoryId?: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    notes?: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check' | 'other';
    dueDate: Date;
    paidDate?: Date;
    clientId?: string;
    appointmentId?: string;
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrenceEndDate?: Date;
    parentTransactionId?: string;
    attachedFileUrl?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FinancialGoal {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    type: 'income' | 'expense' | 'profit';
    targetAmount: number;
    currentAmount: number;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface FinancialAccount {
    id: string;
    companyId: string;
    name: string;
    type: 'checking' | 'savings' | 'cash' | 'credit_card' | 'other';
    bankName?: string;
    accountNumber?: string;
    initialBalance: number;
    currentBalance: number;
    color: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface FinancialMetrics {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    paidIncome: number;
    paidExpense: number;
    pendingIncome: number;
    pendingExpense: number;
    overdueCount: number;
}

// Permissions Types
export interface Permission {
    id: string;
    module: string;
    action: string;
    description?: string;
    createdAt: Date;
}

export interface CompanyRole {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    isSystemRole: boolean;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RolePermission {
    roleId: string;
    permissionId: string;
    granted: boolean;
    createdAt: Date;
}

export interface UserPermissions {
    [module: string]: string[]; // module -> actions[]
}

// Kanban Types
export interface KanbanColumn {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    color: string;
    position: number;
    isDefault: boolean;
    limitWip?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface KanbanCard {
    id: string;
    companyId: string;
    columnId: string;
    appointmentId?: string;
    title: string;
    description?: string;
    clientName?: string;
    clientPhone?: string;
    assignedTo?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    position: number;
    dueDate?: Date;
    completedAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface KanbanMovement {
    id: string;
    cardId: string;
    fromColumnId?: string;
    toColumnId: string;
    movedBy?: string;
    movedAt: Date;
    notes?: string;
}

export interface KanbanComment {
    id: string;
    cardId: string;
    userId?: string;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface KanbanStats {
    columnId: string;
    columnName: string;
    cardCount: number;
    highPriorityCount: number;
    overdueCount: number;
    avgTimeInColumn: string;
}

export type Page = 
  | 'dashboard' 
  | 'agendamentos' 
  | 'servicos'
  | 'profissionais'
  | 'clientes'
  | 'empresas'
  | 'financeiro'
  | 'planos'
  | 'relatorios'
  | 'configuracoes'
  | 'faq'
  | 'manualUsuario'
  | 'manualAdmin';