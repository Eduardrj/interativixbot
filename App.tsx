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
import LoginPage from './components/LoginPage';
import { AppointmentsProvider } from './contexts/AppointmentsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { Page } from './types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-800">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppointmentsProvider>
        <AppContent />
      </AppointmentsProvider>
    </AuthProvider>
  );
};

export default App;