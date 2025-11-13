
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ICONS } from '../constants';
import { AppointmentStatus } from '../types';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change: string; changeType: 'increase' | 'decrease' }> = ({ title, value, icon, change, changeType }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between transition hover:shadow-lg">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <div className={`mt-2 text-sm flex items-center ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
        {changeType === 'increase' ? 
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg> :
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
        }
        <span>{change} vs. mês passado</span>
      </div>
    </div>
    <div className="bg-primary/10 text-primary rounded-full p-4">
      {icon}
    </div>
  </div>
);

const appointmentsData = [
  { name: 'Seg', Agendamentos: 30 },
  { name: 'Ter', Agendamentos: 45 },
  { name: 'Qua', Agendamentos: 60 },
  { name: 'Qui', Agendamentos: 50 },
  { name: 'Sex', Agendamentos: 70 },
  { name: 'Sáb', Agendamentos: 85 },
  { name: 'Dom', Agendamentos: 20 },
];

const revenueData = [
    {name: 'Jan', Receita: 4000},
    {name: 'Fev', Receita: 3000},
    {name: 'Mar', Receita: 5000},
    {name: 'Abr', Receita: 4500},
    {name: 'Mai', Receita: 6000},
    {name: 'Jun', Receita: 5500},
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Atendimentos" value="1,280" icon={ICONS.calendar} change="+12.5%" changeType="increase" />
        <StatCard title="Atendimentos Concluídos" value="1,150" icon={ICONS.check} change="+15.2%" changeType="increase" />
        <StatCard title="Atendimentos Pendentes" value="105" icon={ICONS.loader} change="-3.1%" changeType="decrease" />
        <StatCard title="Novos Clientes" value="45" icon={ICONS.users} change="+20.0%" changeType="increase" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-semibold text-lg text-gray-700 mb-4">Agendamentos da Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip wrapperClassName="rounded-md border bg-white shadow-sm" />
                    <Legend />
                    <Bar dataKey="Agendamentos" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-semibold text-lg text-gray-700 mb-4">Receita Mensal (R$)</h3>
            <ResponsiveContainer width="100%" height={300}>
                 <LineChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Receita" stroke="#EC4899" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
