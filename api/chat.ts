// @ts-ignore
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { IncomingMessage, ServerResponse } from 'http';

// A Vercel exige que a função seja exportada como default
export default async function handler(
    request: IncomingMessage & { body?: any },
    response: ServerResponse
) {
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

            // 5. Chamada à API e Envio da Resposta
            const response_data = await chat.sendMessage({ message: prompt });
            const replyText = response_data.text;

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ reply: replyText }));
        } catch (apiError) {
            console.error("Error calling Google GenAI:", apiError);
            response.statusCode = 502;
            response.end(JSON.stringify({ error: 'Error connecting to AI service. Please try again later.' }));
        }

    } catch (error) {
        console.error("Error in /api/chat:", error);
        response.statusCode = 500;
        response.end(JSON.stringify({ error: 'Failed to process chat message' }));
    }
}