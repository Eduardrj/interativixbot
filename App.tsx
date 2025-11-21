import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import type { Page } from './types';
import { ICONS } from './constants';
import { Toaster } from 'react-hot-toast';
import { AppointmentsProvider } from './contexts/AppointmentsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientsProvider } from './contexts/ClientsContext';
import { ServicesProvider } from './contexts/ServicesContext';
import { ProfessionalsProvider } from './contexts/ProfessionalsContext';
import { CompaniesProvider } from './contexts/CompaniesContext';

// Carregamento dinâmico (lazy loading) dos componentes de página
const Dashboard = lazy(() => import('./components/Dashboard'));
const Appointments = lazy(() => import('./components/Appointments'));
const Settings = lazy(() => import('./components/Settings'));
const Services = lazy(() => import('./components/Services'));
const Professionals = lazy(() => import('./components/Professionals'));
const Clients = lazy(() => import('./components/Clients'));
const Companies = lazy(() => import('./components/Companies'));
const Billing = lazy(() => import('./components/Billing'));
const Reports = lazy(() => import('./components/Reports'));
const Faq = lazy(() => import('./components/Faq'));
const ManualUsuario = lazy(() => import('./components/ManualUsuario'));
const ManualAdmin = lazy(() => import('./components/ManualAdmin'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));

const LoadingFallback: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin text-primary">
      {ICONS.loader}
    </div>
  </div>
);

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
      case 'empresas': return <Companies />;
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
          <Suspense fallback={<LoadingFallback />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CompaniesProvider>
        <AppointmentsProvider>
          <ClientsProvider>
            <ServicesProvider>
              <ProfessionalsProvider>
                <AppContent />
              </ProfessionalsProvider>
            </ServicesProvider>
          </ClientsProvider>
        </AppointmentsProvider>
      </CompaniesProvider>
    </AuthProvider>
  );
};

export default App;