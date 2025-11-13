import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import Settings from './components/Settings';
import Services from './components/Services';
import Professionals from './components/Professionals';
import Clients from './components/Clients';
import Billing from './components/Billing';
import Reports from './components/Reports';
import Faq from './components/Faq';
import ManualUsuario from './components/ManualUsuario';
import ManualAdmin from './components/ManualAdmin';
import LandingPage from './components/LandingPage';
import type { Page } from './types';

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
    return <LandingPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-base-200 text-gray-800">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-100 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;