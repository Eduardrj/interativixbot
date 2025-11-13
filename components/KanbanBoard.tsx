import React, { useState } from 'react';
import AppointmentCard from './AppointmentCard';
import { Appointment, AppointmentStatus } from '../types';

interface KanbanBoardProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: string, newStatus: AppointmentStatus) => void;
}

const KanbanColumn: React.FC<{ title: string; appointments: Appointment[]; status: AppointmentStatus; onStatusChange: (appointmentId: string, newStatus: AppointmentStatus) => void; className: string }> = ({ title, appointments, status, onStatusChange, className }) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        const appointmentId = e.dataTransfer.getData('appointmentId');
        if (appointmentId) {
            onStatusChange(appointmentId, status);
        }
    };

    return (
        <div 
            className={`flex-1 flex flex-col bg-base-200 rounded-xl p-4 min-w-[300px] transition-colors ${isOver ? 'bg-base-300' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex items-center mb-4">
                <div className={`w-3 h-3 rounded-full mr-2 ${className}`}></div>
                <h3 className="font-bold text-lg text-gray-700">{title}</h3>
                <span className="ml-2 bg-base-300 text-gray-500 text-sm font-semibold px-2 py-1 rounded-full">{appointments.length}</span>
            </div>
            <div className="space-y-4 h-full overflow-y-auto pt-2 -mx-2 px-2">
                {appointments.length > 0 ? (
                    appointments.map(app => (
                        <AppointmentCard key={app.id} appointment={app} onStatusChange={onStatusChange} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400 border-2 border-dashed rounded-lg p-4">
                        <p>Arraste um card aqui</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ appointments, onStatusChange }) => {
  const pending = appointments.filter(app => app.status === AppointmentStatus.Pendente);
  const inProgress = appointments.filter(app => app.status === AppointmentStatus.EmAndamento);
  const completed = appointments.filter(app => app.status === AppointmentStatus.Concluido);
  const cancelled = appointments.filter(app => app.status === AppointmentStatus.Cancelado);
  const custom = appointments.filter(app => app.status === AppointmentStatus.Personalizado);

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      <KanbanColumn 
        title="Pendente" 
        appointments={pending} 
        status={AppointmentStatus.Pendente}
        onStatusChange={onStatusChange}
        className="bg-warning"
      />
      <KanbanColumn 
        title="Em Andamento" 
        appointments={inProgress} 
        status={AppointmentStatus.EmAndamento}
        onStatusChange={onStatusChange}
        className="bg-info"
      />
      <KanbanColumn 
        title="Concluído" 
        appointments={completed} 
        status={AppointmentStatus.Concluido}
        onStatusChange={onStatusChange}
        className="bg-success"
      />
      <KanbanColumn 
        title="Cancelado" 
        appointments={cancelled} 
        status={AppointmentStatus.Cancelado}
        onStatusChange={onStatusChange}
        className="bg-error"
      />
      <KanbanColumn 
        title="Personalizado" 
        appointments={custom} 
        status={AppointmentStatus.Personalizado}
        onStatusChange={onStatusChange}
        className="bg-secondary"
      />
    </div>
  );
};

export default KanbanBoard;