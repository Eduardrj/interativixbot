import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ICONS } from '../constants';

const productivityData = [
  { name: 'Ana Silva', Atendimentos: 65 },
  { name: 'Bruno Costa', Atendimentos: 58 },
  { name: 'Carla Dias', Atendimentos: 72 },
  { name: 'Daniel Alves', Atendimentos: 45 },
];

const Reports: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Relatórios</h2>

            <div className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-700">Filtros:</h3>
                <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Período:</label>
                    <input type="date" className="p-2 border-gray-300 rounded-md shadow-sm" />
                    <span className="mx-2">até</span>
                    <input type="date" className="p-2 border-gray-300 rounded-md shadow-sm" />
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-700 mr-2">Profissional:</label>
                    <select className="p-2 border-gray-300 rounded-md shadow-sm">
                        <option>Todos</option>
                        <option>Ana Silva</option>
                        <option>Bruno Costa</option>
                    </select>
                </div>
                <button className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-focus">
                    Aplicar Filtros
                </button>
                 <button className="flex items-center bg-base-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-base-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    <span className="ml-2">Exportar (CSV)</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-700 mb-4">Produtividade por Profissional</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productivityData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip wrapperClassName="rounded-md border bg-white shadow-sm" />
                            <Legend />
                            <Bar dataKey="Atendimentos" fill="#0D9488" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-700 mb-4">Taxa de Conversão (WhatsApp vs. Admin)</h3>
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <p>Gráfico de Pizza/Donut aqui...</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Reports;