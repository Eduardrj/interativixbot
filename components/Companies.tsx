import React, { useState } from 'react';
import { useCompanies, Company } from '../contexts/CompaniesContext';
import Modal from './Modal';

const ICONS = {
  building: '🏢',
  edit: '✏️',
  trash: '🗑️',
  plus: '➕',
  save: '💾',
  close: '✖️',
};

const INDUSTRIES = [
  'Beleza e Estética',
  'Saúde e Bem-estar',
  'Barbearia',
  'Salão de Beleza',
  'Clínica Médica',
  'Clínica Odontológica',
  'Fisioterapia',
  'Psicologia',
  'Advocacia',
  'Consultoria',
  'Outro'
];

const PLANS = [
  { value: 'free', label: 'Gratuito', color: 'bg-gray-100 text-gray-800' },
  { value: 'basic', label: 'Básico', color: 'bg-blue-100 text-blue-800' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-100 text-purple-800' },
  { value: 'enterprise', label: 'Enterprise', color: 'bg-yellow-100 text-yellow-800' },
];

interface CompanyFormData {
  name: string;
  legal_name: string;
  document: string;
  industry: string;
  phone: string;
  email: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
}

const Companies: React.FC = () => {
  const { companies, currentCompany, loading, addCompany, updateCompany, deleteCompany, selectCompany } = useCompanies();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    legal_name: '',
    document: '',
    industry: '',
    phone: '',
    email: '',
    plan: 'free',
  });

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        legal_name: company.legal_name || '',
        document: company.document || '',
        industry: company.industry || '',
        phone: company.phone || '',
        email: company.email || '',
        plan: company.plan,
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        legal_name: '',
        document: '',
        industry: '',
        phone: '',
        email: '',
        plan: 'free',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const companyData: any = {
        ...formData,
        settings: {
          business_hours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '09:00', close: '13:00' },
            sunday: { open: null, close: null },
          },
          notifications: {
            email: true,
            sms: true,
            whatsapp: true,
          },
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
          currency: 'BRL',
        },
        active: true,
      };

      if (editingCompany) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await addCompany(companyData);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Erro ao salvar empresa. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await deleteCompany(id);
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert('Erro ao deletar empresa. Tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando empresas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            {ICONS.building} Empresas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas empresas e selecione a empresa ativa
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-md flex items-center gap-2"
        >
          {ICONS.plus} Nova Empresa
        </button>
      </div>

      {currentCompany && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-blue-700 font-semibold">
            Empresa Ativa: {currentCompany.name}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
              currentCompany?.id === company.id
                ? 'border-primary shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {company.name}
                </h3>
                {company.legal_name && (
                  <p className="text-sm text-gray-600 mb-2">{company.legal_name}</p>
                )}
                {company.industry && (
                  <p className="text-sm text-gray-500 mb-2">{company.industry}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                PLANS.find(p => p.value === company.plan)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {PLANS.find(p => p.value === company.plan)?.label || 'Gratuito'}
              </span>
            </div>

            {company.document && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>CNPJ/CPF:</strong> {company.document}
              </p>
            )}

            {company.phone && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Telefone:</strong> {company.phone}
              </p>
            )}

            {company.email && (
              <p className="text-sm text-gray-600 mb-4">
                <strong>Email:</strong> {company.email}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              {currentCompany?.id !== company.id && (
                <button
                  onClick={() => selectCompany(company.id)}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                >
                  Selecionar
                </button>
              )}
              {currentCompany?.id === company.id && (
                <div className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold text-center">
                  Ativa
                </div>
              )}
              <button
                onClick={() => handleOpenModal(company)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                title="Editar"
              >
                {ICONS.edit}
              </button>
              {companies.length > 1 && (
                <button
                  onClick={() => handleDelete(company.id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  title="Excluir"
                >
                  {ICONS.trash}
                </button>
              )}
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Nenhuma empresa cadastrada ainda
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors"
            >
              {ICONS.plus} Cadastrar Primeira Empresa
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Salão Beleza Pura"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social
            </label>
            <input
              type="text"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nome jurídico da empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ/CPF
            </label>
            <input
              type="text"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ramo de Atividade *
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Selecione...</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="contato@empresa.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plano
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {PLANS.map((plan) => (
                <option key={plan.value} value={plan.value}>
                  {plan.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              {ICONS.close} Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
            >
              {ICONS.save} {editingCompany ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Companies;
