import { GoogleGenAI, Chat, Content } from "@google/genai";

// A Vercel exige que a função seja exportada como default
export default async function handler(request: Request) {
    // 1. Verificação de Segurança e Extração de Dados
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { history, prompt, systemInstruction, model } = await request.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
        }

        // 2. Inicialização Segura da API
        // A chave é lida da variável de ambiente GEMINI_API_KEY
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
        }
        
        // Corrigido: O construtor espera um objeto com a propriedade apiKey
        const ai = new GoogleGenAI({ apiKey });

        // 3. Mapeamento do Histórico para o formato da API
        const chatHistory: Content[] = history.map((msg: { sender: string; text: string; }) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        // 4. Criação da Sessão de Chat com Contexto
        const chat: Chat = ai.chats.create({
            model: model || 'gemini-2.5-pro', // Usa o modelo enviado pelo front-end ou um padrão
            history: chatHistory,
            config: {
                systemInstruction: systemInstruction || 'Você é um assistente prestativo.',
            },
        });

        // 5. Chamada à API e Envio da Resposta
        const response = await chat.sendMessage({ message: prompt });
        const replyText = response.text;

        return new Response(JSON.stringify({ reply: replyText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in /api/chat:", error);
        return new Response(JSON.stringify({ error: 'Failed to process chat message' }), { status: 500 });
    }
}