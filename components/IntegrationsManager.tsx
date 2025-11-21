import React, { useState, useEffect } from 'react';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { IntegrationConfig, WhatsAppMessage, WebhookEndpoint } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';
import toast from 'react-hot-toast';

const IntegrationsManager: React.FC = () => {
  const {
    configs,
    whatsappMessages,
    webhooks,
    stats,
    loading,
    addConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    sendWhatsAppMessage,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    loadStats,
    loadSyncLogs,
    syncLogs,
  } = useIntegrations();

  const [activeTab, setActiveTab] = useState<'configs' | 'whatsapp' | 'webhooks' | 'logs'>('configs');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<IntegrationConfig | null>(null);

  const [configForm, setConfigForm] = useState({
    provider: 'whatsapp' as IntegrationConfig['provider'],
    name: '',
    isActive: true,
    apiKey: '',
    apiSecret: '',
    phoneNumberId: '',
  });

  const [whatsappForm, setWhatsappForm] = useState({
    clientPhone: '',
    message: '',
    templateName: '',
  });

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    method: 'POST' as WebhookEndpoint['method'],
    events: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    loadStats();
    loadSyncLogs(20);
  }, []);

  const handleAddConfig = async () => {
    if (!configForm.name || !configForm.apiKey) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const config: Record<string, any> = {
        apiKey: configForm.apiKey,
      };

      if (configForm.apiSecret) config.apiSecret = configForm.apiSecret;
      if (configForm.phoneNumberId) config.phoneNumberId = configForm.phoneNumberId;

      await addConfig({
        provider: configForm.provider,
        name: configForm.name,
        isActive: configForm.isActive,
        config,
      });

      setConfigForm({
        provider: 'whatsapp',
        name: '',
        isActive: true,
        apiKey: '',
        apiSecret: '',
        phoneNumberId: '',
      });
      setShowConfigModal(false);
      toast.success('Integração configurada!');
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
      toast.error('Erro ao configurar integração');
    }
  };

  const handleToggleConfig = async (id: string, isActive: boolean) => {
    try {
      await toggleConfig(id, !isActive);
      toast.success(isActive ? 'Integração desativada' : 'Integração ativada');
    } catch (error) {
      console.error('Erro ao alternar configuração:', error);
      toast.error('Erro ao alternar integração');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta integração?')) return;

    try {
      await deleteConfig(id);
      toast.success('Integração excluída!');
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast.error('Erro ao excluir integração');
    }
  };

  const handleSendWhatsApp = async () => {
    if (!whatsappForm.clientPhone || !whatsappForm.message) {
      toast.error('Preencha telefone e mensagem');
      return;
    }

    try {
      const whatsappConfig = configs.find(c => c.provider === 'whatsapp' && c.isActive);
      if (!whatsappConfig) {
        toast.error('Configure uma integração WhatsApp primeiro');
        return;
      }

      await sendWhatsAppMessage({
        integrationId: whatsappConfig.id,
        clientId: '', // Should be selected from a list
        phone: whatsappForm.clientPhone,
        message: whatsappForm.message,
        messageType: 'text',
        templateName: whatsappForm.templateName || undefined,
      });

      setWhatsappForm({ clientPhone: '', message: '', templateName: '' });
      setShowWhatsAppModal(false);
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleAddWebhook = async () => {
    if (!webhookForm.name || !webhookForm.url || webhookForm.events.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await addWebhook({
        name: webhookForm.name,
        url: webhookForm.url,
        method: webhookForm.method,
        headers: {},
        events: webhookForm.events,
        isActive: webhookForm.isActive,
      });

      setWebhookForm({
        name: '',
        url: '',
        method: 'POST',
        events: [],
        isActive: true,
      });
      setShowWebhookModal(false);
      toast.success('Webhook criado!');
    } catch (error) {
      console.error('Erro ao criar webhook:', error);
      toast.error('Erro ao criar webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Deseja realmente excluir este webhook?')) return;

    try {
      await deleteWebhook(id);
      toast.success('Webhook excluído!');
    } catch (error) {
      console.error('Erro ao excluir webhook:', error);
      toast.error('Erro ao excluir webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      await testWebhook(id);
      toast.success('Webhook testado com sucesso!');
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast.error('Erro ao testar webhook');
    }
  };

  const providerIcons: Record<string, string> = {
    whatsapp: '💬',
    google_calendar: '📅',
    zapier: '⚡',
    webhook: '🔗',
  };

  const providerColors: Record<string, string> = {
    whatsapp: 'bg-green-100 text-green-700',
    google_calendar: 'bg-blue-100 text-blue-700',
    zapier: 'bg-orange-100 text-orange-700',
    webhook: 'bg-purple-100 text-purple-700',
  };

  const eventOptions = [
    'appointment.created',
    'appointment.updated',
    'appointment.deleted',
    'client.created',
    'client.updated',
    'payment.received',
    'message.sent',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-primary animate-spin">{ICONS.loader}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Integrações</h2>
          <p className="text-gray-600 text-sm mt-1">Conecte com WhatsApp, Google Calendar, Zapier e mais</p>
        </div>
        <button
          onClick={() => setShowConfigModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          {ICONS.plus}
          <span>Nova Integração</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.provider} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{providerIcons[stat.provider]}</span>
              <span className={`text-xs px-2 py-1 rounded ${providerColors[stat.provider]}`}>
                {stat.provider}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stat.activeConfigs}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stat.totalSyncs} sincronizações ({stat.successSyncs} ok, {stat.errorSyncs} erros)
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('configs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configurações ({configs.length})
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'whatsapp'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              WhatsApp ({whatsappMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'webhooks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Webhooks ({webhooks.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Logs ({syncLogs.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'configs' && (
            <div className="space-y-3">
              {configs.length > 0 ? (
                configs.map(config => (
                  <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{providerIcons[config.provider]}</span>
                      <div>
                        <h4 className="font-medium text-gray-800">{config.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="capitalize">{config.provider}</span>
                          <span>•</span>
                          <span>{config.isActive ? '🟢 Ativo' : '🔴 Inativo'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleConfig(config.id, config.isActive)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {config.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(config.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Nenhuma integração configurada
                </div>
              )}
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowWhatsAppModal(true)} className="btn btn-sm btn-primary">
                  💬 Enviar Mensagem
                </button>
              </div>
              <div className="space-y-3">
                {whatsappMessages.length > 0 ? (
                  whatsappMessages.map(message => (
                    <div key={message.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{message.phone}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          message.status === 'sent' ? 'bg-green-100 text-green-700' :
                          message.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {message.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{message.message}</p>
                      <p className="text-xs text-gray-400">
                        {message.createdAt.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Nenhuma mensagem enviada
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowWebhookModal(true)} className="btn btn-sm btn-primary">
                  + Novo Webhook
                </button>
              </div>
              <div className="space-y-3">
                {webhooks.length > 0 ? (
                  webhooks.map(webhook => (
                    <div key={webhook.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{webhook.name}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTestWebhook(webhook.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Testar
                          </button>
                          <button
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{webhook.url}</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Nenhum webhook configurado
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              {syncLogs.length > 0 ? (
                syncLogs.map(log => (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span>{providerIcons[log.provider]}</span>
                        <span className="font-medium text-gray-800">{log.syncType}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.status === 'success' ? 'bg-green-100 text-green-700' :
                        log.status === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    {log.errorMessage && (
                      <p className="text-sm text-red-600 mb-2">{log.errorMessage}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {log.syncedAt.toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Nenhum log de sincronização
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <Modal onClose={() => setShowConfigModal(false)} title="Nova Integração">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Provedor *</label>
              <select
                value={configForm.provider}
                onChange={(e) => setConfigForm({ ...configForm, provider: e.target.value as any })}
                className="input w-full"
              >
                <option value="whatsapp">WhatsApp Business</option>
                <option value="google_calendar">Google Calendar</option>
                <option value="zapier">Zapier</option>
                <option value="webhook">Webhook Customizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={configForm.name}
                onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                className="input w-full"
                placeholder="Ex: WhatsApp Principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">API Key *</label>
              <input
                type="password"
                value={configForm.apiKey}
                onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                className="input w-full"
                placeholder="Sua chave de API"
              />
            </div>

            {configForm.provider === 'whatsapp' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    value={configForm.phoneNumberId}
                    onChange={(e) => setConfigForm({ ...configForm, phoneNumberId: e.target.value })}
                    className="input w-full"
                    placeholder="ID do número de telefone"
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={configForm.isActive}
                onChange={(e) => setConfigForm({ ...configForm, isActive: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm">Ativar imediatamente</label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAddConfig} className="btn btn-primary flex-1">
                Adicionar
              </button>
              <button onClick={() => setShowConfigModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <Modal onClose={() => setShowWhatsAppModal(false)} title="Enviar Mensagem WhatsApp">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="tel"
                value={whatsappForm.clientPhone}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, clientPhone: e.target.value })}
                className="input w-full"
                placeholder="+55 11 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mensagem *</label>
              <textarea
                value={whatsappForm.message}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, message: e.target.value })}
                className="input w-full"
                rows={4}
                placeholder="Digite sua mensagem..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Template (opcional)</label>
              <input
                type="text"
                value={whatsappForm.templateName}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, templateName: e.target.value })}
                className="input w-full"
                placeholder="Nome do template"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleSendWhatsApp} className="btn btn-primary flex-1">
                Enviar
              </button>
              <button onClick={() => setShowWhatsAppModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <Modal onClose={() => setShowWebhookModal(false)} title="Novo Webhook">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={webhookForm.name}
                onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                className="input w-full"
                placeholder="Ex: Zapier - Notificações"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL *</label>
              <input
                type="url"
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                className="input w-full"
                placeholder="https://hooks.zapier.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Método</label>
              <select
                value={webhookForm.method}
                onChange={(e) => setWebhookForm({ ...webhookForm, method: e.target.value as any })}
                className="input w-full"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Eventos *</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {eventOptions.map(event => (
                  <label key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={webhookForm.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWebhookForm({ ...webhookForm, events: [...webhookForm.events, event] });
                        } else {
                          setWebhookForm({ ...webhookForm, events: webhookForm.events.filter(ev => ev !== event) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAddWebhook} className="btn btn-primary flex-1">
                Criar
              </button>
              <button onClick={() => setShowWebhookModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IntegrationsManager;
