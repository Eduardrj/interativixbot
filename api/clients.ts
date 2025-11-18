import { IncomingMessage, ServerResponse } from 'http';
import { verifySupabaseToken, extractBearerToken } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

interface ClientData {
  name: string;
  phone: string;
  email?: string;
  consent_lgpd: boolean;
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

  // Handle GET request - fetch clients
  if (request.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching clients:', error);
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'Failed to fetch clients' }));
    }
    return;
  }

  // Handle POST request - create client
  if (request.method === 'POST') {
    try {
      let body = '';
      
      for await (const chunk of request) {
        body += chunk.toString();
      }

      const clientData: ClientData = JSON.parse(body);

      // Validate required fields
      if (!clientData.name || !clientData.phone) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'Name and phone are required' }));
        return;
      }

      // Create client with user_id for data isolation
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            user_id: userId,
            name: clientData.name,
            phone: clientData.phone,
            email: clientData.email,
            consent_lgpd: clientData.consent_lgpd,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      response.statusCode = 201;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error creating client:', error);
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'Failed to create client' }));
    }
    return;
  }

  // Handle DELETE request - delete client
  if (request.method === 'DELETE') {
    try {
      const urlParts = request.url?.split('/');
      const clientId = urlParts?.[urlParts.length - 1];

      if (!clientId) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'Client ID is required' }));
        return;
      }

      // Delete client (Supabase RLS will ensure user can only delete their own)
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', userId);

      if (error) throw error;

      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ message: 'Client deleted successfully' }));
    } catch (error) {
      console.error('Error deleting client:', error);
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'Failed to delete client' }));
    }
    return;
  }

  // Method not allowed
  response.statusCode = 405;
  response.end(JSON.stringify({ error: 'Method not allowed' }));
}