-- =====================================================
-- MIGRATION: Financial Module
-- =====================================================

-- Tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS public.financial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT NOT NULL DEFAULT '#8B5CF6',
    icon TEXT,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name, type)
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check', 'other')),
    due_date DATE NOT NULL,
    paid_date DATE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
    recurrence_end_date DATE,
    parent_transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
    attached_file_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de metas financeiras
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'profit')),
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas bancárias/caixas
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'cash', 'credit_card', 'other')),
    bank_name TEXT,
    account_number TEXT,
    initial_balance NUMERIC(12, 2) DEFAULT 0,
    current_balance NUMERIC(12, 2) DEFAULT 0,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_financial_categories_company ON public.financial_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_categories_type ON public.financial_categories(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company ON public.financial_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON public.financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_due_date ON public.financial_transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_client ON public.financial_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment ON public.financial_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_company ON public.financial_goals(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_company ON public.financial_accounts(company_id);

-- Habilitar RLS
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

-- Policies para financial_categories
DROP POLICY IF EXISTS "Users can see categories from their companies" ON public.financial_categories;
CREATE POLICY "Users can see categories from their companies" ON public.financial_categories
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can manage categories in their companies" ON public.financial_categories;
CREATE POLICY "Users can manage categories in their companies" ON public.financial_categories
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Policies para financial_transactions
DROP POLICY IF EXISTS "Users can see transactions from their companies" ON public.financial_transactions;
CREATE POLICY "Users can see transactions from their companies" ON public.financial_transactions
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert transactions in their companies" ON public.financial_transactions;
CREATE POLICY "Users can insert transactions in their companies" ON public.financial_transactions
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update transactions in their companies" ON public.financial_transactions;
CREATE POLICY "Users can update transactions in their companies" ON public.financial_transactions
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete transactions in their companies" ON public.financial_transactions;
CREATE POLICY "Users can delete transactions in their companies" ON public.financial_transactions
    FOR DELETE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Policies para financial_goals
DROP POLICY IF EXISTS "Users can see goals from their companies" ON public.financial_goals;
CREATE POLICY "Users can see goals from their companies" ON public.financial_goals
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can manage goals in their companies" ON public.financial_goals;
CREATE POLICY "Users can manage goals in their companies" ON public.financial_goals
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Policies para financial_accounts
DROP POLICY IF EXISTS "Users can see accounts from their companies" ON public.financial_accounts;
CREATE POLICY "Users can see accounts from their companies" ON public.financial_accounts
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can manage accounts in their companies" ON public.financial_accounts;
CREATE POLICY "Users can manage accounts in their companies" ON public.financial_accounts
    FOR ALL USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON public.financial_transactions;
CREATE TRIGGER update_financial_transactions_updated_at 
    BEFORE UPDATE ON public.financial_transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON public.financial_goals;
CREATE TRIGGER update_financial_goals_updated_at 
    BEFORE UPDATE ON public.financial_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_accounts_updated_at ON public.financial_accounts;
CREATE TRIGGER update_financial_accounts_updated_at 
    BEFORE UPDATE ON public.financial_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar saldo de contas
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Implementação futura: atualizar saldo quando há transação vinculada
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar transações vencidas
CREATE OR REPLACE FUNCTION mark_overdue_transactions()
RETURNS void AS $$
BEGIN
    UPDATE public.financial_transactions
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular métricas financeiras de um período
CREATE OR REPLACE FUNCTION get_financial_metrics(
    p_company_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    total_income NUMERIC,
    total_expense NUMERIC,
    net_profit NUMERIC,
    paid_income NUMERIC,
    paid_expense NUMERIC,
    pending_income NUMERIC,
    pending_expense NUMERIC,
    overdue_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount END), 0) as net_profit,
        COALESCE(SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END), 0) as paid_income,
        COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END), 0) as paid_expense,
        COALESCE(SUM(CASE WHEN type = 'income' AND status = 'pending' THEN amount ELSE 0 END), 0) as pending_income,
        COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'pending' THEN amount ELSE 0 END), 0) as pending_expense,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END)::INTEGER as overdue_count
    FROM public.financial_transactions
    WHERE company_id = p_company_id
    AND due_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Inserir categorias padrão para empresas existentes
DO $$
DECLARE
    company_record RECORD;
BEGIN
    FOR company_record IN SELECT id FROM public.companies LOOP
        -- Categorias de receita
        INSERT INTO public.financial_categories (company_id, name, type, color, is_default)
        VALUES 
            (company_record.id, 'Serviços', 'income', '#10B981', TRUE),
            (company_record.id, 'Produtos', 'income', '#3B82F6', TRUE),
            (company_record.id, 'Consultorias', 'income', '#8B5CF6', TRUE),
            (company_record.id, 'Outras Receitas', 'income', '#F59E0B', TRUE)
        ON CONFLICT (company_id, name, type) DO NOTHING;
        
        -- Categorias de despesa
        INSERT INTO public.financial_categories (company_id, name, type, color, is_default)
        VALUES 
            (company_record.id, 'Salários', 'expense', '#EF4444', TRUE),
            (company_record.id, 'Aluguel', 'expense', '#F59E0B', TRUE),
            (company_record.id, 'Fornecedores', 'expense', '#8B5CF6', TRUE),
            (company_record.id, 'Marketing', 'expense', '#3B82F6', TRUE),
            (company_record.id, 'Impostos', 'expense', '#6B7280', TRUE),
            (company_record.id, 'Manutenção', 'expense', '#14B8A6', TRUE),
            (company_record.id, 'Outras Despesas', 'expense', '#EC4899', TRUE)
        ON CONFLICT (company_id, name, type) DO NOTHING;
        
        -- Criar conta caixa padrão
        INSERT INTO public.financial_accounts (company_id, name, type, initial_balance, current_balance, is_active)
        VALUES (company_record.id, 'Caixa Principal', 'cash', 0, 0, TRUE)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
