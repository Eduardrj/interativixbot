-- =====================================================
-- MIGRATION: Permissions & Roles System
-- =====================================================

-- Tabela de roles customizadas por empresa
CREATE TABLE IF NOT EXISTS public.company_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Tabela de permissões disponíveis
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL, -- clients, services, appointments, financial, etc
    action TEXT NOT NULL, -- create, read, update, delete, export, etc
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module, action)
);

-- Tabela de relacionamento role-permissões
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.company_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Atualizar company_users para usar roles customizadas
ALTER TABLE public.company_users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.company_roles(id) ON DELETE SET NULL;
ALTER TABLE public.company_users ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT '{}'::jsonb;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_company_roles_company ON public.company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_company_users_role ON public.company_users(role_id);

-- Habilitar RLS
ALTER TABLE public.company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies para company_roles
DROP POLICY IF EXISTS "Users can see roles from their companies" ON public.company_roles;
CREATE POLICY "Users can see roles from their companies" ON public.company_roles
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can manage roles in their companies" ON public.company_roles;
CREATE POLICY "Admins can manage roles in their companies" ON public.company_roles
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.company_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Policies para permissions (leitura pública para sistema)
DROP POLICY IF EXISTS "Everyone can see permissions" ON public.permissions;
CREATE POLICY "Everyone can see permissions" ON public.permissions
    FOR SELECT USING (true);

