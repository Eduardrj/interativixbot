import React, { useState } from 'react';
import { ICONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useCompanies } from '../contexts/CompaniesContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, signOut } = useAuth();
  const { companies, currentCompany, selectCompany } = useCompanies();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const userEmail = user?.email || 'Usuário';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 focus:outline-none lg:hidden"
        >
          {ICONS.menu}
        </button>
        <h1 className="text-xl font-semibold text-gray-800 ml-4 lg:ml-0">
          Interativix-bot
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Company Selector */}
        {companies.length > 0 && (
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-2xl">{ICONS.building || '🏢'}</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {currentCompany?.name || 'Selecione uma empresa'}
                </p>
                {companies.length > 1 && (
                  <p className="text-xs text-gray-500">
                    {companies.length} empresas
                  </p>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {showCompanyMenu && companies.length > 1 && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Suas Empresas
                  </p>
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        selectCompany(company.id);
                        setShowCompanyMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                        currentCompany?.id === company.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <p className="font-semibold text-sm">{company.name}</p>
                      {company.industry && (
                        <p className="text-xs text-gray-500">{company.industry}</p>
                      )}
                      {currentCompany?.id === company.id && (
                        <span className="text-xs text-blue-600 mt-1 inline-block">✓ Ativa</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-1 bg-red-500 rounded-full"></span>
          <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-1 bg-red-500 rounded-full animate-ping"></span>
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center hover:opacity-80 transition"
          >
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3B82F6&color=fff`}
              alt="User avatar"
            />
            <div className="ml-3 hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
              >
                {ICONS.logout}
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;