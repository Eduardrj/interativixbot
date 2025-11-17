# 📦 Guia de Build e Produção

## 🎯 Resumo

Esta seção descreve como fazer build da aplicação e preparar para produção na Vercel.

---

## 🏗️ Arquitetura de Deploy

### Estrutura de Pastas
```
interativixbot/
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   └── ...
├── api/                      ← Funções Node.js (Vercel Serverless)
│   ├── chat.ts
│   └── appointments.ts
├── dist/                      ← Gerado por build (Frontend React)
│   ├── index.html
│   ├── assets/
│   └── ...
├── vercel.json               ← Configuração Vercel
├── vite.config.ts            ← Configuração build
└── package.json
```

---

## 🔨 Build Local

### 1. Preparar Ambiente
```bash
# Instale dependências (se não fez ainda)
npm install

# Copie variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas credenciais
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_GEMINI_API_KEY=...
# VITE_API_URL=https://interativixbot.com.br (para produção)
```

### 2. Build para Produção
```bash
# Build (cria pasta dist/)
npm run build

# Verificar resultado
ls -la dist/

# Deve conter:
# - index.html
# - assets/ (com arquivos .js, .css)
```

### 3. Testar Build Localmente
```bash
# Preview do build
npm run preview

# Acesse: http://localhost:4173
```

---

## 🚀 Deploy na Vercel

### Pré-requisitos
- [ ] Conta GitHub
- [ ] Conta Vercel (conectada ao GitHub)
- [ ] Repositório GitHub com o código
- [ ] Branch `nova-branch` com código atualizado

### Opção 1: Deploy Automático (Recomendado)

#### 1.1 Preparar Código
```bash
cd /workspaces/interativixbot

# Verifique status
git status

# Commit tudo
git add -A
git commit -m "Ready for production deployment"

# Push para GitHub
git push origin nova-branch
```

#### 1.2 Conectar Vercel
1. Acesse: https://vercel.com/dashboard
2. Clique em **"New Project"**
3. Conecte seu repositório GitHub
4. Selecione a branch: `nova-branch`
5. Clique em **"Import"**

#### 1.3 Configurar Variáveis de Ambiente
Na página do projeto na Vercel:
1. Vá para **Settings** → **Environment Variables**
2. Adicione (ou copie de `.env.local`):
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_GEMINI_API_KEY
   VITE_API_URL=https://interativixbot.com.br
   CORS_ORIGIN=https://interativixbot.com.br
   ```
3. Clique em **"Save"**

#### 1.4 Deploy
Vercel fará deploy automaticamente!
- Aguarde ~3-5 minutos
- Status deve mudar para ✅ **READY**

### Opção 2: Deploy via CLI Vercel

#### 2.1 Instalar CLI
```bash
npm i -g vercel
```

#### 2.2 Conectar Conta
```bash
vercel login
```

#### 2.3 Deploy
```bash
# Development (teste)
vercel

# Production (vai para interativixbot.com.br)
vercel --prod
```

#### 2.4 Configurar Variáveis (via CLI)
```bash
vercel env add VITE_SUPABASE_URL
# Cole sua URL do Supabase

vercel env add VITE_SUPABASE_ANON_KEY
# Cole sua chave anon do Supabase

vercel env add VITE_GEMINI_API_KEY
# Cole sua API key do Gemini

vercel env add VITE_API_URL
# Cole: https://interativixbot.com.br

vercel env add CORS_ORIGIN
# Cole: https://interativixbot.com.br
```

---

## 🌐 Configurar Domínio

### Via Vercel Dashboard
1. Acesse projeto no Vercel
2. Vá para **Settings** → **Domains**
3. Adicione seu domínio: `interativixbot.com.br`
4. Siga as instruções para configurar DNS

### Configuração de DNS (Registrador)
Após adicionar domínio no Vercel, você receberá registros DNS:
- Type: CNAME
- Name: @ (ou interativixbot)
- Value: Provided by Vercel

---

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Build local passa sem erros: `npm run build`
- [ ] Arquivos em `dist/` foram gerados
- [ ] `.env.local` tem todas as variáveis
- [ ] Código comitado no GitHub

### Configuração Vercel
- [ ] Projeto criado no Vercel
- [ ] Git conectado (auto-deploy ativado)
- [ ] Branch correta selecionada
- [ ] Variáveis de ambiente configuradas:
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] VITE_GEMINI_API_KEY
  - [ ] VITE_API_URL
  - [ ] CORS_ORIGIN

### Domínio
- [ ] Domínio adicionado em Vercel
- [ ] DNS configurado no registrador
- [ ] HTTPS ativo (automático do Vercel)

### Testes em Produção
- [ ] Acesse: https://interativixbot.com.br
- [ ] Página carrega corretamente
- [ ] Logo, menu e layout aparecem
- [ ] DevTools (F12) → Network: sem erros 403/404/500

---

## ✅ Pós-Deploy

### 1. Testar Funcionalidades

#### 1.1 Autenticação
```
1. Vá para https://interativixbot.com.br
2. Clique em "Registrar"
3. Crie uma conta
4. Email deve aparecer no Header
```

#### 1.2 CRUD de Clientes
```
1. Menu → Clientes
2. Clique em "+ Adicionar Cliente"
3. Preencha formulário
4. Clique em "Salvar Cliente"
5. Cliente deve aparecer na lista
6. Atualize página (F5)
7. Cliente deve ainda estar lá ✅
```

#### 1.3 Chat IA
```
1. Menu → Chat IA (ou abra chatbot)
2. Digite: "Gostaria de agendar uma massagem amanhã às 14h"
3. IA deve criar agendamento
4. Vá para Agendamentos
5. Agendamento deve estar lá ✅
```

#### 1.4 API Endpoints
Abra DevTools (F12) → Network e verifique:
```
GET  https://interativixbot.com.br/api/chat     ← 200 OK
POST https://interativixbot.com.br/api/appointments ← 200 OK
```

### 2. Monitorar Logs
```bash
# Ver logs em tempo real
vercel logs

