# 🔒 Configuração Segura de Variáveis no Vercel

## ⚠️ IMPORTANTE: Segurança das Chaves de API

As chaves de API agora estão **protegidas no servidor** e NÃO são mais expostas no JavaScript do navegador.

## 📋 Variáveis a Configurar no Vercel

Acesse: https://vercel.com/eduardrj/interativixbot/settings/environment-variables

### 1. Remover Variáveis Antigas (INSEGURAS)
❌ Remova estas (se existirem):
- `VITE_GEMINI_API_KEY`
- `VITE_PERPLEXITY_API_KEY`

### 2. Adicionar Variáveis Novas (SEGURAS)
✅ Adicione estas (SEM prefixo VITE_):

**Nome:** `GEMINI_API_KEY`  
**Valor:** `AIzaSyDZkI15f2uKxEf6IM9TmrEV3Dx4PCsMAug`  
**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

**Nome:** `PERPLEXITY_API_KEY`  
**Valor:** `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`  
**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

### 3. Manter Variáveis Públicas
✅ Mantenha estas (são seguras):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (chave pública do Supabase)

## 🔄 Redeploy

Após configurar:
1. Vá em: https://vercel.com/eduardrj/interativixbot/deployments
2. Clique nos **⋯** do último deployment
3. Selecione **Redeploy**

## ✅ Como Funciona Agora

### Antes (INSEGURO) 🔴
```
Navegador → Chave exposta no JS → Google/Perplexity API
```

### Depois (SEGURO) ✅
```
Navegador → Servidor Vercel (com chave protegida) → Google/Perplexity API
```

## 🔍 Verificar Segurança

Após deploy, abra o DevTools no site e busque por:
- `GEMINI_API_KEY` - não deve aparecer ❌
- `PERPLEXITY_API_KEY` - não deve aparecer ❌

Se aparecer, significa que ainda está usando `VITE_` prefix!

---

**Status:** Aguardando configuração das variáveis no Vercel + Redeploy
