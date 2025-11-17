// @ts-ignore
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { IncomingMessage, ServerResponse } from 'http';

// A Vercel exige que a função seja exportada como default
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

    // 1. Verificação de Segurança e Extração de Dados
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

        const { history = [], prompt, systemInstruction, model } = parsedBody;

        if (!prompt) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: 'Prompt is required' }));
            return;
        }

        // 2. Inicialização Segura da API
        // A API_KEY é pega das Environment Variables configuradas no painel da Vercel
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("API key not found in environment variables");
            response.statusCode = 500;
            response.end(JSON.stringify({ error: 'API key not configured' }));
            return;
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey });

            // 3. Mapeamento do Histórico para o formato da API
            const chatHistory: Content[] = history.map((msg: { sender: string; text: string; }) => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            }));

            // 4. Criação da Sessão de Chat com Contexto
            const chat: Chat = ai.chats.create({
                model: model || 'gemini-2.0-flash', // Usa o modelo enviado pelo front-end ou um padrão
                history: chatHistory,
                config: {
                    systemInstruction: systemInstruction || 'Você é um assistente prestativo.',
                },
            });

            // 5. Chamada à API e Envio da Resposta com Retry
            let lastError: any;
            const maxRetries = 3;
            const baseDelay = 1000; // 1 segundo

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const response_data = await chat.sendMessage({ message: prompt });
                    const replyText = response_data.text;

                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify({ reply: replyText }));
                    return;
                } catch (apiError: any) {
                    lastError = apiError;
                    
                    // Se for erro 503 (overloaded) e não for a última tentativa, retry
                    if (apiError.status === 503 && attempt < maxRetries - 1) {
                        const delay = baseDelay * Math.pow(2, attempt); // Backoff exponencial
                        console.warn(`API overloaded, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    
                    // Outros erros ou última tentativa
                    throw apiError;
                }
            }

            throw lastError;
        } catch (apiError) {
            console.error("Error calling Google GenAI:", apiError);
            const statusCode = (apiError as any).status === 503 ? 503 : 502;
            const errorMsg = (apiError as any).status === 503 
                ? 'The AI service is currently overloaded. Please try again in a few moments.'
                : 'Error connecting to AI service. Please try again later.';
            response.statusCode = statusCode;
            response.end(JSON.stringify({ error: errorMsg }));
        }

    } catch (error) {
        console.error("Error in /api/chat:", error);
        response.statusCode = 500;
        response.end(JSON.stringify({ error: 'Failed to process chat message' }));
    }
}