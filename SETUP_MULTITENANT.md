# 🚀 SETUP MULTI-TENANT - SUPABASE

## Instruções para executar a migração

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard
- Projeto: `interativixbot`
- Navegue para **SQL Editor**

### 2. Execute a migração
Copie e cole o conteúdo do arquivo `supabase/migrations/001_companies_multi_tenant.sql` no SQL Editor e execute.

**OU**

Execute os comandos abaixo diretamente:

```sql
-- Criar tabela companies
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    document TEXT UNIQUE,
    industry TEXT,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address JSONB,
    settings JSONB DEFAULT '{
        "business_hours": {
            "monday": {"open": "09:00", "close": "18:00"},
            "tuesday": {"open": "09:00", "close": "18:00"},
            "wednesday": {"open": "09:00", "close": "18:00"},
            "thursday": {"open": "09:00", "close": "18:00"},
            "friday": {"open": "09:00", "close": "18:00"},
            "saturday": {"open": "09:00", "close": "13:00"},
            "sunday": {"open": null, "close": null}
        },
        "notifications": {
            "email": true,
            "sms": true,
            "whatsapp": true
        },
        "timezone": "America/Sao_Paulo",
        "language": "pt-BR",
        "currency": "BRL"
    }'::jsonb,
    plan TEXT DEFAULT 'free',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela company_users
CREATE TABLE IF NOT EXISTS public.company_users (
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'attendant',
    permissions JSONB DEFAULT '{
        "clients": ["create", "read", "update", "delete"],
        "services": ["create", "read", "update", "delete"],
        "appointments": ["create", "read", "update", "delete"],
        "professionals": ["read"],
        "financial": ["read"],
        "reports": ["read"],
        "settings": []
    }'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (company_id, user_id)
);

-- Adicionar company_id às tabelas existentes
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_company_users_user ON public.company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_services_company ON public.services(company_id);
CREATE INDEX IF NOT EXISTS idx_professionals_company ON public.professionals(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_company ON public.appointments(company_id);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Policies para companies
DROP POLICY IF EXISTS "Users can see their companies" ON public.companies;
CREATE POLICY "Users can see their companies" ON public.companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their companies" ON public.companies;
CREATE POLICY "Users can update their companies" ON public.companies
    FOR UPDATE USING (
        id IN (
            SELECT company_id FROM public.company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Policies para company_users
DROP POLICY IF EXISTS "Users can see their company relationships" ON public.company_users;
CREATE POLICY "Users can see their company relationships" ON public.company_users
    FOR SELECT USING (user_id = auth.uid());

-- Atualizar policies das tabelas existentes
DROP POLICY IF EXISTS "Users can see clients from their companies" ON public.clients;
CREATE POLICY "Users can see clients from their companies" ON public.clients
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert clients in their companies" ON public.clients;
CREATE POLICY "Users can insert clients in their companies" ON public.clients
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update clients in their companies" ON public.clients;
CREATE POLICY "Users can update clients in their companies" ON public.clients
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete clients in their companies" ON public.clients;
CREATE POLICY "Users can delete clients in their companies" ON public.clients
    FOR DELETE USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON public.companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir empresa demo para usuários existentes
DO $$
DECLARE
    demo_company_id UUID;
BEGIN
    INSERT INTO public.companies (name, document, industry, plan)
    VALUES ('Empresa Demo', '00000000000000', 'Beleza e Estética', 'free')
    ON CONFLICT (document) DO NOTHING
    RETURNING id INTO demo_company_id;
    
    IF demo_company_id IS NOT NULL THEN
        INSERT INTO public.company_users (company_id, user_id, role)
        SELECT demo_company_id, id, 'owner'
        FROM public.users
        ON CONFLICT DO NOTHING;
        
        UPDATE public.clients SET company_id = demo_company_id WHERE company_id IS NULL;
        UPDATE public.services SET company_id = demo_company_id WHERE company_id IS NULL;
        UPDATE public.professionals SET company_id = demo_company_id WHERE company_id IS NULL;
        UPDATE public.appointments SET company_id = demo_company_id WHERE company_id IS NULL;
    END IF;
END $$;
```

