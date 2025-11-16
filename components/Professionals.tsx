import React, { useState } from 'react';
import Modal from './Modal';
import { Professional, UserRole } from '../types';
import { ICONS } from '../constants';

const mockProfessionals: Professional[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=8B5CF6&color=fff&size=256', specialties: ['Corte', 'Coloração'] },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Bruno+Costa&background=3B82F6&color=fff&size=256', specialties: ['Manicure', 'Pedicure'] },
  { id: 'u4', name: 'Carla Dias', email: 'carla@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Carla+Dias&background=F59E0B&color=fff&size=256', specialties: ['Estética Facial', 'Maquiagem'] },
  { id: 'u5', name: 'Daniel Alves', email: 'daniel@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Daniel+Alves&background=64748B&color=fff&size=256', specialties: ['Massagem', 'Terapias Corporais'] },
];

const ProfessionalCard: React.FC<{professional: Professional}> = ({professional}) => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden text-center transition hover:shadow-lg hover:-translate-y-1">
        <img src={professional.avatarUrl} alt={professional.name} className="w-full h-48 object-cover" />
        <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800">{professional.name}</h3>
            <p className="text-sm text-gray-500">{professional.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
                {professional.specialties.map(spec => (
                    <span key={spec} className="px-2 py-1 bg-primary-light text-primary text-xs font-semibold rounded-full">{spec}</span>
                ))}
            </div>
        </div>
        <div className="p-4 border-t">
            <button className="text-sm text-primary hover:text-primary-hover font-semibold">Ver Agenda</button>
        </div>
    </div>
);


const Professionals: React.FC = () => {
    const [professionals, setProfessionals] = useState(mockProfessionals);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Profissionais</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                    {ICONS.plus}
                    <span className="ml-2">Adicionar Profissional</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {professionals.map(prof => (
                    <ProfessionalCard key={prof.id} professional={prof} />
                ))}
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Profissional">
                <p>Formulário para adicionar profissional.</p>
            </Modal>
        </div>
    );
};

export default Professionals;