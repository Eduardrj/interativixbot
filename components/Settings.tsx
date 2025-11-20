import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole, AppointmentStatus } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { GoogleGenAI } from "@google/genai";
import { useAppointments, mockServices, mockAttendants } from '../contexts/AppointmentsContext';

const initialUsers: User[] = [
  { id: 'u1', name: 'Ana Silva', email: 'ana@example.com', role: UserRole.Atendente, avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Silva&background=8B5CF6&color=fff' },
  { id: 'u2', name: 'Bruno Costa', email: 'bruno@example.com', role: UserRole.Gerente, avatarUrl: 'https://ui-avatars.com/api/?name=Bruno+Costa&background=3B82F6&color=fff' },
  { id: 'u3', name: 'Admin', email: 'admin@interativix.com', role: UserRole.Administrador, avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=F97316&color=fff' },
];


const SettingsCard: React.FC<{title: string; icon?: React.ReactNode; children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="flex items-center text-xl font-bold text-gray-800 border-b pb-4 mb-4">
            {icon && <span className="mr-3 text-primary">{icon}</span>}
                        </div>
                         <button 
                            onClick={handleSaveAISettings}
                            disabled={saveStatus === 'saving'}
                            className={`w-full font-bold py-2 px-4 rounded-lg shadow-md transition-colors ${
                                saveStatus === 'saved' 
                                    ? 'bg-success text-white' 
                                    : 'bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50'
                            }`}
                        >
                            {saveStatus === 'saving' && 'Salvando...'}
                            {saveStatus === 'saved' && '✓ Configurações salvas!'}
                            {saveStatus === 'idle' && 'Salvar Configurações de IA'}
                        </button>
                    </div>


    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage = { sender: 'user' as 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Chave da API Gemini não encontrada. Verifique o arquivo .env.local e reinicie o servidor.");
            }

            const genAIClient = new GoogleGenAI(apiKey);

            const modelInstance = genAIClient.getGenerativeModel({
                model: aiModel,
                systemInstruction: systemPrompt,
            });

            const chat = modelInstance.startChat({
                history: messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }],
                })),
            });

            const result = await chat.sendMessage(input);
            const response = result.response;
            const replyText = response.text();

            setMessages([...newMessages, { sender: 'bot' as 'bot', text: replyText }]);

        } catch (error) {
            console.error("Failed to get AI response:", error);
            const friendlyMessage = error instanceof Error ? error.message : 'Não foi possível conectar.';
            setMessages([...newMessages, { sender: 'bot' as 'bot', text: `Desculpe, ocorreu um erro: ${friendlyMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="border rounded-lg flex flex-col h-96">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-100/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">{ICONS.robot}</div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">{ICONS.robot}</div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-sm">
                            <div className="flex items-center justify-center space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t bg-white flex">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isLoading ? "Aguardando resposta..." : "Digite sua mensagem..."}
                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-slate-50"
                    disabled={isLoading}
                />
                <button onClick={handleSend} className="ml-2 p-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-primary/50" disabled={isLoading}>
                   {isLoading ? <div className="w-6 h-6 animate-spin">{ICONS.loader}</div> : ICONS.send}
                </button>
            </div>
        </div>
    )
}


const Settings: React.FC = () => {
    const [users, setUsers] = useState(initialUsers);
    const [aiModel, setAiModel] = useState(() => localStorage.getItem('aiModel') || 'gemini-2.5-pro');
    const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('systemPrompt') || `Você é um assistente de agendamento para a plataforma Interativix-bot.

INSTRUÇÕES:
1. Saudação: Inicie cumprimentando o usuário de forma cordial e profissional.
2. Informações necessárias: Pergunte ao usuário (um de cada vez):
   - Nome completo
   - Número de telefone
   - Qual serviço deseja (Corte de Cabelo, Manicure, Limpeza de Pele)
   - Data preferida (em formato DD/MM/YYYY)
   - Horário preferido (em formato HH:MM)
   - Profissional (se tiver preferência)

3. Confirmação: Após coletar todas as informações, revise-as com o usuário.

4. Agendamento confirmado: Quando o usuário confirmar o agendamento, responda com JSON estruturado assim:
```json
{
  "action": "CREATE_APPOINTMENT",
  "clientName": "Nome do Cliente",
  "clientPhone": "11 98765-4321",
  "service": "Corte de Cabelo",
  "date": "17/11/2025",
  "time": "14:30",
  "professional": "Ana Silva"
}
```

5. Tom: Seja sempre cordial, objetivo e profissional.`);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [whatsappStatus, setWhatsappStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [apiType, setApiType] = useState<'official' | 'evolution'>('official');
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');

    const handleSaveAISettings = async () => {
        setSaveStatus('saving');
        try {
            // Simula um delay de processamento
            await new Promise(resolve => setTimeout(resolve, 500));
            // Salva no localStorage
            localStorage.setItem('aiModel', aiModel);
            localStorage.setItem('systemPrompt', systemPrompt);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
            console.log('Configurações de IA salvas com sucesso');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            setSaveStatus('idle');
        }
    };

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    };

    const handleWhatsappConnect = () => {
        if (apiType === 'official') {
            setIsWhatsappModalOpen(true);
        } else {
            if (!apiUrl || !apiKey) {
                alert('Por favor, preencha a URL da API e a API Key.');
                return;
            }
            // Simulating connection for Evolution API
            console.log('Conectando com Evolution API:', { apiUrl, apiKey });
            setWhatsappStatus('connected');
        }
    };
    
    const handleQrCodeConnect = () => {
        setIsWhatsappModalOpen(false);
        setWhatsappStatus('connected');
    };


    const handleWhatsappDisconnect = () => {
        setWhatsappStatus('disconnected');
        setApiUrl('');
        setApiKey('');
    };



    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">IA & Configurações</h2>


            <SettingsCard title="Integração com WhatsApp" icon={ICONS.whatsapp}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Conexão</label>
                    <select value={apiType} onChange={e => setApiType(e.target.value as 'official' | 'evolution')} className="mt-1 block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                        <option value="official">API Oficial (QR Code)</option>
                        <option value="evolution">Evolution API (Não Oficial)</option>
                    </select>
                </div>


                <div className="mt-4 border-t pt-4">
                    {apiType === 'evolution' && (
                        <div className="space-y-4 mb-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">URL da API</label>
                                <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://seudominio.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">API Key</label>
                                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Sua chave de API segura" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`h-3 w-3 rounded-full ${whatsappStatus === 'connected' ? 'bg-success animate-pulse' : 'bg-danger'}`}></span>
                                <p className="font-semibold text-gray-700">Status: <span className={whatsappStatus === 'connected' ? 'text-success' : 'text-danger'}>{whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}</span></p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Conecte seu número para permitir que a IA agende horários automaticamente.</p>
                        </div>
                        {whatsappStatus === 'disconnected' ? (
                            <button onClick={handleWhatsappConnect} className="mt-4 sm:mt-0 bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                                Conectar WhatsApp
                            </button>
                        ) : (
                             <button onClick={handleWhatsappDisconnect} className="mt-4 sm:mt-0 bg-danger text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-colors">
                                Desconectar
                            </button>
                        )}
                    </div>
                </div>
            </SettingsCard>


             <SettingsCard title="Configuração do Chatbot de IA" icon={ICONS.robot}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Modelo de IA</label>
                             <select value={aiModel} onChange={e => setAiModel(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
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
                                placeholder="Descreva o comportamento do seu assistente de IA aqui..."
                             ></textarea>
                             <p className="mt-2 text-xs text-gray-500">Dica: Dê personalidade ao seu bot. Defina como ele deve saudar, se ele deve ser formal ou informal, etc.</p>
                        </div>
<<<<<<< HEAD
                         <button onClick={handleSaveSettings} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                            Salvar Configurações de IA
=======
                         <button 
                            onClick={handleSaveAISettings}
                            disabled={saveStatus === 'saving'}
                            className={`w-full font-bold py-2 px-4 rounded-lg shadow-md transition-colors ${
                                saveStatus === 'saved' 
                                    ? 'bg-success text-white' 
                                    : 'bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50'
                            }`}
                        >
                            {saveStatus === 'saving' && 'Salvando...'}
                            {saveStatus === 'saved' && '✓ Configurações salvas!'}
                            {saveStatus === 'idle' && 'Salvar Configurações de IA'}
                        </button>
                    </div>
                     <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">Sandbox de Teste</p>
                        <ChatSandbox systemPrompt={systemPrompt} aiModel={aiModel} />
                    </div>
                </div>
            </SettingsCard>


            <SettingsCard title="Permissões de Usuário" icon={ICONS.users}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                            disabled={user.role === UserRole.Administrador}
                                        >
                                            {Object.values(UserRole).filter(role => role !== UserRole.Cliente).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-red-600 hover:text-red-900 disabled:text-gray-400" disabled={user.role === UserRole.Administrador}>
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SettingsCard>

            <Modal isOpen={isWhatsappModalOpen} onClose={() => setIsWhatsappModalOpen(false)} title="Conectar WhatsApp">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Escaneie o QR Code com o seu celular para conectar sua conta do WhatsApp.</p>
                    <div className="bg-gray-100 p-4 rounded-lg inline-block">
                        {/* Placeholder for QR Code */}
                        <img src="https://quickchart.io/qr?text=https://interativix.com/connect&size=200" alt="QR Code" />
                    </div>
                    <div className="mt-6">
                        <button onClick={handleQrCodeConnect} className="w-full bg-success text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors">
                            Já escaneei, conectar!
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;