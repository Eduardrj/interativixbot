import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { IntegrationConfig, IntegrationSyncLog, WhatsAppMessage, CalendarEvent, WebhookEndpoint, IntegrationStats } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface IntegrationsContextType {
  configs: IntegrationConfig[];
  syncLogs: IntegrationSyncLog[];
  whatsappMessages: WhatsAppMessage[];
  calendarEvents: CalendarEvent[];
  webhooks: WebhookEndpoint[];
  stats: IntegrationStats[];
  loading: boolean;

  // Configs
  addConfig: (config: Omit<IntegrationConfig, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<IntegrationConfig>;
  updateConfig: (id: string, updates: Partial<IntegrationConfig>) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
  toggleConfig: (id: string, isActive: boolean) => Promise<void>;

  // WhatsApp
  sendWhatsAppMessage: (message: Omit<WhatsAppMessage, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<WhatsAppMessage>;
  updateMessageStatus: (id: string, status: WhatsAppMessage['status']) => Promise<void>;

  // Calendar
  syncCalendarEvent: (appointmentId: string, externalEventId: string, calendarId: string) => Promise<CalendarEvent>;
  unsyncCalendarEvent: (appointmentId: string) => Promise<void>;

  // Webhooks
  addWebhook: (webhook: Omit<WebhookEndpoint, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<WebhookEndpoint>;
  updateWebhook: (id: string, updates: Partial<WebhookEndpoint>) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  testWebhook: (id: string) => Promise<boolean>;

  // Stats
  loadStats: () => Promise<void>;
  loadSyncLogs: (limit?: number) => Promise<void>;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export const IntegrationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [stats, setStats] = useState<IntegrationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setConfigs([]);
      setSyncLogs([]);
      setWhatsappMessages([]);
      setCalendarEvents([]);
      setWebhooks([]);
      setStats([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // Load configs
        const { data: configsData, error: configsError } = await supabase
          .from('integration_configs')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (configsError) throw configsError;

        setConfigs((configsData || []).map(c => ({
          id: c.id,
          companyId: c.company_id,
          provider: c.provider,
          name: c.name,
          isActive: c.is_active,
          config: c.config,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
        })));

        // Load WhatsApp messages (last 50)
        const { data: messagesData, error: messagesError } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (messagesError) throw messagesError;

        setWhatsappMessages((messagesData || []).map(m => ({
          id: m.id,
          companyId: m.company_id,
          integrationId: m.integration_id,
          clientId: m.client_id,
          appointmentId: m.appointment_id,
          phone: m.phone,
          message: m.message,
          messageType: m.message_type,
          status: m.status,
          externalId: m.external_id,
          templateName: m.template_name,
          templateParams: m.template_params,
          errorMessage: m.error_message,
          sentAt: m.sent_at ? new Date(m.sent_at) : undefined,
          deliveredAt: m.delivered_at ? new Date(m.delivered_at) : undefined,
          readAt: m.read_at ? new Date(m.read_at) : undefined,
          createdAt: new Date(m.created_at),
          updatedAt: new Date(m.updated_at),
        })));

        // Load calendar events
        const { data: eventsData, error: eventsError } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('company_id', currentCompany.id);

        if (eventsError) throw eventsError;

        setCalendarEvents((eventsData || []).map(e => ({
          id: e.id,
          companyId: e.company_id,
          integrationId: e.integration_id,
          appointmentId: e.appointment_id,
          externalEventId: e.external_event_id,
          calendarId: e.calendar_id,
          syncStatus: e.sync_status,
          lastSyncAt: e.last_sync_at ? new Date(e.last_sync_at) : undefined,
          errorMessage: e.error_message,
          createdAt: new Date(e.created_at),
          updatedAt: new Date(e.updated_at),
        })));

        // Load webhooks
        const { data: webhooksData, error: webhooksError } = await supabase
          .from('webhook_endpoints')
          .select('*')
          .eq('company_id', currentCompany.id);

        if (webhooksError) throw webhooksError;

        setWebhooks((webhooksData || []).map(w => ({
          id: w.id,
          companyId: w.company_id,
          name: w.name,
          url: w.url,
          method: w.method,
          headers: w.headers,
          events: w.events,
          isActive: w.is_active,
          secretKey: w.secret_key,
          createdBy: w.created_by,
          createdAt: new Date(w.created_at),
          updatedAt: new Date(w.updated_at),
        })));

      } catch (error) {
        console.error('Erro ao carregar integrações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time subscriptions
    const configsChannel = supabase
      .channel(`integration_configs:${currentCompany.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'integration_configs', filter: `company_id=eq.${currentCompany.id}` }, loadData)
      .subscribe();

    const messagesChannel = supabase
      .channel(`whatsapp_messages:${currentCompany.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages', filter: `company_id=eq.${currentCompany.id}` }, loadData)
      .subscribe();

    return () => {
      configsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [user, currentCompany]);

  const addConfig = async (data: Omit<IntegrationConfig, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<IntegrationConfig> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data: result, error } = await supabase
      .from('integration_configs')
      .insert([{
        company_id: currentCompany.id,
        provider: data.provider,
        name: data.name,
        is_active: data.isActive,
        config: data.config,
      }])
      .select()
      .single();

    if (error) throw error;

    const newConfig: IntegrationConfig = {
      id: result.id,
      companyId: result.company_id,
      provider: result.provider,
      name: result.name,
      isActive: result.is_active,
      config: result.config,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setConfigs(prev => [newConfig, ...prev]);
    return newConfig;
  };

  const updateConfig = async (id: string, updates: Partial<IntegrationConfig>): Promise<void> => {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.config !== undefined) updateData.config = updates.config;

    const { error } = await supabase
      .from('integration_configs')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteConfig = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('integration_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setConfigs(prev => prev.filter(c => c.id !== id));
  };

  const toggleConfig = async (id: string, isActive: boolean): Promise<void> => {
    await updateConfig(id, { isActive });
  };

  const sendWhatsAppMessage = async (data: Omit<WhatsAppMessage, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<WhatsAppMessage> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data: result, error } = await supabase
      .from('whatsapp_messages')
      .insert([{
        company_id: currentCompany.id,
        integration_id: data.integrationId,
        client_id: data.clientId,
        appointment_id: data.appointmentId,
        phone: data.phone,
        message: data.message,
        message_type: data.messageType,
        template_name: data.templateName,
        template_params: data.templateParams,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    const newMessage: WhatsAppMessage = {
      id: result.id,
      companyId: result.company_id,
      integrationId: result.integration_id,
      clientId: result.client_id,
      appointmentId: result.appointment_id,
      phone: result.phone,
      message: result.message,
      messageType: result.message_type,
      status: result.status,
      externalId: result.external_id,
      templateName: result.template_name,
      templateParams: result.template_params,
      errorMessage: result.error_message,
      sentAt: result.sent_at ? new Date(result.sent_at) : undefined,
      deliveredAt: result.delivered_at ? new Date(result.delivered_at) : undefined,
      readAt: result.read_at ? new Date(result.read_at) : undefined,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setWhatsappMessages(prev => [newMessage, ...prev]);
    return newMessage;
  };

  const updateMessageStatus = async (id: string, status: WhatsAppMessage['status']): Promise<void> => {
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    setWhatsappMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const syncCalendarEvent = async (appointmentId: string, externalEventId: string, calendarId: string): Promise<CalendarEvent> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data: result, error } = await supabase
      .from('calendar_events')
      .insert([{
        company_id: currentCompany.id,
        appointment_id: appointmentId,
        external_event_id: externalEventId,
        calendar_id: calendarId,
        sync_status: 'synced',
        last_sync_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    const newEvent: CalendarEvent = {
      id: result.id,
      companyId: result.company_id,
      integrationId: result.integration_id,
      appointmentId: result.appointment_id,
      externalEventId: result.external_event_id,
      calendarId: result.calendar_id,
      syncStatus: result.sync_status,
      lastSyncAt: result.last_sync_at ? new Date(result.last_sync_at) : undefined,
      errorMessage: result.error_message,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setCalendarEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const unsyncCalendarEvent = async (appointmentId: string): Promise<void> => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('appointment_id', appointmentId);

    if (error) throw error;
    setCalendarEvents(prev => prev.filter(e => e.appointmentId !== appointmentId));
  };

  const addWebhook = async (data: Omit<WebhookEndpoint, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<WebhookEndpoint> => {
    if (!user || !currentCompany) throw new Error('Não autenticado');

    const { data: result, error } = await supabase
      .from('webhook_endpoints')
      .insert([{
        company_id: currentCompany.id,
        name: data.name,
        url: data.url,
        method: data.method,
        headers: data.headers,
        events: data.events,
        is_active: data.isActive,
        secret_key: data.secretKey,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    const newWebhook: WebhookEndpoint = {
      id: result.id,
      companyId: result.company_id,
      name: result.name,
      url: result.url,
      method: result.method,
      headers: result.headers,
      events: result.events,
      isActive: result.is_active,
      secretKey: result.secret_key,
      createdBy: result.created_by,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setWebhooks(prev => [...prev, newWebhook]);
    return newWebhook;
  };

  const updateWebhook = async (id: string, updates: Partial<WebhookEndpoint>): Promise<void> => {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.method !== undefined) updateData.method = updates.method;
    if (updates.headers !== undefined) updateData.headers = updates.headers;
    if (updates.events !== undefined) updateData.events = updates.events;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { error } = await supabase
      .from('webhook_endpoints')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWebhook = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('webhook_endpoints')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const testWebhook = async (id: string): Promise<boolean> => {
    // Simulate webhook test
    // In production, this would call an edge function
    console.log('Testing webhook:', id);
    return true;
  };

  const loadStats = async (): Promise<void> => {
    if (!currentCompany) return;

    const { data, error } = await supabase.rpc('get_integration_stats', {
      p_company_id: currentCompany.id,
    });

    if (error) {
      console.error('Erro ao carregar estatísticas:', error);
      return;
    }

    setStats((data || []).map((s: any) => ({
      provider: s.provider,
      activeConfigs: parseInt(s.active_configs) || 0,
      totalSyncs: parseInt(s.total_syncs) || 0,
      successSyncs: parseInt(s.success_syncs) || 0,
      errorSyncs: parseInt(s.error_syncs) || 0,
      lastSyncAt: s.last_sync_at ? new Date(s.last_sync_at) : undefined,
    })));
  };

  const loadSyncLogs = async (limit: number = 50): Promise<void> => {
    if (!currentCompany) return;

    const { data, error } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('company_id', currentCompany.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao carregar logs:', error);
      return;
    }

    setSyncLogs((data || []).map(l => ({
      id: l.id,
      companyId: l.company_id,
      integrationId: l.integration_id,
      provider: l.provider,
      syncType: l.sync_type,
      status: l.status,
      entityType: l.entity_type,
      entityId: l.entity_id,
      requestData: l.request_data,
      responseData: l.response_data,
      errorMessage: l.error_message,
      syncedAt: new Date(l.synced_at),
      createdAt: new Date(l.created_at),
    })));
  };

  return (
    <IntegrationsContext.Provider
      value={{
        configs,
        syncLogs,
        whatsappMessages,
        calendarEvents,
        webhooks,
        stats,
        loading,
        addConfig,
        updateConfig,
        deleteConfig,
        toggleConfig,
        sendWhatsAppMessage,
        updateMessageStatus,
        syncCalendarEvent,
        unsyncCalendarEvent,
        addWebhook,
        updateWebhook,
        deleteWebhook,
        testWebhook,
        loadStats,
        loadSyncLogs,
      }}
    >
      {children}
    </IntegrationsContext.Provider>
  );
};

export const useIntegrations = () => {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};
