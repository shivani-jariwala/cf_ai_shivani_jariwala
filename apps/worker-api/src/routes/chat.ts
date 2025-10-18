import { stream } from 'hono/streaming';
import type { Context } from 'hono';
import type { Env } from '../types';
import type { ChatRequest, Message } from '../shared-types';
import { generateId } from '../shared-types';

export async function chatHandler(c: Context<{ Bindings: Env }>) {
  try {
    // Check if request has body
    const body = await c.req.text();
    if (!body || body.trim() === '') {
      return c.json({ error: 'Request body is required' }, 400);
    }
    
    const request: ChatRequest = JSON.parse(body);
    const { sessionId, messages, toolsEnabled, retrievalQuery, stream: shouldStream } = request;

    // Get or create session
    const sessionDO = c.env.SESSION_DO.get(c.env.SESSION_DO.idFromName(sessionId));
    const sessionResponse = await sessionDO.fetch(new Request('https://example.com', { method: 'GET' }));
    let session = await sessionResponse.json();

    if (!session) {
      // Create new session
      const newSession = {
        id: sessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: {
          model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          memory: true,
          voice: false,
        }
      };
      
      await sessionDO.fetch(new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({ session: newSession })
      }));
      session = newSession;
    }

    // Add user message to session
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: messages[messages.length - 1].content,
      timestamp: Date.now(),
    };

    await sessionDO.fetch(new Request('https://example.com', {
      method: 'PUT',
      body: JSON.stringify(userMessage)
    }));

    // If streaming requested, return SSE stream
    if (shouldStream) {
      return stream(c, async (stream) => {
        const llmService = new (await import('../llm')).LLMService(c.env);
        
        // Get context if retrieval is enabled
        let context = [];
        if (toolsEnabled && (retrievalQuery || messages.some(m => m.role === 'user'))) {
          const vectorizeService = new (await import('../vectorize')).VectorizeService(c.env);
          const query = retrievalQuery || messages[messages.length - 1].content;
          context = await vectorizeService.searchNotes(query, 5);
        }

        // Generate response with context
        const enhancedRequest = {
          ...request,
          messages: context.length > 0 
            ? [...messages, {
                role: 'system',
                content: `Context: ${context.map(c => `${c.title}: ${c.content}`).join('\n')}`
              }]
            : messages
        };

        const responseStream = await llmService.generateStream(enhancedRequest);
        const reader = responseStream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            await stream.write(value);
          }
        } finally {
          reader.releaseLock();
        }
      });
    }

    // Non-streaming response
    const llmService = new (await import('../llm')).LLMService(c.env);
    const response = await llmService.generateStream(request);
    
    // Convert stream to string for non-streaming response
    const reader = response.getReader();
    let fullResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              fullResponse += data.content;
            }
          } catch (e) {
            // Ignore malformed JSON
          }
        }
      }
    }

    // Add assistant message to session
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: fullResponse,
      timestamp: Date.now(),
      metadata: {
        citations: context.map(c => c.id),
      }
    };

    await sessionDO.fetch(new Request('https://example.com', {
      method: 'PUT',
      body: JSON.stringify(assistantMessage)
    }));

    return c.json({
      message: assistantMessage,
      usage: {
        promptTokens: 0, // Would be calculated from actual usage
        completionTokens: 0,
        totalTokens: 0,
      },
      citations: context.map(c => ({ id: c.id, title: c.title, score: c.score }))
    });

  } catch (error) {
    console.error('Chat handler error:', error);
    return c.json({ error: 'Failed to process chat request' }, 500);
  }
}
