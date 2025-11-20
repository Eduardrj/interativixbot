# 🤖 Prompt para Construção do InterativiXBot com IA

## 📋 Prompt Completo para IA (Claude, GPT-4, Gemini)

```
Crie um sistema completo de gestão empresarial chamado "InterativiXBot" com as seguintes especificações:

## 🎯 OBJETIVO PRINCIPAL
Desenvolver uma plataforma web e mobile moderna para gestão de agendamentos, clientes, profissionais e chat com IA, utilizando React + TypeScript + Supabase + Google Gemini AI.

## 🏗️ ARQUITETURA TÉCNICA

### Stack Frontend
- React 19 com TypeScript 5.8
- Vite 6 como build tool
- Tailwind CSS para estilização responsiva
- Recharts para visualização de dados
- React Hot Toast para notificações
- Capacitor 7 para builds nativos (iOS/Android)

### Stack Backend
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Google Gemini 1.5 Flash para IA conversacional
- Row Level Security (RLS) ativo em todas as tabelas
- API Routes serverless (Vercel Functions)

### Deployment
- Vercel para hosting principal
- GitHub Actions para CI/CD
- npm como gerenciador de pacotes

## 📊 BANCO DE DADOS (Supabase)

Crie as seguintes tabelas com RLS habilitado:

### 1. users
- id (UUID, PK)
- email (STRING, UNIQUE)
- full_name (STRING)
- avatar_url (STRING, NULLABLE)
- role (ENUM: 'admin', 'professional', 'client')
- created_at (TIMESTAMP)

### 2. clients
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- name (STRING)
- email (STRING)
- phone (STRING)
- address (TEXT, NULLABLE)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)

### 3. professionals
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- name (STRING)
- email (STRING)
- phone (STRING)
- specialties (JSONB)
- availability (JSONB)
- hourly_rate (DECIMAL)
- created_at (TIMESTAMP)

### 4. services
- id (UUID, PK)
- name (STRING)
- description (TEXT)
- duration (INTEGER) -- em minutos
- price (DECIMAL)
- active (BOOLEAN)
- created_at (TIMESTAMP)

### 5. appointments
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- client_id (UUID, FK -> clients.id)
- professional_id (UUID, FK -> professionals.id)
- service_id (UUID, FK -> services.id)
- date (DATE)
- time (TIME)
- status (ENUM: 'pending', 'confirmed', 'completed', 'cancelled')
- notes (TEXT, NULLABLE)
- payment_status (ENUM: 'pending', 'paid', 'refunded')
- payment_amount (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 6. chat_messages
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- role (ENUM: 'user', 'assistant')
- content (TEXT)
- created_at (TIMESTAMP)

### 7. billing
- id (UUID, PK)
- appointment_id (UUID, FK -> appointments.id)
- amount (DECIMAL)
- status (ENUM: 'pending', 'paid', 'cancelled')
- payment_method (STRING, NULLABLE)
- paid_at (TIMESTAMP, NULLABLE)
- created_at (TIMESTAMP)

## 🎨 COMPONENTES PRINCIPAIS

### 1. Dashboard.tsx
- Cards de resumo: Total de agendamentos, Clientes ativos, Faturamento mensal, Profissionais
- Gráfico de agendamentos dos últimos 30 dias (Recharts)
- Lista de próximos agendamentos
- Alertas e notificações

### 2. KanbanBoard.tsx
- 4 colunas: Pendente, Confirmado, Concluído, Cancelado
- Drag-and-drop de cards entre colunas
- Atualização de status em tempo real
- Filtros por profissional, cliente e data

### 3. Appointments.tsx
- CRUD completo de agendamentos
- Modal de criação/edição
- Seleção de cliente, profissional, serviço
- Date/Time picker
- Validações de conflito de horário

### 4. Clients.tsx
- CRUD completo de clientes
- Busca e filtros
- Modal de detalhes com histórico de agendamentos
- Exportação de dados (CSV)

### 5. Professionals.tsx
- CRUD completo de profissionais
- Gestão de especialidades (tags)
- Configuração de disponibilidade (horários por dia da semana)
- Dashboard de performance individual

### 6. Services.tsx
- CRUD completo de serviços
- Configuração de duração e preço
- Status ativo/inativo
- Associação com profissionais

### 7. Reports.tsx
- Filtros por período (dia, semana, mês, ano)
- Gráficos de faturamento (linha/área)
- Gráfico de agendamentos por status (pizza)
- Performance por profissional (barras)
- Exportação de relatórios (PDF/CSV)

### 8. Billing.tsx
- Lista de pagamentos pendentes
- Histórico de pagamentos
- Gráfico de receita mensal
- Filtros por status e período

### 9. Chat com IA (Sidebar/Modal)
- Input de mensagem
- Histórico de conversa (scroll infinito)
- Indicador de "digitando..."
- Persistência no Supabase
- Integração com Google Gemini API

### 10. Settings.tsx
- Configurações de perfil
- Configurações de notificações
- Configurações de tema (claro/escuro)
- Gerenciamento de API keys

## 🔐 CONTEXTOS REACT

Crie os seguintes contextos:

### AuthContext
- Login/Logout com Supabase Auth
- Recuperação de senha
- Gerenciamento de sessão
- Proteção de rotas

### AppointmentsContext
- CRUD de agendamentos
- Filtros e busca
- Atualização de status
- Realtime subscriptions

### ClientsContext
- CRUD de clientes
- Busca e filtros

### ProfessionalsContext
- CRUD de profissionais
- Gestão de disponibilidade

### ServicesContext
- CRUD de serviços

## 🤖 INTEGRAÇÃO COM IA

### API Route: /api/chat.ts
- Endpoint POST para envio de mensagens
- Integração com Google Gemini 1.5 Flash
- Contexto de sistema personalizado:
  ```
  Você é um assistente virtual do InterativiXBot, uma plataforma de gestão de agendamentos.
  Ajude os usuários com informações sobre agendamentos, clientes, profissionais e serviços.
  Seja cordial, objetivo e profissional.
  ```
- Salvamento de mensagens no Supabase
- Limitação de taxa (rate limiting)

## 🎨 DESIGN & UX

### Paleta de Cores
- Primary: #3B82F6 (azul)
- Success: #10B981 (verde)
- Warning: #F59E0B (amarelo)
- Danger: #EF4444 (vermelho)
- Dark: #1F2937
- Light: #F3F4F6

### Layout
- Sidebar fixa à esquerda com navegação
- Header com busca global e perfil do usuário
- Conteúdo principal responsivo
- Modais para criação/edição
- Toast notifications no topo direito

### Responsividade
- Desktop: sidebar visível, layout de 3 colunas
- Tablet: sidebar colapsável, layout de 2 colunas
- Mobile: menu hamburger, layout de 1 coluna

## 🔒 SEGURANÇA

### Row Level Security (RLS) Policies

Para cada tabela, implemente:

1. **SELECT**: Usuários só veem seus próprios dados
2. **INSERT**: Usuários autenticados podem inserir com seu user_id
3. **UPDATE**: Usuários só editam seus próprios registros
4. **DELETE**: Usuários só deletam seus próprios registros

Exemplo para `appointments`:
```sql
-- SELECT
CREATE POLICY "Users can view own appointments"
ON appointments FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own appointments"
ON appointments FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete own appointments"
ON appointments FOR DELETE
USING (auth.uid() = user_id);
```

## 📱 CAPACITOR (MOBILE)

Configure o Capacitor para:
- Splash screen personalizado
- Ícone do app
- Notificações push (Firebase Cloud Messaging)
- Acesso à câmera (para avatar)
- Compartilhamento (share API)

## 🚀 DEPLOY

### Vercel
- Configure variáveis de ambiente:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_GEMINI_API_KEY
- Build command: `npm run build`
- Output directory: `dist`

### Mobile
- Android: `npx cap sync android && npx cap open android`
- iOS: `npx cap sync ios && npx cap open ios`

## 📝 VALIDAÇÕES

Implemente validações para:
- Email válido
- Telefone no formato correto
- Datas futuras para agendamentos
- Conflitos de horário
- Campos obrigatórios
- Valores numéricos positivos

## 🧪 TESTES

Inclua:
- Unit tests para funções utilitárias
- Integration tests para contextos
- E2E tests para fluxos principais (Cypress/Playwright)

## 📚 DOCUMENTAÇÃO

Gere:
- README.md completo
- ARCHITECTURE.md com diagrama de componentes
- API.md documentando rotas
- DEPLOY.md com guia de deploy

## 🎯 ENTREGAS ESPERADAS

1. Código-fonte completo e funcional
2. Schema SQL do Supabase
3. Arquivo .env.example com variáveis necessárias
4. README com instruções de instalação
5. Build para produção testado
6. Configuração de Capacitor para mobile
7. Documentação técnica
8. Testes básicos implementados

## ⚡ PERFORMANCE

Otimize para:
- Lazy loading de rotas
- Memoização de componentes pesados
- Debounce em buscas
- Virtual scrolling em listas grandes
- Compressão de imagens
- Code splitting
- Caching de requisições

## 🌐 INTERNACIONALIZAÇÃO (Opcional)

Prepare estrutura para:
- Português (pt-BR) como padrão
- Inglês (en-US) como secundário
- Formatação de datas/moedas por região

---

## 💡 DIFERENCIAIS

Adicione se possível:
- PWA (Progressive Web App)
- Dark mode toggle
- Exportação de relatórios em PDF
- Integração com Google Calendar
- Envio de lembretes por email/SMS
- Sistema de avaliações (rating)
- Dashboard de analytics avançado
- Backup automático

---

Desenvolva o projeto seguindo as melhores práticas de:
- Clean Code
- SOLID principles
- Componentização
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Semantic Versioning

Priorize: clareza de código, manutenibilidade, segurança e experiência do usuário.
```

