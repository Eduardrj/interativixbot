import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Client } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface ClientsContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  loading: boolean;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const ClientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    const loadClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedClients = (data || []).map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          lastAppointment: c.last_appointment ? new Date(c.last_appointment) : undefined,
          consentLgpd: c.consent_lgpd,
        }));

        setClients(formattedClients);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();

    const subscription = supabase
      .channel(`clients:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadClients();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            user_id: user.id,
            name: clientData.name,
            phone: clientData.phone,
            email: clientData.email,
            last_appointment: clientData.lastAppointment?.toISOString(),
            consent_lgpd: clientData.consentLgpd,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newClient: Client = {
        id: data.id,
        ...clientData,
      };

      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          last_appointment: clientData.lastAppointment?.toISOString(),
          consent_lgpd: clientData.consentLgpd,
        })
        .eq('id', id);

      if (error) throw error;

      setClients(prev =>
        prev.map(c => (c.id === id ? { ...c, ...clientData } : c))
      );
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  };

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient, loading }}>
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error('useClients deve ser usado dentro de um ClientsProvider');
  }
  return context;
};
