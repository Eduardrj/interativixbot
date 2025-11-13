
import React from 'react';
import { ICONS } from '../constants';
import { Plan } from '../types';

const mockPlans: Plan[] = [
    { id: 'p1', name: 'Anual', price: 'R$ 997', frequency: '/ano', features: ['Agendamentos Ilimitados', 'Chatbot IA', 'Notificações WhatsApp', 'Suporte Prioritário'], isPopular: true },
    { id: 'p2', name: 'Vitalício', price: 'R$ 2497', frequency: '/pagamento único', features: ['Todos os benefícios do Anual', 'Acesso a futuras atualizações', 'Sem taxas de renovação'], isPopular: false },
];

const PlanCard: React.FC<{plan: Plan}> = ({plan}) => (
    <div className={`border rounded-2xl p-8 flex flex-col ${plan.isPopular ? 'border-primary shadow-2xl' : 'border-gray-300 bg-white'}`}>
        {plan.isPopular && <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">MAIS POPULAR</span>}
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="mt-2 text-4xl font-bold">{plan.price}<span className="text-lg font-medium text-gray-500">{plan.frequency}</span></p>
        <ul className="mt-6 space-y-3 text-gray-600 flex-1">
            {plan.features.map(feature => (
                <li key={feature} className="flex items-center">
                    <span className="text-primary mr-2">{ICONS.check}</span>
                    {feature}
                </li>
            ))}
        </ul>
        <button className={`mt-8 w-full py-3 rounded-lg font-bold text-lg ${plan.isPopular ? 'bg-primary text-white hover:bg-primary-focus' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
            Contratar Plano
        </button>
    </div>
)

const FaqItem: React.FC<{question: string, children: React.ReactNode}> = ({question, children}) => (
    <details className="group border-b pb-4">
        <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
            <span>{question}</span>
            <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
        </summary>
        <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
            {children}
        </p>
    </details>
)

const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="bg-base-100 text-gray-800">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="flex items-center text-2xl font-bold text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
              AutoAgende
          </a>
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-gray-600 hover:text-primary">Recursos</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary">Depoimentos</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary">Preços</a>
            <a href="#faq" className="text-gray-600 hover:text-primary">FAQ</a>
          </nav>
          <button onClick={onLogin} className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-primary-focus transition-colors">
            Acessar Painel
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 text-center bg-white">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Automatize seus agendamentos e <span className="text-primary">fidelize seus clientes</span>.
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              O AutoAgende usa Inteligência Artificial para marcar horários via WhatsApp, 24/7, enquanto você foca no que realmente importa: seu negócio.
            </p>
            <a href="#pricing" className="mt-8 inline-block bg-accent text-white font-bold text-lg py-4 px-10 rounded-lg shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-105">
              Começar Agora
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Tudo que você precisa em um só lugar</h2>
              <p className="text-gray-600 mt-2">Recursos inteligentes para otimizar sua gestão.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 inline-block">{ICONS.whatsapp}</div>
                <h3 className="mt-4 text-xl font-bold">Agendamento com IA</h3>
                <p className="mt-2 text-gray-600">Seu assistente virtual agenda horários via WhatsApp, sem que você precise digitar nada.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 inline-block">{ICONS.dashboard}</div>
                <h3 className="mt-4 text-xl font-bold">Painel de Controle Completo</h3>
                <p className="mt-2 text-gray-600">Visualize seus agendamentos, gerencie clientes e acompanhe as métricas do seu negócio.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-md text-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 inline-block">{ICONS.messageCircle}</div>
                <h3 className="mt-4 text-xl font-bold">Notificações Automáticas</h3>
                <p className="mt-2 text-gray-600">Envie lembretes de agendamento automáticos para seus clientes e reduza as faltas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Amado por profissionais como você</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-base-100 p-8 rounded-2xl">
                <img src="https://ui-avatars.com/api/?name=Ana+Silva&background=EC4899&color=fff" alt="Cliente 1" className="w-20 h-20 rounded-full mx-auto -mt-16 border-4 border-white" />
                <p className="mt-6 text-gray-600">"O AutoAgende transformou a gestão do meu salão. Agora tenho mais tempo para atender minhas clientes com qualidade."</p>
                <h4 className="mt-4 font-bold">Ana Silva</h4>
                <p className="text-sm text-gray-500">Dona de Salão</p>
              </div>
              <div className="bg-base-100 p-8 rounded-2xl">
                <img src="https://ui-avatars.com/api/?name=Bruno+Costa&background=3B82F6&color=fff" alt="Cliente 2" className="w-20 h-20 rounded-full mx-auto -mt-16 border-4 border-white" />
                <p className="mt-6 text-gray-600">"A IA que agenda pelo WhatsApp é simplesmente mágica. Meus pacientes adoraram a praticidade."</p>
                <h4 className="mt-4 font-bold">Dr. Bruno Costa</h4>
                <p className="text-sm text-gray-500">Fisioterapeuta</p>
              </div>
              <div className="bg-base-100 p-8 rounded-2xl">
                 <img src="https://ui-avatars.com/api/?name=Carla+Dias&background=F59E0B&color=fff" alt="Cliente 3" className="w-20 h-20 rounded-full mx-auto -mt-16 border-4 border-white" />
                <p className="mt-6 text-gray-600">"Finalmente um sistema que entende a nossa rotina. O painel é super intuitivo e fácil de usar."</p>
                <h4 className="mt-4 font-bold">Carla Dias</h4>
                <p className="text-sm text-gray-500">Esteticista</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Planos transparentes, sem surpresas</h2>
                    <p className="text-gray-600 mt-2">Escolha o plano ideal para o seu momento.</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {mockPlans.map(plan => <PlanCard key={plan.id} plan={plan}/>)}
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
                </div>
                <div className="space-y-4">
                    <FaqItem question="Preciso ter conhecimento técnico para usar o sistema?">
                        Não! O AutoAgende foi projetado para ser extremamente fácil de usar. Nossa interface é intuitiva e você terá acesso a manuais e suporte para te auxiliar em cada passo.
                    </FaqItem>
                    <FaqItem question="A integração com WhatsApp funciona com qualquer número?">
                        Sim, o sistema se integra com a API oficial do WhatsApp Business. Nós te guiaremos no processo de configuração para garantir que seu número comercial esteja pronto para automatizar os agendamentos.
                    </FaqItem>
                    <FaqItem question="Posso personalizar as mensagens enviadas pela IA?">
                        Com certeza! No painel de configurações, você pode ajustar o "prompt de sistema" da IA para que ela se comunique com a voz e o tom da sua marca.
                    </FaqItem>
                     <FaqItem question="Existe um período de teste gratuito?">
                        Sim, oferecemos um período de 7 dias de teste gratuito para você experimentar todos os recursos do plano Anual, sem compromisso.
                    </FaqItem>
                </div>
            </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-20 text-center">
             <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                    Pronto para revolucionar seu atendimento?
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Junte-se a centenas de negócios que já estão economizando tempo e aumentando a satisfação de seus clientes.
                </p>
                <a href="#pricing" className="mt-8 inline-block bg-accent text-white font-bold text-lg py-4 px-10 rounded-lg shadow-lg hover:bg-pink-600 transition-transform transform hover:scale-105">
                    Quero Automatizar Meus Agendamentos
                </a>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-8 text-center">
            <p>&copy; {new Date().getFullYear()} AutoAgende. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;