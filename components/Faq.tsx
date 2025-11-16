
import React from 'react';

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="group border-b pb-4">
        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-lg text-gray-800">
            <span>{question}</span>
            <span className="transition group-open:rotate-180 text-primary">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
        </summary>
        <div className="text-gray-600 mt-3 group-open:animate-fadeIn px-2">
            {children}
        </div>
    </details>
);

const Faq: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Perguntas Frequentes (FAQ)</h2>
                <p className="text-gray-500 mt-1">Encontre respostas para as dúvidas mais comuns sobre o Interativix-bot.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
                <FaqItem question="Como conecto meu número de WhatsApp?">
                    <p>Você pode conectar seu número de duas formas, ambas na página <strong>"IA & Configurações"</strong>:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>API Oficial (Recomendado):</strong> A forma mais fácil. Basta selecionar esta opção, clicar em "Conectar" e escanear o QR Code com seu celular.</li>
                        <li><strong>Evolution API (Avançado):</strong> Se você tem sua própria instância da Evolution API, selecione esta opção e preencha a URL e a API Key para conectar.</li>
                    </ul>
                    <p className="mt-2">Para a maioria dos casos, recomendamos usar a API Oficial para maior estabilidade e simplicidade.</p>
                </FaqItem>
                <FaqItem question="Como funciona o agendamento por Inteligência Artificial?">
                    <p>Nossa IA é integrada ao seu WhatsApp e é treinada para entender as solicitações dos seus clientes. Ela conversa naturalmente, verifica sua agenda em tempo real, oferece horários disponíveis e finaliza o agendamento sem que você precise intervir. Você pode personalizar o comportamento dela na tela de "IA & Configurações".</p>
                </FaqItem>
                <FaqItem question="Posso adicionar um agendamento manualmente?">
                    <p>Sim! Na tela de "Agendamentos", clique no botão "Novo Agendamento". Você poderá preencher os dados do cliente, selecionar o serviço, o profissional e o horário desejado. É perfeito para agendamentos feitos por telefone ou presencialmente.</p>
                </FaqItem>
                <FaqItem question="Como configuro os serviços que ofereço?">
                    <p>Vá para a seção "Serviços" no menu lateral. Lá, você pode adicionar novos serviços, definir nome, duração e preço. Essas informações serão usadas tanto pela IA quanto pelos agendamentos manuais para calcular a disponibilidade da sua agenda.</p>
                </FaqItem>
                 <FaqItem question="Existe uma opção gratuita?">
                    <p>Sim! Oferecemos o <strong>Plano Grátis</strong> que permite que você utilize as funcionalidades essenciais da agenda para sempre, com algumas limitações. É a maneira perfeita de começar e entender como o Interativix-bot pode ajudar seu negócio, sem nenhum custo inicial.</p>
                </FaqItem>
                <FaqItem question="O que são os diferentes níveis de permissão de usuário?">
                    <p>Para garantir a segurança e a organização, o Interativix-bot possui três níveis de acesso:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Administrador:</strong> Acesso total a todas as configurações, incluindo IA, planos e permissões de outros usuários.</li>
                        <li><strong>Gerente:</strong> Pode gerenciar agendamentos, clientes e profissionais, mas não tem acesso às configurações críticas do sistema.</li>
                        <li><strong>Atendente:</strong> Tem acesso focado na operação diária, como visualizar a agenda e gerenciar o status dos atendimentos.</li>
                    </ul>
                </FaqItem>
                 <FaqItem question="Como funciona a visualização em Kanban e Calendário?">
                    <p>A tela de agendamentos oferece duas visualizações:</p>
                     <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Kanban:</strong> Ideal para acompanhar o fluxo de atendimento. Você vê os agendamentos organizados por status (Pendente, Em Andamento, Concluído) e pode arrastar os cards para atualizar o progresso.</li>
                        <li><strong>Calendário:</strong> Oferece uma visão semanal da sua agenda, mostrando os horários ocupados de forma clara e organizada, dia a dia.</li>
                    </ul>
                </FaqItem>
            </div>
        </div>
    );
};

export default Faq;