import { createClient } from '@supabase/supabase-js';

function getEnvVar(name: string): string | undefined {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) {
        return (import.meta as any).env[name];
    }

    if (typeof process !== 'undefined' && process.env && process.env[name]) {
        return process.env[name];
    }

    return undefined;
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || '';
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for database
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'gerente' | 'atendente' | 'cliente';
    avatar_url?: string;
    created_at: string;
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    last_appointment?: string;
    consent_lgpd: boolean;
    user_id: string;
    created_at: string;
}

export interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
    user_id: string;
    created_at: string;
}

export interface Professional {
    id: string;
    name: string;
    email: string;
    role: 'atendente';
    avatar_url?: string;
    specialties: string[];
    user_id: string;
    created_at: string;
}

export interface Appointment {
    id: string;
    client_name: string;
    client_phone: string;
    service_id: string;
    start_time: string;
    end_time: string;
    status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
    attendant_id: string;
    source: 'whatsapp' | 'admin';
    user_id: string;
    created_at: string;
}
