import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Professional } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface ProfessionalsContextType {
  professionals: Professional[];
  addProfessional: (professional: Omit<Professional, 'id'>) => Promise<Professional>;
  updateProfessional: (id: string, professional: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  loading: boolean;
}

const ProfessionalsContext = createContext<ProfessionalsContextType | undefined>(undefined);

export const ProfessionalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setProfessionals([]);
      setLoading(false);
      return;
    }

    const loadProfessionals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedProfessionals = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: 'atendente' as const,
          avatarUrl: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=8B5CF6&color=fff`,
          specialties: p.specialties || [],
        }));

        setProfessionals(formattedProfessionals);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();

    const subscription = supabase
      .channel(`professionals:${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professionals',
          filter: `company_id=eq.${currentCompany.id}`,
        },
        () => {
          loadProfessionals();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentCompany]);

  const addProfessional = async (professionalData: Omit<Professional, 'id'>): Promise<Professional> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('professionals')
        .insert([
          {
            company_id: currentCompany.id,
            name: professionalData.name,
            email: professionalData.email,
            avatar_url: professionalData.avatarUrl,
            specialties: professionalData.specialties,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newProfessional: Professional = {
        id: data.id,
        ...professionalData,
      };

      setProfessionals(prev => [newProfessional, ...prev]);
      return newProfessional;
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      throw error;
    }
  };

  const updateProfessional = async (id: string, professionalData: Partial<Professional>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          name: professionalData.name,
          email: professionalData.email,
          avatar_url: professionalData.avatarUrl,
          specialties: professionalData.specialties,
        })
        .eq('id', id);

      if (error) throw error;

      setProfessionals(prev =>
        prev.map(p => (p.id === id ? { ...p, ...professionalData } : p))
      );
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      throw error;
    }
  };

  const deleteProfessional = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfessionals(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
      throw error;
    }
  };

  return (
    <ProfessionalsContext.Provider value={{ professionals, addProfessional, updateProfessional, deleteProfessional, loading }}>
      {children}
    </ProfessionalsContext.Provider>
  );
};

export const useProfessionals = () => {
  const context = useContext(ProfessionalsContext);
  if (context === undefined) {
    throw new Error('useProfessionals deve ser usado dentro de um ProfessionalsProvider');
  }
  return context;
};