# Ver logs específicos
vercel logs --tail
```

### 3. Checar Performance
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto
3. Vá para **Analytics** (se disponível)
4. Verifique:
   - Response time
   - Error rate
   - Edge cache

---

## 🐛 Troubleshooting

### Build Falha na Vercel
```
Erro: "Cannot find module 'X'"

Solução:
1. Verifique package.json
2. Execute localmente: npm install && npm run build
3. Commit e push novamente
```

### Variáveis não Carregam
```
Erro: "API key not configured"

Solução:
1. Vá para Vercel Dashboard
2. Settings → Environment Variables
3. Confirme todas as variáveis
4. Clique em "Redeploy"
```

### CORS Error
```
Erro: "Access to XMLHttpRequest blocked by CORS policy"

Solução:
1. Verifique CORS_ORIGIN no Vercel
2. Confirme vercel.json tem headers corretos
3. Redeploy: vercel --prod
```

### API Retorna 404
```
Erro: "Cannot POST /api/chat"

Solução:
1. Verifique se api/ folder existe
2. Confirme api/chat.ts e api/appointments.ts existem
3. Redeploy: vercel --prod
```

---

## 📊 Monitoramento Contínuo

### Configurar Alertas (Opcional)
1. Vercel Dashboard → Settings → Notifications
2. Habilite alertas para:
   - Build failures
   - Production errors
   - High error rates

### Logs Recomendados
```bash
# Ver todos os logs
vercel logs

# Apenas erros
vercel logs | grep error

# Últimas 100 linhas
vercel logs --tail --lines 100
```

---

## 🔄 CI/CD Automático

Vercel já fornece CI/CD automático:
1. Push no GitHub → Vercel detecta
2. Vercel faz build automaticamente
3. Se build sucede → faz deploy
4. Se build falha → enviá notificação

### Visualizar CI/CD
1. Acesse projeto no Vercel
2. Vá para **Deployments**
3. Veja histórico de builds

---

## 📝 Variáveis de Ambiente por Ambiente

### Development (.env.local)
```env
VITE_SUPABASE_URL=https://pygaktlpmzsfsrydxjoe.supabase.co
VITE_SUPABASE_ANON_KEY=seu-chave-anon
VITE_GEMINI_API_KEY=sua-api-key
VITE_API_URL=http://localhost:3001
```

### Production (Vercel)
```env
VITE_SUPABASE_URL=https://pygaktlpmzsfsrydxjoe.supabase.co
VITE_SUPABASE_ANON_KEY=seu-chave-anon
VITE_GEMINI_API_KEY=sua-api-key
VITE_API_URL=https://interativixbot.com.br
CORS_ORIGIN=https://interativixbot.com.br
```

---

## 🎯 Processo de Deploy Completo

```
1. Fazer alterações no código
   ↓
2. Commit: git add -A && git commit -m "message"
   ↓
3. Push: git push origin nova-branch
   ↓
4. Vercel detecta push (auto-deploy)
   ↓
5. Vercel faz npm run build
   ↓
6. Vercel publica dist/ em interativixbot.com.br
   ↓
7. Aplicação fica disponível online ✅
```

---

## 🎉 Conclusão

Sua aplicação está pronta para produção!

- ✅ Frontend React buildado
- ✅ API Node.js deployada
- ✅ CORS configurado
- ✅ Variáveis de ambiente setadas
- ✅ Domínio apontando para Vercel

**Deploy agora**: `vercel --prod` ou `git push origin nova-branch`

