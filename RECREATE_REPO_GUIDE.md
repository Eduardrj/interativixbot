# 🔄 Guia: Recriar Repositório Sem Referência ao Template

## ⚠️ ATENÇÃO: Leia Tudo Antes de Executar

Este processo vai:
- ✅ Manter todo o código e histórico de commits
- ✅ Remover a referência "generated from google-gemini/aistudio-repository-template"
- ❌ Perder: Issues, Pull Requests, Stars, Forks, Watchers
- ❌ Requer reconfigurações: Webhooks, Secrets, Colaboradores

---

## 📋 Passos Completos

### **1. Backup Completo do Repositório Local**

```bash
# Já está no diretório correto
cd /workspaces/interativixbot

# Verificar que está tudo commitado
git status

# Criar backup local (opcional, mas recomendado)
cd ..
cp -r interativixbot interativixbot-backup-$(date +%Y%m%d)
cd interativixbot

# Verificar remote atual
git remote -v
```

---

### **2. No GitHub: Deletar o Repositório Atual**

⚠️ **CUIDADO:** Esta ação é IRREVERSÍVEL!

1. Acesse: https://github.com/Eduardrj/interativixbot
2. Vá em **Settings** (última opção no menu superior)
3. Role até o final da página
4. Seção **Danger Zone** → clique em **Delete this repository**
5. Digite: `Eduardrj/interativixbot`
6. Confirme com sua senha
7. Aguarde a exclusão (pode levar alguns segundos)

---

### **3. Criar Novo Repositório (SEM Template)**

1. Acesse: https://github.com/new
2. **Repository name:** `interativixbot`
3. **Description:** `🤖 Plataforma Inteligente de Gestão e Agendamentos com IA`
4. **Visibility:** Public (ou Private, sua escolha)
5. ⚠️ **NÃO marque** nenhuma opção:
   - ❌ NÃO adicione README
   - ❌ NÃO adicione .gitignore
   - ❌ NÃO adicione license
   - ❌ NÃO escolha template
6. Clique em **Create repository**

---

### **4. Atualizar Remote e Fazer Push**

```bash
# Remover remote antigo
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/Eduardrj/interativixbot.git

# Verificar
git remote -v

# Push de todo o histórico
git push -u origin main --force

# Push de todas as branches (se existirem)
git push origin --all

# Push de todas as tags (se existirem)
git push origin --tags
```

---

### **5. Verificar no GitHub**

1. Acesse: https://github.com/Eduardrj/interativixbot
2. Verifique que:
   - ✅ Código está completo
   - ✅ Histórico de commits preservado
   - ✅ README.md aparece na página inicial
   - ✅ NÃO aparece "generated from template"

---

### **6. Reconfigurar Integrações**

#### **Vercel**

Se o deploy estava automático, reconecte:

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto ou crie novo
3. **Import Git Repository**
4. Selecione: `Eduardrj/interativixbot`
5. Configure variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
6. Deploy

#### **GitHub Actions** (se tiver)

As actions devem funcionar automaticamente, mas verifique:

```bash
# Próximo push vai triggar as actions
git commit --allow-empty -m "chore: trigger CI/CD"
git push origin main
```

#### **Secrets e Environment Variables**

No GitHub, reconfigure:
1. **Settings** → **Secrets and variables** → **Actions**
2. Adicione novamente os secrets necessários

---

### **7. Atualizar Links Quebrados (se houver)**

Se você tinha links externos apontando para o repo antigo, atualize-os:
- Documentação
- Sites
- Badges
- Integrações

---

## 🔍 Verificação Final

Execute estes comandos para confirmar:

```bash
# Verificar que não há referência ao template
gh repo view --json templateRepository

# Deve retornar:
# {
#   "templateRepository": null
# }

# Verificar remote
git remote -v

# Verificar último commit
git log -1 --oneline

# Verificar status
git status
```

---

## 📦 Comandos Completos (Copy-Paste)

Se você quer executar tudo de uma vez (após deletar o repo no GitHub):

```bash
# 1. Verificar estado atual
cd /workspaces/interativixbot
git status
git remote -v

# 2. Remover e adicionar novo remote
git remote remove origin
git remote add origin https://github.com/Eduardrj/interativixbot.git

# 3. Push completo
git push -u origin main --force
git push origin --all
git push origin --tags

# 4. Verificar
gh repo view --json templateRepository
git remote -v

# 5. Trigger deploy
git commit --allow-empty -m "chore: repository recreated without template reference"
git push origin main
```

---

## 🆘 Rollback (se algo der errado)

Se você fez backup, pode voltar:

```bash
# Restaurar do backup
cd /workspaces
rm -rf interativixbot
cp -r interativixbot-backup-YYYYMMDD interativixbot
cd interativixbot

# Verificar
git log -1
git remote -v
```

---

## ✅ Checklist

Antes de começar:
- [ ] Todo código está commitado (`git status` limpo)
- [ ] Você tem acesso admin ao repositório
- [ ] Você anotou todas as integrações ativas (Vercel, etc)
- [ ] Você salvou todos os Secrets/Environment Variables
- [ ] Você entendeu que Issues/PRs/Stars serão perdidos

Após recriar:
- [ ] Código push foi bem-sucedido
- [ ] `gh repo view --json templateRepository` retorna `null`
- [ ] README aparece corretamente no GitHub
- [ ] Vercel reconectado e fazendo deploy
- [ ] Secrets reconfigurados
- [ ] Links externos atualizados (se houver)

---

## 🎯 Resultado Esperado

Após seguir todos os passos:

**Antes:**
```
✗ interativixbot
  generated from google-gemini/aistudio-repository-template
```

**Depois:**
```
✓ interativixbot
  🤖 Plataforma Inteligente de Gestão e Agendamentos com IA
```

---

## 💡 Alternativa Mais Simples

Se você não se importa com perder o histórico de commits, pode:

1. Baixar o código como ZIP
2. Criar novo repo sem template
3. Fazer commit inicial com todo o código

Mas isso perde todo o histórico de desenvolvimento.

---

<div align="center">

**⚠️ Execute com cuidado e certifique-se de ter backups!**

*Última atualização: Novembro 2025*

</div>