### 3. Verificar se funcionou

Execute esta query para verificar:

```sql
SELECT * FROM public.companies;
SELECT * FROM public.company_users;
```

Você deve ver:
- ✅ Tabela `companies` criada
- ✅ Tabela `company_users` criada
- ✅ Empresa Demo criada
- ✅ Usuários vinculados à Empresa Demo

### 4. Testar a aplicação

1. Faça login na aplicação
2. Clique no seletor de empresas no header (canto superior direito)
3. Você deve ver "Empresa Demo" selecionada
4. Acesse "Empresas" no menu lateral
5. Crie uma nova empresa de teste

### 5. Próximos passos (IMPORTANTE)

**Os módulos existentes ainda NÃO estão filtrando por `company_id`!**

Você precisa atualizar os Contexts:
- `ClientsContext.tsx`
- `ServicesContext.tsx`
- `ProfessionalsContext.tsx`
- `AppointmentsContext.tsx`

**Como atualizar:**

Em cada Context, adicione o filtro por `company_id`:

```typescript
// ANTES
const { data, error } = await supabase
  .from('clients')
  .select('*');

// DEPOIS
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('company_id', currentCompany.id); // Filtrar por empresa
```

E ao inserir, sempre incluir o `company_id`:

```typescript
// ANTES
const { data, error } = await supabase
  .from('clients')
  .insert([{ name, phone, email }]);

// DEPOIS
const { data, error } = await supabase
  .from('clients')
  .insert([{ 
    name, 
    phone, 
    email,
    company_id: currentCompany.id // Sempre incluir
  }]);
```

---

## 📊 Estrutura Multi-Tenant

```
┌────────────────────────────────────────┐
│           USER (Auth)                  │
│   email, password, id                  │
└───────────────┬────────────────────────┘
                │
                │ 1:N
                ▼
┌────────────────────────────────────────┐
│       COMPANY_USERS (Join)             │
│   company_id, user_id, role            │
└───────────┬────────────────────────────┘
            │
            │ N:1
            ▼
┌────────────────────────────────────────┐
│          COMPANY                       │
│   id, name, industry, plan             │
└───────────┬────────────────────────────┘
            │
            │ 1:N
            ├────────────┬──────────────┬─────────────┐
            ▼            ▼              ▼             ▼
    ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  CLIENTS  │  │ SERVICES │  │  PROF.   │  │  APPTS   │
    │ +company  │  │ +company │  │ +company │  │ +company │
    └───────────┘  └──────────┘  └──────────┘  └──────────┘
```

Cada empresa é isolada. Os usuários veem apenas dados da empresa selecionada.

---

## 🔐 Segurança (RLS)

As políticas Row Level Security garantem que:

1. ✅ Usuários só veem empresas que participam
2. ✅ Usuários só veem dados (clientes, serviços) da empresa selecionada
3. ✅ Apenas owners/admins podem editar configurações da empresa
4. ✅ Dados de uma empresa são invisíveis para outras empresas

---

## 🎯 Teste Rápido

```sql
-- Ver todas as empresas do usuário logado
SELECT c.* 
FROM public.companies c
JOIN public.company_users cu ON cu.company_id = c.id
WHERE cu.user_id = auth.uid();

-- Ver todos os clientes da empresa X
SELECT * FROM public.clients 
WHERE company_id = '<UUID_DA_EMPRESA>';
```

---

## ❓ Troubleshooting

### Erro: "relation companies does not exist"
- Execute o SQL de criação no Supabase SQL Editor

### Erro: "column company_id does not exist"
- Execute os `ALTER TABLE` commands

### Empresa Demo não aparece
- Execute o bloco `DO $$` novamente

### Não consigo ver clientes/serviços
- Verifique se o `company_id` está preenchido
- Update manual: `UPDATE clients SET company_id = '<UUID>' WHERE company_id IS NULL`

---

**Pronto! Multi-tenant configurado! 🎉**
