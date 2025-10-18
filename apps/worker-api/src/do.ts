import type { Message, ChatSession } from './shared-types';
import { generateId } from './shared-types';

export class SessionDO {
  private state: DurableObjectState;
  private session: ChatSession | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    switch (method) {
      case 'GET':
        return this.getSession();
      case 'POST':
        return this.updateSession(request);
      case 'PUT':
        return this.appendMessage(request);
      case 'DELETE':
        return this.clearSession();
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  }

  private async getSession(): Promise<Response> {
    if (!this.session) {
      this.session = await this.state.storage.get<ChatSession>('session');
    }
    
    return new Response(JSON.stringify(this.session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async updateSession(request: Request): Promise<Response> {
    const updates = await request.json();
    
    if (!this.session) {
      this.session = {
        id: generateId(),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: {
          model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          memory: true,
          voice: false,
        }
      };
    }

    // Update session properties
    if (updates.settings) {
      this.session.settings = { ...this.session.settings, ...updates.settings };
    }
    
    this.session.updatedAt = Date.now();
    
    await this.state.storage.put('session', this.session);
    
    return new Response(JSON.stringify(this.session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async appendMessage(request: Request): Promise<Response> {
    const message: Message = await request.json();
    
    if (!this.session) {
      this.session = {
        id: generateId(),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: {
          model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          memory: true,
          voice: false,
        }
      };
    }

    // Add message to session
    this.session.messages.push(message);
    this.session.updatedAt = Date.now();
    
    // Keep only last 50 messages to prevent memory bloat
    if (this.session.messages.length > 50) {
      this.session.messages = this.session.messages.slice(-50);
    }
    
    await this.state.storage.put('session', this.session);
    
    return new Response(JSON.stringify(this.session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async clearSession(): Promise<Response> {
    await this.state.storage.deleteAll();
    this.session = null;
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Alarm for cleanup (called automatically by Durable Objects)
  async alarm(): Promise<void> {
    // Clean up old sessions (older than 24 hours)
    if (this.session && Date.now() - this.session.updatedAt > 24 * 60 * 60 * 1000) {
      await this.state.storage.deleteAll();
      this.session = null;
    }
  }

  // Set alarm for cleanup
  async setCleanupAlarm(): Promise<void> {
    // Set alarm for 24 hours from now
    await this.state.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
  }
}
