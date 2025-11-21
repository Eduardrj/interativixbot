-- =====================================================
-- MIGRATION: Fix Companies Insert Policy
-- =====================================================
-- Descrição: Adiciona policy de INSERT para permitir que usuários
--           autenticados criem novas empresas
-- =====================================================

-- Adicionar policy de INSERT para companies
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Adicionar policy de INSERT para company_users
-- Isso permite que o usuário se adicione como owner da empresa criada
DROP POLICY IF EXISTS "Users can add themselves to companies" ON public.company_users;
CREATE POLICY "Users can add themselves to companies" ON public.company_users
    FOR INSERT 
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Comentário explicativo
COMMENT ON POLICY "Users can create companies" ON public.companies IS 
'Permite que qualquer usuário autenticado crie uma nova empresa. O usuário será automaticamente adicionado como owner através da tabela company_users.';

COMMENT ON POLICY "Users can add themselves to companies" ON public.company_users IS 
'Permite que usuários adicionem a si mesmos a uma empresa (necessário para criar a relação owner após criar a empresa).';
