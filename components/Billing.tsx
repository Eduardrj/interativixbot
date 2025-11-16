import React, { useState } from 'react';
import { Plan } from '../types';
import { ICONS } from '../constants';

const mockPlans: Plan[] = [
    { 
        id: 'p1', 
        name: 'Grátis', 
        price: 'R$ 0', 
        frequency: '/mês', 
        description: 'Para quem está começando a organizar a agenda.',
        features: [
            '1 Profissional',
            'Até 50 agendamentos/mês',
            'Gestão de Clientes',
            'Agenda Online Simples',
            'Suporte via Comunidade'
        ], 
        isPopular: false 
    },
    { 
        id: 'p2', 
        name: 'Essencial', 
        price: 'R$ 49', 
        frequency: '/mês', 
        description: 'Automatize tarefas e ganhe tempo no dia a dia.',
        features: [
            'Tudo do plano Grátis, e mais:',
            'Até 2 Profissionais',
            'Até 200 agendamentos/mês',
            'Lembretes via WhatsApp (200/mês)',
            'Chatbot IA Básico (100 conversas/mês)',
            'Relatórios Essenciais'
        ], 
        isPopular: false 
    },
    { 
        id: 'p3', 
        name: 'Pro', 
        price: 'R$ 99', 
        frequency: '/mês', 
        description: 'A solução completa para negócios em crescimento.',
        features: [
            'Tudo do plano Essencial, e mais:',
            'Até 5 Profissionais',
            'Agendamentos Ilimitados',
            'Lembretes via WhatsApp (1000/mês)',
            'Chatbot IA Avançado (500 conversas/mês)',
            'Relatórios Completos',
            'Gestão de Permissões',
            'Suporte Prioritário (Chat)',
        ], 
        isPopular: true 
    },
    { 
        id: 'p4', 
        name: 'Empresa', 
        price: 'R$ 199', 
        frequency: '/mês',
        description: 'Para equipes maiores com alto volume de atendimentos.',
        features: [
            'Tudo do plano Pro, e mais:',
            'Até 15 Profissionais',
            'Lembretes e Chatbot IA Ilimitados',
            'Integrações via API',
            'Gerente de Conta Dedicado',
        ], 
        isPopular: false 
    },
];

const PlanCard: React.FC<{plan: Plan}> = ({plan}) => (
    <div className={`border rounded-2xl p-6 flex flex-col ${plan.isPopular ? 'border-primary shadow-2xl' : 'border-gray-300'}`}>
        {plan.isPopular && <span className="bg-violet text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">MAIS POPULAR</span>}
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
        <p className="mt-4 text-4xl font-bold">{plan.price}<span className="text-lg font-medium text-gray-500">{plan.frequency}</span></p>
        <ul className="mt-6 space-y-3 text-gray-600 flex-1">
            {plan.features.map(feature => (
                <li key={feature} className="flex items-start">
                    <span className="text-primary mr-2 mt-1 flex-shrink-0">{ICONS.check}</span>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button className={`mt-8 w-full py-3 rounded-lg font-bold text-lg ${plan.isPopular ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-slate-200 text-primary hover:bg-slate-300'}`}>
            Selecionar Plano
        </button>
    </div>
)

const Billing: React.FC = () => {
  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Planos & Cobrança</h2>
            <p className="text-gray-500 mt-1">Escolha o plano que melhor se adapta às necessidades do seu negócio.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {mockPlans.map(plan => <PlanCard key={plan.id} plan={plan}/>)}
            </div>
           
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                 <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Cupons de Desconto</h3>
                 <p className="text-sm text-gray-500">Crie e gerencie cupons para suas campanhas de marketing.</p>
                 <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500">Nenhum cupom criado ainda.</p>
                 </div>
                 <button className="w-full flex items-center justify-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                    {ICONS.plus}
                    <span className="ml-2">Criar Novo Cupom</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default Billing;