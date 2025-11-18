import { IncomingMessage, ServerResponse } from 'http';
import { verifySupabaseToken, extractBearerToken } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

interface AppointmentData {
    clientName: string;
    clientPhone: string;
    service_id: string;
    start_time: string;
    end_time: string;
    status: string;
    attendant_id: string;
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

    // Verify authentication
    const authHeader = request.headers.authorization as string | undefined;
    const token = extractBearerToken(authHeader);

    if (!token) {
        response.statusCode = 401;
        response.end(JSON.stringify({ error: 'Missing or invalid Authorization header' }));
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

    // Handle GET request - fetch appointments
    if (request.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching appointments:', error);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to fetch appointments' }));
        }
        return;
    }

    // Handle POST request - create appointment
    if (request.method === 'POST') {
        try {
            let body = '';
            
            for await (const chunk of request) {
                body += chunk.toString();
            }

            const appointmentData: AppointmentData = JSON.parse(body);

            // Validate required fields
            if (!appointmentData.clientName || !appointmentData.clientPhone || !appointmentData.service_id || 
                !appointmentData.start_time || !appointmentData.end_time || !appointmentData.attendant_id) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Missing required fields' }));
                return;
            }

            // Create appointment with user_id for data isolation
            const { data, error } = await supabase
                .from('appointments')
                .insert([
                    {
                        user_id: userId,
                        client_name: appointmentData.clientName,
                        client_phone: appointmentData.clientPhone,
                        service_id: appointmentData.service_id,
                        start_time: appointmentData.start_time,
                        end_time: appointmentData.end_time,
                        status: appointmentData.status,
                        attendant_id: appointmentData.attendant_id,
                        source: 'admin',
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            response.statusCode = 201;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({
                success: true,
                message: `Agendamento criado com sucesso para ${appointmentData.clientName}`,
                appointment: data
            }));
        } catch (error) {
            console.error('Error creating appointment:', error);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to create appointment' }));
        }
        return;
    }

    // Handle PUT request - update appointment status
    if (request.method === 'PUT') {
        try {
            const urlParts = request.url?.split('/');
            const appointmentId = urlParts?.[urlParts.length - 1];

            if (!appointmentId) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Appointment ID is required' }));
                return;
            }

            let body = '';
            
            for await (const chunk of request) {
                body += chunk.toString();
            }

            const { status } = JSON.parse(body);

            if (!status) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Status is required' }));
                return;
            }

            // Update appointment status (Supabase RLS will ensure user can only update their own)
            const { error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', appointmentId)
                .eq('user_id', userId);

            if (error) throw error;

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ message: 'Appointment status updated successfully' }));
        } catch (error) {
            console.error('Error updating appointment:', error);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to update appointment' }));
        }
        return;
    }

    // Handle DELETE request - delete appointment
    if (request.method === 'DELETE') {
        try {
            const urlParts = request.url?.split('/');
            const appointmentId = urlParts?.[urlParts.length - 1];

            if (!appointmentId) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Appointment ID is required' }));
                return;
            }

            // Delete appointment (Supabase RLS will ensure user can only delete their own)
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', appointmentId)
                .eq('user_id', userId);

            if (error) throw error;

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ message: 'Appointment deleted successfully' }));
        } catch (error) {
            console.error('Error deleting appointment:', error);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to delete appointment' }));
        }
        return;
    }

    // Method not allowed
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Method not allowed' }));
}