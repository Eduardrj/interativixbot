-- =====================================================
-- Migration 007: Analytics & Advanced Metrics System
-- =====================================================
-- Descrição: Sistema completo de analytics com métricas de negócio,
-- KPIs, dashboards personalizáveis e relatórios avançados
-- =====================================================

-- =====================================================
-- 1. TABELA: analytics_metrics
-- Armazena métricas calculadas agregadas por período
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- revenue, appointments, clients, conversion_rate, etc
    metric_category VARCHAR(50) NOT NULL, -- financial, operations, clients, marketing
    period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, yearly
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    previous_value DECIMAL(15,2), -- Para cálculo de variação
    target_value DECIMAL(15,2), -- Meta esperada
    unit VARCHAR(20), -- currency, percentage, count, duration
    metadata JSONB DEFAULT '{}', -- Dados adicionais específicos da métrica
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_metric_period UNIQUE(company_id, metric_type, period_type, period_start)
);

CREATE INDEX idx_analytics_metrics_company ON analytics_metrics(company_id);
CREATE INDEX idx_analytics_metrics_type ON analytics_metrics(metric_type, period_type);
CREATE INDEX idx_analytics_metrics_period ON analytics_metrics(period_start, period_end);

-- =====================================================
-- 2. TABELA: analytics_dashboards
-- Dashboards personalizáveis por usuário/empresa
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false, -- Visível para todos na empresa
    layout JSONB DEFAULT '[]', -- Grid layout configuration
    widgets JSONB DEFAULT '[]', -- Array de widgets configurados
    filters JSONB DEFAULT '{}', -- Filtros globais do dashboard
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_dashboards_company ON analytics_dashboards(company_id);
CREATE INDEX idx_analytics_dashboards_user ON analytics_dashboards(user_id);

-- =====================================================
-- 3. TABELA: analytics_reports
-- Relatórios salvos e agendados
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- revenue, clients, appointments, custom
    parameters JSONB DEFAULT '{}', -- Filtros e configurações do relatório
    schedule JSONB, -- Agendamento automático (cron-like)
    last_generated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    recipients JSONB DEFAULT '[]', -- Lista de emails para envio automático
    format VARCHAR(20) DEFAULT 'pdf', -- pdf, csv, xlsx
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_reports_company ON analytics_reports(company_id);
CREATE INDEX idx_analytics_reports_type ON analytics_reports(report_type);

-- =====================================================
-- 4. TABELA: analytics_events
-- Event tracking para análise de comportamento
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- page_view, button_click, feature_used, etc
    event_category VARCHAR(50) NOT NULL, -- user_behavior, system, business
    entity_type VARCHAR(50), -- appointment, client, service, etc
    entity_id UUID, -- ID da entidade relacionada
    properties JSONB DEFAULT '{}', -- Propriedades específicas do evento
    session_id UUID, -- Para agrupar eventos da mesma sessão
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_company ON analytics_events(company_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

-- =====================================================
-- 5. TABELA: analytics_kpis
-- Definição de KPIs customizáveis
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    calculation_formula TEXT NOT NULL, -- SQL query ou fórmula para cálculo
    target_value DECIMAL(15,2),
    unit VARCHAR(20), -- currency, percentage, count
    frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    is_active BOOLEAN DEFAULT true,
    alert_threshold DECIMAL(15,2), -- Valor para disparar alerta
    alert_type VARCHAR(20), -- above, below
    notification_emails JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_kpis_company ON analytics_kpis(company_id);

-- =====================================================
-- 6. RLS (Row Level Security) Policies
-- =====================================================

-- analytics_metrics
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_metrics_company_isolation ON analytics_metrics
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
        )
    );

-- analytics_dashboards
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_dashboards_company_isolation ON analytics_dashboards
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
        )
    );

-- analytics_reports
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_reports_company_isolation ON analytics_reports
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
        )
    );

-- analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_events_company_isolation ON analytics_events
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
        )
    );

