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

const ManualAdmin: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Manual do Administrador</h2>
                <p className="text-gray-500 mt-1">Guia focado nas configurações avançadas e gerenciamento do sistema.</p>
            </div>

            <ManualSection title="1. Conectando seu WhatsApp">
                <p>O primeiro passo para automatizar seus agendamentos é conectar seu número de WhatsApp. O processo é simples e seguro:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Acesse a página <strong>IA & Configurações</strong>.</li>
                    <li>No primeiro card, <strong>"Integração com WhatsApp"</strong>, você verá o status atual da conexão.</li>
                    <li>Clique no botão <strong>"Conectar WhatsApp"</strong>. Uma janela (modal) se abrirá com um QR Code.</li>
                    <li>Abra o aplicativo do WhatsApp em seu celular, vá em <strong>Configurações &gt; Aparelhos Conectados</strong> e selecione <strong>"Conectar um aparelho"</strong>.</li>
                    <li>Escaneie o QR Code exibido na tela do AutoAgende.</li>
                    <li>Pronto! O status mudará para "Conectado" e seu assistente de IA já estará ativo no número configurado.</li>
                </ul>
            </ManualSection>
            
            <ManualSection title="2. Configurando o Chatbot de IA">
                <p>Com o WhatsApp conectado, a seção <strong>IA & Configurações</strong> é onde você dá vida ao seu assistente virtual. Os principais campos são:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Modelo de IA:</strong> Escolha entre os modelos de Inteligência Artificial disponíveis. Recomendamos o Google Gemini 2.5 Pro para um ótimo equilíbrio entre custo e performance.</li>
                    <li><strong>Prompt do Sistema:</strong> Este é o campo mais importante. Aqui você escreve as instruções que definem a personalidade e o comportamento do seu chatbot. Diga a ele como deve saudar o cliente, quais informações pedir e como agir.</li>
                    <li><strong>Sandbox de Teste:</strong> Use a caixa de chat à direita para testar suas configurações em tempo real. Converse com seu bot como se fosse um cliente e ajuste o prompt até que ele se comporte exatamente como você deseja.</li>
                </ul>
                <p className="mt-2 font-semibold">Lembre-se de clicar em "Salvar Configurações de IA" após fazer qualquer alteração.</p>
            </ManualSection>

             <ManualSection title="3. Gerenciando Permissões de Usuário">
                <p>Ainda na tela de configurações, você encontrará a tabela de <strong>Permissões de Usuário</strong>.</p>
                <p>Aqui você pode definir o nível de acesso de cada membro da sua equipe. Use o menu suspenso ao lado de cada nome para alterar a permissão entre:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Administrador:</strong> Controle total do sistema.</li>
                    <li><strong>Gerente:</strong> Acesso a funcionalidades de gestão, mas sem poder alterar configurações críticas de IA e cobrança.</li>
                    <li><strong>Atendente:</strong> Focado nas operações do dia a dia.</li>
                </ul>
            </ManualSection>

             <ManualSection title="4. Planos, Cobrança e Cupons">
                <p>Na seção <strong>Planos & Cobrança</strong>, você gerencia a parte financeira da sua assinatura do AutoAgende.</p>
                 <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Planos:</strong> Visualize os detalhes do seu plano atual ou faça upgrade.</li>
                    <li><strong>Cupons de Desconto:</strong> Crie cupons para campanhas de marketing. Por exemplo, um cupom "PRIMEIROMES" pode oferecer um desconto para novos clientes que contratarem o serviço através de um anúncio.</li>
                </ul>
            </ManualSection>
            
            <ManualSection title="5. Relatórios e Análise de Dados">
                 <p>A página de <strong>Relatórios</strong> oferece insights valiosos sobre seu negócio.</p>
                 <p>Use os filtros de data e profissional para analisar períodos específicos. Você pode visualizar dados como:</p>
                 <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Produtividade por Profissional:</strong> Veja quantos atendimentos cada membro da equipe realizou.</li>
                    <li><strong>Taxa de Conversão:</strong> Compare quantos agendamentos vieram automaticamente pelo WhatsApp versus os que foram inseridos manualmente no painel.</li>
                 </ul>
                 <p className="mt-2">Você também pode <strong>Exportar (CSV)</strong> os dados para análises mais aprofundadas em outras ferramentas, como o Excel ou Google Sheets.</p>
            </ManualSection>
        </div>
    );
};

export default ManualAdmin;