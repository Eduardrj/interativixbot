# ⚡ Proteção de Branch Main - Guia Rápido

## 🎯 Resumo Executivo

```
Problema:     ⚠️  Your main branch isn't protected
Solução:      🔒 Ativar proteção no GitHub
Tempo:        ⏱️  5 minutos
Dificuldade:  ✅ Muito fácil
```

---

## 📱 3 Passos Rápidos (Via Web)

### Passo 1: Ir para Settings
```
https://github.com/Eduardrj/interativixbot/settings/branches
```

### Passo 2: Clicar em "Add rule"
- Branch name pattern: `main`

### Passo 3: Marcar essas opções ✅

```
☑ Require a pull request before merging
  └─ Require approvals: 1
  
☑ Require status checks to pass before merging
  └─ Require branches to be up to date: ✓
  
☑ Require branches to be up to date before merging

☑ Include administrators

☑ Restrict who can push to matching branches (opcional)
```

**Clique em "Create"**

---

## 🖥️ Via Terminal (Alternativa)

```bash
# Se tiver GitHub CLI instalado:
bash scripts/protect-main-branch.sh

# Ou fazer manualmente:
gh api repos/Eduardrj/interativixbot/branches/main/protection \
  -X PUT -f required_pull_request_reviews='{"required_approvals_count":1}' \
  -f enforce_admins=true -f allow_force_pushes=false
```

---

## ✅ Verificar se Funcionou

```bash
# Isso deve FALHAR agora:
git push --force origin main
# Erro: "Protect this branch from force pushing or deletion"

# Isso também deve FALHAR:
git push origin :main  # Tentar deletar
# Erro: "Cannot delete protected branch"
```

---

## 🔐 O que foi Protegido?

| Ação | Antes | Depois |
|------|-------|--------|
| Push direto para main | ✅ Permitido | ❌ Bloqueado |
| Force push | ✅ Permitido | ❌ Bloqueado |
| Deletar main | ✅ Permitido | ❌ Bloqueado |
| PR sem aprovação | ✅ Permitido | ❌ Bloqueado |
| Admin faz bypass | ✅ Sim | ✅ Sim (controle) |

---

## 📝 Novo Fluxo de Trabalho

**Antes (inseguro):**
```bash
git checkout main
git pull
# fazer mudanças
git push origin main  # ⚠️ Direto na produção!
```

**Depois (seguro):**
```bash
git checkout -b feature/minha-feature
git add .
git commit -m "feat: descrição"
git push origin feature/minha-feature

# No GitHub:
# 1. Abrir Pull Request
# 2. Aguardar aprovação (1 review)
# 3. Mergear

# Resultado:
# ✅ Histórico limpo
# ✅ Tudo rastreado
# ✅ Sem surpresas em produção
```

---

## 🚨 Troubleshooting

### Problema: "Permission Denied"
**Solução:** Você precisa ter permissão de admin no repo
- Peça ao owner (você é Eduardrj) para confirmar permissões

### Problema: "Resource not accessible"
**Solução:** O token pode ter permissões limitadas
```bash
# Faça login novamente:
gh auth logout
gh auth login
# Selecione: HTTPS + Web browser login
```

### Problema: "Cannot create rule"
**Solução:** A proteção já existe ou há conflito
```bash
# Ver proteções existentes:
gh api repos/Eduardrj/interativixbot/branches/main/protection
```

---

## 📚 Documentos Relacionados

- [Guia Completo](./BRANCH_PROTECTION_SETUP.md) - Detalhado
- [GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches) - Oficial

---

## ⏰ Status Atual

```
Repositório:  InterativoBot
Branch:       main
Status:       ⚠️  NÃO PROTEGIDA
Ação:         🔄 Aguardando configuração
Responsável:  👤 Eduardrj
```

**Próximo passo:** Configure agora usando um dos 3 métodos acima!

---

**⏱️ Tempo estimado para resolução: 5 minutos**  
**🎯 Resultado: Produção 100% protegida**
