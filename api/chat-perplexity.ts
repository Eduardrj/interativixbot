```typescript
// @ts-ignore
// @ts-ignore
import { IncomingMessage, ServerResponse } from 'http';

// Perplexity API integration for interativixbot
// Uses the pplx-api REST endpoint compatible with OpenAI's interface

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

	// Only POST allowed
	if (request.method !== 'POST') {
		response.statusCode = 405;
		response.end(JSON.stringify({ error: 'Method not allowed' }));
		return;
	}

	try {
		let body = '';
		for await (const chunk of request) {
			body += chunk.toString();
		}

		let parsedBody;
		try {
			parsedBody = JSON.parse(body);
		} catch (e) {
			console.error('Failed to parse JSON:', body);
			response.statusCode = 400;
			response.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
			return;
		}

		const { history = [], prompt, systemInstruction, model = 'sonar-pro' } = parsedBody;

		if (!prompt) {
			response.statusCode = 400;
			response.end(JSON.stringify({ error: 'Prompt is required' }));
			return;
		}

		const apiKey = process.env.PERPLEXITY_API_KEY;
		if (!apiKey) {
			console.error('Perplexity API key not found in environment variables');
			response.statusCode = 500;
			response.end(JSON.stringify({ error: 'API key not configured' }));
			return;
		}

		// Build messages in OpenAI format and include system as a system-role message
		const messages: Array<{ role: string; content: string }> = [];
		if (systemInstruction) {
			messages.push({ role: 'system', content: systemInstruction });
		} else {
			messages.push({ role: 'system', content: 'Você é um assistente prestativo e educativo.' });
		}

		history.forEach((msg: { sender: string; text: string }) => {
			messages.push({
				role: msg.sender === 'user' ? 'user' : 'assistant',
				content: msg.text,
			});
		});

		messages.push({ role: 'user', content: prompt });

		const requestPayload = {
			model: model,
			messages: messages,
			temperature: 0.7,
			max_tokens: 1024,
		} as any;

		const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestPayload),
		});

		if (!perplexityResponse.ok) {
			const errorData = await perplexityResponse.text();
			console.error(`Perplexity API error (${perplexityResponse.status}):`, errorData);

			if (perplexityResponse.status === 429) {
				response.statusCode = 429;
				response.end(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }));
			} else if (perplexityResponse.status === 401) {
				response.statusCode = 500;
				response.end(JSON.stringify({ error: 'Authentication failed with AI service' }));
			} else {
				response.statusCode = perplexityResponse.status;
				response.end(JSON.stringify({ error: 'Error connecting to AI service' }));
			}
			return;
		}

		const data = await perplexityResponse.json();
		const replyText = data.choices?.[0]?.message?.content || data?.choices?.[0]?.text || 'No response generated';

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		response.end(JSON.stringify({ reply: replyText }));
	} catch (error) {
		console.error('Error in /api/chat-perplexity:', error);
		response.statusCode = 500;
		response.end(JSON.stringify({ error: 'Failed to process chat message' }));
	}
}
 
