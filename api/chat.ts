import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatRequestBody {
  history: ChatMessage[];
  prompt: string;
  systemInstruction?: string;
  model?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { history, prompt, systemInstruction, model = 'gemini-1.5-flash' } = req.body as ChatRequestBody;

    const isPerplexity = model?.includes('perplexity');

    if (isPerplexity) {
      return await handlePerplexity(req, res, { history, prompt, systemInstruction, model });
    } else {
      return await handleGemini(req, res, { history, prompt, systemInstruction, model });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function handleGemini(
  req: VercelRequest,
  res: VercelResponse,
  options: ChatRequestBody
) {
  const { history, prompt, systemInstruction, model = 'gemini-1.5-flash' } = options;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    let chatHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      chatHistory = chatHistory.slice(1);
    }

    const chat = geminiModel.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const finalPrompt = systemInstruction 
      ? `${systemInstruction}\n\nUsuário: ${prompt}`
      : prompt;

    const result = await chat.sendMessage(finalPrompt);
    const response = result.response.text();

    return res.status(200).json({ response });
  } catch (error: any) {
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: error.message || 'Gemini API error' });
  }
}

async function handlePerplexity(
  req: VercelRequest,
  res: VercelResponse,
  options: ChatRequestBody
) {
  const { history, prompt, systemInstruction, model = 'perplexity-sonar' } = options;

  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Perplexity API key not configured' });
  }

  try {
    const perplexityModel = model.includes('pro') ? 'sonar-pro' : 'sonar';

    const messages: any[] = [];
    
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }

    history.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: perplexityModel,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Sem resposta';

    return res.status(200).json({ response: text });
  } catch (error: any) {
    console.error('Perplexity Error:', error);
    return res.status(500).json({ error: error.message || 'Perplexity API error' });
  }
}
