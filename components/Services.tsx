import React, { useState } from 'react';
import Modal from './Modal';
import { Service } from '../types';
import { ICONS } from '../constants';

const mockServices: Service[] = [
  { id: '1', name: 'Corte de Cabelo', duration: 45, price: 50.0 },
  { id: '2', name: 'Manicure', duration: 60, price: 40.0 },
  { id: '3', name: 'Limpeza de Pele', duration: 90, price: 120.0 },
  { id: '4', name: 'Massagem Relaxante', duration: 60, price: 150.0 },
];

const ServiceForm: React.FC<{onSave: (service: Omit<Service, 'id'>) => void, service?: Service | null}> = ({ onSave, service }) => {
    const [name, setName] = useState(service?.name || '');
    const [duration, setDuration] = useState(service?.duration || 0);
    const [price, setPrice] = useState(service?.price || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name && duration > 0 && price >= 0) {
            onSave({ name, duration, price });
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nome do Serviço" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <input type="number" placeholder="Duração (minutos)" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <input type="number" placeholder="Preço (R$)" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                    Salvar Serviço
                </button>
            </div>
        </form>
    )
}

const Services: React.FC = () => {
    const [services, setServices] = useState(mockServices);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleSaveService = (serviceData: Omit<Service, 'id'>) => {
        const newService: Service = {
            id: `S${services.length + 1}`,
            ...serviceData,
        };
        setServices(prev => [...prev, newService]);
        setIsModalOpen(false);
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
                                    <a href="#" className="text-primary hover:text-primary-hover">Editar</a>
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