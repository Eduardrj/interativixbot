// Perplexity API handler (OpenAI-compatible payload)
// Minimal, valid implementation based on project needs
// @ts-ignore
import { IncomingMessage, ServerResponse } from 'http';

export default async function handler(
  request: IncomingMessage & { body?: any },
  response: ServerResponse
) {
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

  try {
    let body = '';
    for await (const chunk of request) body += chunk.toString();

    const parsed = JSON.parse(body || '{}');
    const prompt = parsed.prompt || parsed.message || parsed.input;
    if (!prompt) {
      response.statusCode = 400;
      response.end(JSON.stringify({ error: 'Prompt is required' }));
      return;
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      response.statusCode = 500;
      response.end(JSON.stringify({ error: 'API key not configured' }));
      return;
    }

    // Forward request to Perplexity API (best-effort)
    const messages = parsed.messages || [{ role: 'user', content: prompt }];
    const payload = { model: parsed.model || 'sonar-pro', messages };

    const r = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const t = await r.text();
      response.statusCode = r.status;
      response.end(JSON.stringify({ error: 'AI service error', detail: t }));
      return;
    }

    const data = await r.json().catch(() => null);
    const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || null;
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ reply }));
  } catch (err) {
    console.error('chat-perplexity error', err);
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'Failed to process request' }));
  }
}
 
