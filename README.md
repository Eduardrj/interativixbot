<div align="center">
  
# 🤖 InterativiXBot

### Plataforma Inteligente de Gestão e Agendamentos com IA

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Sistema Integrado de Gestão e Chat com IA em Tempo Real**

[Demo](https://interativixbot.vercel.app) · [Documentação](./ARCHITECTURE.md) · [Relatório de Bugs](https://github.com/Eduardrj/interativixbot/issues)

</div>

---

## 📋 Sobre o Projeto

**InterativiXBot** é uma plataforma completa para gestão empresarial desenvolvida com **React + TypeScript**, que integra:

- ✨ **Gestão de Agendamentos** - Dashboard intuitivo com kanban visual e drag-and-drop
- 🤖 **Chat com IA** - Assistente inteligente baseado em Google Gemini para suporte 24/7
- 👥 **Gerenciamento de Clientes** - CRM integrado com histórico completo
- 💼 **Gestão de Profissionais** - Controle de equipe, disponibilidade e especialidades
- 📊 **Relatórios e Analytics** - Insights de negócio em tempo real
- 💰 **Sistema de Billing** - Gestão de pagamentos e faturamento
- 🔐 **Autenticação Segura** - Supabase Auth + JWT + Row Level Security (RLS)

---

## 🚀 Stack Tecnológico

### **Frontend**
- **React 19** com **TypeScript 5.8** - Framework moderno e type-safe
- **Vite 6.4** - Build tool ultrarrápido com HMR
- **Tailwind CSS** - Styling responsivo e customizável
- **Recharts** - Visualização de dados e gráficos
- **React Hot Toast** - Notificações elegantes

### **Backend & Banco de Dados**
- **Supabase** - PostgreSQL + Auth + Real-time + Storage
- **Google Gemini API** - IA conversacional de última geração
- **Row Level Security (RLS)** - Segurança a nível de linha

### **Mobile**
- **Capacitor 7** - Build nativo para iOS e Android
- Suporte completo a recursos nativos

### **Deployment & DevOps**
- **Vercel** - Hosting principal com edge functions
- **GitHub Actions** - CI/CD automatizado
- **npm** - Gerenciamento de pacotes

---

## 📦 Estrutura do Projeto

```
interativixbot/
├── components/          # Componentes React principais
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── KanbanBoard.tsx  # Board de agendamentos
│   ├── Appointments.tsx # Gestão de agendamentos
│   ├── Clients.tsx      # CRM de clientes
│   ├── Professionals.tsx# Gestão de profissionais
│   ├── Reports.tsx      # Relatórios e analytics
│   ├── Billing.tsx      # Sistema de faturamento
│   └── Settings.tsx     # Configurações
│
├── contexts/            # Contextos globais React
│   ├── AuthContext.tsx  # Autenticação
│   ├── AppointmentsContext.tsx
│   ├── ClientsContext.tsx
│   ├── ProfessionalsContext.tsx
│   └── ServicesContext.tsx
│
├── api/                 # Rotas de API serverless
│   ├── chat.ts          # Chat com Gemini AI
│   └── appointments.ts  # CRUD de agendamentos
│
├── lib/                 # Utilidades e configurações
│   ├── supabaseClient.ts
│   └── config.ts
│
├── supabase/            # Schema e migrations SQL
│   └── schema.sql
│
├── android/             # Build nativo Android
├── ios/                 # Build nativo iOS
└── types.ts             # Definições TypeScript
```

---

## 🛠️ Instalação e Configuração

### **Pré-requisitos**

- **Node.js 20+** e **npm**
- Conta no [Supabase](https://supabase.com)
- Conta no [Google AI Studio](https://ai.google.dev)

### **1. Clone o Repositório**

```bash
git clone https://github.com/Eduardrj/interativixbot.git
cd interativixbot
```

### **2. Instale as Dependências**

```bash
npm install
```

### **3. Configure as Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key

# Google Gemini AI
VITE_GEMINI_API_KEY=sua-chave-gemini-api
```

### **4. Configure o Banco de Dados**

Execute o schema SQL no Supabase:

```bash
# Acesse o SQL Editor no Supabase Dashboard
# Cole e execute o conteúdo de: supabase/schema.sql
```

### **5. Execute o Projeto**

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### **6. Build Mobile (Opcional)**

```bash
# Android
npm run build
npx cap sync android
npx cap open android

# iOS
npm run build
npx cap sync ios
npx cap open ios
```

---

## 📚 Funcionalidades Principais

### 🗓️ **Dashboard de Agendamentos**
- Visualização em kanban com 4 estados (Pendente, Confirmado, Concluído, Cancelado)
- Agendamento com drag-and-drop intuitivo
- Filtros por status, profissional e cliente
- Notificações em tempo real via Supabase Realtime

### 💬 **Chat com IA**
- Assistente inteligente disponível 24/7
- Histórico de conversa persistente no Supabase
- Integração com Google Gemini 1.5 Flash
- Suporte a contexto e memória de conversas

### 👥 **Gestão de Clientes**
- CRUD completo com validação
- Histórico detalhado de agendamentos
- Sistema de contato integrado
- Relatórios individuais por cliente

### 💼 **Gerenciamento de Profissionais**
- Cadastro completo da equipe
- Controle de disponibilidade e horários
- Registro de especialidades e competências
- Dashboard de performance e avaliações

### 📊 **Relatórios e Analytics**
- Análise de agendamentos por período
- Faturamento mensal detalhado
- Performance individual da equipe
- Métricas de satisfação de clientes
- Gráficos interativos com Recharts

### 💰 **Sistema de Billing**
- Gestão de pagamentos
- Controle de faturamento
- Histórico financeiro
- Relatórios de receita

---

## 🔒 Segurança

- **Row Level Security (RLS)** ativo em todas as tabelas
- **Autenticação JWT** via Supabase
- **Validação de dados** no frontend e backend
- **HTTPS** obrigatório em produção
- **Variáveis de ambiente** protegidas

---

## 📖 Documentação Adicional

- [Arquitetura do Sistema](./ARCHITECTURE.md)
- [Guia de Deploy](./BUILD_AND_DEPLOY.md)
- [Configuração do Supabase](./SUPABASE_SETUP.md)
- [Guia de Testes](./TESTING_GUIDE.md)
- [Status do Projeto](./PROJECT_STATUS.md)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Eduardo RJ**

- GitHub: [@Eduardrj](https://github.com/Eduardrj)
- Projeto: [InterativiXBot](https://github.com/Eduardrj/interativixbot)

---

## 🙏 Agradecimentos

- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Google AI](https://ai.google.dev/)
- [Vercel](https://vercel.com/)
- [Capacitor](https://capacitorjs.com/)

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

[⬆ Voltar ao topo](#-interativixbot)

</div>
