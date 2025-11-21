-- =====================================================
-- MIGRATION 006: SISTEMA DE INTEGRAÇÕES
-- =====================================================
-- Integração com serviços externos (WhatsApp, Google Calendar, Zapier)
-- Webhooks, logs de sincronização, configurações por empresa
-- =====================================================

-- Tabela: integration_configs
-- Configurações de integrações por empresa
CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'whatsapp', 'google_calendar', 'zapier', 'webhook'
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}', -- Configurações específicas (API keys, tokens, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, provider, name)
);

CREATE INDEX idx_integration_configs_company ON integration_configs(company_id);
CREATE INDEX idx_integration_configs_provider ON integration_configs(provider);
CREATE INDEX idx_integration_configs_active ON integration_configs(is_active) WHERE is_active = true;

-- Tabela: integration_sync_logs
-- Logs de sincronização de dados entre sistemas
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integration_configs(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50) NOT NULL, -- 'appointment_create', 'appointment_update', 'message_send', etc
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'pending'
    entity_type VARCHAR(50), -- 'appointment', 'client', 'message'
    entity_id UUID,
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_logs_company ON integration_sync_logs(company_id);
CREATE INDEX idx_sync_logs_integration ON integration_sync_logs(integration_id);
CREATE INDEX idx_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX idx_sync_logs_created ON integration_sync_logs(created_at DESC);