-- analytics_kpis
ALTER TABLE analytics_kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_kpis_company_isolation ON analytics_kpis
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- 7. FUNÇÃO: calculate_business_metrics
-- Calcula todas as métricas de negócio para um período
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_business_metrics(
    p_company_id UUID,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS TABLE(
    metric_type VARCHAR,
    value DECIMAL,
    previous_value DECIMAL,
    variation_percent DECIMAL
) AS $$
BEGIN
    -- Total de receitas
    RETURN QUERY
    SELECT 
        'total_revenue'::VARCHAR,
        COALESCE(SUM(amount), 0)::DECIMAL,
        NULL::DECIMAL,
        NULL::DECIMAL
    FROM financial_transactions
    WHERE company_id = p_company_id
        AND type = 'income'
        AND is_paid = true
        AND date BETWEEN p_start_date AND p_end_date;

    -- Total de despesas
    RETURN QUERY
    SELECT 
        'total_expenses'::VARCHAR,
        COALESCE(SUM(amount), 0)::DECIMAL,
        NULL::DECIMAL,
        NULL::DECIMAL
    FROM financial_transactions
    WHERE company_id = p_company_id
        AND type = 'expense'
        AND is_paid = true
        AND date BETWEEN p_start_date AND p_end_date;

    -- Número de agendamentos
    RETURN QUERY
    SELECT 
        'total_appointments'::VARCHAR,
        COUNT(*)::DECIMAL,
        NULL::DECIMAL,
        NULL::DECIMAL
    FROM appointments
    WHERE company_id = p_company_id
        AND date BETWEEN p_start_date AND p_end_date;

    -- Novos clientes
    RETURN QUERY
    SELECT 
        'new_clients'::VARCHAR,
        COUNT(*)::DECIMAL,
        NULL::DECIMAL,
        NULL::DECIMAL
    FROM clients
    WHERE company_id = p_company_id
        AND created_at BETWEEN p_start_date AND p_end_date;

    -- Taxa de conversão (clientes ativos / total)
    RETURN QUERY
    SELECT 
        'conversion_rate'::VARCHAR,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'active')::DECIMAL / COUNT(*) * 100)
            ELSE 0
        END,
        NULL::DECIMAL,
        NULL::DECIMAL
    FROM clients
    WHERE company_id = p_company_id;

    -- Ticket médio
    RETURN QUERY
    SELECT 
        'average_ticket'::VARCHAR,
        CASE 
            WHEN COUNT(*) > 0 THEN (SUM(amount) / COUNT(*))::DECIMAL
            ELSE 0
        END,
        NULL::DECIMAL,
        NULL::DECIMAL
    FROM financial_transactions
    WHERE company_id = p_company_id
        AND type = 'income'
        AND is_paid = true
        AND date BETWEEN p_start_date AND p_end_date;

    -- Taxa de cancelamento de agendamentos
    RETURN QUERY
    SELECT 
        'cancellation_rate'::VARCHAR,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'Cancelado')::DECIMAL / COUNT(*) * 100)
            ELSE 0
        END,
        NULL::DECIMAL,
        NULL::DECIMAL
    FROM appointments
    WHERE company_id = p_company_id
        AND date BETWEEN p_start_date AND p_end_date;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FUNÇÃO: get_dashboard_kpis
-- Retorna KPIs principais para dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION get_dashboard_kpis(
    p_company_id UUID,
    p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
    kpi_name VARCHAR,
    current_value DECIMAL,
    previous_value DECIMAL,
    variation_percent DECIMAL,
    trend VARCHAR,
    unit VARCHAR
) AS $$
DECLARE
    v_current_start TIMESTAMP := NOW() - (p_period_days || ' days')::INTERVAL;
    v_current_end TIMESTAMP := NOW();
    v_previous_start TIMESTAMP := v_current_start - (p_period_days || ' days')::INTERVAL;
    v_previous_end TIMESTAMP := v_current_start;
