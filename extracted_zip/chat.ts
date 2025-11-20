// @ts-ignore
import { IncomingMessage, ServerResponse } from 'http';
import { verifySupabaseToken, extractBearerToken } from '../lib/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
 
 if (request.method !== 'POST') {
 response.statusCode = 405;
 response.end(JSON.stringify({ error: 'Method not allowed' }));
 return;
 }

 // Try multiple header keys and fallback to query param to be resilient behind proxies
 try {
   const headerNames = Object.keys(request.headers || {});
   console.log('[chat] header keys:', headerNames.join(','));
   console.log('[chat] request url:', request.url);
 } catch {}
 const headersAny = request.headers as any;
 const possibleAuthHeader =
   headersAny?.authorization ||
   headersAny?.Authorization ||
   headersAny?.['x-authorization'] ||
   headersAny?.['x-supabase-auth'] ||
   undefined;
  try { console.log('[chat] auth header present:', !!possibleAuthHeader); } catch {}

 let token = extractBearerToken(possibleAuthHeader as string | undefined);

 if (!token && request.url) {
   try {
     const host = (headersAny?.host as string) || 'interativixbot.com.br';
     const url = new URL(request.url, `https://${host}`);
     const qpToken = url.searchParams.get('access_token') || url.searchParams.get('token');
     if (qpToken) token = qpToken;
   } catch {}
 }
 

 let userId: string;
 
 try {
 let body = '';
 
 for await (const chunk of request) {
 body += chunk.toString();
 }
 
 let parsedBody;
 try {
 parsedBody = JSON.parse(body);
 } catch (e) {
 console.error("Failed to parse JSON:", body);
 response.statusCode = 400;
 response.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
 return;
 }

 // As a fallback, accept token from request body
 if (!token) {
   token = parsedBody?.accessToken || parsedBody?.token || null;
 }

 if (!token) {
   response.statusCode = 401;
   response.end(JSON.stringify({ error: 'Missing or invalid Authorization header. Please provide a valid JWT token.' }));
   return;
 }

 try {
   const verified = await verifySupabaseToken(token, process.env.VITE_SUPABASE_URL || '');
   userId = verified.userId;
 } catch (authError) {
   console.error('Authentication failed:', authError);
   response.statusCode = 401;
   response.end(JSON.stringify({ error: 'Invalid or expired token' }));
   return;
 }
 
 const { history = [], prompt, systemInstruction, model = 'gemini-1.5-flash' } = parsedBody;
 
 if (!prompt) {
 response.statusCode = 400;
 response.end(JSON.stringify({ error: 'Prompt is required' }));
 return;
 }
 
 const apiKey = process.env.VITE_GEMINI_API_KEY;
 if (!apiKey) {
 console.error("Gemini API key not found in environment variables");
 response.statusCode = 500;
 response.end(JSON.stringify({ error: 'API key not configured' }));
 return;
 }
 
 try {
 // Initialize Google Generative AI
 const genAI = new GoogleGenerativeAI(apiKey);
 const geminiModel = genAI.getGenerativeModel({ model: model });

 // Build conversation history for Gemini
 const chatHistory = [];
 
 history.forEach((msg: { sender: string; text: string }) => {
 chatHistory.push({
 role: msg.sender === 'user' ? 'user' : 'model',
 parts: [{ text: msg.text }],
 });
 });

 // Start chat with history
 const chat = geminiModel.startChat({
 history: chatHistory,
 generationConfig: {
 temperature: 0.7,
 maxOutputTokens: 1024,
 },
 systemInstruction: systemInstruction || 'Você é um assistente prestativo e educativo.',
 });

 // Send message and get response
 const result = await chat.sendMessage(prompt);
 const replyText = result.response.text();
 
 response.statusCode = 200;
 response.setHeader('Content-Type', 'application/json');
 response.end(JSON.stringify({ reply: replyText, userId }));
 
 } catch (apiError: any) {
 console.error("Error calling Gemini API:", apiError);
 
 // Handle specific Gemini API errors
 if (apiError.message?.includes('API_KEY_INVALID')) {
   response.statusCode = 500;
   response.end(JSON.stringify({ error: 'Invalid API key for AI service' }));
   return;
 }
 
 if (apiError.message?.includes('Quota exceeded')) {
   response.statusCode = 429;
   response.end(JSON.stringify({ error: 'AI service quota exceeded. Please try again later.' }));
   return;
 }
 
 response.statusCode = 502;
 response.end(JSON.stringify({ error: 'Error connecting to AI service. Please try again later.' }));
 }
 } catch (error) {
 console.error("Error in /api/chat:", error);
 response.statusCode = 500;
 response.end(JSON.stringify({ error: 'Failed to process chat message' }));
 }
}