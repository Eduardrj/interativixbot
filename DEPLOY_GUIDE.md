# 🚀 Guia de Deploy para Produção - Interativix Bot

## 📋 Pré-requisitos

- [x] Conta na Vercel (https://vercel.com)
- [x] Conta no Supabase (https://supabase.com)
- [x] Repositório GitHub conectado
- [x] Migrations 002-007 executadas no Supabase
- [x] Build local validado (npm run build)

---

## 🔧 Passo 1: Configurar Supabase Production

### 1.1. Criar Projeto de Produção no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Configure:
   - **Name**: `interativixbot-production`
   - **Database Password**: Escolha uma senha forte (salve em gerenciador de senhas)
   - **Region**: `South America (São Paulo)` (melhor latência para Brasil)
   - **Pricing Plan**: Free tier (suficiente para começar)
4. Aguarde ~2 minutos para provisionar

### 1.2. Executar Migrations

1. No projeto criado, vá em **SQL Editor**
2. Execute as migrations **NA ORDEM**:
   ```
   001_multi_tenant.sql (base - já deve existir)
   002_crm.sql
   003_financial.sql
   004_permissions.sql
   005_kanban.sql
   006_integrations.sql
   007_analytics.sql
   ```
3. ✅ Verifique se todas rodaram sem erros

### 1.3. Obter Credenciais

1. Vá em **Project Settings** → **API**
2. Copie:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (chave longa)
3. 📝 Salve essas credenciais (vamos usar no Vercel)

### 1.4. Configurar Authentication

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** provider
3. Configure **Site URL**: `https://interativixbot.vercel.app` (atualizar depois com domínio custom)
4. Configure **Redirect URLs**:
   ```
   https://interativixbot.vercel.app
   https://interativixbot.vercel.app/**
   ```

---

## 🌐 Passo 2: Deploy na Vercel

### 2.1. Importar Projeto

1. Acesse https://vercel.com/new
2. Clique em **Import Git Repository**
3. Selecione: `Eduardrj/interativixbot`
4. Clique em **Import**

### 2.2. Configurar Build Settings

Na tela de configuração, verifique:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

✅ **Não clique em Deploy ainda!** Precisamos configurar variáveis de ambiente primeiro.

### 2.3. Adicionar Environment Variables

Clique em **Environment Variables** e adicione:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` (do passo 1.3) | Production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (do passo 1.3) | Production |
| `VITE_GEMINI_API_KEY` | Sua chave do Gemini AI | Production |
| `VITE_API_URL` | `https://interativixbot.vercel.app` | Production |

**Como obter Gemini API Key:**
1. Acesse https://aistudio.google.com/apikey
2. Clique em "Get API Key"
3. Copie a chave gerada

### 2.4. Deploy!

1. Clique em **Deploy**
2. Aguarde ~2-3 minutos
3. ✅ Vercel vai:
   - Instalar dependências
   - Rodar `npm run build`
   - Otimizar assets
   - Publicar na URL: `https://interativixbot.vercel.app`

---

## 🌍 Passo 3: Domínio Customizado (Opcional)

### 3.1. Adicionar Domínio na Vercel

1. No dashboard do projeto, vá em **Settings** → **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio: `interativixbot.com.br`
4. Vercel vai mostrar os registros DNS necessários

### 3.2. Configurar DNS

No seu provedor de domínio (Registro.br, GoDaddy, Hostinger, etc):

**Opção A - Domínio Raiz (interativixbot.com.br):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Opção B - Subdomínio (app.interativixbot.com.br):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### 3.3. Aguardar Propagação

- Tempo: 5 minutos a 48 horas (geralmente 10-30 minutos)
- Verificar em: https://dnschecker.org

### 3.4. Atualizar Supabase

Volte no Supabase e atualize:
1. **Authentication** → **URL Configuration**
2. **Site URL**: `https://interativixbot.com.br`
3. **Redirect URLs**: Adicione o novo domínio

---

## ✅ Passo 4: Validação e Testes

### 4.1. Smoke Tests

Acesse a aplicação e teste:

- [ ] **Carregamento**: Página abre sem erros
- [ ] **Login**: Criar conta e fazer login
- [ ] **Criar Empresa**: Cadastrar primeira empresa
- [ ] **Dashboard**: Visualizar dados iniciais
- [ ] **Agendamentos**: Criar um agendamento teste
- [ ] **Clientes**: Adicionar cliente
- [ ] **Financeiro**: Registrar transação
- [ ] **Analytics**: Verificar se KPIs carregam
- [ ] **Real-time**: Abrir em 2 abas e verificar sincronização

### 4.2. Performance Checks

```bash
# Lighthouse Score (rodar no DevTools)
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 85
```

### 4.3. Monitoramento

Configurar (opcional mas recomendado):

**Vercel Analytics** (já incluído gratuitamente):
- Dashboard automático de tráfego
- Web Vitals tracking

**Sentry** (erros em produção):
```bash
npm install @sentry/react
```

**Google Analytics** (comportamento de usuários):
- Adicionar GA4 tracking code no index.html

---

## 🔐 Passo 5: Segurança

### 5.1. Verificar RLS (Row Level Security)

No Supabase, verifique que **todas as tabelas** têm RLS ativo:
```sql
-- Rodar no SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;
```

✅ Deve retornar 0 resultados (todas protegidas)

### 5.2. Configurar Rate Limiting

Na Vercel, vá em **Settings** → **Edge Config**:
- Limite: 100 requests/minuto por IP
- Previne ataques DDoS básicos

### 5.3. HTTPS

✅ Vercel provê SSL/TLS automático (Let's Encrypt)
✅ Supabase usa HTTPS por padrão

---

## 📊 Passo 6: Monitoramento Contínuo

### 6.1. Vercel Dashboard

Monitore:
- **Deployments**: Cada push no GitHub gera deploy automático
- **Analytics**: Pageviews, usuários únicos, países
- **Logs**: Erros de runtime

### 6.2. Supabase Dashboard

Monitore:
- **Database**: Uso de espaço (~500 MB no free tier)
- **API Requests**: ~50.000/mês no free tier
- **Bandwidth**: ~2 GB/mês no free tier
- **Auth Users**: Ilimitado no free tier

### 6.3. Alertas

Configure email alerts para:
- Deploy failures na Vercel
- Database usage > 80% no Supabase
- API quota > 80%

---

## 🔄 Workflow de Deploy Contínuo

### Após configuração inicial:

1. **Desenvolver localmente**:
   ```bash
   npm run dev
   ```

2. **Testar build**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Commit & Push**:
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

4. **Deploy Automático**: 
   - Vercel detecta push
   - Roda build automaticamente
   - Deploy em ~2 minutos
   - Preview URL gerada

5. **Validar em Staging**:
   - Vercel gera URL de preview: `https://interativixbot-xxxxx.vercel.app`
   - Teste antes de promover

6. **Promover para Produção**:
   - Se tudo OK, merge vai automaticamente para produção
   - URL principal atualizada: `https://interativixbot.vercel.app`

---

## 🐛 Troubleshooting Comum

### Erro: "Invalid API Key"
**Solução**: Verificar se variáveis de ambiente estão corretas na Vercel

### Erro: "Network Error" no login
**Solução**: Verificar se Supabase URL está correto e RLS está configurado

### Build falha com "Type error"
**Solução**: 
```bash
npm run build  # Testar localmente
npx tsc --noEmit  # Verificar erros TypeScript
```

### Dashboard não carrega dados
**Solução**: 
1. Verificar se migrations foram executadas
2. Abrir DevTools → Console e ver erros
3. Verificar se usuário está autenticado

### Real-time não funciona
**Solução**: Verificar se Realtime está habilitado no Supabase (Database → Replication)

---

## 📈 Próximos Passos (Pós-Deploy)

1. **Onboarding**: Criar tutorial para primeiros usuários
2. **Backup**: Configurar backup automático do Supabase
3. **Escalabilidade**: Monitorar e planejar upgrade conforme crescimento
4. **Features**: Implementar Sprints 9A (Advanced Analytics) e 9B (Notifications)
5. **Marketing**: SEO, landing page otimizada, Google My Business
6. **Support**: Implementar sistema de tickets/chat de suporte

---

## 📞 Suporte

**Documentação:**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Vite: https://vite.dev

**Issues:**
- GitHub Issues: https://github.com/Eduardrj/interativixbot/issues

---

✅ **Deploy Completo!** Sua aplicação está no ar e acessível globalmente.