-- Tabela: whatsapp_messages
-- Histórico de mensagens enviadas via WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integration_configs(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'template', 'media'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    external_id VARCHAR(255), -- ID da mensagem na API do WhatsApp
    template_name VARCHAR(100),
    template_params JSONB,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_whatsapp_messages_company ON whatsapp_messages(company_id);
CREATE INDEX idx_whatsapp_messages_client ON whatsapp_messages(client_id);
CREATE INDEX idx_whatsapp_messages_appointment ON whatsapp_messages(appointment_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- Tabela: calendar_events
-- Sincronização com Google Calendar
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES integration_configs(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    external_event_id VARCHAR(255) NOT NULL, -- ID do evento no Google Calendar
    calendar_id VARCHAR(255) NOT NULL, -- ID do calendário
    sync_status VARCHAR(20) DEFAULT 'synced', -- 'synced', 'pending', 'error'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(appointment_id)
);

CREATE INDEX idx_calendar_events_company ON calendar_events(company_id);
CREATE INDEX idx_calendar_events_appointment ON calendar_events(appointment_id);
CREATE INDEX idx_calendar_events_external ON calendar_events(external_event_id);
CREATE INDEX idx_calendar_events_sync_status ON calendar_events(sync_status);

-- Tabela: webhook_endpoints
-- Webhooks customizados para integrações via Zapier ou outras plataformas
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    method VARCHAR(10) DEFAULT 'POST', -- 'POST', 'GET', 'PUT'
    headers JSONB DEFAULT '{}',
    events TEXT[] NOT NULL, -- ['appointment.created', 'appointment.updated', 'client.created', etc]
    is_active BOOLEAN DEFAULT true,
    secret_key VARCHAR(255), -- Para validação de webhooks
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_endpoints_company ON webhook_endpoints(company_id);
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active) WHERE is_active = true;

-- Tabela: webhook_deliveries
-- Log de entregas de webhooks
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempt_count INTEGER DEFAULT 1,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_company ON webhook_deliveries(company_id);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_integration_configs_updated_at
    BEFORE UPDATE ON integration_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER trigger_whatsapp_messages_updated_at
    BEFORE UPDATE ON whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER trigger_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER trigger_webhook_endpoints_updated_at
    BEFORE UPDATE ON webhook_endpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_updated_at();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Log de sincronização
CREATE OR REPLACE FUNCTION log_integration_sync(
    p_company_id UUID,
    p_integration_id UUID,
    p_provider VARCHAR,
    p_sync_type VARCHAR,
    p_status VARCHAR,
    p_entity_type VARCHAR DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_request_data JSONB DEFAULT NULL,
    p_response_data JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO integration_sync_logs (
        company_id,
        integration_id,
        provider,
        sync_type,
        status,
        entity_type,
        entity_id,
        request_data,
        response_data,
        error_message
    ) VALUES (
        p_company_id,
        p_integration_id,
        p_provider,
        p_sync_type,
        p_status,
        p_entity_type,
        p_entity_id,
        p_request_data,
        p_response_data,
        p_error_message
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Enviar mensagem WhatsApp
CREATE OR REPLACE FUNCTION send_whatsapp_message(
    p_company_id UUID,
    p_integration_id UUID,
    p_client_id UUID,
    p_appointment_id UUID,
    p_phone VARCHAR,
    p_message TEXT,
    p_template_name VARCHAR DEFAULT NULL,
    p_template_params JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
BEGIN
    INSERT INTO whatsapp_messages (
        company_id,
        integration_id,
        client_id,
        appointment_id,
        phone,
        message,
        template_name,
        template_params,
        status
    ) VALUES (
        p_company_id,
        p_integration_id,
        p_client_id,
        p_appointment_id,
        p_phone,
        p_message,
        p_template_name,
        p_template_params,
        'pending'
    ) RETURNING id INTO v_message_id;

    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Obter estatísticas de integrações
CREATE OR REPLACE FUNCTION get_integration_stats(p_company_id UUID)
RETURNS TABLE (
    provider VARCHAR,
    active_configs INTEGER,
    total_syncs BIGINT,
    success_syncs BIGINT,
    error_syncs BIGINT,
    last_sync_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ic.provider,
        COUNT(DISTINCT ic.id)::INTEGER as active_configs,
        COUNT(sl.id) as total_syncs,
        COUNT(sl.id) FILTER (WHERE sl.status = 'success') as success_syncs,
        COUNT(sl.id) FILTER (WHERE sl.status = 'error') as error_syncs,
        MAX(sl.synced_at) as last_sync_at
    FROM integration_configs ic
    LEFT JOIN integration_sync_logs sl ON sl.integration_id = ic.id
    WHERE ic.company_id = p_company_id
      AND ic.is_active = true
    GROUP BY ic.provider;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Disparar webhook
CREATE OR REPLACE FUNCTION trigger_webhooks(
    p_company_id UUID,
    p_event_type VARCHAR,
    p_payload JSONB
)
RETURNS INTEGER AS $$
DECLARE
    v_webhook RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_webhook IN 
        SELECT * FROM webhook_endpoints
        WHERE company_id = p_company_id
          AND is_active = true
          AND p_event_type = ANY(events)
    LOOP
        INSERT INTO webhook_deliveries (
            webhook_id,
            company_id,
            event_type,
            payload,
            attempt_count
        ) VALUES (
            v_webhook.id,
            p_company_id,
            p_event_type,
            p_payload,
            1
        );
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Policies: integration_configs
CREATE POLICY "Usuários podem ver configs de sua empresa"
    ON integration_configs FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins podem gerenciar configs"
    ON integration_configs FOR ALL
    USING (company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ));

-- Policies: integration_sync_logs
CREATE POLICY "Usuários podem ver logs de sua empresa"
    ON integration_sync_logs FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

-- Policies: whatsapp_messages
CREATE POLICY "Usuários podem ver mensagens de sua empresa"
    ON whatsapp_messages FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Usuários podem criar mensagens"
    ON whatsapp_messages FOR INSERT
    WITH CHECK (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

-- Policies: calendar_events
CREATE POLICY "Usuários podem ver eventos de sua empresa"
    ON calendar_events FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Usuários podem gerenciar eventos"
    ON calendar_events FOR ALL
    USING (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

-- Policies: webhook_endpoints
CREATE POLICY "Usuários podem ver webhooks de sua empresa"
    ON webhook_endpoints FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins podem gerenciar webhooks"
    ON webhook_endpoints FOR ALL
    USING (company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ));

-- Policies: webhook_deliveries
CREATE POLICY "Usuários podem ver deliveries de sua empresa"
    ON webhook_deliveries FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_users WHERE user_id = auth.uid()
    ));

-- =====================================================
-- DADOS INICIAIS - Templates WhatsApp
-- =====================================================

-- Nota: Os templates reais devem ser configurados no WhatsApp Business API
-- Aqui apenas documentamos exemplos comuns

COMMENT ON TABLE whatsapp_messages IS 'Templates comuns:
- appointment_reminder: Lembrete de agendamento
- appointment_confirmation: Confirmação de agendamento
- appointment_cancelled: Notificação de cancelamento
- payment_reminder: Lembrete de pagamento
- satisfaction_survey: Pesquisa de satisfação';

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE integration_configs IS 'Configurações de integrações por empresa (WhatsApp, Calendar, Zapier)';
COMMENT ON TABLE integration_sync_logs IS 'Logs de sincronização entre sistemas';
COMMENT ON TABLE whatsapp_messages IS 'Histórico de mensagens WhatsApp enviadas';
COMMENT ON TABLE calendar_events IS 'Sincronização com Google Calendar';
COMMENT ON TABLE webhook_endpoints IS 'Webhooks customizados para automações';
COMMENT ON TABLE webhook_deliveries IS 'Log de entregas de webhooks';

-- =====================================================
-- FIM DA MIGRATION 006
-- =====================================================
