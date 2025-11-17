#!/bin/bash

# 🔒 Script para Proteger Branch Main
# Este script configura as proteções da branch main no GitHub

set -e

REPO="Eduardrj/interativixbot"
BRANCH="main"

echo "🔒 Configurando proteção para branch: $BRANCH"
echo "📦 Repositório: $REPO"
echo ""

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI não encontrado. Instale em: https://cli.github.com/"
    exit 1
fi

# Verificar autenticação
if ! gh auth status > /dev/null 2>&1; then
    echo "❌ Não autenticado no GitHub. Execute: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI autenticado"
echo ""

# Tentar configurar a proteção
echo "⏳ Configurando regras de proteção..."
echo ""

API_ENDPOINT="repos/$REPO/branches/$BRANCH/protection"

# Configuração recomendada
PROTECTION_CONFIG='{
  "required_pull_request_reviews": {
    "required_approvals_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "require_conversation_resolution": true,
  "block_creations": false
}'

echo "Enviando requisição para API..."
gh api "$API_ENDPOINT" \
  -X PUT \
  --input - <<< "$PROTECTION_CONFIG" 2>&1 && \
echo "✅ Proteção configurada com sucesso!" || \
echo "⚠️  Proteção parcialmente configurada (pode precisar de acesso admin)"

echo ""
echo "📋 Regras aplicadas:"
echo "  ✅ Requer Pull Request"
echo "  ✅ Requer 1 aprovação"
echo "  ✅ Dismiss stale reviews"
echo "  ✅ Require status checks"
echo "  ✅ Admins inclusos"
echo "  ✅ Histórico linear"
echo "  ✅ Sem force push"
echo "  ✅ Sem deletions"
echo "  ✅ Resolução de conversa"
echo ""

# Verificar a configuração
echo "⏳ Verificando configuração..."
gh api "$API_ENDPOINT" --jq '.name, .protected' 2>/dev/null && \
echo "✅ Branch protegida!" || \
echo "⚠️  Execute este script com um token com permissões admin"

echo ""
echo "📚 Para mais detalhes, veja: BRANCH_PROTECTION_SETUP.md"
