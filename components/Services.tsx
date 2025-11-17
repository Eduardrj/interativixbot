import React, { useState } from 'react';
import Modal from './Modal';
import { Service } from '../types';
import { ICONS } from '../constants';
import { useServices } from '../contexts/ServicesContext';

const ServiceForm: React.FC<{onSave: (service: Omit<Service, 'id'>) => void, service?: Service | null}> = ({ onSave, service }) => {
    const [name, setName] = useState(service?.name || '');
    const [duration, setDuration] = useState(service?.duration || 0);
    const [price, setPrice] = useState(service?.price || 0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if(name && duration > 0 && price >= 0) {
                await onSave({ name, duration, price });
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nome do Serviço" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <input type="number" placeholder="Duração (minutos)" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <input type="number" placeholder="Preço (R$)" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover disabled:bg-primary/50 transition-colors">
                    {loading ? 'Salvando...' : 'Salvar Serviço'}
                </button>
            </div>
        </form>
    );
}

const Services: React.FC = () => {
    const { services, addService, deleteService, loading } = useServices();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveService = async (serviceData: Omit<Service, 'id'>) => {
        try {
            await addService(serviceData);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
        }
    };

    const handleDeleteService = async (id: string) => {
        if (window.confirm('Tem certeza que deseja deletar este serviço?')) {
            try {
                await deleteService(id);
            } catch (error) {
                console.error('Erro ao deletar serviço:', error);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-8">Carregando serviços...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Serviços</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                    {ICONS.plus}
                    <span className="ml-2">Adicionar Serviço</span>
                </button>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-md overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.map(service => (
                            <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.duration} min</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {service.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleDeleteService(service.id)} className="text-red-600 hover:text-red-800 font-medium">Deletar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Serviço">
                <ServiceForm onSave={handleSaveService} />
            </Modal>
        </div>
    );
};

export default Services;