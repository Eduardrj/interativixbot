import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Service } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface ServicesContextType {
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Promise<Service>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  loading: boolean;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setServices([]);
      setLoading(false);
      return;
    }

    const loadServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedServices = (data || []).map(s => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          price: s.price,
        }));

        setServices(formattedServices);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();

    const subscription = supabase
      .channel(`services:${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services',
          filter: `company_id=eq.${currentCompany.id}`,
        },
        () => {
          loadServices();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentCompany]);

  const addService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('services')
        .insert([
          {
            company_id: currentCompany.id,
            name: serviceData.name,
            duration: serviceData.duration,
            price: serviceData.price,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newService: Service = {
        id: data.id,
        ...serviceData,
      };

      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: serviceData.name,
          duration: serviceData.duration,
          price: serviceData.price,
        })
        .eq('id', id);

      if (error) throw error;

      setServices(prev =>
        prev.map(s => (s.id === id ? { ...s, ...serviceData } : s))
      );
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  };

  const deleteService = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
  };

  return (
    <ServicesContext.Provider value={{ services, addService, updateService, deleteService, loading }}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices deve ser usado dentro de um ServicesProvider');
  }
  return context;
};
