import React, { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import Modal from './Modal';
import { Appointment, AppointmentStatus } from '../types';
import { ICONS } from '../constants';
import { useAppointments, mockServices, mockAttendants } from '../contexts/AppointmentsContext';

const initialAppointments: Appointment[] = [
  { id: 'A1', clientName: 'Carlos Pereira', clientPhone: '(11) 98765-4321', service: mockServices[0], startTime: new Date(new Date().setHours(10, 0, 0, 0)), endTime: new Date(new Date().setHours(10, 45, 0, 0)), status: AppointmentStatus.Pendente, attendant: mockAttendants[0], source: 'admin' },
  { id: 'A2', clientName: 'Fernanda Lima', clientPhone: '(21) 91234-5678', service: mockServices[1], startTime: new Date(new Date().setHours(11, 0, 0, 0)), endTime: new Date(new Date().setHours(12, 0, 0, 0)), status: AppointmentStatus.EmAndamento, attendant: mockAttendants[1], source: 'whatsapp' },
  { id: 'A3', clientName: 'Ricardo Alves', clientPhone: '(31) 99999-8888', service: mockServices[2], startTime: new Date(new Date().setHours(9, 0, 0, 0)), endTime: new Date(new Date().setHours(10, 30, 0, 0)), status: AppointmentStatus.Concluido, attendant: mockAttendants[0], source: 'admin' },
  { id: 'A4', clientName: 'Juliana Souza', clientPhone: '(41) 98888-7777', service: mockServices[0], startTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0)), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 45, 0, 0)), status: AppointmentStatus.Pendente, attendant: mockAttendants[1], source: 'whatsapp' },
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
                                    <p>{app.clientName.split(' ')[0]}</p>
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

// ... (AppointmentForm remains the same)
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