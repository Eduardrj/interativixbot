import React, { useState, useEffect } from 'react';
import { useKanban } from '../contexts/KanbanContext';
import { KanbanCard, KanbanColumn } from '../types';
import { ICONS } from '../constants';
import toast from 'react-hot-toast';
import Modal from './Modal';

const priorityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const priorityIcons = {
  low: '↓',
  medium: '→',
  high: '↑',
  urgent: '⚠',
};

const CardComponent: React.FC<{ card: KanbanCard; onEdit: (card: KanbanCard) => void }> = ({ card, onEdit }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const isOverdue = card.dueDate && card.dueDate < new Date() && !card.completedAt;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit(card)}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move border-l-4"
      style={{ borderLeftColor: card.priority === 'urgent' ? '#ef4444' : card.priority === 'high' ? '#f97316' : '#94a3b8' }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-800 text-sm leading-tight flex-1">{card.title}</h4>
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[card.priority]}`}>
          {priorityIcons[card.priority]}
        </span>
      </div>
      
      {card.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{card.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {card.clientName && (
            <span className="flex items-center">
              <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
              {card.clientName}
            </span>
          )}
        </div>
        {card.dueDate && (
          <span className={`${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
            {card.dueDate.toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {card.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ColumnComponent: React.FC<{ column: KanbanColumn; cards: KanbanCard[]; onCardEdit: (card: KanbanCard) => void; onCardMove: (cardId: string, toColumnId: string) => void }> = ({ column, cards, onCardEdit, onCardMove }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) {
      onCardMove(cardId, column.id);
    }
  };

  const wipWarning = column.limitWip && cards.length >= column.limitWip;

  return (
    <div
      className={`flex-shrink-0 w-80 bg-slate-50 rounded-xl p-4 transition-all ${isOver ? 'bg-slate-100 ring-2 ring-blue-400' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: column.color }}
          ></div>
          <h3 className="font-bold text-gray-700">{column.name}</h3>
          <span className={`ml-2 text-sm font-semibold px-2 py-1 rounded-full ${wipWarning ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-gray-600'}`}>
            {cards.length}
            {column.limitWip ? `/${column.limitWip}` : ''}
          </span>
        </div>
      </div>

      {column.description && (
        <p className="text-xs text-gray-500 mb-3">{column.description}</p>
      )}

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {cards.length > 0 ? (
          cards.map(card => (
            <CardComponent key={card.id} card={card} onEdit={onCardEdit} />
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400 border-2 border-dashed rounded-lg">
            <p>Arraste cards aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoardMain: React.FC = () => {
  const { columns, cards, loading, moveCard, addCard, updateCard, loadStats, stats } = useKanban();
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
    columnId: '',
    priority: 'medium' as KanbanCard['priority'],
    clientName: '',
    clientPhone: '',
    dueDate: '',
    tags: '',
  });

  useEffect(() => {
    loadStats();
  }, [cards]);

  const handleCardMove = async (cardId: string, toColumnId: string) => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (!card) return;

      const targetColumn = columns.find(c => c.id === toColumnId);
      if (targetColumn?.limitWip) {
        const targetCards = cards.filter(c => c.columnId === toColumnId);
        if (targetCards.length >= targetColumn.limitWip) {
          toast.error(`Limite WIP atingido (${targetColumn.limitWip})`);
          return;
        }
      }

      const targetCards = cards.filter(c => c.columnId === toColumnId);
      await moveCard(cardId, toColumnId, targetCards.length);
      toast.success('Card movido!');
    } catch (error) {
      console.error('Erro ao mover card:', error);
      toast.error('Erro ao mover card');
    }
  };

  const handleCreateCard = async () => {
    if (!newCardData.title.trim() || !newCardData.columnId) {
      toast.error('Título e coluna são obrigatórios');
      return;
    }

    try {
      const columnCards = cards.filter(c => c.columnId === newCardData.columnId);
      await addCard({
        title: newCardData.title,
        description: newCardData.description,
        columnId: newCardData.columnId,
        priority: newCardData.priority,
        clientName: newCardData.clientName || undefined,
        clientPhone: newCardData.clientPhone || undefined,
        dueDate: newCardData.dueDate ? new Date(newCardData.dueDate) : undefined,
        tags: newCardData.tags ? newCardData.tags.split(',').map(t => t.trim()) : [],
        position: columnCards.length,
      });

      setShowNewCardModal(false);
      setNewCardData({
        title: '',
        description: '',
        columnId: '',
        priority: 'medium',
        clientName: '',
        clientPhone: '',
        dueDate: '',
        tags: '',
      });
      toast.success('Card criado!');
    } catch (error) {
      console.error('Erro ao criar card:', error);
      toast.error('Erro ao criar card');
    }
  };

  const handleUpdateCard = async () => {
    if (!selectedCard) return;

    try {
      await updateCard(selectedCard.id, {
        title: selectedCard.title,
        description: selectedCard.description,
        priority: selectedCard.priority,
        clientName: selectedCard.clientName,
        clientPhone: selectedCard.clientPhone,
        dueDate: selectedCard.dueDate,
        tags: selectedCard.tags,
      });
      setSelectedCard(null);
      toast.success('Card atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      toast.error('Erro ao atualizar card');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-800">Kanban Board</h2>
          <p className="text-gray-600 text-sm mt-1">Gerencie visualmente seus atendimentos</p>
        </div>
        <button
          onClick={() => setShowNewCardModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          {ICONS.plus}
          <span>Novo Card</span>
        </button>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.columnId} className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">{stat.columnName}</h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800">{stat.cardCount}</span>
                {stat.highPriorityCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    {stat.highPriorityCount} urgentes
                  </span>
                )}
              </div>
              {stat.overdueCount > 0 && (
                <p className="text-xs text-red-600 mt-2">⚠ {stat.overdueCount} atrasados</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-4 overflow-x-auto pb-6">
        {columns.map(column => (
          <ColumnComponent
            key={column.id}
            column={column}
            cards={cards.filter(c => c.columnId === column.id).sort((a, b) => a.position - b.position)}
            onCardEdit={setSelectedCard}
            onCardMove={handleCardMove}
          />
        ))}
      </div>

      {showNewCardModal && (
        <Modal onClose={() => setShowNewCardModal(false)} title="Novo Card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                value={newCardData.title}
                onChange={e => setNewCardData({ ...newCardData, title: e.target.value })}
                className="input w-full"
                placeholder="Título do card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Coluna *</label>
              <select
                value={newCardData.columnId}
                onChange={e => setNewCardData({ ...newCardData, columnId: e.target.value })}
                className="input w-full"
              >
                <option value="">Selecione uma coluna</option>
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={newCardData.description}
                onChange={e => setNewCardData({ ...newCardData, description: e.target.value })}
                className="input w-full"
                rows={3}
                placeholder="Descrição detalhada"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prioridade</label>
                <select
                  value={newCardData.priority}
                  onChange={e => setNewCardData({ ...newCardData, priority: e.target.value as KanbanCard['priority'] })}
                  className="input w-full"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  value={newCardData.dueDate}
                  onChange={e => setNewCardData({ ...newCardData, dueDate: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <input
                type="text"
                value={newCardData.clientName}
                onChange={e => setNewCardData({ ...newCardData, clientName: e.target.value })}
                className="input w-full"
                placeholder="Nome do cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={newCardData.tags}
                onChange={e => setNewCardData({ ...newCardData, tags: e.target.value })}
                className="input w-full"
                placeholder="urgente, importante, revisar"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleCreateCard} className="btn btn-primary flex-1">
                Criar Card
              </button>
              <button onClick={() => setShowNewCardModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {selectedCard && (
        <Modal onClose={() => setSelectedCard(null)} title="Editar Card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                type="text"
                value={selectedCard.title}
                onChange={e => setSelectedCard({ ...selectedCard, title: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={selectedCard.description || ''}
                onChange={e => setSelectedCard({ ...selectedCard, description: e.target.value })}
                className="input w-full"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prioridade</label>
                <select
                  value={selectedCard.priority}
                  onChange={e => setSelectedCard({ ...selectedCard, priority: e.target.value as KanbanCard['priority'] })}
                  className="input w-full"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  value={selectedCard.dueDate ? selectedCard.dueDate.toISOString().split('T')[0] : ''}
                  onChange={e => setSelectedCard({ ...selectedCard, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <input
                type="text"
                value={selectedCard.clientName || ''}
                onChange={e => setSelectedCard({ ...selectedCard, clientName: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={selectedCard.tags?.join(', ') || ''}
                onChange={e => setSelectedCard({ ...selectedCard, tags: e.target.value.split(',').map(t => t.trim()) })}
                className="input w-full"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleUpdateCard} className="btn btn-primary flex-1">
                Salvar
              </button>
              <button onClick={() => setSelectedCard(null)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default KanbanBoardMain;