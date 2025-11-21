import React from 'react';
import type { Page } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center px-4 py-3 text-base transition-colors duration-200 transform rounded-lg ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 hover:bg-slate-200 hover:text-gray-700'
    }`}
  >
    <span className="w-6 h-6">{icon}</span>
    <span className="mx-4 font-medium">{label}</span>
  </a>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setOpen }) => {
  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    if(window.innerWidth < 1024) { // Close sidebar on mobile after navigation
      setOpen(false);
    }
  }

  const mainNavItems = [
    { page: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { page: 'agendamentos', label: 'Agendamentos', icon: ICONS.calendar },
    { page: 'kanban', label: 'Kanban Board', icon: ICONS.trello },
  ];
  
  const managementNavItems = [
     { page: 'clientes', label: 'Clientes', icon: ICONS.users },
     { page: 'crm', label: 'CRM Detalhado', icon: ICONS.target },
    { page: 'profissionais', label: 'Profissionais', icon: ICONS.briefcase },
    { page: 'servicos', label: 'Serviços', icon: ICONS.scissors },
    { page: 'empresas', label: 'Empresas', icon: ICONS.building },
  ];

  const businessNavItems = [
    { page: 'financeiro', label: 'Financeiro', icon: ICONS.dollarSign },
    { page: 'planos', label: 'Planos & Cobrança', icon: ICONS.creditCard },
    { page: 'relatorios', label: 'Relatórios', icon: ICONS.fileText },
    { page: 'permissoes', label: 'Permissões', icon: ICONS.lock },
    { page: 'configuracoes', label: 'IA & Configurações', icon: ICONS.settings },
  ];

  const helpNavItems = [
    { page: 'faq', label: 'FAQ', icon: ICONS.helpCircle },
    { page: 'manualUsuario', label: 'Manual do Usuário', icon: ICONS.bookOpen },
    { page: 'manualAdmin', label: 'Manual do Admin', icon: ICONS.shieldCheck },
  ]

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 flex flex-col w-72 h-screen px-5 py-8 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700 transform transition-transform z-30 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <a href="#" className="flex items-center text-xl font-bold text-primary">
          <span className="w-8 h-8 mr-2">{ICONS.robot}</span>
            Interativix-bot
        </a>

        <div className="flex flex-col justify-between flex-1 mt-6">
          <nav className="flex-1 -mx-3 space-y-1">
            {mainNavItems.map(item => (
              <NavLink key={item.page} icon={item.icon} label={item.label} isActive={currentPage === item.page} onClick={() => handleNavigation(item.page as Page)} />
            ))}
            
            <div className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">Gerenciamento</div>
            {managementNavItems.map(item => (
              <NavLink key={item.page} icon={item.icon} label={item.label} isActive={currentPage === item.page} onClick={() => handleNavigation(item.page as Page)} />
            ))}

            <div className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">Negócios</div>
            {businessNavItems.map(item => (
              <NavLink key={item.page} icon={item.icon} label={item.label} isActive={currentPage === item.page} onClick={() => handleNavigation(item.page as Page)} />
            ))}
          </nav>
          
           <div className="mt-6">
              <div className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase">Ajuda & Suporte</div>
               <nav className="-mx-3 space-y-1">
                 {helpNavItems.map(item => (
                    <NavLink key={item.page} icon={item.icon} label={item.label} isActive={currentPage === item.page} onClick={() => handleNavigation(item.page as Page)} />
                ))}
              </nav>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;