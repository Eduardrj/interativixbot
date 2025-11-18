// @ts-ignore
import { IncomingMessage, ServerResponse } from 'http';

// Perplexity API integration for interativixbot
// Uses the pplx-api REST endpoint compatible with OpenAI's interface
// This replaces Google Gemini due to quota limitations

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
 
 // 1. Segurança: Apenas POST permitido
 if (request.method !== 'POST') {
 response.statusCode = 405;
 response.end(JSON.stringify({ error: 'Method not allowed' }));
 return;
 }
 
 try {
 let body = '';
 
 // Coletar o corpo da requisição
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
 
 const { history = [], prompt, systemInstruction, model = 'sonar-reasoning-pro' } = parsedBody;
 
 if (!prompt) {
 response.statusCode = 400;
 response.end(JSON.stringify({ error: 'Prompt is required' }));
 return;
 }
 
 // 2. Verificar API Key
 const apiKey = process.env.PERPLEXITY_API_KEY;
 if (!apiKey) {
 console.error("Perplexity API key not found in environment variables");
 response.statusCode = 500;
 response.end(JSON.stringify({ error: 'API key not configured' }));
 return;
 }
 
 try {
 // 3. Preparar mensagens no formato OpenAI/Perplexity
 const messages: Array<{ role: string; content: string }> = [];
 
 // Adicionar histórico
 history.forEach((msg: { sender: string; text: string }) => {
 messages.push({
 role: msg.sender === 'user' ? 'user' : 'assistant',
 content: msg.text,
 });
 });
 
 // Adicionar mensagem atual do usuário
 messages.push({
 role: 'user',
 content: prompt,
 });
 
 // 4. Preparar payload para Perplexity
 const requestPayload = {
 model: model,
 messages: messages,
 temperature: 0.7,
 max_tokens: 1024,
 system: systemInstruction || 'Você é um assistente prestativo e educativo.',
 };
 
 // 5. Fazer requisição para Perplexity API com retry
 let lastError: any;
 const maxRetries = 3;
 const baseDelay = 1000;
 
 for (let attempt = 0; attempt < maxRetries; attempt++) {
 try {
 const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${apiKey}`,
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(requestPayload),
 });
 
 if (!perplexityResponse.ok) {
 const errorData = await perplexityResponse.text();
 console.error(`Perplexity API error (${perplexityResponse.status}):`, errorData);
 
 // Se for 429 (rate limit) e não for a última tentativa, retry
 if (perplexityResponse.status === 429 && attempt < maxRetries - 1) {
 const delay = baseDelay * Math.pow(2, attempt);
 console.warn(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
 await new Promise(resolve => setTimeout(resolve, delay));
 continue;
 }
 
 // Tratamento específico de outros erros
 if (perplexityResponse.status === 401) {
 response.statusCode = 500;
 response.end(JSON.stringify({ error: 'Authentication failed with AI service' }));
 } else if (perplexityResponse.status === 429) {
 response.statusCode = 429;
 response.end(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }));
 } else {
 response.statusCode = perplexityResponse.status;
 response.end(JSON.stringify({ error: 'Error connecting to AI service' }));
 }
 return;
 }
 
 const data = await perplexityResponse.json();
 
 // 6. Extrair resposta
 const replyText = data.choices?.[0]?.message?.content || 'No response generated';
 
 response.statusCode = 200;
 response.setHeader('Content-Type', 'application/json');
 response.end(JSON.stringify({ reply: replyText }));
 return;
 
 } catch (apiError: any) {
 lastError = apiError;
 
 // Se for erro de rede e não for a última tentativa, retry
 if (attempt < maxRetries - 1 && !apiError.message.includes('Unauthorized')) {
 const delay = baseDelay * Math.pow(2, attempt);
 console.warn(`API error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`, apiError.message);
 await new Promise(resolve => setTimeout(resolve, delay));
 continue;
 }
 
 throw apiError;
 }
 }
 
 throw lastError;
 
 } catch (apiError) {
 console.error("Error calling Perplexity API:", apiError);
 response.statusCode = 502;
 response.end(JSON.stringify({ error: 'Error connecting to AI service. Please try again later.' }));
 }
 } catch (error) {
 console.error("Error in /api/chat:", error);
 response.statusCode = 500;
 response.end(JSON.stringify({ error: 'Failed to process chat message' }));
 }
}
