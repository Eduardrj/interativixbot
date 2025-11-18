import { IncomingMessage, ServerResponse } from 'http';
import { verifySupabaseToken, extractBearerToken } from '../lib/auth';

interface AppointmentData {
    clientName: string;
    clientPhone: string;
    service: string;
    date: string;
    time: string;
    attendant?: string;
}

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

    // NOVO: Verificar autenticação JWT
    const authHeader = request.headers.authorization as string | undefined;
    const token = extractBearerToken(authHeader);

    if (!token) {
        response.statusCode = 401;
        response.end(JSON.stringify({ error: 'Missing or invalid Authorization header. Please provide a valid JWT token.' }));
        return;
    }

    let userId: string;
    try {
        const verified = await verifySupabaseToken(token, process.env.VITE_SUPABASE_URL || '');
        userId = verified.userId;
    } catch (authError) {
        console.error('Authentication failed:', authError);
        response.statusCode = 401;
        response.end(JSON.stringify({ error: 'Invalid or expired token' }));
        return;
    }

    try {
        let body = '';
        
        for await (const chunk of request) {
            body += chunk.toString();
        }

        const appointmentData: AppointmentData = JSON.parse(body);

        // Validação básica
        if (!appointmentData.clientName || !appointmentData.clientPhone || !appointmentData.service || !appointmentData.date || !appointmentData.time) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
        }

        // Criar agendamento com user_id para isolamento de dados
        const newAppointment = {
            id: `A${Date.now()}`,
            clientName: appointmentData.clientName,
            clientPhone: appointmentData.clientPhone,
            service: appointmentData.service,
            startTime: new Date(`${appointmentData.date}T${appointmentData.time}`),
            endTime: new Date(`${appointmentData.date}T${appointmentData.time}`),
            status: 'Pendente',
            attendant: appointmentData.attendant || 'Não atribuído',
            source: 'whatsapp',
            userId: userId,
            createdAt: new Date()
        };

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