import { Ai } from '@cloudflare/ai';
import type { Env } from './types';
import type { ChatRequest, ChatResponse, Message } from './shared-types';

export class LLMService {
  constructor(private env: Env) {}

  async generateStream(request: ChatRequest): Promise<ReadableStream> {
    const { messages, toolsEnabled = false, retrievalQuery } = request;
    
    // Prepare system prompt
    const systemPrompt = this.buildSystemPrompt(toolsEnabled);
    
    // Format messages for Llama 3.3
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    try {
      // Use Workers AI binding
      const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: formattedMessages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      });

      return this.createSSEStream(response);
    } catch (error) {
      console.error('LLM generation error:', error);
      throw new Error('Failed to generate response');
    }
  }

  async generateOpenAICompatible(request: ChatRequest): Promise<{ message: any; usage: any }> {
    const { messages, toolsEnabled = false } = request;
    
    // Prepare system prompt
    const systemPrompt = this.buildSystemPrompt(toolsEnabled);
    
    // Format messages for Llama 3.3
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    try {
      // Use Workers AI binding
      const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: formattedMessages,
        stream: false,
        max_tokens: 2048,
        temperature: 0.7,
      });

      // Extract response content
      const content = response.response || response.message || 'I apologize, but I could not generate a response.';
      
      return {
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: content,
          timestamp: Date.now(),
        },
        usage: {
          promptTokens: response.prompt_tokens || 0,
          completionTokens: response.completion_tokens || 0,
          totalTokens: response.total_tokens || 0,
        }
      };
    } catch (error) {
      console.error('LLM generation error:', error);
      throw new Error('Failed to generate response');
    }
  }

  private buildSystemPrompt(toolsEnabled: boolean): string {
    let prompt = `You are a helpful AI assistant powered by Cloudflare Workers AI. 
You can help users with questions, provide information, and assist with various tasks.

Guidelines:
- Be helpful, accurate, and concise
- If you don't know something, say so
- Use a friendly, professional tone
- Provide specific, actionable advice when possible`;

    if (toolsEnabled) {
      prompt += `

Available tools:
- searchNotes(query): Search through saved notes and knowledge base
- saveNote(title, content): Save a new note to the knowledge base
- setPreference(key, value): Save user preferences

Use these tools when appropriate to provide better assistance.`;
    }

    return prompt;
  }

  private createSSEStream(response: any): ReadableStream {
    return new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial event
        controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));
        
        // Process the response stream
        const reader = response.getReader();
        
        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
              controller.close();
              return;
            }
            
            // Convert response to SSE format
            const chunk = new TextDecoder().decode(value);
            const data = JSON.stringify({ type: 'token', content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            
            return pump();
          });
        }
        
        return pump();
      }
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        text,
        task: 'embedding'
      });
      
      return response.data[0];
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error('Failed to generate embedding');
    }
  }
}
