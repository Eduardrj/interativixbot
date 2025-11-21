# 🚀 ROADMAP - Interativix Bot - Arquitetura Completa

## 📊 Status Atual vs Ideal

### ✅ JÁ IMPLEMENTADO
- [x] Autenticação (Supabase Auth)
- [x] Clientes (CRUD básico)
- [x] Profissionais (CRUD básico)
- [x] Serviços (CRUD básico)
- [x] Agendamentos (CRUD + Kanban)
- [x] Dashboard (indicadores básicos)
- [x] Chat IA (Gemini)
- [x] Proteção de dados (RLS Supabase)

### 🔨 A IMPLEMENTAR (Prioridade)

#### FASE 1: Estrutura Base Multi-Tenant (Alta Prioridade)
- [ ] **Módulo Empresas**
  - [ ] Tabela `companies` no Supabase
  - [ ] CRUD de empresas
  - [ ] Upload de logo
  - [ ] Configurações por empresa
  - [ ] Vínculo usuário-empresa

#### FASE 2: CRM e Relacionamento (Alta Prioridade)
- [ ] **CRM Completo**
  - [ ] Status de cliente (Lead, Ativo, Inativo, VIP)
  - [ ] Histórico de interações
  - [ ] Tags e segmentação
  - [ ] Score de engajamento
  - [ ] Funil de vendas
  - [ ] Notas e observações

#### FASE 3: Financeiro (Alta Prioridade)
- [ ] **Módulo Financeiro**
  - [ ] Tabela `financial_transactions`
  - [ ] Registro entrada/saída
  - [ ] Categorias de movimentação
  - [ ] Relatórios por período
  - [ ] Dashboard financeiro
  - [ ] Fluxo de caixa

#### FASE 4: Permissões Avançadas (Média Prioridade)
- [ ] **Sistema de Permissões**
  - [ ] Matriz de permissões por role
  - [ ] Permissões granulares (create, read, update, delete)
  - [ ] Middleware de autorização
  - [ ] UI condicional por permissão

#### FASE 5: Integrações Externas (Média Prioridade)
- [ ] **Google Agenda**
  - [ ] OAuth2 Google
  - [ ] Sincronização bidirecional
  - [ ] Webhook de eventos
  - [ ] Configuração por profissional

- [ ] **Notificações Multi-Canal**
  - [ ] WhatsApp (Twilio/Evolution API)
  - [ ] Email (Resend/SendGrid)
  - [ ] SMS (Twilio)
  - [ ] Push notifications (FCM)
  - [ ] Configuração de templates

- [ ] **Pagamentos**
  - [ ] Stripe/Mercado Pago
  - [ ] Checkout
  - [ ] Webhooks de confirmação
  - [ ] Assinaturas

#### FASE 6: Cadastro Automático e IA (Média Prioridade)
- [ ] **Cadastro Automático**
  - [ ] Extração de dados do chat
  - [ ] Validação automática
  - [ ] Deduplicação inteligente
  - [ ] Enriquecimento de dados

#### FASE 7: Relatórios e Analytics (Baixa Prioridade)
- [ ] **Relatórios Avançados**
  - [ ] Exportação PDF/Excel
  - [ ] Gráficos interativos (Chart.js/Recharts)
  - [ ] Relatórios customizáveis
  - [ ] Agendamento de relatórios

- [ ] **Backup Automático**
  - [ ] Backup diário Supabase
  - [ ] Storage externo (S3)
  - [ ] Versionamento
  - [ ] Restore automático

#### FASE 8: Mobile e PWA (Baixa Prioridade)
- [ ] **PWA (Progressive Web App)**
  - [ ] Service Worker
  - [ ] Offline mode
  - [ ] Install prompt
  - [ ] App icons

- [ ] **App Mobile Nativo (Capacitor)**
  - [ ] Build Android
  - [ ] Build iOS
  - [ ] Push notifications nativas
  - [ ] Câmera/GPS access

