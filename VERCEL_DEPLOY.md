# 🚀 Guia de Deploy - Vercel

## 📋 Resumo

A aplicação está configurada para rodar na Vercel com:
- **Frontend**: React/TypeScript (dist folder)
- **API**: Node.js serverless (api/ folder)
- **Domínio**: interativixbot.com.br
- **Backend**: Supabase PostgreSQL

---

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **interativixbot**
3. Vá para **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://pygaktlpmzsfsrydxjoe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=sua-api-key-aqui
VITE_API_URL=https://interativixbot.com.br
```

### 2. Configuração de Domínio

1. Na Vercel, vá para **Settings** → **Domains**
2. Adicione seu domínio: `interativixbot.com.br`
3. Configure os DNS records conforme instruções da Vercel

### 3. Deploy

#### Opção A: Via Git (Recomendado)
```bash
git add -A
git commit -m "Ready for Vercel deployment"
git push origin nova-branch
```
A Vercel fará deploy automático ao detectar push.

#### Opção B: Via CLI Vercel
```bash
npm i -g vercel
vercel --prod
```

---

## 📁 Estrutura do Deploy

```
interativixbot (Vercel Project)
│
├─ Frontend (React Build)
│  └─ dist/ (gerado por: npm run build)
│
├─ API (Node.js Serverless)
│  └─ api/
│     ├─ chat.ts
│     └─ appointments.ts
│
└─ Configuração
   └─ vercel.json (build settings + CORS)
```

---

## 🔄 Fluxo de Requisições

### Local (Development)
```
Cliente React (localhost:3001)
    ↓
API Node.js (localhost:3001/api/*)
    ↓
Supabase PostgreSQL
```

### Produção (Vercel)
```
Cliente React (https://interativixbot.com.br)
    ↓
API Node.js (https://interativixbot.com.br/api/*)
    ↓
Supabase PostgreSQL
```

---

## ✅ Checklist de Deploy

- [ ] **Variáveis de Ambiente**
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] VITE_GEMINI_API_KEY
  - [ ] VITE_API_URL

- [ ] **Build Local**
  - [ ] `npm run build` sem erros
  - [ ] `dist/` folder criado
  - [ ] Arquivos .js gerados

- [ ] **API Functions**
  - [ ] `api/chat.ts` funcional
  - [ ] `api/appointments.ts` funcional
  - [ ] CORS configurado em vercel.json

- [ ] **Domínio**
  - [ ] DNS apontando para Vercel
  - [ ] HTTPS ativo
  - [ ] Certificado SSL válido

- [ ] **Redirecionamentos**
  - [ ] `/api/*` → funciona
  - [ ] `/*` → index.html (SPA)

---

## 🔐 CORS Configuration

O arquivo `vercel.json` já configura CORS para aceitar requisições de:
- Origin: `https://interativixbot.com.br`
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: Content-Type, Authorization, X-Requested-With

---

## 📊 Monitoramento

### Via Dashboard Vercel
1. Acesse: https://vercel.com/dashboard
2. Selecione: **interativixbot**
3. Veja:
   - Logs em tempo real
   - Performance
   - Deployments anteriores

### Via CLI
```bash
vercel logs
```

---

## 🐛 Troubleshooting

### Problema: "CORS error"
- Verifique se VITE_API_URL está correto
- Confirme que vercel.json tem o domínio certo

### Problema: "API returns 404"
- Verifique se `api/` folder existe
- Confirme que `api/chat.ts` e `api/appointments.ts` estão corretos

### Problema: "Build falha"
- Execute localmente: `npm run build`
- Verifique se há erros de TypeScript
- Confirme que todas as dependências estão no package.json

### Problema: "Variáveis de ambiente não carregam"
- Redeploy o projeto na Vercel
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Aguarde 5 minutos para o cache CDN limpar

---

## 📝 Pré-Deploy Checklist

Antes de fazer deploy, execute localmente:

```bash
# 1. Build
npm run build

# 2. Verifique se dist/ foi criado
ls dist/

# 3. Verifique arquivos da API
ls api/

# 4. Commit e push
git add -A
git commit -m "Ready for production"
git push origin nova-branch
```

---

## 🚀 Após o Deploy

1. **Teste a aplicação**
   - Acesse: https://interativixbot.com.br
   - Registre uma conta
   - Crie um cliente
   - Verifique se dados salvam

2. **Teste a API**
   - Abra DevTools (F12)
   - Vá para Network
   - Crie um cliente
   - Verifique requisições para `/api/*`

3. **Teste o Chat**
   - Abra o chat IA
   - Peça um agendamento
   - Verifique se aparece em Agendamentos

---

## 📞 URLs Importantes

| Recurso | URL |
|---------|-----|
| App | https://interativixbot.com.br |
| API Chat | https://interativixbot.com.br/api/chat |
| API Appointments | https://interativixbot.com.br/api/appointments |
| Supabase Dashboard | https://app.supabase.com/projects |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## 🎉 Pronto!

Quando tudo estiver configurado:

1. Verifique em: https://vercel.com/dashboard/interativixbot
2. Status deve ser: ✅ **READY**
3. Acesse: https://interativixbot.com.br

---

**Dúvidas? Verifique:**
- `vercel.json` - configuração de deploy
- `.env.local` - variáveis locais
- `package.json` - scripts e dependências
- `api/` folder - funções Node.js

