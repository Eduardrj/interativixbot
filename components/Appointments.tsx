import React, { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import Modal from './Modal';
import { Appointment, AppointmentStatus, Service, User, UserRole } from '../types';
import { ICONS } from '../constants';
import { useAppointments } from '../contexts/AppointmentsContext';

const mockServices: Service[] = [
  { id: '1', name: 'Corte de Cabelo', duration: 45, price: 50.0 },
  { id: '2', name: 'Manicure', duration: 60, price: 40.0 },
  { id: '3', name: 'Limpeza de Pele', duration: 90, price: 120.0 },
];

const mockAttendants: User[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=8B5CF6&color=fff' },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Bruno+Costa&background=3B82F6&color=fff' },
];

const CalendarView: React.FC<{appointments: Appointment[]}> = ({appointments}) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const weekDates = Array.from({length: 7}, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i);
        return date;
    });

    return (
        <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-md">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-bold text-gray-600 text-xs sm:text-base">
                {days.map((day, i) => <div key={day} className={`${weekDates[i].toDateString() === today.toDateString() ? 'text-primary' : ''}`}>{day} <span className="block sm:inline text-sm font-normal">{weekDates[i].getDate()}</span></div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2 h-[60vh] overflow-y-auto">
                {weekDates.map(date => (
                    <div key={date.toISOString()} className={`border-t-2 p-1 sm:p-2 ${date.toDateString() === today.toDateString() ? 'border-primary' : 'border-gray-200'}`}>
                        {appointments
                            .filter(app => app.startTime.toDateString() === date.toDateString())
                            .sort((a,b) => a.startTime.getTime() - b.startTime.getTime())
                            .map(app => (
                                <div key={app.id} className="text-xs bg-primary-light text-primary p-1 sm:p-2 rounded-lg mb-2">
                                    <p className="font-bold hidden sm:block">{app.service.name}</p>
                                    <p>{app.clientName.split(' ')}</p>
                                    <p>{app.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            ))
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}

const Appointments: React.FC = () => {
  const { appointments, updateAppointmentStatus, addAppointment } = useAppointments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Agendamentos</h2>
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-1 bg-slate-200 rounded-lg">
                <button onClick={() => setViewMode('kanban')} className={`px-2 py-1 sm:px-3 text-sm font-semibold rounded-md ${viewMode === 'kanban' ? 'bg-white shadow' : 'text-gray-600'}`}>Kanban</button>
                <button onClick={() => setViewMode('calendar')} className={`px-2 py-1 sm:px-3 text-sm font-semibold rounded-md ${viewMode === 'calendar' ? 'bg-white shadow' : 'text-gray-600'}`}>Calendário</button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-primary text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors"
            >
              {ICONS.plus}
              <span className="ml-2 hidden sm:inline">Novo Agendamento</span>
            </button>
        </div>
      </div>
      
      {viewMode === 'kanban' ? (
        <KanbanBoard appointments={appointments} onStatusChange={updateAppointmentStatus} />
      ) : (
        <CalendarView appointments={appointments} />
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
        <AppointmentForm onSave={(newAppointmentData) => {
            const service = mockServices.find(s => s.id === newAppointmentData.service.id);
            if(!service) return;

            const endTime = new Date(newAppointmentData.startTime.getTime() + service.duration * 60000);
            
            addAppointment({
                ...newAppointmentData,
                endTime,
                source: 'admin'
            });
            setIsModalOpen(false);
        }} services={mockServices} attendants={mockAttendants}/>
      </Modal>
    </div>
  );
};

const AppointmentForm: React.FC<{onSave: (data: any) => void, services: Service[], attendants: User[]}> = ({ onSave, services, attendants }) => {
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [attendantId, setAttendantId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const startTime = new Date(`${date}T${time}`);
        const service = services.find(s => s.id === serviceId);
        const attendant = attendants.find(a => a.id === attendantId);
        if(clientName && clientPhone && service && attendant && date && time) {
            onSave({
                clientName,
                clientPhone,
                service,
                startTime,
                status: AppointmentStatus.Pendente,
                attendant,
            });
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Telefone do Cliente</label>
                <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Serviço</label>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
                    <option value="">Selecione um serviço</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Atendente</label>
                <select value={attendantId} onChange={(e) => setAttendantId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
                    <option value="">Selecione um atendente</option>
                    {attendants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hora</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                    Salvar Agendamento
                </button>
            </div>
        </form>
    );
};

export default Appointments;