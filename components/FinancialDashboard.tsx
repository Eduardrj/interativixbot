import React, { useState, useEffect } from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { FinancialTransaction, FinancialCategory, FinancialGoal, FinancialAccount } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';
import toast from 'react-hot-toast';

const FinancialDashboard: React.FC = () => {
  const {
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
    addGoal,
    updateGoal,
    addAccount,
    loadMetrics,
  } = useFinancial();

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'goals' | 'accounts'>('transactions');

  const [transactionForm, setTransactionForm] = useState({
    type: 'income' as FinancialTransaction['type'],
    amount: '',
    categoryId: '',
    accountId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isPaid: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as FinancialCategory['type'],
    color: '#3b82f6',
    icon: '📦',
  });

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
  });

  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'checking' as FinancialAccount['type'],
    balance: '',
    bank: '',
  });

  useEffect(() => {
    loadMetrics();
  }, [transactions]);

  const handleAddTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.categoryId || !transactionForm.accountId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await addTransaction({
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        categoryId: transactionForm.categoryId,
        accountId: transactionForm.accountId,
        description: transactionForm.description || undefined,
        date: new Date(transactionForm.date),
        isPaid: transactionForm.isPaid,
      });

      setTransactionForm({
        type: 'income',
        amount: '',
        categoryId: '',
        accountId: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isPaid: true,
      });
      setShowTransactionModal(false);
      toast.success('Transação criada!');
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao criar transação');
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await addCategory({
        name: categoryForm.name,
        type: categoryForm.type,
        color: categoryForm.color,
        icon: categoryForm.icon,
      });

      setCategoryForm({
        name: '',
        type: 'expense',
        color: '#3b82f6',
        icon: '📦',
      });
      setShowCategoryModal(false);
      toast.success('Categoria criada!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.targetAmount) {
      toast.error('Nome e valor alvo são obrigatórios');
      return;
    }

    try {
      await addGoal({
        name: goalForm.name,
        targetAmount: parseFloat(goalForm.targetAmount),
        currentAmount: parseFloat(goalForm.currentAmount),
        deadline: goalForm.deadline ? new Date(goalForm.deadline) : undefined,
      });

      setGoalForm({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
      });
      setShowGoalModal(false);
      toast.success('Meta criada!');
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta');
    }
  };

  const handleAddAccount = async () => {
    if (!accountForm.name || !accountForm.balance) {
      toast.error('Nome e saldo são obrigatórios');
      return;
    }

    try {
      await addAccount({
        name: accountForm.name,
        type: accountForm.type,
        balance: parseFloat(accountForm.balance),
        bank: accountForm.bank || undefined,
      });

      setAccountForm({
        name: '',
        type: 'checking',
        balance: '',
        bank: '',
      });
      setShowAccountModal(false);
      toast.success('Conta criada!');
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro ao criar conta');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;

    try {
      await deleteTransaction(id);
      toast.success('Transação excluída!');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getProgressPercent = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-primary animate-spin">{ICONS.loader}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Financeiro</h2>
          <p className="text-gray-600 text-sm mt-1">Gestão completa de receitas, despesas e metas</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowTransactionModal(true)} className="btn btn-primary flex items-center space-x-2">
            {ICONS.plus}
            <span>Nova Transação</span>
          </button>
          <button onClick={() => setShowCategoryModal(true)} className="btn btn-ghost">
            Categoria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Receitas</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(metrics?.totalIncome || 0)}</div>
          <div className="text-xs opacity-75 mt-1">Mês atual</div>
        </div>

        <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Despesas</span>
            <span className="text-2xl">💸</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(metrics?.totalExpenses || 0)}</div>
          <div className="text-xs opacity-75 mt-1">Mês atual</div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Saldo</span>
            <span className="text-2xl">💵</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(metrics?.balance || 0)}</div>
          <div className="text-xs opacity-75 mt-1">Receitas - Despesas</div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Contas a Receber</span>
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(metrics?.pendingIncome || 0)}</div>
          <div className="text-xs opacity-75 mt-1">Não recebidas</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transações ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Metas ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contas ({accounts.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.slice(0, 20).map(transaction => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  const account = accounts.find(a => a.id === transaction.accountId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: category?.color + '20' }}
                        >
                          {category?.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {transaction.description || category?.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{transaction.date.toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>{account?.name}</span>
                            {!transaction.isPaid && (
                              <>
                                <span>•</span>
                                <span className="text-orange-600 font-semibold">Pendente</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Nenhuma transação registrada
                </div>
              )}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowGoalModal(true)} className="btn btn-sm btn-primary">
                  + Nova Meta
                </button>
              </div>
              {goals.length > 0 ? (
                goals.map(goal => {
                  const progress = getProgressPercent(goal);
                  const isCompleted = goal.isCompleted;
                  return (
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{goal.name}</h4>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`absolute h-full ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          } transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{progress.toFixed(0)}% concluído</span>
                        {goal.deadline && (
                          <span>Prazo: {goal.deadline.toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Nenhuma meta criada
                </div>
              )}
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowAccountModal(true)} className="btn btn-sm btn-primary">
                  + Nova Conta
                </button>
              </div>
              {accounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.map(account => (
                    <div key={account.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{account.name}</h4>
                        <span className="text-xs text-gray-500 uppercase">{account.type}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">
                        {formatCurrency(account.balance)}
                      </div>
                      {account.bank && (
                        <p className="text-xs text-gray-500">{account.bank}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Nenhuma conta cadastrada
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showTransactionModal && (
        <Modal onClose={() => setShowTransactionModal(false)} title="Nova Transação">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'income' })}
                  className={`p-3 rounded-lg border-2 ${
                    transactionForm.type === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200'
                  }`}
                >
                  💰 Receita
                </button>
                <button
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'expense' })}
                  className={`p-3 rounded-lg border-2 ${
                    transactionForm.type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200'
                  }`}
                >
                  💸 Despesa
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="input w-full"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data *</label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoria *</label>
              <select
                value={transactionForm.categoryId}
                onChange={(e) => setTransactionForm({ ...transactionForm, categoryId: e.target.value })}
                className="input w-full"
              >
                <option value="">Selecione</option>
                {categories
                  .filter(c => c.type === transactionForm.type)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Conta *</label>
              <select
                value={transactionForm.accountId}
                onChange={(e) => setTransactionForm({ ...transactionForm, accountId: e.target.value })}
                className="input w-full"
              >
                <option value="">Selecione</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <input
                type="text"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                className="input w-full"
                placeholder="Descrição opcional"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={transactionForm.isPaid}
                onChange={(e) => setTransactionForm({ ...transactionForm, isPaid: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm">Já foi paga/recebida</label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAddTransaction} className="btn btn-primary flex-1">
                Criar
              </button>
              <button onClick={() => setShowTransactionModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showCategoryModal && (
        <Modal onClose={() => setShowCategoryModal(false)} title="Nova Categoria">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCategoryForm({ ...categoryForm, type: 'income' })}
                  className={`p-3 rounded-lg border-2 ${
                    categoryForm.type === 'income'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  Receita
                </button>
                <button
                  onClick={() => setCategoryForm({ ...categoryForm, type: 'expense' })}
                  className={`p-3 rounded-lg border-2 ${
                    categoryForm.type === 'expense'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  Despesa
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ícone</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="input w-full text-2xl text-center"
                  placeholder="📦"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="input w-full h-12"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAddCategory} className="btn btn-primary flex-1">
                Criar
              </button>
              <button onClick={() => setShowCategoryModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showGoalModal && (
        <Modal onClose={() => setShowGoalModal(false)} title="Nova Meta">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                className="input w-full"
                placeholder="Ex: Fundo de emergência"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor Alvo *</label>
                <input
                  type="number"
                  step="0.01"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor Atual</label>
                <input
                  type="number"
                  step="0.01"
                  value={goalForm.currentAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prazo</label>
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                className="input w-full"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAddGoal} className="btn btn-primary flex-1">
                Criar
              </button>
              <button onClick={() => setShowGoalModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAccountModal && (
        <Modal onClose={() => setShowAccountModal(false)} title="Nova Conta">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input
                type="text"
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                className="input w-full"
                placeholder="Ex: Conta Corrente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <select
                value={accountForm.type}
                onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as FinancialAccount['type'] })}
                className="input w-full"
              >
                <option value="checking">Conta Corrente</option>
                <option value="savings">Poupança</option>
                <option value="investment">Investimento</option>
                <option value="cash">Dinheiro</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Saldo Inicial *</label>
                <input
                  type="number"
                  step="0.01"
                  value={accountForm.balance}
                  onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banco</label>
                <input
                  type="text"
                  value={accountForm.bank}
                  onChange={(e) => setAccountForm({ ...accountForm, bank: e.target.value })}
                  className="input w-full"
                  placeholder="Ex: Nubank"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button onClick={handleAddAccount} className="btn btn-primary flex-1">
                Criar
              </button>
              <button onClick={() => setShowAccountModal(false)} className="btn btn-ghost flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FinancialDashboard;
