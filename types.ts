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

// =====================================================
// INTEGRATIONS TYPES
// =====================================================

export interface IntegrationConfig {
    id: string;
    companyId: string;
    provider: 'whatsapp' | 'google_calendar' | 'zapier' | 'webhook';
    name: string;
    isActive: boolean;
    config: Record<string, any>; // API keys, tokens, etc
    createdAt: Date;
    updatedAt: Date;
}

export interface IntegrationSyncLog {
    id: string;
    companyId: string;
    integrationId?: string;
    provider: string;
    syncType: string; // 'appointment_create', 'message_send', etc
    status: 'success' | 'error' | 'pending';
    entityType?: string;
    entityId?: string;
    requestData?: Record<string, any>;
    responseData?: Record<string, any>;
    errorMessage?: string;
    syncedAt: Date;
    createdAt: Date;
}

export interface WhatsAppMessage {
    id: string;
    companyId: string;
    integrationId?: string;
    clientId: string;
    appointmentId?: string;
    phone: string;
    message: string;
    messageType: 'text' | 'template' | 'media';
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    externalId?: string;
    templateName?: string;
    templateParams?: Record<string, any>;
    errorMessage?: string;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CalendarEvent {
    id: string;
    companyId: string;
    integrationId?: string;
    appointmentId: string;
    externalEventId: string;
    calendarId: string;
    syncStatus: 'synced' | 'pending' | 'error';
    lastSyncAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WebhookEndpoint {
    id: string;
    companyId: string;
    name: string;
    url: string;
    method: 'POST' | 'GET' | 'PUT';
    headers: Record<string, string>;
    events: string[]; // ['appointment.created', 'client.created', etc]
    isActive: boolean;
    secretKey?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WebhookDelivery {
    id: string;
    webhookId: string;
    companyId: string;
    eventType: string;
    payload: Record<string, any>;
    statusCode?: number;
    responseBody?: string;
    errorMessage?: string;
    attemptCount: number;
    deliveredAt: Date;
    createdAt: Date;
}

export interface IntegrationStats {
    provider: string;
    activeConfigs: number;
    totalSyncs: number;
    successSyncs: number;
    errorSyncs: number;
    lastSyncAt?: Date;
}

// Analytics Module
export interface AnalyticsMetric {
    id: string;
    companyId: string;
    metricType: 'revenue' | 'expenses' | 'profit' | 'appointments' | 'clients' | 'conversion' | 'cancellation' | 'custom';
    metricCategory: 'financial' | 'operational' | 'customer' | 'employee';
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    periodStart: Date;
    periodEnd: Date;
    value: number;
    previousValue?: number;
    targetValue?: number;
    unit?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface AnalyticsDashboard {
    id: string;
    companyId: string;
    userId?: string;
    name: string;
    description?: string;
    isDefault: boolean;
    isPublic: boolean;
    layout: Record<string, any>; // Grid layout configuration
    widgets: Record<string, any>[]; // Widget configurations
    filters?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface AnalyticsReport {
    id: string;
    companyId: string;
    createdBy: string;
    name: string;
    description?: string;
    reportType: 'financial' | 'operational' | 'customer' | 'custom';
    parameters: Record<string, any>;
    schedule?: Record<string, any>; // Cron-like schedule
    lastGeneratedAt?: Date;
    isActive: boolean;
    recipients: string[];
    format: 'pdf' | 'csv' | 'xlsx';
    createdAt: Date;
    updatedAt: Date;
}

export interface AnalyticsEvent {
    id: string;
    companyId: string;
    userId?: string;
    eventType: string; // 'page_view', 'button_click', 'feature_used', etc
    eventCategory: 'navigation' | 'interaction' | 'transaction' | 'error';
    entityType?: string;
    entityId?: string;
    properties?: Record<string, any>;
    sessionId?: string;
    createdAt: Date;
}

export interface AnalyticsKPI {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    calculationFormula: string; // SQL expression
    targetValue?: number;
    unit?: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    isActive: boolean;
    alertThreshold?: number;
    alertType?: 'above' | 'below';
    notificationEmails?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DashboardKPI {
    kpiName: string;
    currentValue: number;
    previousValue: number;
    variationPercent: number;
    trend: 'up' | 'down' | 'stable';
    unit: string;
}

export interface RevenueChartData {
    periodLabel: string;
    revenue: number;
    expenses: number;
    profit: number;
}

export interface ChartDataPoint {
    label: string;
    value: number;
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
  | 'manualAdmin'
  | 'kanban'
  | 'crm'
  | 'permissoes'
  | 'integracoes'
  | 'analytics';