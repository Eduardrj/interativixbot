import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import type { Page } from './types';
import { ICONS } from './constants';

// Carregamento dinâmico (lazy loading) dos componentes de página
const Dashboard = lazy(() => import('./components/Dashboard'));
const Appointments = lazy(() => import('./components/Appointments'));
const Settings = lazy(() => import('./components/Settings'));
const Services = lazy(() => import('./components/Services'));
const Professionals = lazy(() => import('./components/Professionals'));
const Clients = lazy(() => import('./components/Clients'));
const Billing = lazy(() => import('./components/Billing'));
const Reports = lazy(() => import('./components/Reports'));
const Faq = lazy(() => import('./components/Faq'));
const ManualUsuario = lazy(() => import('./components/ManualUsuario'));
const ManualAdmin = lazy(() => import('./components/ManualAdmin'));
const LandingPage = lazy(() => import('./components/LandingPage'));

const LoadingFallback: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin text-primary">
      {ICONS.loader}
    </div>
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'agendamentos': return <Appointments />;
      case 'servicos': return <Services />;
      case 'profissionais': return <Professionals />;
      case 'clientes': return <Clients />;
      case 'planos': return <Billing />;
      case 'relatorios': return <Reports />;
      case 'configuracoes': return <Settings />;
      case 'faq': return <Faq />;
      case 'manualUsuario': return <ManualUsuario />;
      case 'manualAdmin': return <ManualAdmin />;
      default: return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-slate-50"><LoadingFallback /></div>}>
        <LandingPage onLogin={() => setIsLoggedIn(true)} />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-800">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<LoadingFallback />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;