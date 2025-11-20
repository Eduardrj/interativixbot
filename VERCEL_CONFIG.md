# ✅ Configuração Vercel - Variáveis de Ambiente

## 📋 Variáveis Já Configuradas

- ✅ `VITE_SUPABASE_URL` = https://pygaktlpmzsfsrydxjoe.supabase.co
- ✅ `VITE_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- ✅ `VITE_GEMINI_API_KEY` = AIzaSyDZkI15f2uKxEf6IM9TmrEV3Dx4PCsMAug
- ✅ `VITE_API_URL` = https://interativixbot.com.br
- ✅ `CORS_ORIGIN` = https://interativixbot.com.br
- ✅ `DEFAULT_GEMINI_MODEL` = gemini-2.5-flash-native-audio-dialog

## ⚠️ Falta Adicionar

Adicione esta variável no Vercel Dashboard:

**Nome:** `VITE_PERPLEXITY_API_KEY`  
**Valor:** `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`  
**Ambientes:** ✅ Production, ✅ Preview, ✅ Development

## 🚀 Como Adicionar

1. Acesse: https://vercel.com/eduardrj/interativixbot/settings/environment-variables
2. Clique em **"Add New"**
3. Preencha:
   - **Key:** `VITE_PERPLEXITY_API_KEY`
   - **Value:** `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`
   - **Environments:** Marque todos (Production, Preview, Development)
4. Clique em **"Save"**

## 🔄 Redeploy

Após adicionar a variável:

1. Vá para: https://vercel.com/eduardrj/interativixbot/deployments
2. Clique nos **três pontos** do último deployment
3. Selecione **"Redeploy"**
4. Aguarde o build completar (~2-3 minutos)

## ✅ Verificar

Após o redeploy, acesse: https://interativixbot.vercel.app

Teste o chat com os modelos:
- ✅ Gemini 1.5 Flash
- ✅ Gemini 2.5 Flash  
- ✅ Gemini 2.5 Pro
- ✅ Perplexity Sonar
- ✅ Perplexity Sonar Pro

---

**Status:** Aguardando adição de `VITE_PERPLEXITY_API_KEY` + Redeploy