#### FASE 9: Internacionalização (Baixa Prioridade)
- [ ] **Multi-idioma**
  - [ ] i18n setup (react-i18next)
  - [ ] Tradução PT-BR/EN/ES
  - [ ] Detecção automática de idioma
  - [ ] Switch de idioma na UI

- [ ] **Acessibilidade**
  - [ ] ARIA labels
  - [ ] Navegação por teclado
  - [ ] Contraste de cores (WCAG AA)
  - [ ] Screen reader support

#### FASE 10: API Aberta (Baixa Prioridade)
- [ ] **REST API Pública**
  - [ ] Documentação OpenAPI/Swagger
  - [ ] API Keys por empresa
  - [ ] Rate limiting
  - [ ] Webhooks para eventos
  - [ ] SDK JavaScript/Python

---

## 🗄️ ESTRUTURA DE DADOS IDEAL

### Tabelas a Criar

```sql
-- EMPRESAS (Multi-tenant)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  document TEXT, -- CNPJ/CPF
  industry TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RELAÇÃO USUÁRIO-EMPRESA
CREATE TABLE company_users (
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL, -- admin, manager, attendant
  PRIMARY KEY (company_id, user_id)
);

-- CRM STATUS
CREATE TABLE client_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES clients(id),
  status TEXT NOT NULL, -- lead, active, inactive, vip
  tags TEXT[],
  score INTEGER DEFAULT 0,
  last_interaction TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- HISTÓRICO DE INTERAÇÕES
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES clients(id),
  type TEXT NOT NULL, -- call, email, whatsapp, appointment
  content TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- FINANCEIRO
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  type TEXT NOT NULL, -- income, expense
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  appointment_id UUID REFERENCES appointments(id),
  payment_method TEXT,
  date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- CATEGORIAS FINANCEIRAS
CREATE TABLE financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- income, expense
  icon TEXT,
  color TEXT
);

-- PERMISSÕES
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL, -- clients, services, appointments, etc
  actions TEXT[] NOT NULL, -- create, read, update, delete
  UNIQUE(role, resource)
);

-- INTEGRAÇÕES
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  type TEXT NOT NULL, -- google_calendar, whatsapp, stripe
  credentials JSONB,
  settings JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICAÇÕES
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT, -- info, success, warning, error
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TEMPLATES DE MENSAGEM
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  channel TEXT NOT NULL, -- whatsapp, email, sms
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT[], -- {{client_name}}, {{service}}, etc
  active BOOLEAN DEFAULT TRUE
);

-- DISPONIBILIDADE DE PROFISSIONAIS
CREATE TABLE professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id),
  day_of_week INTEGER, -- 0-6 (domingo-sábado)
  start_time TIME,
  end_time TIME,
  break_start TIME,
  break_end TIME
);

-- AVALIAÇÕES
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  appointment_id UUID REFERENCES appointments(id),
  client_id UUID REFERENCES clients(id),
  professional_id UUID REFERENCES professionals(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Tecnológica

#### Frontend
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: TailwindCSS
- **State**: Context API + React Query (para cache)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts/Chart.js
- **i18n**: react-i18next
- **PWA**: Vite PWA Plugin

#### Backend
- **Database**: Supabase (PostgreSQL)
- **API**: Vercel Edge Functions
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

#### Mobile
- **Framework**: Capacitor 6
- **Targets**: Android + iOS
- **Plugins**: Camera, Push Notifications, Geolocation

#### Integrações
- **IA**: Google Gemini 2.5
- **Calendário**: Google Calendar API
- **WhatsApp**: Evolution API / Twilio
- **Email**: Resend / SendGrid
- **SMS**: Twilio
- **Pagamento**: Stripe / Mercado Pago
- **Analytics**: Google Analytics 4

---

## 📱 FLUXO IDEAL DO USUÁRIO

### 1️⃣ Onboarding (Primeira vez)
```
┌─────────────────────────────────────────────┐
│ 1. Empresa se cadastra                      │
│    - Nome, CNPJ, ramo, logo                 │
│    - Plano (free/premium)                   │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│ 2. Configura perfil                         │
│    - Horários de funcionamento              │
│    - Canais de atendimento                  │
│    - Preferências de notificação            │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│ 3. Cadastra profissionais                   │
│    - Nome, email, especialidades            │
│    - Serviços que executa                   │
│    - Disponibilidade semanal                │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│ 4. Cadastra serviços                        │
│    - Nome, descrição, preço, duração        │
│    - Vincula a profissionais                │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│ 5. Configura integrações (opcional)         │
│    - Google Calendar                        │
│    - WhatsApp Business                      │
│    - Gateway de pagamento                   │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│ 6. Sistema pronto! 🎉                       │
│    - Link de agendamento gerado             │
│    - Chatbot configurado                    │
└─────────────────────────────────────────────┘
```

### 2️⃣ Dia-a-dia Operacional
```
CLIENTE ENTRA → Chat/Link → IA identifica → Cria registro
                                            ↓
                            Agendamento criado → Notifica profissional
                                            ↓
                            Profissional atende → Move no Kanban
                                            ↓
                            Finaliza serviço → Registra financeiro
                                            ↓
                            Cliente avalia → Score CRM atualizado
                                            ↓
                            Dashboard atualiza → Relatórios em tempo real
