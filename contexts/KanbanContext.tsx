import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { KanbanColumn, KanbanCard, KanbanMovement, KanbanComment, KanbanStats } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface KanbanContextType {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  movements: KanbanMovement[];
  stats: KanbanStats[];
  loading: boolean;
  
  // Columns
  addColumn: (column: Omit<KanbanColumn, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<KanbanColumn>;
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  reorderColumns: (columnIds: string[]) => Promise<void>;
  
  // Cards
  addCard: (card: Omit<KanbanCard, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<KanbanCard>;
  updateCard: (id: string, updates: Partial<KanbanCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, toColumnId: string, position: number) => Promise<void>;
  
  // Comments
  addComment: (cardId: string, comment: string) => Promise<KanbanComment>;
  getCardComments: (cardId: string) => Promise<KanbanComment[]>;
  
  // Stats
  loadStats: () => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [movements, setMovements] = useState<KanbanMovement[]>([]);
  const [stats, setStats] = useState<KanbanStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setColumns([]);
      setCards([]);
      setMovements([]);
      setStats([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load columns
        const { data: columnsData, error: columnsError } = await supabase
          .from('kanban_columns')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('position');

        if (columnsError) throw columnsError;

        setColumns((columnsData || []).map(c => ({
          id: c.id,
          companyId: c.company_id,
          name: c.name,
          description: c.description,
          color: c.color,
          position: c.position,
          isDefault: c.is_default,
          limitWip: c.limit_wip,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
        })));

        // Load cards
        const { data: cardsData, error: cardsError } = await supabase
          .from('kanban_cards')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('position');

        if (cardsError) throw cardsError;

        setCards((cardsData || []).map(c => ({
          id: c.id,
          companyId: c.company_id,
          columnId: c.column_id,
          appointmentId: c.appointment_id,
          title: c.title,
          description: c.description,
          clientName: c.client_name,
          clientPhone: c.client_phone,
          assignedTo: c.assigned_to,
          priority: c.priority as KanbanCard['priority'],
          tags: c.tags,
          position: c.position,
          dueDate: c.due_date ? new Date(c.due_date) : undefined,
          completedAt: c.completed_at ? new Date(c.completed_at) : undefined,
          createdBy: c.created_by,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
        })));
      } catch (error) {
        console.error('Erro ao carregar Kanban:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time subscriptions
    const columnsChannel = supabase
      .channel(`kanban_columns:${currentCompany.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanban_columns', filter: `company_id=eq.${currentCompany.id}` }, loadData)
      .subscribe();

    const cardsChannel = supabase
      .channel(`kanban_cards:${currentCompany.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanban_cards', filter: `company_id=eq.${currentCompany.id}` }, loadData)
      .subscribe();

    return () => {
      columnsChannel.unsubscribe();
      cardsChannel.unsubscribe();
    };
  }, [user, currentCompany]);

  const addColumn = async (data: Omit<KanbanColumn, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<KanbanColumn> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data: result, error } = await supabase
      .from('kanban_columns')
      .insert([{
        company_id: currentCompany.id,
        name: data.name,
        description: data.description,
        color: data.color,
        position: data.position,
        is_default: data.isDefault,
        limit_wip: data.limitWip,
      }])
      .select()
      .single();

    if (error) throw error;

    const newColumn: KanbanColumn = {
      id: result.id,
      companyId: result.company_id,
      name: result.name,
      description: result.description,
      color: result.color,
      position: result.position,
      isDefault: result.is_default,
      limitWip: result.limit_wip,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setColumns(prev => [...prev, newColumn].sort((a, b) => a.position - b.position));
    return newColumn;
  };

  const updateColumn = async (id: string, updates: Partial<KanbanColumn>): Promise<void> => {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.position !== undefined) updateData.position = updates.position;
    if (updates.limitWip !== undefined) updateData.limit_wip = updates.limitWip;

    const { error } = await supabase
      .from('kanban_columns')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    setColumns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c).sort((a, b) => a.position - b.position));
  };

  const deleteColumn = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('kanban_columns')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setColumns(prev => prev.filter(c => c.id !== id));
  };

  const reorderColumns = async (columnIds: string[]): Promise<void> => {
    const updates = columnIds.map((id, index) => 
      supabase.from('kanban_columns').update({ position: index }).eq('id', id)
    );

    await Promise.all(updates);
    setColumns(prev => {
      const ordered = columnIds.map(id => prev.find(c => c.id === id)!).filter(Boolean);
      return ordered.map((col, index) => ({ ...col, position: index }));
    });
  };

  const addCard = async (data: Omit<KanbanCard, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<KanbanCard> => {
    if (!user || !currentCompany) throw new Error('Não autenticado');

    const { data: result, error } = await supabase
      .from('kanban_cards')
      .insert([{
        company_id: currentCompany.id,
        column_id: data.columnId,
        appointment_id: data.appointmentId,
        title: data.title,
        description: data.description,
        client_name: data.clientName,
        client_phone: data.clientPhone,
        assigned_to: data.assignedTo,
        priority: data.priority,
        tags: data.tags,
        position: data.position,
        due_date: data.dueDate?.toISOString(),
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) throw error;

    const newCard: KanbanCard = {
      id: result.id,
      companyId: result.company_id,
      columnId: result.column_id,
      appointmentId: result.appointment_id,
      title: result.title,
      description: result.description,
      clientName: result.client_name,
      clientPhone: result.client_phone,
      assignedTo: result.assigned_to,
      priority: result.priority,
      tags: result.tags,
      position: result.position,
      dueDate: result.due_date ? new Date(result.due_date) : undefined,
      completedAt: result.completed_at ? new Date(result.completed_at) : undefined,
      createdBy: result.created_by,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setCards(prev => [...prev, newCard]);
    return newCard;
  };

  const updateCard = async (id: string, updates: Partial<KanbanCard>): Promise<void> => {
    const updateData: any = {};
    if (updates.columnId !== undefined) updateData.column_id = updates.columnId;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.clientName !== undefined) updateData.client_name = updates.clientName;
    if (updates.clientPhone !== undefined) updateData.client_phone = updates.clientPhone;
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.position !== undefined) updateData.position = updates.position;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString();

    const { error } = await supabase
      .from('kanban_cards')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCard = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('kanban_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const moveCard = async (cardId: string, toColumnId: string, position: number): Promise<void> => {
    await updateCard(cardId, { columnId: toColumnId, position });
  };

  const addComment = async (cardId: string, comment: string): Promise<KanbanComment> => {
    if (!user) throw new Error('Não autenticado');

    const { data: result, error } = await supabase
      .from('kanban_comments')
      .insert([{
        card_id: cardId,
        user_id: user.id,
        comment,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      cardId: result.card_id,
      userId: result.user_id,
      comment: result.comment,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };
  };

  const getCardComments = async (cardId: string): Promise<KanbanComment[]> => {
    const { data, error } = await supabase
      .from('kanban_comments')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      cardId: c.card_id,
      userId: c.user_id,
      comment: c.comment,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    }));
  };

  const loadStats = async (): Promise<void> => {
    if (!currentCompany) return;

    const { data, error } = await supabase.rpc('get_kanban_stats', {
      p_company_id: currentCompany.id,
    });

    if (error) {
      console.error('Erro ao carregar estatísticas:', error);
      return;
    }

    setStats((data || []).map((s: any) => ({
      columnId: s.column_id,
      columnName: s.column_name,
      cardCount: parseInt(s.card_count) || 0,
      highPriorityCount: parseInt(s.high_priority_count) || 0,
      overdueCount: parseInt(s.overdue_count) || 0,
      avgTimeInColumn: s.avg_time_in_column || '0',
    })));
  };

  return (
    <KanbanContext.Provider
      value={{
        columns,
        cards,
        movements,
        stats,
        loading,
        addColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        addComment,
        getCardComments,
        loadStats,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
