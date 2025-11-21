import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface BusinessHours {
  open: string | null;
  close: string | null;
}

interface CompanySettings {
  business_hours: {
    monday: BusinessHours;
    tuesday: BusinessHours;
    wednesday: BusinessHours;
    thursday: BusinessHours;
    friday: BusinessHours;
    saturday: BusinessHours;
    sunday: BusinessHours;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  timezone: string;
  language: string;
  currency: string;
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Company {
  id: string;
  name: string;
  legal_name?: string;
  document?: string;
  industry?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: Address;
  settings: CompanySettings;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompaniesContextType {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  error: string | null;
  selectCompany: (companyId: string) => void;
  addCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

export const CompaniesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar empresas do usuário
  const loadCompanies = async () => {
    if (!user) {
      setCompanies([]);
      setCurrentCompany(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar empresas vinculadas ao usuário
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('active', true);

      if (companyUsersError) throw companyUsersError;

      if (!companyUsers || companyUsers.length === 0) {
        setCompanies([]);
        setCurrentCompany(null);
        setLoading(false);
        return;
      }

      const companyIds = companyUsers.map(cu => cu.company_id);

      // Buscar dados das empresas
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds)
        .eq('active', true)
        .order('name');

      if (companiesError) throw companiesError;

      setCompanies(companiesData || []);

      // Selecionar empresa atual
      const savedCompanyId = localStorage.getItem('currentCompanyId');
      if (savedCompanyId && companiesData?.some(c => c.id === savedCompanyId)) {
        const company = companiesData.find(c => c.id === savedCompanyId);
        setCurrentCompany(company || null);
      } else if (companiesData && companiesData.length > 0) {
        setCurrentCompany(companiesData[0]);
        localStorage.setItem('currentCompanyId', companiesData[0].id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar empresas:', err);
      setError(err.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [user]);

  // Selecionar empresa
  const selectCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      localStorage.setItem('currentCompanyId', companyId);
    }
  };

  // Adicionar empresa
  const addCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setError(null);

      // Criar empresa
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single();

      if (createError) throw createError;

      // Vincular usuário como owner
      const { error: linkError } = await supabase
        .from('company_users')
        .insert([{
          company_id: newCompany.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (linkError) throw linkError;

      await loadCompanies();
    } catch (err: any) {
      console.error('Erro ao adicionar empresa:', err);
      setError(err.message || 'Erro ao adicionar empresa');
      throw err;
    }
  };

  // Atualizar empresa
  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      await loadCompanies();
    } catch (err: any) {
      console.error('Erro ao atualizar empresa:', err);
      setError(err.message || 'Erro ao atualizar empresa');
      throw err;
    }
  };

  // Deletar empresa
  const deleteCompany = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      if (currentCompany?.id === id) {
        setCurrentCompany(null);
        localStorage.removeItem('currentCompanyId');
      }

      await loadCompanies();
    } catch (err: any) {
      console.error('Erro ao deletar empresa:', err);
      setError(err.message || 'Erro ao deletar empresa');
      throw err;
    }
  };

  const refreshCompanies = async () => {
    await loadCompanies();
  };

  return (
    <CompaniesContext.Provider
      value={{
        companies,
        currentCompany,
        loading,
        error,
        selectCompany,
        addCompany,
        updateCompany,
        deleteCompany,
        refreshCompanies,
      }}
    >
      {children}
    </CompaniesContext.Provider>
  );
};

export const useCompanies = () => {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompaniesProvider');
  }
  return context;
};
