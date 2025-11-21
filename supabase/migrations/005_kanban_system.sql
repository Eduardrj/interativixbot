-- =====================================================
-- MIGRATION: Kanban Board System
-- =====================================================

-- Tabela de colunas do Kanban (stages customizáveis)
CREATE TABLE IF NOT EXISTS public.kanban_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    position INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    limit_wip INTEGER, -- Work In Progress limit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Tabela de cards do Kanban (agendamentos)
CREATE TABLE IF NOT EXISTS public.kanban_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    column_id UUID NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    client_phone TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    tags TEXT[],
    position INTEGER NOT NULL DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de movimentações
CREATE TABLE IF NOT EXISTS public.kanban_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
    from_column_id UUID REFERENCES public.kanban_columns(id) ON DELETE SET NULL,
    to_column_id UUID NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
    moved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Tabela de comentários em cards
CREATE TABLE IF NOT EXISTS public.kanban_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_kanban_columns_company ON public.kanban_columns(company_id);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_position ON public.kanban_columns(position);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_company ON public.kanban_cards(company_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON public.kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_appointment ON public.kanban_cards(appointment_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_assigned_to ON public.kanban_cards(assigned_to);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_position ON public.kanban_cards(position);
CREATE INDEX IF NOT EXISTS idx_kanban_movements_card ON public.kanban_movements(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_comments_card ON public.kanban_comments(card_id);

-- Habilitar RLS
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_comments ENABLE ROW LEVEL SECURITY;

-- Policies para kanban_columns
DROP POLICY IF EXISTS "Users can see columns from their companies" ON public.kanban_columns;
CREATE POLICY "Users can see columns from their companies" ON public.kanban_columns
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can manage columns in their companies" ON public.kanban_columns;
CREATE POLICY "Users can manage columns in their companies" ON public.kanban_columns
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Policies para kanban_cards
DROP POLICY IF EXISTS "Users can see cards from their companies" ON public.kanban_cards;
CREATE POLICY "Users can see cards from their companies" ON public.kanban_cards
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can manage cards in their companies" ON public.kanban_cards;
CREATE POLICY "Users can manage cards in their companies" ON public.kanban_cards
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Policies para kanban_movements
DROP POLICY IF EXISTS "Users can see movements from their companies" ON public.kanban_movements;
CREATE POLICY "Users can see movements from their companies" ON public.kanban_movements
    FOR SELECT USING (
        card_id IN (
            SELECT id FROM public.kanban_cards 
            WHERE company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can create movements" ON public.kanban_movements;
CREATE POLICY "Users can create movements" ON public.kanban_movements
    FOR INSERT WITH CHECK (
        card_id IN (
            SELECT id FROM public.kanban_cards 
            WHERE company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
        )
    );

-- Policies para kanban_comments
DROP POLICY IF EXISTS "Users can see comments from their companies" ON public.kanban_comments;
CREATE POLICY "Users can see comments from their companies" ON public.kanban_comments
    FOR SELECT USING (
        card_id IN (
            SELECT id FROM public.kanban_cards 
            WHERE company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can manage their comments" ON public.kanban_comments;
CREATE POLICY "Users can manage their comments" ON public.kanban_comments
    FOR ALL USING (
        user_id = auth.uid() OR
        card_id IN (
            SELECT id FROM public.kanban_cards 
            WHERE company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
        )
    );

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_kanban_columns_updated_at ON public.kanban_columns;
CREATE TRIGGER update_kanban_columns_updated_at 
    BEFORE UPDATE ON public.kanban_columns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kanban_cards_updated_at ON public.kanban_cards;
CREATE TRIGGER update_kanban_cards_updated_at 
    BEFORE UPDATE ON public.kanban_cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kanban_comments_updated_at ON public.kanban_comments;
CREATE TRIGGER update_kanban_comments_updated_at 
    BEFORE UPDATE ON public.kanban_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar movimentações automaticamente
CREATE OR REPLACE FUNCTION log_kanban_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Só registra se a coluna mudou
    IF OLD.column_id IS DISTINCT FROM NEW.column_id THEN
        INSERT INTO public.kanban_movements (card_id, from_column_id, to_column_id, moved_by)
        VALUES (NEW.id, OLD.column_id, NEW.column_id, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_kanban_movement ON public.kanban_cards;
CREATE TRIGGER trigger_log_kanban_movement
    AFTER UPDATE ON public.kanban_cards
    FOR EACH ROW
    EXECUTE FUNCTION log_kanban_movement();

-- Função para obter estatísticas do Kanban
CREATE OR REPLACE FUNCTION get_kanban_stats(p_company_id UUID)
RETURNS TABLE(
    column_id UUID,
    column_name TEXT,
    card_count BIGINT,
    high_priority_count BIGINT,
    overdue_count BIGINT,
    avg_time_in_column INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kc.id as column_id,
        kc.name as column_name,
        COUNT(kca.id) as card_count,
        COUNT(kca.id) FILTER (WHERE kca.priority IN ('high', 'urgent')) as high_priority_count,
        COUNT(kca.id) FILTER (WHERE kca.due_date < NOW() AND kca.completed_at IS NULL) as overdue_count,
        AVG(NOW() - kca.updated_at) as avg_time_in_column
    FROM public.kanban_columns kc
    LEFT JOIN public.kanban_cards kca ON kca.column_id = kc.id
    WHERE kc.company_id = p_company_id
    GROUP BY kc.id, kc.name, kc.position
    ORDER BY kc.position;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar card com agendamento
CREATE OR REPLACE FUNCTION sync_card_with_appointment()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o appointment foi atualizado, atualizar o card correspondente
    IF TG_TABLE_NAME = 'appointments' THEN
        UPDATE public.kanban_cards
        SET 
            title = COALESCE(NEW.client_name, title),
            client_name = NEW.client_name,
            client_phone = NEW.client_phone,
            due_date = NEW.start_time
        WHERE appointment_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar appointments com cards
DROP TRIGGER IF EXISTS trigger_sync_appointment_to_card ON public.appointments;
CREATE TRIGGER trigger_sync_appointment_to_card
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION sync_card_with_appointment();

-- Inserir colunas padrão para empresas existentes
DO $$
DECLARE
    company_record RECORD;
BEGIN
    FOR company_record IN SELECT id FROM public.companies LOOP
        -- Colunas padrão do Kanban
        INSERT INTO public.kanban_columns (company_id, name, description, color, position, is_default)
        VALUES 
            (company_record.id, 'Aguardando', 'Agendamentos aguardando atendimento', '#6B7280', 0, TRUE),
            (company_record.id, 'Em Atendimento', 'Cliente sendo atendido', '#3B82F6', 1, TRUE),
            (company_record.id, 'Finalizado', 'Atendimento concluído', '#10B981', 2, TRUE),
            (company_record.id, 'Cancelado', 'Atendimento cancelado', '#EF4444', 3, TRUE)
        ON CONFLICT (company_id, name) DO NOTHING;
    END LOOP;
END $$;

-- Migrar agendamentos existentes para cards do Kanban
DO $$
DECLARE
    appointment_record RECORD;
    default_column_id UUID;
BEGIN
    FOR appointment_record IN 
        SELECT a.*, cu.company_id
        FROM public.appointments a
        JOIN public.company_users cu ON cu.user_id = a.user_id
        WHERE NOT EXISTS (SELECT 1 FROM public.kanban_cards WHERE appointment_id = a.id)
        LIMIT 100 -- Limitar para não sobrecarregar
    LOOP
        -- Buscar coluna apropriada baseada no status
        SELECT id INTO default_column_id
        FROM public.kanban_columns
        WHERE company_id = appointment_record.company_id
        AND (
            (appointment_record.status = 'Pendente' AND name = 'Aguardando')
            OR (appointment_record.status = 'Em Andamento' AND name = 'Em Atendimento')
            OR (appointment_record.status = 'Concluído' AND name = 'Finalizado')
            OR (appointment_record.status = 'Cancelado' AND name = 'Cancelado')
        )
        LIMIT 1;
        
        -- Se não encontrou, usar primeira coluna
        IF default_column_id IS NULL THEN
            SELECT id INTO default_column_id
            FROM public.kanban_columns
            WHERE company_id = appointment_record.company_id
            ORDER BY position
            LIMIT 1;
        END IF;
        
        -- Criar card
        IF default_column_id IS NOT NULL THEN
            INSERT INTO public.kanban_cards (
                company_id,
                column_id,
                appointment_id,
                title,
                client_name,
                client_phone,
                due_date,
                created_by
            ) VALUES (
                appointment_record.company_id,
                default_column_id,
                appointment_record.id,
                COALESCE(appointment_record.client_name, 'Sem título'),
                appointment_record.client_name,
                appointment_record.client_phone,
                appointment_record.start_time,
                appointment_record.user_id
            );
        END IF;
    END LOOP;
END $$;