BEGIN
    -- Revenue Growth
    RETURN QUERY
    WITH current_revenue AS (
        SELECT COALESCE(SUM(amount), 0) as value
        FROM financial_transactions
        WHERE company_id = p_company_id
            AND type = 'income'
            AND is_paid = true
            AND date BETWEEN v_current_start AND v_current_end
    ),
    previous_revenue AS (
        SELECT COALESCE(SUM(amount), 0) as value
        FROM financial_transactions
        WHERE company_id = p_company_id
            AND type = 'income'
            AND is_paid = true
            AND date BETWEEN v_previous_start AND v_previous_end
    )
    SELECT 
        'Revenue'::VARCHAR,
        cr.value,
        pr.value,
        CASE WHEN pr.value > 0 THEN ((cr.value - pr.value) / pr.value * 100) ELSE 0 END,
        CASE 
            WHEN cr.value > pr.value THEN 'up'::VARCHAR
            WHEN cr.value < pr.value THEN 'down'::VARCHAR
            ELSE 'stable'::VARCHAR
        END,
        'currency'::VARCHAR
    FROM current_revenue cr, previous_revenue pr;

    -- Active Clients
    RETURN QUERY
    WITH current_clients AS (
        SELECT COUNT(*) as value
        FROM clients
        WHERE company_id = p_company_id
            AND status = 'active'
    ),
    previous_clients AS (
        SELECT COUNT(*) as value
        FROM clients
        WHERE company_id = p_company_id
            AND status = 'active'
            AND updated_at < v_current_start
    )
    SELECT 
        'Active Clients'::VARCHAR,
        cc.value::DECIMAL,
        pc.value::DECIMAL,
        CASE WHEN pc.value > 0 THEN ((cc.value - pc.value)::DECIMAL / pc.value * 100) ELSE 0 END,
        CASE 
            WHEN cc.value > pc.value THEN 'up'::VARCHAR
            WHEN cc.value < pc.value THEN 'down'::VARCHAR
            ELSE 'stable'::VARCHAR
        END,
        'count'::VARCHAR
    FROM current_clients cc, previous_clients pc;

    -- Appointments Completed
    RETURN QUERY
    WITH current_appts AS (
        SELECT COUNT(*) as value
        FROM appointments
        WHERE company_id = p_company_id
            AND status = 'Concluído'
            AND date BETWEEN v_current_start AND v_current_end
    ),
    previous_appts AS (
        SELECT COUNT(*) as value
        FROM appointments
        WHERE company_id = p_company_id
            AND status = 'Concluído'
            AND date BETWEEN v_previous_start AND v_previous_end
    )
    SELECT 
        'Appointments'::VARCHAR,
        ca.value::DECIMAL,
        pa.value::DECIMAL,
        CASE WHEN pa.value > 0 THEN ((ca.value - pa.value)::DECIMAL / pa.value * 100) ELSE 0 END,
        CASE 
            WHEN ca.value > pa.value THEN 'up'::VARCHAR
            WHEN ca.value < pa.value THEN 'down'::VARCHAR
            ELSE 'stable'::VARCHAR
        END,
        'count'::VARCHAR
    FROM current_appts ca, previous_appts pa;

    -- Average Revenue per Client
    RETURN QUERY
    WITH current_avg AS (
        SELECT 
            CASE 
                WHEN COUNT(DISTINCT c.id) > 0 
                THEN SUM(ft.amount) / COUNT(DISTINCT c.id)
                ELSE 0 
            END as value
        FROM clients c
        LEFT JOIN financial_transactions ft ON ft.company_id = c.company_id
            AND ft.type = 'income'
            AND ft.is_paid = true
            AND ft.date BETWEEN v_current_start AND v_current_end
        WHERE c.company_id = p_company_id
            AND c.status = 'active'
    ),
    previous_avg AS (
        SELECT 
            CASE 
                WHEN COUNT(DISTINCT c.id) > 0 
                THEN SUM(ft.amount) / COUNT(DISTINCT c.id)
                ELSE 0 
            END as value
        FROM clients c
        LEFT JOIN financial_transactions ft ON ft.company_id = c.company_id
            AND ft.type = 'income'
            AND ft.is_paid = true
            AND ft.date BETWEEN v_previous_start AND v_previous_end
        WHERE c.company_id = p_company_id
            AND c.status = 'active'
            AND c.created_at < v_current_start
    )
    SELECT 
        'Avg Revenue/Client'::VARCHAR,
        ca.value,
        pa.value,
        CASE WHEN pa.value > 0 THEN ((ca.value - pa.value) / pa.value * 100) ELSE 0 END,
        CASE 
            WHEN ca.value > pa.value THEN 'up'::VARCHAR
            WHEN ca.value < pa.value THEN 'down'::VARCHAR
            ELSE 'stable'::VARCHAR
        END,
        'currency'::VARCHAR
    FROM current_avg ca, previous_avg pa;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. FUNÇÃO: get_revenue_by_period
