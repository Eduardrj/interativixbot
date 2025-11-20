import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatOptions {
  history: ChatMessage[];
  prompt: string;
  systemInstruction?: string;
  model?: string;
}

export async function sendChatMessage(options: ChatOptions): Promise<string> {
  const { history, prompt, systemInstruction, model = 'gemini-1.5-flash' } = options;

  // Verificar qual modelo está sendo usado
  const isPerplexity = model?.includes('perplexity');
  
  if (isPerplexity) {
    return sendPerplexityMessage(options);
  }
  
  return sendGeminiMessage(options);
}

async function sendGeminiMessage(options: ChatOptions): Promise<string> {
  const { history, prompt, systemInstruction, model = 'gemini-1.5-flash' } = options;
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'sua-chave-gemini-aqui') {
    throw new Error('Chave da API do Gemini não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env.local');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    // Construir histórico para o Gemini
    const chatHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Iniciar chat com histórico
    const chat = geminiModel.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
      systemInstruction: systemInstruction || 'Você é um assistente prestativo e educativo.',
    });

    // Enviar mensagem e obter resposta
    const result = await chat.sendMessage(prompt);
    return result.response.text();
    
  } catch (error: any) {
    console.error('Erro ao chamar API do Gemini:', error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Chave da API do Gemini inválida. Verifique sua configuração.');
    }
    
    if (error.message?.includes('quota')) {
      throw new Error('Cota da API do Gemini excedida. Tente novamente mais tarde.');
    }
    
    throw new Error('Erro ao conectar com o serviço de IA. Tente novamente.');
  }
}

async function sendPerplexityMessage(options: ChatOptions): Promise<string> {
  const { history, prompt, systemInstruction, model = 'sonar' } = options;
  
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  
  if (!apiKey || apiKey === 'sua-chave-perplexity-aqui') {
    throw new Error('Chave da API do Perplexity não configurada. Configure VITE_PERPLEXITY_API_KEY no arquivo .env.local');
  }

  try {
    // Construir mensagens para o Perplexity
    const messages: any[] = [];
    
    if (systemInstruction) {
      messages.push({
        role: 'system',
        content: systemInstruction
      });
    }
    
    history.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.replace('perplexity-', ''),
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sem resposta';
    
  } catch (error: any) {
    console.error('Erro ao chamar API do Perplexity:', error);
    
    if (error.message?.includes('401')) {
      throw new Error('Chave da API do Perplexity inválida. Verifique sua configuração.');
    }
    
    if (error.message?.includes('429')) {
      throw new Error('Cota da API do Perplexity excedida. Tente novamente mais tarde.');
    }
    
    throw new Error('Erro ao conectar com o serviço de IA. Tente novamente.');
  }
}
