import { IncomingMessage, ServerResponse } from 'http';
import { verifySupabaseToken, extractBearerToken } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

interface ProfessionalData {
  name: string;
  email: string;
  specialties?: string[];
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

  // Handle GET request - fetch professionals
  if (request.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching professionals:', error);
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'Failed to fetch professionals' }));
    }
    return;
  }

  // Handle POST request - create professional
  if (request.method === 'POST') {
    try {
      let body = '';
      
      for await (const chunk of request) {
        body += chunk.toString();
      }

      const professionalData: ProfessionalData = JSON.parse(body);

      // Validate required fields
      if (!professionalData.name || !professionalData.email) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'Name and email are required' }));
        return;
      }

      // Create professional with user_id for data isolation
      const { data, error } = await supabase
        .from('professionals')
        .insert([
          {
            user_id: userId,
            name: professionalData.name,
            email: professionalData.email,
            specialties: professionalData.specialties || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      response.statusCode = 201;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(data));
    } catch (error) {
      console.error('Error creating professional:', error);
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'Failed to create professional' }));
    }
    return;
  }

  // Handle DELETE request - delete professional
  if (request.method === 'DELETE') {
    try {
      const urlParts = request.url?.split('/');
      const professionalId = urlParts?.[urlParts.length - 1];

      if (!professionalId) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'Professional ID is required' }));
        return;
      }

      // Delete professional (Supabase RLS will ensure user can only delete their own)
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', professionalId)
        .eq('user_id', userId);

      if (error) throw error;

      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ message: 'Professional deleted successfully' }));
    } catch (error) {
      console.error('Error deleting professional:', error);
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'Failed to delete professional' }));
    }
    return;
  }

  // Method not allowed
  response.statusCode = 405;
  response.end(JSON.stringify({ error: 'Method not allowed' }));
}