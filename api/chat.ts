import type { Content } from "@google/genai";

// A Vercel exige que a função seja exportada como default
export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { history, prompt, systemInstruction, model } = await request.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found in environment variables.");
            return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
        }
        
        // Use a type assertion to work around a faulty type definition in this environment.
        const genAIModule = await import('@google/genai') as any;
        const GoogleGenerativeAI = genAIModule.GoogleGenerativeAI;

        if (typeof GoogleGenerativeAI !== 'function') {
            console.error("GoogleGenerativeAI class not found on the imported module.");
            return new Response(JSON.stringify({ error: 'Failed to initialize AI client' }), { status: 500 });
        }

        const genAIClient = new GoogleGenerativeAI(apiKey);

        // Mapeamento do histórico para o formato da API
        const chatHistory: Content[] = history.map((msg: { sender: 'user' | 'bot'; text: string; }) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const modelInstance = genAIClient.getGenerativeModel({ 
            model: model || 'gemini-1.5-flash',
            systemInstruction: systemInstruction || 'Você é um assistente prestativo.'
        });

        const chat = modelInstance.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const replyText = response.text();

        return new Response(JSON.stringify({ reply: replyText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in /api/chat:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: 'Failed to process chat message', details: errorMessage }), { status: 500 });
    }
}