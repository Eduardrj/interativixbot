# Correção: Erro ao Criar Empresa

## Problemas Identificados

O erro "Erro ao salvar empresa. Tente novamente." ocorre por **DOIS problemas**:

### Problema 1: RLS Policy de INSERT Ausente

No arquivo `supabase/migrations/001_companies_multi_tenant.sql`, foram criadas policies para:
- ✅ SELECT (linha 58): "Users can see their companies"
- ✅ UPDATE (linha 64): "Users can update their companies"
- ❌ INSERT: **AUSENTE** - Causa do erro

Sem a policy de INSERT, mesmo usuários autenticados não conseguem criar empresas no Supabase, pois o RLS bloqueia a operação.

### Problema 2: Foreign Key Incorreta ⚠️ **CRÍTICO**

Na migration `001_companies_multi_tenant.sql` linha 26:
```sql
user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
```

❌ **ERRO**: A tabela referenciada deveria ser `auth.users(id)`, não `public.users(id)`

O Supabase Auth gerencia usuários no schema `auth.users`, não `public.users`. Isso causa erro ao tentar inserir na tabela `company_users` após criar a empresa.

## Solução

### Passo 1: Executar Migrations no Supabase (ORDEM IMPORTANTE!)

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**

#### Migration 008: Adicionar RLS Policies

Copie e execute o conteúdo de: `supabase/migrations/008_fix_companies_insert_policy.sql`

```sql
-- Adicionar policy de INSERT para companies
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Adicionar policy de INSERT para company_users
DROP POLICY IF EXISTS "Users can add themselves to companies" ON public.company_users;
CREATE POLICY "Users can add themselves to companies" ON public.company_users
    FOR INSERT 
    TO authenticated
    WITH CHECK (user_id = auth.uid());
```

#### Migration 009: Corrigir Foreign Key ⚠️ **CRÍTICO**

Copie e execute o conteúdo de: `supabase/migrations/009_fix_company_users_fkey.sql`

```sql
-- Remover constraint antiga (incorreta)
ALTER TABLE public.company_users 
DROP CONSTRAINT IF EXISTS company_users_user_id_fkey;

-- Adicionar nova constraint correta apontando para auth.users
ALTER TABLE public.company_users
ADD CONSTRAINT company_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

5. Clique em **Run** (ou Ctrl+Enter) para cada migration
6. Aguarde a confirmação: "Success. No rows returned"

### Passo 2: Verificar as Policies

No Supabase Dashboard:
1. Vá em **Database** → **Policies**
2. Selecione a tabela `companies`
3. Verifique que agora existem 3 policies:
   - ✅ Users can see their companies (SELECT)
   - ✅ Users can update their companies (UPDATE)
   - ✅ **Users can create companies (INSERT)** ← Nova
4. Selecione a tabela `company_users`
5. Verifique que existe:
   - ✅ Users can see their company relationships (SELECT)
   - ✅ **Users can add themselves to companies (INSERT)** ← Nova

### Passo 3: Testar a Criação de Empresa

1. Faça logout e login novamente no sistema
2. Tente criar uma nova empresa
3. O erro deve desaparecer e a empresa deve ser criada com sucesso

## Como Funciona

### Fluxo de Criação de Empresa

1. **Usuário autenticado** chama `addCompany()`
2. **INSERT na tabela companies**:
   - RLS verifica policy "Users can create companies"
   - Policy permite: `WITH CHECK (true)` para qualquer usuário autenticado
   - ✅ Empresa criada com sucesso
3. **INSERT na tabela company_users**:
   - RLS verifica policy "Users can add themselves to companies"
   - Policy permite: `WITH CHECK (user_id = auth.uid())`
   - Garante que o usuário só pode adicionar a si mesmo
   - ✅ Relação user ↔ company criada como "owner"

### Segurança

As policies são seguras porque:
- ✅ Apenas usuários autenticados podem criar empresas
- ✅ Usuários só podem se adicionar como membros (não podem adicionar outros)
- ✅ Cada empresa tem isolamento multi-tenant via RLS
- ✅ Usuários só veem empresas às quais pertencem

## Próximos Passos

Após corrigir o erro:

1. **Criar Empresa de Teste**
   - Nome: "Minha Empresa Demo"
   - Documento: 12.345.678/0001-90
   - Indústria: Beleza e Estética

2. **Carregar Dados de Exemplo**
   - Abrir arquivo: `supabase/seed_data_exemplo.sql`
   - Substituir `YOUR_COMPANY_ID` pelo UUID da empresa criada
   - Executar no SQL Editor do Supabase
   - Verificar 50 registros inseridos

3. **Testar Sistema**
   - Dashboard deve mostrar métricas
   - Clientes, serviços e profissionais devem aparecer
   - Agendamentos devem funcionar
   - Financeiro deve exibir transações

## Troubleshooting

### Se o erro persistir após executar a migration:

**1. Verificar se a migration foi executada:**
```sql
SELECT * FROM public.companies LIMIT 1;
-- Se retornar erro de permissão, a policy não foi aplicada
```

**2. Verificar policies manualmente:**
```sql
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('companies', 'company_users')
ORDER BY tablename, policyname;
```

**3. Limpar cache do navegador:**
- Pressione Ctrl+Shift+Delete
- Limpe cache e cookies
- Feche e reabra o navegador

**4. Verificar autenticação:**
- Abra DevTools (F12) → Console
- Execute: `supabase.auth.getUser()`
- Deve retornar objeto com `data.user.id`

**5. Logs detalhados:**
- No DevTools → Console
- Procure por: "Erro ao adicionar empresa:"
- Copie o erro completo para análise

## Referências

- **Arquivo de Contexto**: `contexts/CompaniesContext.tsx`
- **Função com erro**: `addCompany` (linhas 153-183)
- **Migration original**: `supabase/migrations/001_companies_multi_tenant.sql`
- **Migration de correção**: `supabase/migrations/008_fix_companies_insert_policy.sql`
- **Documentação RLS**: https://supabase.com/docs/guides/auth/row-level-security

---

**Status**: ✅ Solução implementada - Aguardando execução da migration no Supabase
