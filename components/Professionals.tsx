import React, { useState } from 'react';
import Modal from './Modal';
import { Professional, UserRole } from '../types';
import { ICONS } from '../constants';
import { useProfessionals } from '../contexts/ProfessionalsContext';

const ProfessionalCard: React.FC<{professional: Professional, onDelete: (id: string) => void}> = ({professional, onDelete}) => (
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
        <div className="p-4 border-t flex gap-2 justify-center">
            <button className="text-sm text-primary hover:text-primary-hover font-semibold">Ver Agenda</button>
            <button onClick={() => onDelete(professional.id)} className="text-sm text-red-600 hover:text-red-800 font-semibold">Deletar</button>
        </div>
    </div>
);

const ProfessionalForm: React.FC<{onSave: (professional: Omit<Professional, 'id' | 'avatarUrl'>) => void}> = ({ onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if(name && email && specialties) {
                const specialtiesArray = specialties.split(',').map(s => s.trim());
                await onSave({ 
                    name, 
                    email, 
                    role: UserRole.Atendente,
                    specialties: specialtiesArray 
                });
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <input type="text" placeholder="Especialidades (separadas por vírgula)" value={specialties} onChange={e => setSpecialties(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover disabled:bg-primary/50 transition-colors">
                    {loading ? 'Salvando...' : 'Salvar Profissional'}
                </button>
            </div>
        </form>
    );
};


const Professionals: React.FC = () => {
    const { professionals, addProfessional, deleteProfessional, loading } = useProfessionals();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveProfessional = async (professionalData: Omit<Professional, 'id' | 'avatarUrl'>) => {
        try {
            await addProfessional(professionalData);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erro ao salvar profissional:', error);
        }
    };

    const handleDeleteProfessional = async (id: string) => {
        if (window.confirm('Tem certeza que deseja deletar este profissional?')) {
            try {
                await deleteProfessional(id);
            } catch (error) {
                console.error('Erro ao deletar profissional:', error);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-8">Carregando profissionais...</div>;
    }

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
                    <ProfessionalCard key={prof.id} professional={prof} onDelete={handleDeleteProfessional} />
                ))}
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Profissional">
                <ProfessionalForm onSave={handleSaveProfessional} />
            </Modal>
        </div>
    );
};

export default Professionals;