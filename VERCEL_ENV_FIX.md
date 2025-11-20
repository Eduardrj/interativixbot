# 🚀 Guia de Configuração de Variáveis de Ambiente no Vercel

## ❌ Erro Atual

```
Environment Variable "VITE_SUPABASE_URL" references Secret "vite_supabase_url", which does not exist.
```

Este erro ocorre quando o Vercel está esperando um Secret que não foi criado ou foi referenciado incorretamente.

---

## ✅ Solução: Configurar Variáveis de Ambiente no Vercel

### **Opção 1: Via Dashboard do Vercel (Recomendado)**

#### 1. Acesse o Dashboard
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto `interativixbot`
3. Vá em **Settings** → **Environment Variables**

#### 2. Adicione as Variáveis (sem Secrets)

Adicione cada variável como **Plain Text** (não como Secret):

| Nome da Variável | Valor | Ambientes |
|------------------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `sua-chave-anon-key-completa` | Production, Preview, Development |
| `VITE_GEMINI_API_KEY` | `sua-chave-gemini-api` | Production, Preview, Development |

**⚠️ IMPORTANTE:** 
- **NÃO** marque como "Secret" (cause o erro atual)
- Use **Plain Text** para variáveis que começam com `VITE_`
- Selecione **todos os ambientes** (Production, Preview, Development)

#### 3. Salve e Redeploy

Após adicionar as variáveis:
1. Clique em **Save**
2. Vá em **Deployments**
3. Clique nos **⋮** do último deployment
4. Selecione **Redeploy**

---

### **Opção 2: Via CLI do Vercel**

#### 1. Instale a CLI do Vercel

```bash
npm i -g vercel
```

#### 2. Faça Login

```bash
vercel login
```

#### 3. Adicione as Variáveis

```bash
# Supabase URL
vercel env add VITE_SUPABASE_URL production
# Cole o valor quando solicitado: https://seu-projeto.supabase.co

# Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production
# Cole sua chave anon key

# Gemini API Key
vercel env add VITE_GEMINI_API_KEY production
# Cole sua chave Gemini

# Repita para preview e development se necessário
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_URL development
```

#### 4. Redeploy

```bash
vercel --prod
```

---

### **Opção 3: Remover Referências a Secrets**

Se você criou Secrets por engano, remova-os:

#### Via Dashboard:
1. **Settings** → **Environment Variables**
2. Encontre variáveis com ícone 🔒 (Secret)
3. Clique em **⋮** → **Remove**
4. Adicione novamente como **Plain Text**

#### Via CLI:
```bash
# Listar secrets
vercel secrets ls

# Remover secret (se existir)
vercel secrets rm vite_supabase_url

# Adicionar como env normal (não secret)
vercel env add VITE_SUPABASE_URL production
```

---

## 📋 Como Obter os Valores

### **1. Supabase URL e Anon Key**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### **2. Google Gemini API Key**

1. Acesse: https://ai.google.dev/
2. Clique em **Get API Key**
3. Crie/selecione um projeto
4. Copie a chave gerada → `VITE_GEMINI_API_KEY`

---

## 🔍 Verificar Configuração

### Via Dashboard:
1. **Settings** → **Environment Variables**
2. Verifique se aparecem **3 variáveis** sem ícone 🔒
3. Todas devem estar marcadas para **Production**, **Preview** e **Development**

### Via CLI:
```bash
# Listar todas as env vars
vercel env ls

# Você deve ver:
# VITE_SUPABASE_URL (Production, Preview, Development)
# VITE_SUPABASE_ANON_KEY (Production, Preview, Development)
# VITE_GEMINI_API_KEY (Production, Preview, Development)
```

---

## 🐛 Troubleshooting

### Erro persiste após adicionar variáveis?

1. **Limpe o cache do build:**
   ```bash
   # No dashboard: Deployments → ⋮ → Redeploy → Clear Cache
   ```

2. **Verifique o vercel.json:**
   ```bash
   cat vercel.json
   ```
   
   Certifique-se que não há referências a secrets:
   ```json
   {
     "buildCommand": "npm run build",
     "env": {
       "VITE_SUPABASE_URL": "@vite_supabase_url"  // ❌ REMOVA ISSO
     }
   }
   ```

3. **Force um novo deployment:**
   ```bash
   git commit --allow-empty -m "chore: trigger rebuild"
   git push origin main
   ```

### Variáveis não estão sendo lidas?

Certifique-se que o prefixo `VITE_` está correto:
- ✅ `VITE_SUPABASE_URL` - exposta no browser
- ❌ `SUPABASE_URL` - não exposta (server-only)

Vite só expõe variáveis que começam com `VITE_` para o código client-side.

---

## 📄 Exemplo de .env.local (Desenvolvimento)

Crie um arquivo `.env.local` na raiz do projeto para desenvolvimento:

```bash
# .env.local (NÃO COMMITAR)

# Supabase
VITE_SUPABASE_URL=https://pygaktlpmzsfsrydxjoe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini AI
VITE_GEMINI_API_KEY=AIzaSyD...

# Perplexity (opcional)
PERPLEXITY_API_KEY=pplx-...
```

Adicione ao `.gitignore`:
```
.env.local
.env*.local
```

---

## ✅ Checklist Final

Após configurar, verifique:

- [ ] 3 variáveis adicionadas no Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY)
- [ ] Todas as variáveis estão como **Plain Text** (sem 🔒)
- [ ] Todas marcadas para **Production, Preview, Development**
- [ ] Nenhum Secret referenciado no código ou vercel.json
- [ ] Deployment refeito após adicionar variáveis
- [ ] Build passou sem erros
- [ ] Aplicação carrega corretamente em produção

---

## 🔗 Links Úteis

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase API Settings](https://supabase.com/dashboard/project/_/settings/api)
- [Google AI Studio](https://ai.google.dev/)

---

## 🆘 Suporte

Se o erro persistir:

1. Verifique os logs de build no Vercel
2. Compartilhe o erro completo
3. Verifique se as chaves estão válidas no Supabase/Google

---

<div align="center">

**✅ Problema resolvido? Marque este guia como útil!**

*Última atualização: Novembro 2025*

</div>
