import React from 'react';

const ManualSection: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 text-primary">
            {title}
        </h3>
        <div className="space-y-3 text-gray-700 leading-relaxed">
            {children}
        </div>
    </div>
)

const ManualUsuario: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Manual do Usuário</h2>
                <p className="text-gray-500 mt-1">Guia completo para Atendentes e Gerentes sobre as funcionalidades do dia a dia.</p>
            </div>
            
            <ManualSection title="1. Dashboard: Sua Visão Geral">
                <p>O <strong>Dashboard</strong> é a primeira tela que você vê ao entrar. Ele oferece um resumo rápido e visual da saúde do seu negócio:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Cards de Estatísticas:</strong> Mostram o total de atendimentos, quantos foram concluídos, quantos estão pendentes e o número de novos clientes em um período.</li>
                    <li><strong>Gráfico de Agendamentos:</strong> Exibe o volume de agendamentos ao longo da semana, ajudando a identificar os dias de maior movimento.</li>
                    <li><strong>Gráfico de Receita:</strong> Acompanhe a evolução da sua receita mensalmente.</li>
                </ul>
            </ManualSection>

             <ManualSection title="2. Gerenciando Agendamentos">
                <p>A página de <strong>Agendamentos</strong> é o coração da sua operação. Você tem duas formas de visualizá-la:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Kanban:</strong> Arraste e solte os cards de agendamento entre as colunas (Pendente, Em Andamento, etc.) para atualizar o status de cada atendimento de forma rápida e visual.</li>
                    <li><strong>Calendário:</strong> Tenha uma visão clara da sua semana, com todos os horários já preenchidos. É ideal para verificar a disponibilidade rapidamente.</li>
                </ul>
                <p className="mt-2">Para criar um novo agendamento, clique em <strong>"Novo Agendamento"</strong> e preencha as informações do cliente, serviço e profissional.</p>
            </ManualSection>

             <ManualSection title="3. Cadastrando e Gerenciando Clientes">
                <p>Na seção <strong>Clientes</strong>, você tem acesso a uma lista completa de todas as pessoas que já agendaram um serviço com você.</p>
                 <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Adicionar Cliente:</strong> Clique em "Adicionar Cliente" para inserir manualmente os dados de um novo contato.</li>
                    <li><strong>Buscar:</strong> Utilize a barra de busca para encontrar um cliente específico pelo nome ou telefone.</li>
                    <li><strong>Ver Histórico:</strong> Clique em "Ver Histórico" para acessar todos os agendamentos passados e futuros de um cliente específico.</li>
                </ul>
            </ManualSection>
            
            <ManualSection title="4. Gerenciamento de Profissionais e Serviços (Acesso de Gerente)">
                 <p>Se você tem permissão de <strong>Gerente</strong>, poderá acessar as seções "Profissionais" e "Serviços".</p>
                 <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Profissionais:</strong> Adicione os membros da sua equipe, com foto, nome e especialidades.</li>
                    <li><strong>Serviços:</strong> Defina os serviços que seu negócio oferece, incluindo nome, duração e preço. Manter essa lista atualizada é fundamental para que a IA e o agendamento manual funcionem corretamente.</li>
                </ul>
            </ManualSection>

        </div>
    );
};

export default ManualUsuario;
