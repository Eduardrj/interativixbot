import React, { useState } from 'react';
import { Client } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';

const mockClients: Client[] = [
  { id: 'C1', name: 'Carlos Pereira', phone: '(11) 98765-4321', email: 'carlos.p@email.com', lastAppointment: new Date(), consentLgpd: true },
  { id: 'C2', name: 'Fernanda Lima', phone: '(21) 91234-5678', email: 'fernanda.l@email.com', lastAppointment: new Date(), consentLgpd: true },
  { id: 'C3', name: 'Ricardo Alves', phone: '(31) 99999-8888', email: 'ricardo.a@email.com', lastAppointment: new Date(), consentLgpd: false },
  { id: 'C4', name: 'Juliana Souza', phone: '(41) 98888-7777', email: 'juliana.s@email.com', lastAppointment: new Date(new Date().setDate(new Date().getDate() - 10)), consentLgpd: true },
];

const Clients: React.FC = () => {
    const [clients, setClients] = useState(mockClients);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Clientes</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-focus transition-colors">
                    {ICONS.plus}
                    <span className="ml-2">Adicionar Cliente</span>
                </button>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Agendamento</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map(client => (
                            <tr key={client.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{client.phone}</div>
                                    <div className="text-xs">{client.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastAppointment?.toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <a href="#" className="text-primary hover:text-primary-focus">Ver Histórico</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Cliente">
                <p>Formulário para adicionar cliente.</p>
            </Modal>
        </div>
    );
};

export default Clients;