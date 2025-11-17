# 🤖 InterativoBot - Plataforma Inteligente de Agendamentos

<div align="center">
  <h2>Sistema Integrado de Gestão e Chat com IA</h2>
  <p>
    <strong>Plataforma completa para gerenciamento de agendamentos com assistente de IA em tempo real</strong>
  </p>
  
  ![Version](https://img.shields.io/badge/version-1.0.2-blue)
  ![License](https://img.shields.io/badge/license-MIT-green)
  ![Status](https://img.shields.io/badge/status-Production%20Ready-success)
</div>

---

## 📋 Sobre o Projeto

**InterativoBot** é uma plataforma web e mobile desenvolvida em **React** + **TypeScript** que integra:

✨ **Gestão de Agendamentos** - Dashboard intuitivo com kanban visual  
🤖 **Chat com IA** - Assistente baseado em Google Gemini para suporte  
👥 **Gerenciamento de Clientes** - CRM integrado  
💼 **Gestão de Profissionais** - Controle de equipe e disponibilidade  
📊 **Relatórios e Analytics** - Insights de negócio  
💰 **Sistema de Billing** - Gestão de pagamentos e faturamento  
🔐 **Autenticação Segura** - Supabase + JWT  

---

## 🚀 Stack Tecnológico

### Frontend
- **React 18** com TypeScript
- **Vite** - Build tool moderno e rápido
- **Tailwind CSS** - Styling responsivo
- **Capacitor** - Suporte para iOS/Android

### Backend & Banco de Dados
- **Supabase** - PostgreSQL + Autenticação
- **Google Gemini API** - IA conversacional
- **Node.js** - API serverless (Vercel)

### Deployment
- **Vercel** - Hosting principal
- **GitHub** - Versionamento e CI/CD
- **Capacitor** - Build nativo iOS/Android

---

## 📦 Estrutura do Projeto

```
interativixbot/
├── components/          # Componentes React principais
├── contexts/           # Contextos globais (Auth, Appointments, etc)
├── api/                # Rotas de API serverless
├── lib/                # Utilidades e configurações
├── supabase/           # Schema e migrations SQL
├── android/            # Build nativo Android
├── ios/                # Build nativo iOS
└── scripts/            # Scripts utilitários
```

---

## 🛠️ Instalação e Configuração

### Pré-requisitos
- **Node.js** 18+ 
- **pnpm** 8+ (ou npm/yarn)
- **Git**

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/Eduardrj/interativixbot.git
cd interativixbot
```

### 2️⃣ Instale as Dependências

```bash
pnpm install
```

### 3️⃣ Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica

# Google Gemini
VITE_GEMINI_API_KEY=sua_chave_gemini
API_KEY=sua_chave_gemini

# CORS
CORS_ORIGIN=http://localhost:5173

# Aplicação
VITE_APP_NAME=InterativoBot
VITE_APP_URL=http://localhost:5173
```

### 4️⃣ Inicie o Servidor de Desenvolvimento

```bash
pnpm run dev
```

Acesse em: **http://localhost:5173**

---

## 📚 Funcionalidades Principais

### 🗓️ Dashboard de Agendamentos
- Visualização em kanban
- Agendamento com drag-and-drop
- Filtros por status, profissional e cliente
- Notificações em tempo real

### 💬 Chat com IA
- Assistente inteligente 24/7
- Histórico de conversa persistente
- Integração com Supabase
- Suporte a múltiplos modelos Gemini

### 👥 Gestão de Clientes
- CRUD completo
- Histórico de agendamentos
- Contato integrado
- Relatórios por cliente

### 💼 Gerenciamento de Profissionais
- Cadastro de equipe
- Controle de disponibilidade
- Especialidades e competências
- Performance e avaliações

### 📊 Relatórios
- Análise de agendamentos
- Faturamento mensal
- Performance da equipe
- Satisfação de clientes

---

## 🔐 Autenticação e Segurança

- **JWT** com Supabase Auth
- **Row Level Security** no banco de dados
- **CORS** configurado
- **HTTPS** obrigatório em produção
- **Validação** de entrada em API

---

## 📱 Build para Mobile

### iOS

```bash
pnpm run build:ios
# Ou abrir Xcode manualmente
npx cap open ios
```

### Android

```bash
pnpm run build:android
# Ou abrir Android Studio
npx cap open android
```

---

## 🚀 Deploy em Produção

### Deploy no Vercel

```bash
# Conecte seu repositório ao Vercel
vercel --prod
```

**Environment Variables necessárias:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`
- `API_KEY` (para rota de chat)

Consulte [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) para mais detalhes.

---

## 📖 Documentação Adicional

- [🏗️ Arquitetura do Sistema](./ARCHITECTURE.md)
- [🚀 Guia de Deploy](./BUILD_AND_DEPLOY.md)
- [📝 Guia de Testes](./TESTING_GUIDE.md)
- [🔧 Setup do Supabase](./SUPABASE_SETUP.md)
- [📦 Integração de Chat](./CHANGELOG_CHAT_INTEGRATION.md)
- [✅ Status do Projeto](./PROJECT_STATUS.md)

---

## 🏷️ Versionamento

Este projeto utiliza **Semantic Versioning** com tags para rastreabilidade:

```bash
# Ver todas as tags
git tag -l

# Ver detalhes de uma versão específica
git tag -l v1.0.2-chat-supabase-integration -n10

# Fazer checkout de uma versão
git checkout v1.0.2-chat-supabase-integration
```

### Versões Recentes
- **v1.0.2** - Integração completa com Supabase
- **v1.0.1** - Persistência de dados do chat
- **v1.0.0** - Implementação inicial com Gemini

---

## 🧪 Testes

```bash
# Executar testes
pnpm run test

# Testes com cobertura
pnpm run test:coverage

# Scripts de teste de dados
node scripts/create_test_records.mjs
node scripts/create_test_records_auth.mjs
```

---

## 🤝 Contribuindo

1. **Fork** o repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: Adicione MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Padrão de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Adiciona nova funcionalidade
fix: Corrige um bug
docs: Atualiza documentação
style: Mudanças de formatação
refactor: Refatora código
test: Adiciona testes
chore: Tarefas de manutenção
```

---

## 📞 Suporte e Contato

- **Email:** eduardrj@example.com
- **Issues:** [GitHub Issues](https://github.com/Eduardrj/interativixbot/issues)
- **Discussões:** [GitHub Discussions](https://github.com/Eduardrj/interativixbot/discussions)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](./LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- [Google Gemini API](https://ai.google.dev/) pela IA
- [Supabase](https://supabase.com/) pelo banco de dados
- [Vercel](https://vercel.com/) pelo hosting
- [React](https://react.dev/) pelo framework
- [Capacitor](https://capacitorjs.com/) pelo suporte mobile

---

<div align="center">
  <p>
    <strong>InterativoBot</strong> © 2025 - Desenvolvido por Eduardrj
  </p>
  <p>
    Feito com ❤️ para simplificar a gestão de agendamentos
  </p>
</div>
