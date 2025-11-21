// =====================================================
// INTERATIVIX BOT - TYPES COMPLETOS
// =====================================================

// =====================================================
// ENUMS
// =====================================================

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show'
}

export enum UserRole {
  Owner = 'owner',
  Admin = 'admin',
  Manager = 'manager',
  Attendant = 'attendant',
  Client = 'client'
}

export enum ClientStatus {
  Lead = 'lead',
  Active = 'active',
  Inactive = 'inactive',
  VIP = 'vip',
  Blocked = 'blocked'
}

export enum InteractionType {
  Call = 'call',
  Email = 'email',
  WhatsApp = 'whatsapp',
  SMS = 'sms',
  Appointment = 'appointment',
  Note = 'note'
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Refunded = 'refunded'
}

export enum PaymentMethod {
  Cash = 'cash',
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  PIX = 'pix',
  Transfer = 'transfer'
}

export enum TransactionType {
  Income = 'income',
  Expense = 'expense'
}

export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error'
}

export enum IntegrationType {
  GoogleCalendar = 'google_calendar',
  WhatsApp = 'whatsapp',
  Stripe = 'stripe',
  MercadoPago = 'mercadopago',
  Mailgun = 'mailgun'
}

// =====================================================
// BASE INTERFACES
// =====================================================

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// =====================================================
// COMPANY (Multi-Tenant)
// =====================================================

export interface BusinessHours {
  open: string | null;
  close: string | null;
}

export interface CompanySettings {
  business_hours: {
    monday: BusinessHours;
    tuesday: BusinessHours;
    wednesday: BusinessHours;
    thursday: BusinessHours;
    friday: BusinessHours;
    saturday: BusinessHours;
    sunday: BusinessHours;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  timezone: string;
  language: string;
  currency: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Company extends BaseEntity {
  name: string;
  legal_name?: string;
  document?: string; // CNPJ/CPF
  industry?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: Address;
  settings: CompanySettings;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  active: boolean;
}

// =====================================================
// USER
// =====================================================

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface User extends BaseEntity {
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  active: boolean;
  last_login?: Date;
  preferences: UserPreferences;
}

export interface Permission {
  clients: string[];
  services: string[];
  appointments: string[];
  professionals: string[];
  financial: string[];
  reports: string[];
  settings: string[];
}

export interface CompanyUser {
  company_id: string;
  user_id: string;
  role: UserRole;
  permissions: Permission;
  active: boolean;
  joined_at: Date;
}

// =====================================================
// CLIENT (CRM)
// =====================================================

export interface Client extends BaseEntity {
  company_id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string; // CPF
  birth_date?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  photo_url?: string;
  
  // CRM
  status: ClientStatus;
  source?: 'whatsapp' | 'website' | 'instagram' | 'referral' | 'walk-in';
  tags: string[];
  score: number; // 0-100
  lifetime_value: number;
  
  // Dates
  first_contact: Date;
  last_interaction?: Date;
  last_appointment?: Date;
  
  // Compliance
  consent_lgpd: boolean;
  consent_marketing: boolean;
  
  // Metadata
  notes?: string;
  custom_fields?: Record<string, any>;
}

export interface Interaction extends BaseEntity {
  company_id: string;
  client_id: string;
  user_id?: string;
  type: InteractionType;
  channel?: string;
  subject?: string;
  content?: string;
  metadata?: Record<string, any>;
}

// =====================================================
// SERVICE
// =====================================================

export interface ServiceSettings {
  requires_deposit: boolean;
  deposit_percentage: number;
  cancellation_hours: number;
  max_advance_days: number;
}

export interface Service extends BaseEntity {
  company_id: string;
  name: string;
  description?: string;
  duration: number; // minutos
  price: number;
  category?: string;
  color?: string;
  active: boolean;
  settings: ServiceSettings;
}

// =====================================================
// PROFESSIONAL
// =====================================================

export interface Professional extends BaseEntity {
  company_id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  specialties: string[];
  
  // Performance
  rating: number; // 0.00 to 5.00
  total_reviews: number;
  total_appointments: number;
  
  active: boolean;
}

export interface ProfessionalService {
  professional_id: string;
  service_id: string;
  custom_price?: number;
  custom_duration?: number;
}

export interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0-6
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  active: boolean;
}

export interface ProfessionalBlock {
  id: string;
  professional_id: string;
  start_date: Date;
  end_date: Date;
  reason?: string;
  created_at: Date;
}

// =====================================================
// APPOINTMENT
// =====================================================

export interface Appointment extends BaseEntity {
  company_id: string;
  
  // Client
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  
  // Service
  service_id?: string;
  service_name: string;
  service_price?: number;
  service_duration?: number;
  
  // Professional
  professional_id?: string;
  professional_name: string;
  
  // Schedule
  start_time: Date;
  end_time: Date;
  
  status: AppointmentStatus;
  source: 'admin' | 'whatsapp' | 'website' | 'api';
  
  // Payment
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_date?: Date;
  
  // Review
  rating?: number; // 1-5
  review_comment?: string;
  reviewed_at?: Date;
  
  notes?: string;
  cancellation_reason?: string;
  cancelled_at?: Date;
  cancelled_by?: string;
  
