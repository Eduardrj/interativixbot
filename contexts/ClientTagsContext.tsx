import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ClientTag } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface ClientTagsContextType {
  tags: ClientTag[];
  loading: boolean;
  addTag: (tag: Omit<ClientTag, 'id' | 'companyId' | 'createdAt'>) => Promise<ClientTag>;
  updateTag: (id: string, updates: Partial<ClientTag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  assignTagToClient: (clientId: string, tagId: string) => Promise<void>;
  removeTagFromClient: (clientId: string, tagId: string) => Promise<void>;
  getClientTags: (clientId: string) => Promise<ClientTag[]>;
}

const ClientTagsContext = createContext<ClientTagsContextType | undefined>(undefined);

export const ClientTagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<ClientTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setTags([]);
      setLoading(false);
      return;
    }

    const loadTags = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('client_tags')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('name', { ascending: true });

        if (error) throw error;

        const formattedTags = (data || []).map(tag => ({
          id: tag.id,
          companyId: tag.company_id,
          name: tag.name,
          color: tag.color,
          description: tag.description,
          createdAt: new Date(tag.created_at),
        }));

        setTags(formattedTags);
      } catch (error) {
        console.error('Erro ao carregar tags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTags();

    const subscription = supabase
      .channel(`client_tags:${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_tags',
          filter: `company_id=eq.${currentCompany.id}`,
        },
        () => {
          loadTags();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentCompany]);

  const addTag = async (tagData: Omit<ClientTag, 'id' | 'companyId' | 'createdAt'>): Promise<ClientTag> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('client_tags')
        .insert([
          {
            company_id: currentCompany.id,
            name: tagData.name,
            color: tagData.color,
            description: tagData.description,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newTag: ClientTag = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        color: data.color,
        description: data.description,
        createdAt: new Date(data.created_at),
      };

      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      throw error;
    }
  };

  const updateTag = async (id: string, updates: Partial<ClientTag>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('client_tags')
        .update({
          name: updates.name,
          color: updates.color,
          description: updates.description,
        })
        .eq('id', id);

      if (error) throw error;

      setTags(prev =>
        prev.map(tag => (tag.id === id ? { ...tag, ...updates } : tag))
      );
    } catch (error) {
      console.error('Erro ao atualizar tag:', error);
      throw error;
    }
  };

  const deleteTag = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('client_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTags(prev => prev.filter(tag => tag.id !== id));
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
      throw error;
    }
  };

  const assignTagToClient = async (clientId: string, tagId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('client_tag_relations')
        .insert([
          {
            client_id: clientId,
            tag_id: tagId,
          },
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atribuir tag ao cliente:', error);
      throw error;
    }
  };

  const removeTagFromClient = async (clientId: string, tagId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('client_tag_relations')
        .delete()
        .eq('client_id', clientId)
        .eq('tag_id', tagId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover tag do cliente:', error);
      throw error;
    }
  };

  const getClientTags = async (clientId: string): Promise<ClientTag[]> => {
    try {
      const { data, error } = await supabase
        .from('client_tag_relations')
        .select(`
          tag_id,
          client_tags (
            id,
            company_id,
            name,
            color,
            description,
            created_at
          )
        `)
        .eq('client_id', clientId);

      if (error) throw error;

      return (data || [])
        .filter(rel => rel.client_tags)
        .map(rel => {
          const tag = rel.client_tags as any;
          return {
            id: tag.id,
            companyId: tag.company_id,
            name: tag.name,
            color: tag.color,
            description: tag.description,
            createdAt: new Date(tag.created_at),
          };
        });
    } catch (error) {
      console.error('Erro ao buscar tags do cliente:', error);
      return [];
    }
  };

  return (
    <ClientTagsContext.Provider
      value={{
        tags,
        loading,
        addTag,
        updateTag,
        deleteTag,
        assignTagToClient,
        removeTagFromClient,
        getClientTags,
      }}
    >
      {children}
    </ClientTagsContext.Provider>
  );
};

export const useClientTags = () => {
  const context = useContext(ClientTagsContext);
  if (context === undefined) {
    throw new Error('useClientTags must be used within a ClientTagsProvider');
  }
  return context;
};
