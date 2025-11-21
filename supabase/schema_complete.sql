-- =====================================================
-- INTERATIVIX BOT - SCHEMA COMPLETO
-- Arquitetura Multi-Tenant com todos os módulos
-- =====================================================

-- =====================================================
-- 1. EMPRESAS (Multi-Tenant Base)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    document TEXT UNIQUE, -- CNPJ/CPF
    industry TEXT,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address JSONB, -- {street, number, city, state, zip}
    settings JSONB DEFAULT '{
        "business_hours": {
            "monday": {"open": "09:00", "close": "18:00"},
            "tuesday": {"open": "09:00", "close": "18:00"},
            "wednesday": {"open": "09:00", "close": "18:00"},
            "thursday": {"open": "09:00", "close": "18:00"},
            "friday": {"open": "09:00", "close": "18:00"},
            "saturday": {"open": "09:00", "close": "13:00"},
            "sunday": {"open": null, "close": null}
        },
        "notifications": {
            "email": true,
            "sms": true,
            "whatsapp": true
        },
        "timezone": "America/Sao_Paulo",
        "language": "pt-BR",
        "currency": "BRL"
    }'::jsonb,
    plan TEXT DEFAULT 'free', -- free, basic, premium, enterprise
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USUÁRIOS (Estendido)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'attendant', -- admin, manager, attendant, client
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{
        "theme": "light",
        "notifications": true,
        "language": "pt-BR"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relação Usuário-Empresa (Multi-tenant)
CREATE TABLE IF NOT EXISTS public.company_users (
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- owner, admin, manager, attendant
    permissions JSONB DEFAULT '{
        "clients": ["create", "read", "update", "delete"],
        "services": ["create", "read", "update", "delete"],
        "appointments": ["create", "read", "update", "delete"],
        "professionals": ["read"],
        "financial": ["read"],
        "reports": ["read"],
        "settings": []
    }'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (company_id, user_id)
);

-- =====================================================
-- 3. CLIENTES (CRM Completo)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    document TEXT, -- CPF
    birth_date DATE,
    gender TEXT,
    address JSONB,
    photo_url TEXT,
    
    -- CRM Fields
    status TEXT DEFAULT 'lead', -- lead, active, inactive, vip, blocked
    source TEXT, -- whatsapp, website, instagram, referral, walk-in
    tags TEXT[] DEFAULT '{}',
    score INTEGER DEFAULT 0, -- 0-100 engagement score
    lifetime_value DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Dates
    first_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction TIMESTAMP WITH TIME ZONE,
    last_appointment TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    consent_lgpd BOOLEAN DEFAULT FALSE,
    consent_marketing BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_phone_per_company UNIQUE (company_id, phone)
);

-- Histórico de Interações
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- call, email, whatsapp, sms, appointment, note
    channel TEXT, -- whatsapp, phone, email, in_person
    subject TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactions_client ON public.interactions(client_id);
CREATE INDEX idx_interactions_created ON public.interactions(created_at DESC);

-- =====================================================
-- 4. SERVIÇOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- em minutos
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    color TEXT,
    active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{
        "requires_deposit": false,
        "deposit_percentage": 0,
        "cancellation_hours": 24,
        "max_advance_days": 90
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. PROFISSIONAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    specialties TEXT[] DEFAULT '{}',
    
    -- Performance
    rating DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 to 5.00
    total_reviews INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Serviços que cada profissional executa
CREATE TABLE IF NOT EXISTS public.professional_services (
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    custom_price DECIMAL(10, 2), -- preço diferente do serviço padrão
    custom_duration INTEGER, -- duração diferente do serviço padrão
    PRIMARY KEY (professional_id, service_id)
);

-- Disponibilidade semanal
CREATE TABLE IF NOT EXISTS public.professional_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 (domingo) a 6 (sábado)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_professional_day UNIQUE (professional_id, day_of_week)
);

