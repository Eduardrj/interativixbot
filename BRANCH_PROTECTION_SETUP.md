# 🔒 Proteção da Branch Main - Guia Configuração

## Problema Detectado
```
⚠️  Your main branch isn't protected
Protect this branch from force pushing or deletion, 
or require status checks before merging.
```

## Solução: Ativar Branch Protection Rules

### 📋 Passo a Passo no GitHub

1. **Acesse o repositório no GitHub**
   - URL: https://github.com/Eduardrj/interativixbot

2. **Vá para Configurações**
   - Clique em **Settings** (Engrenagem)

3. **Acesse Branch Protection Rules**
   - Painel esquerdo: **Code and automation** → **Branches**
   - Clique em **Add rule** (Adicionar regra)

4. **Configure a Proteção para Main**

### ⚙️ Configurações Recomendadas

#### Padrão Mínimo (Segurança Básica)

```
Branch name pattern: main

✅ Require a pull request before merging
   ├─ Require approvals: 1
   ├─ Dismiss stale pull request approvals when new commits are pushed
   └─ Require review from code owners

✅ Require status checks to pass before merging
   ├─ Require branches to be up to date before merging
   └─ Status checks:
       ├─ build
       ├─ test
       └─ lint

✅ Require branches to be up to date before merging

✅ Include administrators
```

#### Configuração Recomendada (Alta Segurança)

```
Branch name pattern: main

✅ Require a pull request before merging
   ├─ Require approvals: 2  (ou 1 se for solo)
   ├─ Dismiss stale pull request approvals when new commits are pushed
   ├─ Require review from code owners
   └─ Restrict who can dismiss pull request reviews

✅ Require status checks to pass before merging
   ├─ Require branches to be up to date before merging
   └─ Status checks:
       ├─ build (Vercel)
       ├─ test (se houver CI)
       └─ lint (se houver CI)

✅ Require conversation resolution before merging

✅ Require branches to be up to date before merging

✅ Include administrators

✅ Allow force pushes: Ninguém
   (Mais seguro)

✅ Allow deletions: Desabilitar
   (Protege contra exclusão acidental)

✅ Lock branch: Desabilitar
   (A menos que queira congelá-la temporariamente)

✅ Require linear history
   (Mantém histórico limpo)
```

---

## 🔧 Alternativa: Via CLI (GitHub CLI)

Se preferir usar a linha de comando:

```bash
# Primeiro, verifique se tem o GitHub CLI instalado
gh --version

# Se não tiver, instale:
# https://cli.github.com/

# Login no GitHub (se necessário)
gh auth login

# Ativar proteção básica na main
gh api repos/Eduardrj/interativixbot/branches/main/protection \
  -X PUT \
  -f required_pull_request_reviews="{required_approvals_count:1}" \
  -f enforce_admins=true \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false

# Verificar a configuração
gh api repos/Eduardrj/interativixbot/branches/main/protection
```

---

## ✅ Checklist Final

Após aplicar a proteção, verifique:

- [ ] Branch `main` está protegida no GitHub
- [ ] Não é mais possível fazer force push
- [ ] Não é possível deletar a branch
- [ ] Pull Requests precisam de aprovação
- [ ] Status checks devem passar
- [ ] Histórico está atualizado

### Teste a Proteção

```bash
# Isso deve falhar agora:
git push --force origin main
# Erro esperado: "Pushing to protected branch"

# Isso também deve falhar:
git push origin :main  # Tentar deletar
# Erro esperado: Branch is protected
```

---

## 📚 Informações Adicionais

### Por que Proteger a Branch Main?

1. **Prevenção de Bugs** - Código deve ser revisto antes de mergear
2. **Rastreabilidade** - Histórico limpo de mudanças aprovadas
3. **Backup** - Protege contra exclusão acidental
4. **Qualidade** - Garante que testes passem
5. **Conformidade** - Seguir boas práticas de versionamento

### Branches Normalmente Protegidas

- ✅ `main` - Produção (SEMPRE proteger)
- ✅ `develop` - Desenvolvimento (proteger também)
- ⚠️ `staging` - Teste (proteger em equipes)
- ❌ `nova-branch` - Feature/experimental (não precisa)

### Configuração para Este Projeto

Para **InterativoBot**, recomendo:

```
main branch:
├─ ✅ Require PR + 1 approval
├─ ✅ Status checks (Vercel build)
├─ ✅ Require up-to-date
├─ ✅ Dismiss stale approvals
├─ ✅ No force push
└─ ✅ No deletions
```

---

## 🚀 Próximos Passos

1. Configure a proteção conforme instruções acima
2. Atualize seu workflow local:
   ```bash
   # Para fazer mudanças na main, use PR:
   git checkout -b feature/minha-feature
   git add .
   git commit -m "feat: Descrição"
   git push origin feature/minha-feature
   # Abra PR no GitHub
   ```

3. Documente a política de branches no `CONTRIBUTING.md`

---

## ❓ FAQ

**P: Posso fazer push direto na main depois de proteger?**  
R: Não. Você precisará fazer PR, aguardar aprovação e depois mergear.

**P: E se for urgente?**  
R: Admin pode contornar temporariamente, mas o ideal é manter protegida.

**P: Como adiciono status checks?**  
R: Configure CI/CD (GitHub Actions, Vercel) primeiro, depois aparece aqui.

**P: Posso proteger outras branches?**  
R: Sim! Recomendo também proteger `develop` com regras similares.

---

**Documentação Oficial:** https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

**Status:** ⏳ Aguardando configuração manual no GitHub  
**Prioridade:** 🔴 Alta - Essencial para produção  
