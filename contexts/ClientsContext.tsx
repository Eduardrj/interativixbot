import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Client } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

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
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
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
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedClients = (data || []).map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          lastAppointment: c.last_appointment ? new Date(c.last_appointment) : undefined,
          consentLgpd: c.consent_lgpd,
          status: c.status,
          pipelineStage: c.pipeline_stage,
          score: c.score,
          source: c.source,
          company: c.company,
          position: c.position,
          birthday: c.birthday ? new Date(c.birthday) : undefined,
          address: c.address,
          socialMedia: c.social_media,
          notes: c.notes,
          lastContactAt: c.last_contact_at ? new Date(c.last_contact_at) : undefined,
          assignedTo: c.assigned_to,
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
      .channel(`clients:${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `company_id=eq.${currentCompany.id}`,
        },
        () => {
          loadClients();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentCompany]);

  const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            company_id: currentCompany.id,
            name: clientData.name,
            phone: clientData.phone,
            email: clientData.email,
            last_appointment: clientData.lastAppointment?.toISOString(),
            consent_lgpd: clientData.consentLgpd,
            status: clientData.status || 'lead',
            pipeline_stage: clientData.pipelineStage || 'new',
            score: clientData.score || 0,
            source: clientData.source,
            company: clientData.company,
            position: clientData.position,
            birthday: clientData.birthday?.toISOString().split('T')[0],
            address: clientData.address,
            social_media: clientData.socialMedia,
            notes: clientData.notes,
            assigned_to: clientData.assignedTo,
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
      const updateData: any = {};
      
      if (clientData.name !== undefined) updateData.name = clientData.name;
      if (clientData.phone !== undefined) updateData.phone = clientData.phone;
      if (clientData.email !== undefined) updateData.email = clientData.email;
      if (clientData.lastAppointment !== undefined) updateData.last_appointment = clientData.lastAppointment?.toISOString();
      if (clientData.consentLgpd !== undefined) updateData.consent_lgpd = clientData.consentLgpd;
      if (clientData.status !== undefined) updateData.status = clientData.status;
      if (clientData.pipelineStage !== undefined) updateData.pipeline_stage = clientData.pipelineStage;
      if (clientData.score !== undefined) updateData.score = clientData.score;
      if (clientData.source !== undefined) updateData.source = clientData.source;
      if (clientData.company !== undefined) updateData.company = clientData.company;
      if (clientData.position !== undefined) updateData.position = clientData.position;
      if (clientData.birthday !== undefined) updateData.birthday = clientData.birthday?.toISOString().split('T')[0];
      if (clientData.address !== undefined) updateData.address = clientData.address;
      if (clientData.socialMedia !== undefined) updateData.social_media = clientData.socialMedia;
      if (clientData.notes !== undefined) updateData.notes = clientData.notes;
      if (clientData.lastContactAt !== undefined) updateData.last_contact_at = clientData.lastContactAt?.toISOString();
      if (clientData.assignedTo !== undefined) updateData.assigned_to = clientData.assignedTo;

      const { error } = await supabase
        .from('clients')
        .update(updateData)
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