-- Dados para gráfico de receitas
-- =====================================================
CREATE OR REPLACE FUNCTION get_revenue_by_period(
    p_company_id UUID,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP,
    p_interval VARCHAR DEFAULT 'day' -- day, week, month
)
RETURNS TABLE(
    period_label TEXT,
    revenue DECIMAL,
    expenses DECIMAL,
    profit DECIMAL
) AS $$
BEGIN
    IF p_interval = 'day' THEN
        RETURN QUERY
        SELECT 
            TO_CHAR(date, 'DD/MM')::TEXT,
            COALESCE(SUM(CASE WHEN type = 'income' AND is_paid THEN amount ELSE 0 END), 0)::DECIMAL,
            COALESCE(SUM(CASE WHEN type = 'expense' AND is_paid THEN amount ELSE 0 END), 0)::DECIMAL,
            COALESCE(SUM(CASE WHEN type = 'income' AND is_paid THEN amount ELSE -amount END), 0)::DECIMAL
        FROM financial_transactions
        WHERE company_id = p_company_id
            AND date BETWEEN p_start_date AND p_end_date
        GROUP BY date
        ORDER BY date;
    ELSIF p_interval = 'week' THEN
        RETURN QUERY
        SELECT 
            'Sem ' || EXTRACT(WEEK FROM date)::TEXT,
            COALESCE(SUM(CASE WHEN type = 'income' AND is_paid THEN amount ELSE 0 END), 0)::DECIMAL,
            COALESCE(SUM(CASE WHEN type = 'expense' AND is_paid THEN amount ELSE 0 END), 0)::DECIMAL,
            COALESCE(SUM(CASE WHEN type = 'income' AND is_paid THEN amount ELSE -amount END), 0)::DECIMAL
        FROM financial_transactions
        WHERE company_id = p_company_id
            AND date BETWEEN p_start_date AND p_end_date
        GROUP BY EXTRACT(WEEK FROM date), EXTRACT(YEAR FROM date)
        ORDER BY EXTRACT(YEAR FROM date), EXTRACT(WEEK FROM date);
    ELSE -- month
        RETURN QUERY
        SELECT 
            TO_CHAR(date, 'Mon/YY')::TEXT,
            COALESCE(SUM(CASE WHEN type = 'income' AND is_paid THEN amount ELSE 0 END), 0)::DECIMAL,
            COALESCE(SUM(CASE WHEN type = 'expense' AND is_paid THEN amount ELSE 0 END), 0)::DECIMAL,
            COALESCE(SUM(CASE WHEN type = 'income' AND is_paid THEN amount ELSE -amount END), 0)::DECIMAL
        FROM financial_transactions
        WHERE company_id = p_company_id
            AND date BETWEEN p_start_date AND p_end_date
        GROUP BY TO_CHAR(date, 'Mon/YY'), EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ORDER BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. TRIGGER: update_analytics_metrics_timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analytics_metrics_update_timestamp
    BEFORE UPDATE ON analytics_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER analytics_dashboards_update_timestamp
    BEFORE UPDATE ON analytics_dashboards
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER analytics_reports_update_timestamp
    BEFORE UPDATE ON analytics_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER analytics_kpis_update_timestamp
    BEFORE UPDATE ON analytics_kpis
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

-- =====================================================
-- 11. DEFAULT DATA: KPIs Padrão
-- Será inserido quando uma empresa é criada
-- =====================================================
COMMENT ON TABLE analytics_metrics IS 'Armazena métricas agregadas calculadas periodicamente para análise de performance';
COMMENT ON TABLE analytics_dashboards IS 'Dashboards personalizáveis com widgets configuráveis para visualização de dados';
COMMENT ON TABLE analytics_reports IS 'Relatórios agendáveis com geração automática e envio por email';
COMMENT ON TABLE analytics_events IS 'Event tracking para análise de comportamento de usuários e sistema';
COMMENT ON TABLE analytics_kpis IS 'Definição de KPIs customizáveis com alertas automáticos';
