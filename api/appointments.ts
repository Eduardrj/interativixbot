import { IncomingMessage, ServerResponse } from 'http';

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

        const appointmentData: AppointmentData = JSON.parse(body);

        // Validação básica
        if (!appointmentData.clientName || !appointmentData.clientPhone || !appointmentData.service || !appointmentData.date || !appointmentData.time) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: 'Missing required fields' }));
            return;
        }

        // Criar agendamento
        const newAppointment = {
            id: `A${Date.now()}`,
            clientName: appointmentData.clientName,
            clientPhone: appointmentData.clientPhone,
            service: appointmentData.service,
            startTime: new Date(`${appointmentData.date}T${appointmentData.time}`),
            endTime: new Date(`${appointmentData.date}T${appointmentData.time}`), // será calculado no frontend
            status: 'Pendente',
            attendant: appointmentData.attendant || 'Não atribuído',
            source: 'whatsapp',
            createdAt: new Date()
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
