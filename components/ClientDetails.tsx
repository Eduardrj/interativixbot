import React, { useState, useEffect } from 'react';
import { Client, ClientTag, ClientInteraction } from '../types';
import { ICONS } from '../constants';
import { useClients } from '../contexts/ClientsContext';
import { useClientTags } from '../contexts/ClientTagsContext';
import { useClientInteractions } from '../contexts/ClientInteractionsContext';
import Modal from './Modal';
import toast from 'react-hot-toast';

const ClientDetails: React.FC = () => {
  const { clients, updateClient, loading: clientsLoading } = useClients();
  const { tags, addTag, assignTagToClient, removeTagFromClient, getClientTags } = useClientTags();
  const { interactions, addInteraction, getClientInteractions } = useClientInteractions();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientTags, setClientTags] = useState<ClientTag[]>([]);
  const [clientInteractions, setClientInteractions] = useState<ClientInteraction[]>([]);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    type: 'call' as ClientInteraction['type'],
    description: '',
    outcome: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (selectedClient) {
      loadClientData(selectedClient.id);
    }
  }, [selectedClient]);

  const loadClientData = async (clientId: string) => {
    try {
      const [tagsData, interactionsData] = await Promise.all([
        getClientTags(clientId),
        getClientInteractions(clientId),
      ]);
      setClientTags(tagsData);
      setClientInteractions(interactionsData);
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    }
  };

  const handleAddInteraction = async () => {
    if (!selectedClient || !newInteraction.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    try {
      await addInteraction({
        clientId: selectedClient.id,
        type: newInteraction.type,
        description: newInteraction.description,
        outcome: newInteraction.outcome || undefined,
      });

      setNewInteraction({ type: 'call', description: '', outcome: '' });
      setShowInteractionModal(false);
      await loadClientData(selectedClient.id);
      toast.success('Interação registrada!');
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
      toast.error('Erro ao registrar interação');
    }
  };

  const handleAssignTags = async () => {
    if (!selectedClient) return;

    try {
      for (const tagId of selectedTags) {
        if (!clientTags.find(t => t.id === tagId)) {
          await assignTagToClient(selectedClient.id, tagId);
        }
      }
      setShowTagModal(false);
      setSelectedTags([]);
      await loadClientData(selectedClient.id);
      toast.success('Tags atribuídas!');
    } catch (error) {
      console.error('Erro ao atribuir tags:', error);
      toast.error('Erro ao atribuir tags');
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!selectedClient) return;

    try {
      await removeTagFromClient(selectedClient.id, tagId);
      await loadClientData(selectedClient.id);
      toast.success('Tag removida!');
    } catch (error) {
      console.error('Erro ao remover tag:', error);
      toast.error('Erro ao remover tag');
    }
  };

  const handleUpdateStatus = async (status: Client['status']) => {
    if (!selectedClient) return;

    try {
      await updateClient(selectedClient.id, { status });
      setSelectedClient({ ...selectedClient, status });
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status?: Client['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      lead: 'bg-blue-100 text-blue-700',
      prospect: 'bg-yellow-100 text-yellow-700',
    };
    return styles[status || 'lead'];
  };

  const interactionIcons = {
    call: '📞',
    email: '📧',
    meeting: '🤝',
    whatsapp: '💬',
    other: '📝',
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-primary animate-spin">{ICONS.loader}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Detalhes dos Clientes (CRM)</h2>
        <p className="text-gray-600 text-sm mt-1">Gerencie tags, interações e informações completas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Clientes</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedClient?.id === client.id ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{client.name}</h4>
                    <p className="text-xs text-gray-500">{client.phone}</p>
                  </div>
                  {client.score !== undefined && (
                    <span className={`text-sm font-bold ${getScoreColor(client.score)}`}>
                      {client.score}
                    </span>
                  )}
                </div>
                {client.status && (
                  <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${getStatusBadge(client.status)}`}>
                    {client.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedClient ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedClient.name}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>{ICONS.phone} {selectedClient.phone}</span>
                      {selectedClient.email && <span>{ICONS.mail} {selectedClient.email}</span>}
                    </div>
                  </div>
                  {selectedClient.score !== undefined && (
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(selectedClient.score)}`}>
                        {selectedClient.score}
                      </div>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                    <select
                      value={selectedClient.status || 'lead'}
                      onChange={(e) => handleUpdateStatus(e.target.value as Client['status'])}
                      className="input w-full"
                    >
                      <option value="lead">Lead</option>
                      <option value="prospect">Prospect</option>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Etapa do Funil</label>
                    <input
                      type="text"
                      value={selectedClient.pipelineStage || 'Contato Inicial'}
                      readOnly
                      className="input w-full bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {selectedClient.company && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Empresa:</span>
                      <span className="font-medium">{selectedClient.company}</span>
                    </div>
                  )}
                  {selectedClient.position && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Cargo:</span>
                      <span className="font-medium">{selectedClient.position}</span>
                    </div>
                  )}
                  {selectedClient.source && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Origem:</span>
                      <span className="font-medium">{selectedClient.source}</span>
                    </div>
                  )}
                  {selectedClient.lastContactAt && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Último Contato:</span>
                      <span className="font-medium">{selectedClient.lastContactAt.toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-700">Tags</h4>
                  <button
                    onClick={() => setShowTagModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    {ICONS.plus} Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clientTags.length > 0 ? (
                    clientTags.map(tag => (
                      <div
                        key={tag.id}
                        className="px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                      >
                        <span>{tag.name}</span>
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="hover:opacity-70"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Nenhuma tag atribuída</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-700">Interações</h4>
                  <button
                    onClick={() => setShowInteractionModal(true)}
                    className="btn btn-sm btn-primary flex items-center space-x-2"
                  >
                    {ICONS.plus}
                    <span>Nova Interação</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clientInteractions.length > 0 ? (
                    clientInteractions.map(interaction => (
                      <div key={interaction.id} className="border-l-4 border-blue-400 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span>{interactionIcons[interaction.type]}</span>
                          <span className="text-sm font-medium text-gray-700 capitalize">{interaction.type}</span>
                          <span className="text-xs text-gray-400">
                            {interaction.createdAt.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{interaction.description}</p>
                        {interaction.outcome && (
                          <p className="text-xs text-gray-500 mt-1">Resultado: {interaction.outcome}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Nenhuma interação registrada</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 text-lg">
                Selecione um cliente para ver os detalhes
              </div>
            </div>
          )}
        </div>
      </div>

      {showInteractionModal && (
        <Modal onClose={() => setShowInteractionModal(false)} title="Nova Interação">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={newInteraction.type}
                onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as ClientInteraction['type'] })}
                className="input w-full"
              >
                <option value="call">Ligação</option>
                <option value="email">E-mail</option>
                <option value="meeting">Reunião</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição *</label>
              <textarea
                value={newInteraction.description}
                onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                className="input w-full"
                rows={4}
                placeholder="Descreva o que foi discutido..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resultado</label>
              <input
                type="text"
                value={newInteraction.outcome}
                onChange={(e) => setNewInteraction({ ...newInteraction, outcome: e.target.value })}
                className="input w-full"
                placeholder="Ex: Agendar reunião, Enviar proposta"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAddInteraction} className="btn btn-primary flex-1">
                Registrar
              </button>
              <button onClick={() => setShowInteractionModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showTagModal && (
        <Modal onClose={() => setShowTagModal(false)} title="Atribuir Tags">
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id]);
                      } else {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAssignTags} className="btn btn-primary flex-1">
                Atribuir
              </button>
              <button onClick={() => setShowTagModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientDetails;
