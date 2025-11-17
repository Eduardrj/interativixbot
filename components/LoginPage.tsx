import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ICONS } from '../constants';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Por favor, insira seu nome');
          return;
        }
        await signUp(email, password, name);
        setError('Conta criada! Verifique seu email para confirmar.');
        setTimeout(() => setIsSignUp(false), 2000);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">{ICONS.robot}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Interativix-bot</h1>
            <p className="text-gray-500 mt-2">Agendamentos inteligentes com IA</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
                !isSignUp
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
                isSignUp
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('Verifique seu email')
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-danger/10 text-danger border border-danger/20'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover disabled:bg-primary/50 transition flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 animate-spin">{ICONS.loader}</div>}
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp
              ? 'Já tem uma conta?'
              : 'Não tem uma conta?'}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="text-primary font-semibold ml-1 hover:underline"
            >
              {isSignUp ? 'Faça login' : 'Registre-se'}
            </button>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
          <h3 className="font-bold mb-3">Demo Credentials</h3>
          <p className="text-sm opacity-90">
            <strong>Email:</strong> demo@example.com<br/>
            <strong>Senha:</strong> demo123456
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
