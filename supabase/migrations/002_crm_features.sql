-- =====================================================
-- MIGRATION: CRM Features
-- =====================================================

-- Tabela de tags para clientes
CREATE TABLE IF NOT EXISTS public.client_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#8B5CF6',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Tabela de relacionamento cliente-tag (muitos para muitos)
CREATE TABLE IF NOT EXISTS public.client_tag_relations (
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.client_tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (client_id, tag_id)
);

-- Tabela de interações com clientes
CREATE TABLE IF NOT EXISTS public.client_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'note', 'sms', 'other')),
    subject TEXT,
    description TEXT NOT NULL,
    duration_minutes INTEGER,
    outcome TEXT CHECK (outcome IN ('positive', 'neutral', 'negative', 'pending')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela clients com campos CRM
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'active', 'inactive', 'vip'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'new' CHECK (pipeline_stage IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('website', 'referral', 'social_media', 'advertising', 'event', 'cold_call', 'other'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_client_tags_company ON public.client_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_client_tag_relations_client ON public.client_tag_relations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tag_relations_tag ON public.client_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_company ON public.client_interactions(company_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_client ON public.client_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_user ON public.client_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_pipeline_stage ON public.clients(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_clients_score ON public.clients(score);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON public.clients(assigned_to);

-- Habilitar RLS
ALTER TABLE public.client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;

-- Policies para client_tags
DROP POLICY IF EXISTS "Users can see tags from their companies" ON public.client_tags;
CREATE POLICY "Users can see tags from their companies" ON public.client_tags
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert tags in their companies" ON public.client_tags;
CREATE POLICY "Users can insert tags in their companies" ON public.client_tags
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update tags in their companies" ON public.client_tags;
CREATE POLICY "Users can update tags in their companies" ON public.client_tags
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete tags in their companies" ON public.client_tags;
CREATE POLICY "Users can delete tags in their companies" ON public.client_tags
    FOR DELETE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Policies para client_tag_relations
DROP POLICY IF EXISTS "Users can see client tag relations" ON public.client_tag_relations;
CREATE POLICY "Users can see client tag relations" ON public.client_tag_relations
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM public.clients 
            WHERE company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can manage client tag relations" ON public.client_tag_relations;
CREATE POLICY "Users can manage client tag relations" ON public.client_tag_relations
    FOR ALL USING (
        client_id IN (
            SELECT id FROM public.clients 
            WHERE company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
        )
    );

-- Policies para client_interactions
DROP POLICY IF EXISTS "Users can see interactions from their companies" ON public.client_interactions;
CREATE POLICY "Users can see interactions from their companies" ON public.client_interactions
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert interactions in their companies" ON public.client_interactions;
CREATE POLICY "Users can insert interactions in their companies" ON public.client_interactions
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update interactions in their companies" ON public.client_interactions;
CREATE POLICY "Users can update interactions in their companies" ON public.client_interactions
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete interactions in their companies" ON public.client_interactions;
CREATE POLICY "Users can delete interactions in their companies" ON public.client_interactions
    FOR DELETE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Trigger para updated_at em client_interactions
DROP TRIGGER IF EXISTS update_client_interactions_updated_at ON public.client_interactions;
CREATE TRIGGER update_client_interactions_updated_at 
    BEFORE UPDATE ON public.client_interactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular score do cliente automaticamente
CREATE OR REPLACE FUNCTION calculate_client_score(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_interactions_count INTEGER;
    v_appointments_count INTEGER;
    v_revenue NUMERIC;
    v_days_since_last_contact INTEGER;
BEGIN
    -- Contar interações (max 30 pontos)
    SELECT COUNT(*) INTO v_interactions_count
    FROM public.client_interactions
    WHERE client_id = p_client_id
    AND created_at > NOW() - INTERVAL '90 days';
    
    v_score := v_score + LEAST(v_interactions_count * 3, 30);
    
    -- Contar agendamentos concluídos (max 30 pontos)
    SELECT COUNT(*) INTO v_appointments_count
    FROM public.appointments
    WHERE client_id = p_client_id
    AND status = 'completed'
    AND start_time > NOW() - INTERVAL '180 days';
    
    v_score := v_score + LEAST(v_appointments_count * 5, 30);
    
    -- Verificar última interação (max 20 pontos)
    SELECT EXTRACT(DAY FROM NOW() - MAX(created_at)) INTO v_days_since_last_contact
    FROM public.client_interactions
    WHERE client_id = p_client_id;
    
    IF v_days_since_last_contact IS NULL THEN
        v_score := v_score + 0;
    ELSIF v_days_since_last_contact <= 7 THEN
        v_score := v_score + 20;
    ELSIF v_days_since_last_contact <= 30 THEN
        v_score := v_score + 15;
    ELSIF v_days_since_last_contact <= 60 THEN
        v_score := v_score + 10;
    ELSIF v_days_since_last_contact <= 90 THEN
        v_score := v_score + 5;
    END IF;
    
    -- Pipeline stage (max 20 pontos)
    DECLARE
        v_pipeline_stage TEXT;
    BEGIN
        SELECT pipeline_stage INTO v_pipeline_stage
        FROM public.clients
        WHERE id = p_client_id;
        
        CASE v_pipeline_stage
            WHEN 'won' THEN v_score := v_score + 20;
            WHEN 'negotiation' THEN v_score := v_score + 15;
            WHEN 'proposal' THEN v_score := v_score + 12;
            WHEN 'qualified' THEN v_score := v_score + 8;
            WHEN 'contacted' THEN v_score := v_score + 5;
            WHEN 'new' THEN v_score := v_score + 2;
            ELSE v_score := v_score + 0;
        END CASE;
    END;
    
    RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar last_contact_at automaticamente
CREATE OR REPLACE FUNCTION update_client_last_contact()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clients
    SET last_contact_at = NOW()
    WHERE id = NEW.client_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_client_last_contact ON public.client_interactions;
CREATE TRIGGER trigger_update_client_last_contact
    AFTER INSERT ON public.client_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_client_last_contact();

-- Inserir tags padrão para empresas existentes
DO $$
DECLARE
    company_record RECORD;
BEGIN
    FOR company_record IN SELECT id FROM public.companies LOOP
        -- Inserir tags padrão se não existirem
        INSERT INTO public.client_tags (company_id, name, color, description)
        VALUES 
            (company_record.id, 'VIP', '#F59E0B', 'Cliente VIP com alta prioridade'),
            (company_record.id, 'Ativo', '#10B981', 'Cliente com agendamentos regulares'),
            (company_record.id, 'Inativo', '#6B7280', 'Cliente sem agendamentos recentes'),
            (company_record.id, 'Novo', '#3B82F6', 'Cliente recém cadastrado'),
            (company_record.id, 'Fidelizado', '#8B5CF6', 'Cliente leal e frequente'),
            (company_record.id, 'Inadimplente', '#EF4444', 'Cliente com pagamentos pendentes')
        ON CONFLICT (company_id, name) DO NOTHING;
    END LOOP;
END $$;