  created_by?: string;
}

// =====================================================
// FINANCIAL
// =====================================================

export interface FinancialCategory extends BaseEntity {
  company_id?: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  active: boolean;
}

export interface FinancialTransaction extends BaseEntity {
  company_id: string;
  type: TransactionType;
  category_id?: string;
  amount: number;
  description?: string;
  
  // Relations
  appointment_id?: string;
  client_id?: string;
  
  payment_method?: PaymentMethod;
  transaction_date: Date;
  due_date?: Date;
  paid_date?: Date;
  
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  
  // Recurring
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'weekly' | 'yearly';
  recurring_until?: Date;
  parent_transaction_id?: string;
  
  notes?: string;
  attachments?: string[];
  
  created_by?: string;
}

// =====================================================
// INTEGRATION
// =====================================================

export interface Integration extends BaseEntity {
  company_id: string;
  type: IntegrationType;
  name: string;
  credentials?: Record<string, any>; // Encrypted
  settings?: Record<string, any>;
  active: boolean;
  last_sync?: Date;
  sync_status?: 'success' | 'error' | 'syncing';
  sync_error?: string;
}

// =====================================================
// NOTIFICATION
// =====================================================

export interface Notification extends BaseEntity {
  company_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: 'appointment' | 'payment' | 'system';
  action_url?: string;
  read: boolean;
  read_at?: Date;
}

export interface MessageTemplate extends BaseEntity {
  company_id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[]; // {{client_name}}, {{service}}, etc
  active: boolean;
}

// =====================================================
// REVIEW
// =====================================================

export interface Review extends BaseEntity {
  company_id: string;
  appointment_id: string;
  client_id: string;
  professional_id: string;
  rating: number; // 1-5
  comment?: string;
  response?: string;
  response_at?: Date;
  visible: boolean;
}

// =====================================================
// AUDIT LOG
// =====================================================

export interface AuditLog {
  id: string;
  company_id?: string;
  user_id?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'export';
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// =====================================================
// DASHBOARD / REPORTS
// =====================================================

export interface DashboardMetrics {
  // Revenue
  total_revenue: number;
  revenue_today: number;
  revenue_this_month: number;
  revenue_growth: number; // percentage
  
  // Appointments
  total_appointments: number;
  appointments_today: number;
  appointments_this_month: number;
  appointments_growth: number;
  
  // Clients
  total_clients: number;
  new_clients_today: number;
  new_clients_this_month: number;
  clients_growth: number;
  
  // Performance
  average_rating: number;
  occupancy_rate: number; // percentage
  cancellation_rate: number; // percentage
  no_show_rate: number; // percentage
}

export interface RevenueByService {
  service_name: string;
  total: number;
  count: number;
}

export interface AppointmentsByStatus {
  status: AppointmentStatus;
  count: number;
}

export interface TopProfessionals {
  professional_name: string;
  total_appointments: number;
  total_revenue: number;
  average_rating: number;
}

// =====================================================
// UI / NAVIGATION
// =====================================================

export type Page = 
  | 'dashboard'
  | 'agendamentos'
  | 'clientes'
  | 'servicos'
  | 'profissionais'
  | 'financeiro'
  | 'relatorios'
  | 'crm'
  | 'integracoes'
  | 'configuracoes'
  | 'planos'
  | 'faq'
  | 'manualUsuario'
  | 'manualAdmin';

// =====================================================
// API RESPONSES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// =====================================================
// FILTERS / QUERIES
// =====================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AppointmentFilters {
  status?: AppointmentStatus[];
  professional_id?: string;
  client_id?: string;
  service_id?: string;
  date_range?: DateRange;
  source?: string[];
}

export interface ClientFilters {
  status?: ClientStatus[];
  tags?: string[];
  source?: string[];
  score_min?: number;
  score_max?: number;
  date_range?: DateRange;
}

export interface FinancialFilters {
  type?: TransactionType[];
  category_id?: string;
  payment_method?: PaymentMethod[];
  status?: string[];
  date_range?: DateRange;
}

// =====================================================
// CHAT / AI
// =====================================================

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

export interface ChatContext {
  company_id: string;
  user_id?: string;
  client_id?: string;
  history: ChatMessage[];
  intent?: string;
  entities?: Record<string, any>;
}

// =====================================================
// FORMS / INPUTS
// =====================================================

export interface AppointmentFormData {
  client_name: string;
  client_phone: string;
  client_email?: string;
  service_id: string;
  professional_id: string;
  date: string;
  time: string;
  notes?: string;
}

export interface ClientFormData {
  name: string;
  phone: string;
  email?: string;
  document?: string;
  birth_date?: string;
  gender?: string;
  address?: Address;
  consent_lgpd: boolean;
  consent_marketing: boolean;
  notes?: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  color?: string;
}

export interface ProfessionalFormData {
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  specialties: string[];
  service_ids: string[];
}

export interface TransactionFormData {
  type: TransactionType;
  category_id: string;
  amount: number;
  description?: string;
  payment_method: PaymentMethod;
  transaction_date: string;
  notes?: string;
}

// =====================================================
// EXPORTS
// =====================================================

export type {
  BaseEntity,
  BusinessHours,
  CompanySettings,
  Address,
  UserPreferences,
  Permission,
  ServiceSettings
};
