# Executar Schema SQL no Supabase

## Passo a Passo:

1. Acesse seu projeto Supabase em: https://app.supabase.com/projects

2. Clique no seu projeto **interativixbot**

3. Na barra lateral esquerda, procure por **SQL Editor**

4. Clique em **New query**

5. **Copie todo o SQL abaixo** e cole no editor:

```sql
-- Users table (extended from Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'atendente',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    last_appointment TIMESTAMP WITH TIME ZONE,
    consent_lgpd BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    specialties TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    service_id TEXT NOT NULL,
    attendant_id TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pendente',
    source TEXT DEFAULT 'admin',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can see own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Create RLS policies for clients
CREATE POLICY "Clients are visible to own user" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for services
CREATE POLICY "Services are visible to own user" ON public.services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services" ON public.services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" ON public.services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" ON public.services
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for professionals
CREATE POLICY "Professionals are visible to own user" ON public.professionals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own professionals" ON public.professionals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own professionals" ON public.professionals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own professionals" ON public.professionals
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for appointments
CREATE POLICY "Appointments are visible to own user" ON public.appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON public.appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
```

6. Clique no botão **Run** (ou pressione `Ctrl+Enter`)

7. Aguarde a mensagem de sucesso ✅

## Pronto! ✨

Suas tabelas e políticas de segurança foram criadas! Agora:

1. Reinicie o servidor: `npm run dev`
2. Acesse http://localhost:3000
3. Clique em "Registrar" para criar sua conta
4. Comece a usar o sistema!

