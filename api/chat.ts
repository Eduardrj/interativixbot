import type { Content } from "@google/genai";

// Vercel exige que a função seja exportada como default
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const {
      history = [],
      prompt,
      systemInstruction,
      model,
    }: {
      history?: { sender: "user" | "bot"; text: string }[];
      prompt?: string;
      systemInstruction?: string;
      model?: string;
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables.");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Type assertion para contornar definição de tipos quebrada neste ambiente
    const genAIModule = (await import("@google/genai")) as any;
    const GoogleGenerativeAI = genAIModule.GoogleGenerativeAI;

    if (typeof GoogleGenerativeAI !== "function") {
      console.error("GoogleGenerativeAI class not found on the imported module.");
      return new Response(
        JSON.stringify({ error: "Failed to initialize AI client" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const genAIClient = new GoogleGenerativeAI(apiKey);

    // Mapeamento do histórico para o formato da API
    const chatHistory: Content[] = Array.isArray(history)
      ? history.map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
      : [];

    const modelInstance = genAIClient.getGenerativeModel({
      model: model || "gemini-1.5-flash",
      systemInstruction: systemInstruction || "Você é um assistente prestativo.",
    });

    const chat = modelInstance.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const replyText = response.text();

    return new Response(
      JSON.stringify({ reply: replyText }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in /api/chat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return new Response(
      JSON.stringify({
        error: "Failed to process chat message",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}