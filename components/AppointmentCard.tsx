import React from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { ICONS } from '../constants';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (appointmentId: string, newStatus: AppointmentStatus) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onStatusChange }) => {
  const { id, clientName, service, startTime, attendant, status } = appointment;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(id, e.target.value as AppointmentStatus);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('appointmentId', id);
    e.currentTarget.style.opacity = '0.5';
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  }

  const statusClasses = {
      [AppointmentStatus.Pendente]: "bg-amber-100 text-amber-800 border-l-4 border-amber-500",
      [AppointmentStatus.EmAndamento]: "bg-blue-100 text-blue-800 border-l-4 border-blue-500",
      [AppointmentStatus.Concluido]: "bg-green-100 text-green-800 border-l-4 border-green-500",
      [AppointmentStatus.Cancelado]: "bg-red-100 text-red-800 border-l-4 border-red-500",
      [AppointmentStatus.Personalizado]: "bg-slate-100 text-slate-800 border-l-4 border-slate-500",
  }

  return (
    <div 
      className={`bg-white rounded-lg p-4 shadow-sm transition hover:shadow-md cursor-grab active:cursor-grabbing ${statusClasses[status]}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-800">{clientName}</h4>
          <p className="text-sm text-gray-600">{service.name}</p>
        </div>
        <img src={attendant.avatarUrl} alt={attendant.name} className="w-10 h-10 rounded-full" />
      </div>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <span className="w-5 h-5 mr-2">{ICONS.clock}</span>
        <span>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="mt-4">
         <select
            value={status}
            onChange={handleStatusChange}
            className="w-full text-sm p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            {Object.values(AppointmentStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default AppointmentCard;