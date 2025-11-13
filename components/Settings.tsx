import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';

const initialUsers: User[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=EC4899&color=fff' },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno@example.com', role: UserRole.Gerente, avatarUrl: 'https://ui-avatars.com/api/?name=Bruno+Costa&background=3B82F6&color=fff' },
  { id: 'u3', name: 'Admin', email: 'admin@autoagende.com', role: UserRole.Administrador, avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=14B8A6&color=fff' },
];

const SettingsCard: React.FC<{title: string; icon?: React.ReactNode; children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="flex items-center text-xl font-bold text-gray-800 border-b pb-4 mb-4">
            {icon && <span className="mr-3 text-primary">{icon}</span>}
            {title}
        </h3>
        {children}
    </div>
);

const ChatSandbox: React.FC = () => {
    const [messages, setMessages] = useState<{sender: 'user'|'bot', text: string}[]>([
        { sender: 'bot', text: 'Olá! Como posso te ajudar a agendar seu horário hoje?' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { sender: 'user' as 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        // Mock bot response
        setTimeout(() => {
            setMessages([...newMessages, { sender: 'bot' as 'bot', text: 'Entendido. Verificando horários disponíveis para você...' }]);
        }, 1000);
    };

    return (
        <div className="border rounded-lg flex flex-col h-96">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-base-200/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">{ICONS.robot}</div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t bg-white flex">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua mensagem..." 
                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                <button onClick={handleSend} className="ml-2 p-3 bg-primary text-white rounded-lg hover:bg-primary-focus">
                    {ICONS.send}
                </button>
            </div>
        </div>
    )
}

const Settings: React.FC = () => {
    const [users, setUsers] = useState(initialUsers);
    const [aiModel, setAiModel] = useState('gemini-2.5-pro');
    const [systemPrompt, setSystemPrompt] = useState("Você é um assistente de agendamento para a plataforma AutoAgende. Pergunte ao usuário qual serviço deseja, preferências de profissional, data e horário. Verifique disponibilidade, confirme dados do cliente e finalize o agendamento. Seja cordial e objetivo.");
    const [whatsappStatus, setWhatsappStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    };

    const handleWhatsappConnect = () => {
        setIsWhatsappModalOpen(false);
        setWhatsappStatus('connected');
    };

    const handleWhatsappDisconnect = () => {
        setWhatsappStatus('disconnected');
    };


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">IA & Configurações</h2>

            <SettingsCard title="Integração com WhatsApp" icon={ICONS.whatsapp}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${whatsappStatus === 'connected' ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                            <p className="font-semibold text-gray-700">Status: <span className={whatsappStatus === 'connected' ? 'text-success' : 'text-error'}>{whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}</span></p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Conecte seu número para permitir que a IA agende horários automaticamente.</p>
                    </div>
                    {whatsappStatus === 'disconnected' ? (
                        <button onClick={() => setIsWhatsappModalOpen(true)} className="mt-4 sm:mt-0 bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-focus transition-colors">
                            Conectar WhatsApp
                        </button>
                    ) : (
                         <button onClick={handleWhatsappDisconnect} className="mt-4 sm:mt-0 bg-error text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-colors">
                            Desconectar
                        </button>
                    )}
                </div>
            </SettingsCard>

             <SettingsCard title="Configuração do Chatbot de IA" icon={ICONS.robot}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Modelo de IA</label>
                            <select value={aiModel} onChange={e => setAiModel(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                                <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700">Prompt do Sistema</label>
                             <textarea 
                                id="system-prompt" 
                                rows={8}
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            ></textarea>
                            <p className="mt-1 text-xs text-gray-500">Este é o prompt principal que define o comportamento do seu assistente de IA.</p>
                        </div>
                         <div className="flex justify-end pt-2">
                            <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-focus transition-colors">
                                Salvar Configurações de IA
                            </button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teste do Chatbot (Sandbox)</label>
                        <ChatSandbox />
                     </div>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Permissões de Usuário" icon={ICONS.users}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        >
                                            {Object.values(UserRole).filter(r => r !== 'Cliente').map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SettingsCard>

            <Modal isOpen={isWhatsappModalOpen} onClose={() => setIsWhatsappModalOpen(false)} title="Conectar ao WhatsApp">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Escaneie o QR Code com o seu celular para conectar sua conta do WhatsApp.</p>
                    <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AutoAgendeIntegrationLink" 
                        alt="QR Code para conectar WhatsApp"
                        className="mx-auto border-4 border-gray-200 rounded-lg"
                    />
                    <div className="text-left mt-6 space-y-2 text-sm text-gray-500">
                        <p>1. Abra o WhatsApp no seu celular.</p>
                        <p>2. Toque em <strong>Menu</strong> (&#8942;) ou <strong>Configurações</strong> e selecione <strong>Aparelhos conectados</strong>.</p>
                        <p>3. Toque em <strong>Conectar um aparelho</strong>.</p>
                        <p>4. Aponte seu celular para esta tela para capturar o código.</p>
                    </div>
                     <div className="mt-6">
                        <button onClick={handleWhatsappConnect} className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-primary-focus transition-colors w-full sm:w-auto">
                            Já escaneei, conectar!
                        </button>
                     </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;