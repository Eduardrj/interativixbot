import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { FinancialTransaction, FinancialCategory, FinancialGoal, FinancialAccount, FinancialMetrics } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useCompanies } from './CompaniesContext';

interface FinancialContextType {
  transactions: FinancialTransaction[];
  categories: FinancialCategory[];
  goals: FinancialGoal[];
  accounts: FinancialAccount[];
  metrics: FinancialMetrics | null;
  loading: boolean;
  
  // Transactions
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<FinancialTransaction>;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Categories
  addCategory: (category: Omit<FinancialCategory, 'id' | 'companyId' | 'createdAt'>) => Promise<FinancialCategory>;
  updateCategory: (id: string, updates: Partial<FinancialCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Goals
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<FinancialGoal>;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Accounts
  addAccount: (account: Omit<FinancialAccount, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<FinancialAccount>;
  updateAccount: (id: string, updates: Partial<FinancialAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Metrics
  loadMetrics: (startDate: Date, endDate: Date) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  useEffect(() => {
    if (!user || !currentCompany) {
      setTransactions([]);
      setCategories([]);
      setGoals([]);
      setAccounts([]);
      setMetrics(null);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [transactionsRes, categoriesRes, goalsRes, accountsRes] = await Promise.all([
          supabase.from('financial_transactions').select('*').eq('company_id', currentCompany.id).order('due_date', { ascending: false }),
          supabase.from('financial_categories').select('*').eq('company_id', currentCompany.id).order('name'),
          supabase.from('financial_goals').select('*').eq('company_id', currentCompany.id).order('end_date'),
          supabase.from('financial_accounts').select('*').eq('company_id', currentCompany.id).order('name'),
        ]);

        if (transactionsRes.data) {
          setTransactions(transactionsRes.data.map(t => ({
            id: t.id,
            companyId: t.company_id,
            categoryId: t.category_id,
            type: t.type as 'income' | 'expense',
            amount: parseFloat(t.amount),
            description: t.description,
            notes: t.notes,
            status: t.status as FinancialTransaction['status'],
            paymentMethod: t.payment_method as FinancialTransaction['paymentMethod'],
            dueDate: new Date(t.due_date),
            paidDate: t.paid_date ? new Date(t.paid_date) : undefined,
            clientId: t.client_id,
            appointmentId: t.appointment_id,
            recurrence: t.recurrence as FinancialTransaction['recurrence'],
            recurrenceEndDate: t.recurrence_end_date ? new Date(t.recurrence_end_date) : undefined,
            parentTransactionId: t.parent_transaction_id,
            attachedFileUrl: t.attached_file_url,
            createdBy: t.created_by,
            createdAt: new Date(t.created_at),
            updatedAt: new Date(t.updated_at),
          })));
        }

        if (categoriesRes.data) {
          setCategories(categoriesRes.data.map(c => ({
            id: c.id,
            companyId: c.company_id,
            name: c.name,
            type: c.type as 'income' | 'expense',
            color: c.color,
            icon: c.icon,
            description: c.description,
            isDefault: c.is_default,
            createdAt: new Date(c.created_at),
          })));
        }

        if (goalsRes.data) {
          setGoals(goalsRes.data.map(g => ({
            id: g.id,
            companyId: g.company_id,
            name: g.name,
            description: g.description,
            type: g.type as FinancialGoal['type'],
            targetAmount: parseFloat(g.target_amount),
            currentAmount: parseFloat(g.current_amount),
            startDate: new Date(g.start_date),
            endDate: new Date(g.end_date),
            status: g.status as FinancialGoal['status'],
            createdAt: new Date(g.created_at),
            updatedAt: new Date(g.updated_at),
          })));
        }

        if (accountsRes.data) {
          setAccounts(accountsRes.data.map(a => ({
            id: a.id,
            companyId: a.company_id,
            name: a.name,
            type: a.type as FinancialAccount['type'],
            bankName: a.bank_name,
            accountNumber: a.account_number,
            initialBalance: parseFloat(a.initial_balance),
            currentBalance: parseFloat(a.current_balance),
            color: a.color,
            isActive: a.is_active,
            createdAt: new Date(a.created_at),
            updatedAt: new Date(a.updated_at),
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time subscriptions
    const transactionsChannel = supabase
      .channel(`financial_transactions:${currentCompany.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions', filter: `company_id=eq.${currentCompany.id}` }, loadData)
      .subscribe();

    const categoriesChannel = supabase
      .channel(`financial_categories:${currentCompany.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_categories', filter: `company_id=eq.${currentCompany.id}` }, loadData)
      .subscribe();

    return () => {
      transactionsChannel.unsubscribe();
      categoriesChannel.unsubscribe();
    };
  }, [user, currentCompany]);

  // Transaction methods
  const addTransaction = async (data: Omit<FinancialTransaction, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<FinancialTransaction> => {
    if (!user || !currentCompany) throw new Error('Não autenticado');

    const { data: result, error } = await supabase.from('financial_transactions').insert([{
      company_id: currentCompany.id,
      category_id: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      notes: data.notes,
      status: data.status,
      payment_method: data.paymentMethod,
      due_date: data.dueDate.toISOString().split('T')[0],
      paid_date: data.paidDate?.toISOString().split('T')[0],
      client_id: data.clientId,
      appointment_id: data.appointmentId,
      recurrence: data.recurrence,
      recurrence_end_date: data.recurrenceEndDate?.toISOString().split('T')[0],
      parent_transaction_id: data.parentTransactionId,
      attached_file_url: data.attachedFileUrl,
      created_by: user.id,
    }]).select().single();

    if (error) throw error;
    
    const newTransaction: FinancialTransaction = {
      id: result.id,
      companyId: result.company_id,
      categoryId: result.category_id,
      type: result.type,
      amount: parseFloat(result.amount),
      description: result.description,
      notes: result.notes,
      status: result.status,
      paymentMethod: result.payment_method,
      dueDate: new Date(result.due_date),
      paidDate: result.paid_date ? new Date(result.paid_date) : undefined,
      clientId: result.client_id,
      appointmentId: result.appointment_id,
      recurrence: result.recurrence,
      recurrenceEndDate: result.recurrence_end_date ? new Date(result.recurrence_end_date) : undefined,
      parentTransactionId: result.parent_transaction_id,
      attachedFileUrl: result.attached_file_url,
      createdBy: result.created_by,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = async (id: string, updates: Partial<FinancialTransaction>): Promise<void> => {
    const updateData: any = {};
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString().split('T')[0];
    if (updates.paidDate !== undefined) updateData.paid_date = updates.paidDate?.toISOString().split('T')[0];

    const { error } = await supabase.from('financial_transactions').update(updateData).eq('id', id);
    if (error) throw error;

    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
    if (error) throw error;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Category methods
  const addCategory = async (data: Omit<FinancialCategory, 'id' | 'companyId' | 'createdAt'>): Promise<FinancialCategory> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data: result, error } = await supabase.from('financial_categories').insert([{
      company_id: currentCompany.id,
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
      description: data.description,
      is_default: data.isDefault,
    }]).select().single();

    if (error) throw error;

    const newCategory: FinancialCategory = {
      id: result.id,
      companyId: result.company_id,
      name: result.name,
      type: result.type,
      color: result.color,
      icon: result.icon,
      description: result.description,
      isDefault: result.is_default,
      createdAt: new Date(result.created_at),
    };

    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<FinancialCategory>): Promise<void> => {
    const { error } = await supabase.from('financial_categories').update({
      name: updates.name,
      color: updates.color,
      icon: updates.icon,
      description: updates.description,
    }).eq('id', id);

    if (error) throw error;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase.from('financial_categories').delete().eq('id', id);
    if (error) throw error;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Goal methods
  const addGoal = async (data: Omit<FinancialGoal, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<FinancialGoal> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data: result, error } = await supabase.from('financial_goals').insert([{
      company_id: currentCompany.id,
      name: data.name,
      description: data.description,
      type: data.type,
      target_amount: data.targetAmount,
      current_amount: data.currentAmount,
      start_date: data.startDate.toISOString().split('T')[0],
      end_date: data.endDate.toISOString().split('T')[0],
      status: data.status,
    }]).select().single();

    if (error) throw error;

    const newGoal: FinancialGoal = {
      id: result.id,
      companyId: result.company_id,
      name: result.name,
      description: result.description,
      type: result.type,
      targetAmount: parseFloat(result.target_amount),
      currentAmount: parseFloat(result.current_amount),
      startDate: new Date(result.start_date),
      endDate: new Date(result.end_date),
      status: result.status,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>): Promise<void> => {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error } = await supabase.from('financial_goals').update(updateData).eq('id', id);
    if (error) throw error;
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = async (id: string): Promise<void> => {
    const { error } = await supabase.from('financial_goals').delete().eq('id', id);
    if (error) throw error;
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Account methods
  const addAccount = async (data: Omit<FinancialAccount, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<FinancialAccount> => {
    if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

    const { data: result, error } = await supabase.from('financial_accounts').insert([{
      company_id: currentCompany.id,
      name: data.name,
      type: data.type,
      bank_name: data.bankName,
      account_number: data.accountNumber,
      initial_balance: data.initialBalance,
      current_balance: data.currentBalance,
      color: data.color,
      is_active: data.isActive,
    }]).select().single();

    if (error) throw error;

    const newAccount: FinancialAccount = {
      id: result.id,
      companyId: result.company_id,
      name: result.name,
      type: result.type,
      bankName: result.bank_name,
      accountNumber: result.account_number,
      initialBalance: parseFloat(result.initial_balance),
      currentBalance: parseFloat(result.current_balance),
      color: result.color,
      isActive: result.is_active,
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };

    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  };

  const updateAccount = async (id: string, updates: Partial<FinancialAccount>): Promise<void> => {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.bankName !== undefined) updateData.bank_name = updates.bankName;
    if (updates.accountNumber !== undefined) updateData.account_number = updates.accountNumber;
    if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { error } = await supabase.from('financial_accounts').update(updateData).eq('id', id);
    if (error) throw error;
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = async (id: string): Promise<void> => {
    const { error } = await supabase.from('financial_accounts').delete().eq('id', id);
    if (error) throw error;
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Metrics
  const loadMetrics = async (startDate: Date, endDate: Date): Promise<void> => {
    if (!currentCompany) return;

    const { data, error } = await supabase.rpc('get_financial_metrics', {
      p_company_id: currentCompany.id,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0],
    });

    if (error) {
      console.error('Erro ao carregar métricas:', error);
      return;
    }

    if (data && data.length > 0) {
      const m = data[0];
      setMetrics({
        totalIncome: parseFloat(m.total_income) || 0,
        totalExpense: parseFloat(m.total_expense) || 0,
        netProfit: parseFloat(m.net_profit) || 0,
        paidIncome: parseFloat(m.paid_income) || 0,
        paidExpense: parseFloat(m.paid_expense) || 0,
        pendingIncome: parseFloat(m.pending_income) || 0,
        pendingExpense: parseFloat(m.pending_expense) || 0,
        overdueCount: m.overdue_count || 0,
      });
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        categories,
        goals,
        accounts,
        metrics,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addGoal,
        updateGoal,
        deleteGoal,
        addAccount,
        updateAccount,
        deleteAccount,
        loadMetrics,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
