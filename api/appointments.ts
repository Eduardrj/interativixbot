import { IncomingMessage, ServerResponse } from 'http';
import { supabase } from '../lib/supabaseClient';
import { verifySupabaseToken, extractBearerToken } from '../lib/auth.js';

interface AppointmentCreate {
    clientName: string;
    clientPhone: string;
    service_id: string;
    start_time: string;
    end_time: string;
    status?: string;
    attendant_id?: string;
}

// Simple in-memory fallback for environments without Supabase
let fallbackAppointments: any[] = [];

export default async function handler(
    request: IncomingMessage & { body?: any },
    response: ServerResponse
) {
    // CORS Headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'https://interativixbot.com.br');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    // Authenticate: support Bearer header or query param/token in body
    const headersAny = request.headers as any;
    const possibleAuthHeader = headersAny?.authorization || headersAny?.Authorization || headersAny?.['x-authorization'] || headersAny?.['x-supabase-auth'] || undefined;
    let token = extractBearerToken(possibleAuthHeader as string | undefined);

    if (!token && request.url) {
        try {
            const host = (headersAny?.host as string) || 'interativixbot.com.br';
            const url = new URL(request.url, `https://${host}`);
            token = url.searchParams.get('access_token') || url.searchParams.get('token') || undefined;
        } catch {}
    }

    // Allow a development bypass when explicitly set (use with caution)
    const allowBypass = process.env.ALLOW_DEV_BYPASS === 'true' || process.env.NODE_ENV === 'development';
    let userId: string | null = null;
    if (!token) {
        if (allowBypass) {
            userId = process.env.DEV_MOCK_USER_ID || 'dev-mock-user';
        }
    } else {
        try {
            const verified = await verifySupabaseToken(token, process.env.VITE_SUPABASE_URL || '');
            userId = verified.userId;
        } catch (err) {
            console.error('Appointment auth failed:', err);
            response.statusCode = 401;
            response.end(JSON.stringify({ error: 'Invalid or expired token' }));
            return;
        }
    }

    // GET - list appointments
    if (request.method === 'GET') {
        try {
            if ((supabase as any) && process.env.VITE_SUPABASE_URL) {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify(data));
                return;
            }

            // Fallback
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(fallbackAppointments));
            return;
        } catch (err) {
            console.error('Error fetching appointments:', err);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to fetch appointments' }));
            return;
        }
    }

    // POST - create appointment
    if (request.method === 'POST') {
        try {
            let body = '';
            for await (const chunk of request) body += chunk.toString();

            const appointmentData: AppointmentCreate & { userId?: string } = JSON.parse(body);

            if (!appointmentData.clientName || !appointmentData.clientPhone || !appointmentData.service_id || !appointmentData.start_time || !appointmentData.end_time) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Missing required fields' }));
                return;
            }

            const dbRecord = {
                user_id: appointmentData.userId || userId,
                client_name: appointmentData.clientName,
                client_phone: appointmentData.clientPhone,
                service_id: appointmentData.service_id,
                start_time: appointmentData.start_time,
                end_time: appointmentData.end_time,
                status: appointmentData.status || 'pendente',
                attendant_id: appointmentData.attendant_id || null,
                source: 'admin',
            };

            if ((supabase as any) && process.env.VITE_SUPABASE_URL) {
                const { data, error } = await supabase.from('appointments').insert([dbRecord]).select().single();
                if (error) throw error;

                response.statusCode = 201;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ success: true, appointment: data }));
                return;
            }

            // Fallback persistent in memory
            const newAppointment = { id: `A${Date.now()}`, ...dbRecord, createdAt: new Date().toISOString() };
            fallbackAppointments.push(newAppointment);

            response.statusCode = 201;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ success: true, appointment: newAppointment }));
            return;
        } catch (err) {
            console.error('Error creating appointment:', err);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to create appointment' }));
            return;
        }
    }

    // PUT - update appointment (status, etc.)
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
            for await (const chunk of request) body += chunk.toString();
            const { status } = JSON.parse(body);
            if (!status) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Status is required' }));
                return;
            }

            if ((supabase as any) && process.env.VITE_SUPABASE_URL) {
                const { error } = await supabase.from('appointments').update({ status }).eq('id', appointmentId).eq('user_id', userId);
                if (error) throw error;

                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ message: 'Appointment status updated successfully' }));
                return;
            }

            // Fallback: update in memory
            const item = fallbackAppointments.find(a => a.id === appointmentId);
            if (!item) {
                response.statusCode = 404;
                response.end(JSON.stringify({ error: 'Appointment not found' }));
                return;
            }
            item.status = status;

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ message: 'Appointment status updated successfully' }));
            return;
        } catch (err) {
            console.error('Error updating appointment:', err);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to update appointment' }));
            return;
        }
    }

    // DELETE - remove appointment
    if (request.method === 'DELETE') {
        try {
            const urlParts = request.url?.split('/');
            const appointmentId = urlParts?.[urlParts.length - 1];
            if (!appointmentId) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: 'Appointment ID is required' }));
                return;
            }

            if ((supabase as any) && process.env.VITE_SUPABASE_URL) {
                const { error } = await supabase.from('appointments').delete().eq('id', appointmentId).eq('user_id', userId);
                if (error) throw error;

                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ message: 'Appointment deleted successfully' }));
                return;
            }

            // Fallback: remove from memory
            const idx = fallbackAppointments.findIndex(a => a.id === appointmentId);
            if (idx === -1) {
                response.statusCode = 404;
                response.end(JSON.stringify({ error: 'Appointment not found' }));
                return;
            }
            fallbackAppointments.splice(idx, 1);

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ message: 'Appointment deleted successfully' }));
            return;
        } catch (err) {
            console.error('Error deleting appointment:', err);
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Failed to delete appointment' }));
            return;
        }
    }

    // Method not allowed
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Method not allowed' }));
}
