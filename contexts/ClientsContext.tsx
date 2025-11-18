import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Client } from '../types';
import { useAuth } from './AuthContext';
import { API_URL, getAuthHeaders } from '../lib/config';

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
  const { session } = useAuth();

  const fetchClients = async () => {
    if (!session?.access_token) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      
      const formattedClients = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        lastAppointment: c.last_appointment ? new Date(c.last_appointment) : undefined,
        consentLgpd: c.consent_lgpd,
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [session]);

  const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: getAuthHeaders(session.access_token),
        body: JSON.stringify({
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          consent_lgpd: clientData.consentLgpd,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create client');
      }

      const newClientData = await response.json();
      
      const newClient: Client = {
        id: newClientData.id,
        name: newClientData.name,
        phone: newClientData.phone,
        email: newClientData.email,
        lastAppointment: newClientData.last_appointment ? new Date(newClientData.last_appointment) : undefined,
        consentLgpd: newClientData.consent_lgpd,
      };

      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>): Promise<void> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(session.access_token),
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update client');
      }

      setClients(prev =>
        prev.map(c => (c.id === id ? { ...c, ...clientData } : c))
      );
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/api/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(session.access_token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete client');
      }

      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
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
    throw new Error('useClients must be used within a ClientsProvider');
  }
  return context;
};