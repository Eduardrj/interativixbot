import { IncomingMessage, ServerResponse } from 'http';
import { supabase } from '../lib/supabaseClient';

interface AppointmentData {
    clientName: string;
    clientPhone: string;
    service: string;
    date: string;
    time: string;
    attendant?: string;
}

// Mock database - em produção seria um banco de dados real
let appointments: any[] = [];

export default async function handler(
    request: IncomingMessage & { body?: any },
    response: ServerResponse
) {
    // CORS Headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'https://interativixbot.com.br');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    try {
        let body = '';
        
        for await (const chunk of request) {
            body += chunk.toString();
        }

        const appointmentData: AppointmentData & { userId?: string } = JSON.parse(body);

        // Validação básica
        if (!appointmentData.clientName || !appointmentData.clientPhone || !appointmentData.service || !appointmentData.date || !appointmentData.time) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
        }

        // Criar agendamento - tentar salvar no Supabase se configurado
        const startTime = new Date(`${appointmentData.date}T${appointmentData.time}`);
        const endTime = new Date(startTime);

        const dbRecord = {
            client_name: appointmentData.clientName,
            client_phone: appointmentData.clientPhone,
            service: appointmentData.service,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'pendente',
            attendant: appointmentData.attendant || null,
            source: 'whatsapp',
            user_id: appointmentData.userId || null
        };

        // Se Supabase estiver configurado, tentar inserir; caso contrário, usar mock local
        if ((supabase as any) && process.env.VITE_SUPABASE_URL) {
            const { data, error } = await supabase.from('appointments').insert([dbRecord]).select().single();
            if (error) {
                console.error('Supabase insert error:', error);
                response.statusCode = 500;
                response.end(JSON.stringify({ error: 'Failed to create appointment in DB' }));
                return;
            }

            response.statusCode = 201;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ success: true, appointment: data }));
            return;
        }

        // Fallback: mock local storage
        const newAppointment = {
            id: `A${Date.now()}`,
            ...dbRecord,
            createdAt: new Date().toISOString()
        };
        appointments.push(newAppointment);

        response.statusCode = 201;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({
            success: true,
            message: `Agendamento criado com sucesso para ${appointmentData.clientName} em ${appointmentData.date} às ${appointmentData.time}`,
            appointment: newAppointment
        }));

    } catch (error) {
        console.error("Error creating appointment:", error);
        response.statusCode = 500;
        response.end(JSON.stringify({ error: 'Failed to create appointment' }));
    }
}
