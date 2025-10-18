import type { Context } from 'hono';
import type { Env } from '../types';
import { LLMService } from '../llm';

export async function chatHandlerSimple(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.text();
    if (!body || body.trim() === '') {
      return c.json({ error: 'Request body is required' }, 400);
    }
    
    const request = JSON.parse(body);
    const { messages, sessionId } = request;
    
    // Initialize LLM service
    const llmService = new LLMService(c.env);
    
    // Create a proper chat request for the LLM
    const chatRequest = {
      sessionId,
      messages,
      toolsEnabled: false,
      stream: false
    };
    
    // Generate response using Workers AI
    const response = await llmService.generateOpenAICompatible(chatRequest);
    
    return c.json({
      message: response.message,
      usage: response.usage
    });
  } catch (error) {
    console.error('Chat handler error:', error);
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
}