-- Policies para role_permissions
DROP POLICY IF EXISTS "Users can see role permissions from their companies" ON public.role_permissions;
CREATE POLICY "Users can see role permissions from their companies" ON public.role_permissions
    FOR SELECT USING (
        role_id IN (
            SELECT id FROM public.company_roles 
            WHERE company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
    FOR ALL USING (
        role_id IN (
            SELECT cr.id FROM public.company_roles cr
            JOIN public.company_users cu ON cu.company_id = cr.company_id
            WHERE cu.user_id = auth.uid() AND cu.role IN ('owner', 'admin')
        )
    );

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_company_roles_updated_at ON public.company_roles;
CREATE TRIGGER update_company_roles_updated_at 
    BEFORE UPDATE ON public.company_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_company_id UUID,
    p_module TEXT,
    p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_role_id UUID;
    v_has_permission BOOLEAN;
BEGIN
    -- Buscar role_id do usuário
    SELECT role_id INTO v_role_id
    FROM public.company_users
    WHERE user_id = p_user_id AND company_id = p_company_id;
    
    -- Se não tem role customizada, verificar role antiga
    IF v_role_id IS NULL THEN
        -- Owner e admin têm todas permissões
        SELECT role IN ('owner', 'admin') INTO v_has_permission
        FROM public.company_users
        WHERE user_id = p_user_id AND company_id = p_company_id;
        
        RETURN COALESCE(v_has_permission, FALSE);
    END IF;
    
    -- Verificar permissão na role
    SELECT EXISTS (
        SELECT 1 FROM public.role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = v_role_id
        AND p.module = p_module
        AND p.action = p_action
        AND rp.granted = TRUE
    ) INTO v_has_permission;
    
    RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql;

-- Função para obter todas permissões de um usuário
CREATE OR REPLACE FUNCTION get_user_permissions(
    p_user_id UUID,
    p_company_id UUID
)
RETURNS TABLE(module TEXT, action TEXT) AS $$
DECLARE
    v_role_id UUID;
    v_role TEXT;
BEGIN
    -- Buscar role_id e role antiga do usuário
    SELECT cu.role_id, cu.role INTO v_role_id, v_role
    FROM public.company_users cu
    WHERE cu.user_id = p_user_id AND cu.company_id = p_company_id;
    
    -- Se tem role customizada, retornar suas permissões
    IF v_role_id IS NOT NULL THEN
        RETURN QUERY
        SELECT p.module, p.action
        FROM public.role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = v_role_id AND rp.granted = TRUE;
        RETURN;
    END IF;
    
    -- Se é owner ou admin, retornar todas permissões
    IF v_role IN ('owner', 'admin') THEN
        RETURN QUERY SELECT p.module, p.action FROM public.permissions p;
        RETURN;
    END IF;
    
    -- Caso contrário, retornar permissões básicas (leitura)
    RETURN QUERY
    SELECT p.module, p.action
    FROM public.permissions p
    WHERE p.action = 'read';
END;
$$ LANGUAGE plpgsql;

-- Inserir permissões padrão do sistema
INSERT INTO public.permissions (module, action, description) VALUES
    -- Clients
    ('clients', 'create', 'Criar novos clientes'),
    ('clients', 'read', 'Visualizar clientes'),
    ('clients', 'update', 'Editar clientes'),
    ('clients', 'delete', 'Excluir clientes'),
    ('clients', 'export', 'Exportar dados de clientes'),
    ('clients', 'import', 'Importar clientes'),
    
    -- Services
    ('services', 'create', 'Criar novos serviços'),
    ('services', 'read', 'Visualizar serviços'),
    ('services', 'update', 'Editar serviços'),
    ('services', 'delete', 'Excluir serviços'),
    
    -- Professionals
    ('professionals', 'create', 'Adicionar profissionais'),
    ('professionals', 'read', 'Visualizar profissionais'),
    ('professionals', 'update', 'Editar profissionais'),
    ('professionals', 'delete', 'Remover profissionais'),
    
    -- Appointments
    ('appointments', 'create', 'Criar agendamentos'),
    ('appointments', 'read', 'Visualizar agendamentos'),
    ('appointments', 'update', 'Editar agendamentos'),
    ('appointments', 'delete', 'Cancelar agendamentos'),
    ('appointments', 'manage_all', 'Gerenciar agendamentos de todos'),
    
    -- Financial
    ('financial', 'create', 'Criar transações financeiras'),
    ('financial', 'read', 'Visualizar finanças'),
    ('financial', 'update', 'Editar transações'),
    ('financial', 'delete', 'Excluir transações'),
    ('financial', 'manage_categories', 'Gerenciar categorias financeiras'),
    ('financial', 'manage_goals', 'Gerenciar metas financeiras'),
    ('financial', 'manage_accounts', 'Gerenciar contas bancárias'),
    ('financial', 'view_reports', 'Visualizar relatórios financeiros'),
    
    -- Reports
    ('reports', 'read', 'Visualizar relatórios'),
    ('reports', 'export', 'Exportar relatórios'),
    ('reports', 'advanced', 'Acessar relatórios avançados'),
    
    -- Settings
    ('settings', 'read', 'Visualizar configurações'),
    ('settings', 'update', 'Alterar configurações'),
    ('settings', 'manage_integrations', 'Gerenciar integrações'),
    ('settings', 'manage_notifications', 'Gerenciar notificações'),
    
    -- Companies
    ('companies', 'read', 'Visualizar empresas'),
    ('companies', 'update', 'Editar empresa'),
    ('companies', 'manage_users', 'Gerenciar usuários'),
    ('companies', 'manage_roles', 'Gerenciar roles e permissões'),
    
    -- CRM
    ('crm', 'manage_tags', 'Gerenciar tags de clientes'),
    ('crm', 'manage_interactions', 'Gerenciar interações'),
    ('crm', 'view_analytics', 'Visualizar analytics CRM')
ON CONFLICT (module, action) DO NOTHING;

-- Inserir roles padrão para empresas existentes
DO $$
DECLARE
    company_record RECORD;
    owner_role_id UUID;
    admin_role_id UUID;
    manager_role_id UUID;
    attendant_role_id UUID;
BEGIN
    FOR company_record IN SELECT id FROM public.companies LOOP
        -- Role: Owner (todas permissões)
        INSERT INTO public.company_roles (company_id, name, description, is_system_role)
        VALUES (company_record.id, 'Owner', 'Proprietário com acesso total', TRUE)
        ON CONFLICT (company_id, name) DO NOTHING
        RETURNING id INTO owner_role_id;
        
        IF owner_role_id IS NOT NULL THEN
            INSERT INTO public.role_permissions (role_id, permission_id, granted)
            SELECT owner_role_id, id, TRUE FROM public.permissions;
        END IF;
        
        -- Role: Administrador
        INSERT INTO public.company_roles (company_id, name, description, is_system_role)
        VALUES (company_record.id, 'Administrador', 'Administrador com amplo acesso', TRUE)
        ON CONFLICT (company_id, name) DO NOTHING
        RETURNING id INTO admin_role_id;
        
        IF admin_role_id IS NOT NULL THEN
            INSERT INTO public.role_permissions (role_id, permission_id, granted)
            SELECT admin_role_id, id, TRUE FROM public.permissions
            WHERE module != 'companies' OR action != 'manage_roles';
        END IF;
        
        -- Role: Gerente
        INSERT INTO public.company_roles (company_id, name, description, is_system_role)
        VALUES (company_record.id, 'Gerente', 'Gerente com acesso a operações e relatórios', TRUE)
        ON CONFLICT (company_id, name) DO NOTHING
        RETURNING id INTO manager_role_id;
        
        IF manager_role_id IS NOT NULL THEN
            INSERT INTO public.role_permissions (role_id, permission_id, granted)
            SELECT manager_role_id, id, TRUE FROM public.permissions
            WHERE (module IN ('clients', 'services', 'professionals', 'appointments', 'crm') AND action IN ('create', 'read', 'update'))
            OR (module = 'reports' AND action IN ('read', 'export'))
            OR (module = 'financial' AND action IN ('read', 'view_reports'));
        END IF;
        
        -- Role: Atendente
        INSERT INTO public.company_roles (company_id, name, description, is_system_role)
        VALUES (company_record.id, 'Atendente', 'Atendente com acesso básico', TRUE)
        ON CONFLICT (company_id, name) DO NOTHING
        RETURNING id INTO attendant_role_id;
        
        IF attendant_role_id IS NOT NULL THEN
            INSERT INTO public.role_permissions (role_id, permission_id, granted)
            SELECT attendant_role_id, id, TRUE FROM public.permissions
            WHERE module IN ('clients', 'appointments', 'services', 'professionals')
            AND action IN ('create', 'read', 'update');
        END IF;
    END LOOP;
END $$;

-- Migrar usuários existentes para roles customizadas
DO $$
DECLARE
    user_record RECORD;
    target_role_id UUID;
BEGIN
    FOR user_record IN 
        SELECT cu.company_id, cu.user_id, cu.role, cr.id as role_id
        FROM public.company_users cu
        LEFT JOIN public.company_roles cr ON cr.company_id = cu.company_id 
        WHERE cu.role_id IS NULL
    LOOP
        -- Mapear role antiga para nova
        SELECT id INTO target_role_id
        FROM public.company_roles
        WHERE company_id = user_record.company_id
        AND (
            (user_record.role = 'owner' AND name = 'Owner')
            OR (user_record.role = 'admin' AND name = 'Administrador')
            OR (user_record.role = 'manager' AND name = 'Gerente')
            OR (user_record.role = 'attendant' AND name = 'Atendente')
        )
        LIMIT 1;
        
        -- Atualizar company_users
        IF target_role_id IS NOT NULL THEN
            UPDATE public.company_users
            SET role_id = target_role_id
            WHERE company_id = user_record.company_id 
            AND user_id = user_record.user_id;
        END IF;
    END LOOP;
END $$;
