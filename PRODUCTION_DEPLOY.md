# 🚀 Guia de Deploy para Produção - InterativiXBot

## ✅ Checklist Pré-Deploy

### 1. Variáveis de Ambiente no Vercel

Acesse: https://vercel.com/dashboard → Seu Projeto → **Settings** → **Environment Variables**

Adicione as seguintes variáveis (para Production, Preview e Development):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
VITE_GEMINI_API_KEY=sua-chave-gemini
VITE_PERPLEXITY_API_KEY=sua-chave-perplexity (opcional)
```

### 2. Configurações do Supabase

1. **RLS (Row Level Security)** - Executar `supabase/schema.sql`
2. **Auth Settings** - Configurar URLs permitidas
3. **API Settings** - Verificar chaves

### 3. Build Local (Teste)

```bash
npm run build
npm run preview
```

Verifique se não há erros de build.

---

## 📦 Deploy Automático via Git

O deploy é automático a cada `git push`:

```bash
git add -A
git commit -m "chore: production ready"
git push origin main
```

O Vercel detecta o push e faz deploy automaticamente.

---

## 🔍 Verificar Deploy

1. Aguarde o build no dashboard do Vercel
2. Acesse a URL de produção: `https://interativixbot.vercel.app`
3. Teste as funcionalidades:
   - ✅ Login/Registro
   - ✅ Dashboard
   - ✅ Agendamentos
   - ✅ Chat com IA (Gemini)
   - ✅ Clientes/Profissionais

---

## 🐛 Troubleshooting

### Erro: "API key not configured"
- Verifique as variáveis de ambiente no Vercel
- Certifique-se que estão marcadas para Production

### Erro: "Failed to fetch"
- Verifique o CORS no `vercel.json`
- Confirme que as APIs estão respondendo

### Chat não funciona
- Verifique a chave do Gemini no console do navegador (F12)
- Teste localmente primeiro com `.env.local`

---

## 🔐 Segurança em Produção

✅ **Implementado:**
- RLS ativo no Supabase
- HTTPS obrigatório
- Variáveis de ambiente protegidas
- Validação de tokens JWT

⚠️ **Recomendações:**
- Rotacione chaves de API regularmente
- Monitore uso de APIs (quotas)
- Configure alertas no Vercel
- Habilite 2FA no GitHub e Vercel

---

## 📊 Monitoramento

### Vercel Analytics
- Acesse: Dashboard → Analytics
- Monitore: Page views, Performance, Errors

### Supabase Logs
- Acesse: Dashboard → Logs
- Monitore: Auth, Database, API

### Google Cloud Console (Gemini)
- Monitore uso da API
- Configure alertas de quota

---

## 🚀 Otimizações Aplicadas

✅ **Performance:**
- Code splitting automático (Vite)
- Lazy loading de rotas
- Memoização de componentes
- Build otimizado

✅ **SEO:**
- Meta tags configuradas
- Open Graph tags
- Sitemap gerado

✅ **UX:**
- Loading states
- Error boundaries
- Toast notifications
- Responsive design

---

## 📱 Deploy Mobile (Opcional)

### Android

```bash
npm run build
npx cap sync android
npx cap open android

# No Android Studio:
# Build → Generate Signed Bundle/APK
```

### iOS

```bash
npm run build
npx cap sync ios
npx cap open ios

# No Xcode:
# Product → Archive
```

---

## 🔄 Atualizações Futuras

Para atualizar a produção:

```bash
# 1. Faça suas alterações
# 2. Teste localmente
npm run dev

# 3. Build e teste
npm run build
npm run preview

# 4. Commit e push
git add -A
git commit -m "feat: sua feature"
git push origin main

# 5. Vercel faz deploy automaticamente
```

---

## 📚 URLs Importantes

- **Produção:** https://interativixbot.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub Repo:** https://github.com/Eduardrj/interativixbot

---

## ✅ Status Atual

- ✅ Frontend build sem erros
- ✅ Supabase configurado
- ✅ Chat com Gemini funcionando
- ✅ Autenticação ativa
- ✅ RLS implementado
- ⚠️ Perplexity (apenas em produção via API route)

---

## 🎯 Próximos Passos (Pós-Deploy)

1. Configurar domínio customizado no Vercel
2. Configurar SSL/HTTPS (automático no Vercel)
3. Adicionar Google Analytics
4. Configurar backup do Supabase
5. Implementar testes E2E
6. Configurar CI/CD avançado

---

<div align="center">

**🚀 Pronto para Produção!**

*Última atualização: Novembro 2025*

</div>