---

## 🎨 Prompt Simplificado (Versão Curta)

```
Crie uma plataforma web completa de gestão de agendamentos com:

TECH STACK:
- React 19 + TypeScript + Vite
- Supabase (PostgreSQL + Auth + Realtime)
- Google Gemini AI para chat
- Tailwind CSS + Recharts
- Capacitor para mobile

FUNCIONALIDADES:
1. Dashboard com métricas e gráficos
2. Kanban de agendamentos (drag-and-drop)
3. CRUD de clientes, profissionais e serviços
4. Chat com IA integrado
5. Relatórios e analytics
6. Sistema de billing
7. Autenticação segura com RLS

COMPONENTES:
- Dashboard, KanbanBoard, Appointments, Clients, Professionals, Services, Reports, Billing, Settings
- Contextos: Auth, Appointments, Clients, Professionals, Services

BANCO DE DADOS:
Tabelas: users, clients, professionals, services, appointments, chat_messages, billing

SEGURANÇA:
- Row Level Security ativo
- Validações frontend/backend
- JWT authentication

Entregue código completo, funcional e documentado.
```

---

## 🔧 Como Usar Este Prompt

### 1. **Claude (Anthropic)**
- Cole o prompt completo no Claude
- Use o modo "Artifacts" para visualizar código
- Itere pedindo refinamentos específicos

