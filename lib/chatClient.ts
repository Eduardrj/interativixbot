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
  // Chamar API do servidor para proteger as chaves
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao comunicar com o servidor');
    }

    const data = await response.json();
    return data.response;
  } catch (error: any) {
    // Se falhar, tentar diretamente (dev mode)
    if (process.env.NODE_ENV === 'development') {
      return sendChatMessageDirect(options);
    }
    throw error;
  }
}

// Função legacy para desenvolvimento local
async function sendChatMessageDirect(options: ChatOptions): Promise<string> {
  const { history, prompt, systemInstruction, model = 'gemini-1.5-flash' } = options;

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
    // Gemini requer que o histórico comece com 'user'
    let chatHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Garantir que o histórico comece com 'user'
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      chatHistory = chatHistory.slice(1);
    }

    // Iniciar chat com histórico
    const chat = geminiModel.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Construir o prompt final com system instruction
    const finalPrompt = systemInstruction 
      ? `${systemInstruction}\n\nUsuário: ${prompt}`
      : prompt;

    // Enviar mensagem e obter resposta
    const result = await chat.sendMessage(finalPrompt);
    return result.response.text();
    
  } catch (error: any) {
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      throw new Error('Chave da API do Gemini inválida. Verifique sua configuração.');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Cota da API do Gemini excedida. Tente novamente mais tarde.');
    }
    
    throw new Error(`Erro Gemini: ${error.message || 'Erro desconhecido'}`);
  }
}

async function sendPerplexityMessage(options: ChatOptions): Promise<string> {
  const { history, prompt, systemInstruction, model = 'sonar' } = options;
  
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  
  if (!apiKey || apiKey === 'sua-chave-perplexity-aqui') {
    throw new Error('Chave da API do Perplexity não configurada.');
  }

  // Em desenvolvimento (Codespaces), a API do Perplexity não funciona por CORS
  // Retornar mensagem explicativa
  if (import.meta.env.DEV) {
    throw new Error('Perplexity não disponível em desenvolvimento local devido a restrições CORS. Use Gemini ou faça deploy para produção.');
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
    
    // Adicionar histórico
    history.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });
    
    // Adicionar prompt atual
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch('/api/chat-perplexity', {
      method: 'POST',
      headers: {
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
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.reply || 'Sem resposta';
    
  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Chave da API do Perplexity inválida.');
    }
    
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error('Cota da API do Perplexity excedida. Tente novamente mais tarde.');
    }
    
    throw new Error(`Erro Perplexity: ${error.message || 'Erro desconhecido'}`);
  }
}
