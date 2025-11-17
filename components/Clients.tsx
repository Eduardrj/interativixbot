import React, { useState } from 'react';
import { Client } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';
import { useClients } from '../contexts/ClientsContext';

const Clients: React.FC = () => {
    const { clients, addClient, deleteClient, loading } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Clientes</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                    {ICONS.plus}
                    <span className="ml-2">Adicionar Cliente</span>
                </button>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Carregando clientes...</div>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Nenhum cliente cadastrado. Adicione um novo cliente para começar.</div>
                    </div>
                ) : (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button className="text-primary hover:text-primary-hover">Ver Histórico</button>
                                        <button onClick={() => deleteClient(client.id)} className="text-danger hover:text-red-700">Deletar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Cliente">
                <ClientForm onSave={(clientData) => {
                    addClient(clientData);
                    setIsModalOpen(false);
                }} />
            </Modal>
        </div>
    );
};

interface ClientFormProps {
    onSave: (client: Omit<Client, 'id'>) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [consentLgpd, setConsentLgpd] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                name,
                phone,
                email,
                consentLgpd,
            });
            setName('');
            setPhone('');
            setEmail('');
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={consentLgpd}
                    onChange={(e) => setConsentLgpd(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                    Consentimento LGPD
                </label>
            </div>
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover disabled:bg-primary/50 transition-colors"
                >
                    {loading ? 'Salvando...' : 'Salvar Cliente'}
                </button>
            </div>
        </form>
    );
};

export default Clients;