-- Bloqueios/Férias
CREATE TABLE IF NOT EXISTS public.professional_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. AGENDAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    service_price DECIMAL(10, 2),
    service_duration INTEGER,
    
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    professional_name TEXT NOT NULL,
    
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status TEXT DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled, no_show
    source TEXT DEFAULT 'admin', -- admin, whatsapp, website, api
    
    -- Pagamento
    payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
    payment_method TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Avaliação
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES public.users(id),
    
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_company ON public.appointments(company_id);
CREATE INDEX idx_appointments_client ON public.appointments(client_id);
CREATE INDEX idx_appointments_professional ON public.appointments(professional_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- =====================================================
-- 7. FINANCEIRO
-- =====================================================

-- Categorias
CREATE TABLE IF NOT EXISTS public.financial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT,
    color TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transações
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES public.financial_categories(id),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    
    -- Relações
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    
    payment_method TEXT, -- cash, credit_card, debit_card, pix, transfer
    transaction_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    
    status TEXT DEFAULT 'pending', -- pending, paid, overdue, cancelled
    
    -- Recorrência
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT, -- monthly, weekly, yearly
    recurring_until DATE,
    parent_transaction_id UUID REFERENCES public.financial_transactions(id),
    
    notes TEXT,
    attachments TEXT[], -- URLs de comprovantes
    
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_company ON public.financial_transactions(company_id);
CREATE INDEX idx_transactions_date ON public.financial_transactions(transaction_date DESC);
CREATE INDEX idx_transactions_status ON public.financial_transactions(status);

-- =====================================================
-- 8. INTEGRAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- google_calendar, whatsapp, stripe, mercadopago, mailgun
    name TEXT NOT NULL,
    credentials JSONB, -- Criptografado
    settings JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status TEXT, -- success, error, syncing
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_integration UNIQUE (company_id, type)
);

-- =====================================================
-- 9. NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    category TEXT, -- appointment, payment, system
    action_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Templates de Mensagens
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT NOT NULL, -- whatsapp, email, sms
    subject TEXT,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}', -- {{client_name}}, {{service}}, {{date}}, etc
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. AVALIAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT, -- resposta da empresa
    response_at TIMESTAMP WITH TIME ZONE,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_professional ON public.reviews(professional_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating DESC);

-- =====================================================
-- 11. LOGS E AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL, -- create, update, delete, login, export
    resource_type TEXT NOT NULL, -- client, appointment, service, etc
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_company ON public.audit_logs(company_id);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies para COMPANIES
CREATE POLICY "Users can see their companies" ON public.companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Policies para COMPANY_USERS
CREATE POLICY "Users can see their company relationships" ON public.company_users
    FOR SELECT USING (user_id = auth.uid());

-- Policies para CLIENTS (exemplo - aplicar similar para outras tabelas)
CREATE POLICY "Users can see clients from their companies" ON public.clients
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert clients in their companies" ON public.clients
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update clients in their companies" ON public.clients
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete clients in their companies" ON public.clients
    FOR DELETE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- =====================================================
-- 13. FUNÇÕES ÚTEIS
-- =====================================================

-- Atualizar score do cliente baseado em interações
CREATE OR REPLACE FUNCTION update_client_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clients
    SET score = (
        SELECT LEAST(100, COUNT(*) * 10) -- 10 pontos por interação, máximo 100
        FROM public.interactions
        WHERE client_id = NEW.client_id
        AND created_at > NOW() - INTERVAL '30 days'
    )
    WHERE id = NEW.client_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_score
AFTER INSERT ON public.interactions
FOR EACH ROW
EXECUTE FUNCTION update_client_score();

-- Atualizar rating do profissional
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.professionals
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews
            WHERE professional_id = NEW.professional_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE professional_id = NEW.professional_id
        )
    WHERE id = NEW.professional_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_professional_rating
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_professional_rating();

-- Atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. DADOS INICIAIS (Seeds)
-- =====================================================

-- Categorias financeiras padrão
INSERT INTO public.financial_categories (id, company_id, name, type, icon, color) VALUES
    (gen_random_uuid(), NULL, 'Serviços Prestados', 'income', '💰', '#10b981'),
    (gen_random_uuid(), NULL, 'Produtos', 'income', '🛍️', '#10b981'),
    (gen_random_uuid(), NULL, 'Aluguel', 'expense', '🏠', '#ef4444'),
    (gen_random_uuid(), NULL, 'Salários', 'expense', '👥', '#ef4444'),
    (gen_random_uuid(), NULL, 'Fornecedores', 'expense', '📦', '#ef4444'),
    (gen_random_uuid(), NULL, 'Marketing', 'expense', '📢', '#ef4444'),
    (gen_random_uuid(), NULL, 'Contas', 'expense', '📄', '#ef4444');

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