```

---

## 🎯 PRIORIZAÇÃO (Próximos Sprints)

### Sprint 1 (Semana 1-2) - Multi-Tenant Base
- [ ] Criar tabela `companies`
- [ ] Criar tabela `company_users`
- [ ] Implementar CRUD de empresas
- [ ] Adicionar seletor de empresa na UI
- [ ] Atualizar RLS policies para multi-tenant

### Sprint 2 (Semana 3-4) - CRM Básico
- [ ] Criar tabelas CRM
- [ ] Status de clientes
- [ ] Histórico de interações
- [ ] Tags e filtros
- [ ] UI de CRM

### Sprint 3 (Semana 5-6) - Financeiro
- [ ] Criar tabelas financeiras
- [ ] CRUD de transações
- [ ] Dashboard financeiro
- [ ] Relatórios básicos
- [ ] Vincular agendamentos a receitas

### Sprint 4 (Semana 7-8) - Permissões
- [ ] Sistema de permissões
- [ ] Middleware de autorização
- [ ] UI condicional
- [ ] Testes de segurança

### Sprint 5+ - Integrações e Avançados
- Google Calendar
- WhatsApp
- PWA/Mobile
- Multi-idioma

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs Técnicos
- ✅ Uptime > 99.9%
- ✅ Latência API < 200ms
- ✅ Lighthouse Score > 90
- ✅ Cobertura de testes > 80%
- ✅ Zero vulnerabilidades críticas

### KPIs de Negócio
- 📈 Conversão chat → agendamento > 30%
- 📈 Taxa de retenção > 85%
- 📈 NPS > 8
- 📈 Tempo médio de atendimento < 5min
- 📈 ROI por cliente > 5x

---

## 🔐 SEGURANÇA E COMPLIANCE

### LGPD (Lei Geral de Proteção de Dados)
- [x] Consentimento explícito
- [ ] Termo de privacidade
- [ ] Anonimização de dados
- [ ] Direito ao esquecimento
- [ ] Exportação de dados
- [ ] Log de acessos

### Segurança
- [x] HTTPS obrigatório
- [x] JWT tokens
- [x] RLS Supabase
- [ ] 2FA (Two-Factor Authentication)
- [ ] Rate limiting API
- [ ] Criptografia de dados sensíveis
- [ ] Backup automático diário
- [ ] Disaster recovery plan

---

## 📞 CONTATO E SUPORTE

**Próximos Passos Imediatos:**
1. Revisar e aprovar roadmap
2. Definir prioridades do Sprint 1
3. Configurar ambiente de testes
4. Iniciar desenvolvimento multi-tenant

🚀 **Vamos começar?**