### 2. **GPT-4 (OpenAI)**
- Cole o prompt no ChatGPT com GPT-4
- Use "Continue" se a resposta for cortada
- Peça arquivos específicos individualmente

### 3. **Gemini (Google)**
- Cole o prompt no Google AI Studio
- Use "Generate code" para snippets
- Exporte para projeto completo

### 4. **GitHub Copilot Chat**
- Use `/new` seguido do prompt
- Peça para gerar workspace completo
- Refine componente por componente

---

## 📊 Checklist de Validação

Após gerar o código, valide:

- [ ] Todas as dependências estão no package.json
- [ ] Variáveis de ambiente documentadas
- [ ] Schema SQL executável no Supabase
- [ ] RLS policies implementadas
- [ ] Todos os componentes principais criados
- [ ] Contextos funcionando corretamente
- [ ] Chat com IA operacional
- [ ] Build sem erros (`npm run build`)
- [ ] README completo e atualizado
- [ ] TypeScript sem erros (`npx tsc --noEmit`)

---

## 🎯 Dicas para Melhores Resultados

1. **Seja específico**: Quanto mais detalhes, melhor o resultado
2. **Itere**: Peça refinamentos em partes específicas
3. **Valide progressivamente**: Teste cada funcionalidade gerada
4. **Combine IAs**: Use Claude para arquitetura, GPT-4 para código, Gemini para documentação
5. **Use exemplos**: Forneça screenshots ou wireframes quando possível

---

## 📚 Recursos Complementares

- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

---

<div align="center">

**🤖 Prompt criado para maximizar a eficiência na construção do InterativiXBot**

*Última atualização: Novembro 2025*

</div>
