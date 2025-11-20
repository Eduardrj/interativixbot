import { IncomingMessage, ServerResponse } from 'http';

// Handler para Perplexity (substitui a implementação do Gemini).
// Usa a variável de ambiente `PERPLEXITY_API_KEY` como prioridade.
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

        let parsed;
        try {
            parsed = JSON.parse(body);
        } catch (e) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
        }

        const { prompt, history = [], systemInstruction } = parsed;
        if (!prompt) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: 'Prompt is required' }));
            return;
        }

        const apiKey = process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_KEY;
        if (!apiKey) {
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'Perplexity API key not configured (PERPLEXITY_API_KEY)' }));
            return;
        }

        // Construir payload básico para Perplexity: adaptável conforme API real
        const payload = {
            query: prompt,
            // histórico e instruções podem ser usados se a API suportar
            history,
            systemInstruction: systemInstruction || 'Você é um assistente prestativo.'
        };

        try {
            const res = await fetch('https://api.perplexity.ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error('Perplexity API error', res.status, text);
                response.statusCode = res.status === 401 ? 502 : 502;
                response.end(JSON.stringify({ error: 'AI service error', details: text }));
                return;
            }

            const data = await res.json().catch(() => null);

            // Tentar extrair um texto de resposta com abordagens seguras
            let reply = null;
            if (data) {
                reply = data.answer || data.reply || data.text || JSON.stringify(data);
            }

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ reply }));
            return;
        } catch (apiError) {
            console.error('Error calling Perplexity API:', apiError);
            response.statusCode = 502;
            response.end(JSON.stringify({ error: 'Error connecting to Perplexity API' }));
            return;
        }

    } catch (error) {
        console.error('Error in /api/chat:', error);
        response.statusCode = 500;
        response.end(JSON.stringify({ error: 'Internal server error' }));
    }
}