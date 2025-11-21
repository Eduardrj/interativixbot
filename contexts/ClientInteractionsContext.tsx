import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ClientInteraction } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface ClientInteractionsContextType {
  interactions: ClientInteraction[];
  loading: boolean;
  addInteraction: (interaction: Omit<ClientInteraction, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<ClientInteraction>;
  updateInteraction: (id: string, updates: Partial<ClientInteraction>) => Promise<void>;
  deleteInteraction: (id: string) => Promise<void>;
  getClientInteractions: (clientId: string) => Promise<ClientInteraction[]>;
}

const ClientInteractionsContext = createContext<ClientInteractionsContextType | undefined>(undefined);

export const ClientInteractionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setInteractions([]);
      setLoading(false);
      return;
    }

    const loadInteractions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('client_interactions')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedInteractions = (data || []).map(interaction => ({
          id: interaction.id,
          companyId: interaction.company_id,
          clientId: interaction.client_id,
          userId: interaction.user_id,
          type: interaction.type as ClientInteraction['type'],
          subject: interaction.subject,
          description: interaction.description,
          durationMinutes: interaction.duration_minutes,
          outcome: interaction.outcome as ClientInteraction['outcome'],
          scheduledAt: interaction.scheduled_at ? new Date(interaction.scheduled_at) : undefined,
          completedAt: interaction.completed_at ? new Date(interaction.completed_at) : undefined,
          createdAt: new Date(interaction.created_at),
          updatedAt: new Date(interaction.updated_at),
        }));

        setInteractions(formattedInteractions);
      } catch (error) {
        console.error('Erro ao carregar interações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInteractions();

    const subscription = supabase
      .channel(`client_interactions:${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_interactions',
          filter: `company_id=eq.${currentCompany.id}`,
        },
        () => {
          loadInteractions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentCompany]);

  const addInteraction = async (
    interactionData: Omit<ClientInteraction, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
  ): Promise<ClientInteraction> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('client_interactions')
        .insert([
          {
            company_id: currentCompany.id,
            client_id: interactionData.clientId,
            user_id: interactionData.userId || user.id,
            type: interactionData.type,
            subject: interactionData.subject,
            description: interactionData.description,
            duration_minutes: interactionData.durationMinutes,
            outcome: interactionData.outcome,
            scheduled_at: interactionData.scheduledAt?.toISOString(),
            completed_at: interactionData.completedAt?.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newInteraction: ClientInteraction = {
        id: data.id,
        companyId: data.company_id,
        clientId: data.client_id,
        userId: data.user_id,
        type: data.type,
        subject: data.subject,
        description: data.description,
        durationMinutes: data.duration_minutes,
        outcome: data.outcome,
        scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setInteractions(prev => [newInteraction, ...prev]);
      return newInteraction;
    } catch (error) {
      console.error('Erro ao criar interação:', error);
      throw error;
    }
  };

  const updateInteraction = async (id: string, updates: Partial<ClientInteraction>): Promise<void> => {
    try {
      const updateData: any = {};
      
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes;
      if (updates.outcome !== undefined) updateData.outcome = updates.outcome;
      if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt?.toISOString();
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString();

      const { error } = await supabase
        .from('client_interactions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setInteractions(prev =>
        prev.map(interaction => (interaction.id === id ? { ...interaction, ...updates } : interaction))
      );
    } catch (error) {
      console.error('Erro ao atualizar interação:', error);
      throw error;
    }
  };

  const deleteInteraction = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('client_interactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInteractions(prev => prev.filter(interaction => interaction.id !== id));
    } catch (error) {
      console.error('Erro ao deletar interação:', error);
      throw error;
    }
  };

  const getClientInteractions = async (clientId: string): Promise<ClientInteraction[]> => {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(interaction => ({
        id: interaction.id,
        companyId: interaction.company_id,
        clientId: interaction.client_id,
        userId: interaction.user_id,
        type: interaction.type,
        subject: interaction.subject,
        description: interaction.description,
        durationMinutes: interaction.duration_minutes,
        outcome: interaction.outcome,
        scheduledAt: interaction.scheduled_at ? new Date(interaction.scheduled_at) : undefined,
        completedAt: interaction.completed_at ? new Date(interaction.completed_at) : undefined,
        createdAt: new Date(interaction.created_at),
        updatedAt: new Date(interaction.updated_at),
      }));
    } catch (error) {
      console.error('Erro ao buscar interações do cliente:', error);
      return [];
    }
  };

  return (
    <ClientInteractionsContext.Provider
      value={{
        interactions,
        loading,
        addInteraction,
        updateInteraction,
        deleteInteraction,
        getClientInteractions,
      }}
    >
      {children}
    </ClientInteractionsContext.Provider>
  );
};

export const useClientInteractions = () => {
  const context = useContext(ClientInteractionsContext);
  if (context === undefined) {
    throw new Error('useClientInteractions must be used within a ClientInteractionsProvider');
  }
  return context;
};
