-- =====================================================
-- MIGRATION: Fix company_users Foreign Key
-- =====================================================
-- Descrição: Corrige a referência de user_id em company_users
--           de public.users para auth.users
-- =====================================================

-- Remover constraint antiga
ALTER TABLE public.company_users 
DROP CONSTRAINT IF EXISTS company_users_user_id_fkey;

-- Adicionar nova constraint correta apontando para auth.users
ALTER TABLE public.company_users
ADD CONSTRAINT company_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Comentário explicativo
COMMENT ON CONSTRAINT company_users_user_id_fkey ON public.company_users IS 
'Referência corrigida para auth.users ao invés de public.users. Supabase Auth usa o schema auth.users para gerenciar usuários autenticados.';
