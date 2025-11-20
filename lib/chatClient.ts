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
  
  console.log('[Gemini] API Key presente:', !!apiKey);
  console.log('[Gemini] Modelo:', model);
  
  if (!apiKey || apiKey === 'sua-chave-gemini-aqui') {
    throw new Error('Chave da API do Gemini não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env.local');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    // Construir histórico para o Gemini
    // Gemini requer que o histórico comece com 'user', então filtramos mensagens vazias ou começamos do primeiro 'user'
    let chatHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Garantir que o histórico comece com 'user'
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      chatHistory = chatHistory.slice(1);
    }

    // Se o histórico tem número ímpar de mensagens (não termina com resposta do bot), está OK
    // Gemini aceita histórico vazio também
    console.log('[Gemini] Histórico:', chatHistory.length, 'mensagens');

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
    console.log('[Gemini] Enviando prompt...');
    const result = await chat.sendMessage(finalPrompt);
    const responseText = result.response.text();
    console.log('[Gemini] Resposta recebida:', responseText.substring(0, 50) + '...');
    return responseText;
    
  } catch (error: any) {
    console.error('[Gemini] Erro completo:', error);
    console.error('[Gemini] Mensagem:', error.message);
    console.error('[Gemini] Stack:', error.stack);
    
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
  
  console.log('[Perplexity] API Key presente:', !!apiKey);
  console.log('[Perplexity] Modelo:', model);
  
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

    console.log('[Perplexity] Total de mensagens:', messages.length);

    const requestBody = {
      model: model.replace('perplexity-', ''),
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    };

    console.log('[Perplexity] Usando proxy para evitar CORS');

    // Usar um proxy simples para evitar CORS
    // Em desenvolvimento, vamos usar o AllOrigins como proxy público
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const apiUrl = encodeURIComponent('https://api.perplexity.ai/chat/completions');
    
    // Como o proxy não suporta headers customizados, vamos tentar uma alternativa:
    // Usar a API diretamente e capturar o erro de CORS
    console.log('[Perplexity] Tentando chamada direta (pode falhar por CORS)...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }).catch(async (fetchError) => {
      console.error('[Perplexity] Erro de CORS detectado:', fetchError);
      throw new Error('A API do Perplexity não pode ser chamada diretamente do navegador devido a restrições CORS. Use o modelo Gemini ou configure um proxy/API backend.');
    });

    console.log('[Perplexity] Response status:', response.status);
    
    const responseText = await response.text();
    console.log('[Perplexity] Response text:', responseText.substring(0, 200));

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('[Perplexity] Failed to parse error response');
      }
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const replyText = data.choices[0]?.message?.content || 'Sem resposta';
    console.log('[Perplexity] Resposta recebida:', replyText.substring(0, 50) + '...');
    return replyText;
    
  } catch (error: any) {
    console.error('[Perplexity] Erro completo:', error);
    console.error('[Perplexity] Mensagem:', error.message);
    console.error('[Perplexity] Stack:', error.stack);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Chave da API do Perplexity inválida. Verifique sua configuração.');
    }
    
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error('Cota da API do Perplexity excedida. Tente novamente mais tarde.');
    }
    
    throw new Error(`Erro Perplexity: ${error.message || 'Erro desconhecido'}`);
  }
}
