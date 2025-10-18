// Shared types for CF Agents Worker API

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    tokens?: number;
    citations?: string[];
    tools?: string[];
  };
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  settings: {
    model: string;
    memory: boolean;
    voice: boolean;
  };
}

export interface ChatRequest {
  sessionId: string;
  messages: Message[];
  toolsEnabled?: boolean;
  retrievalQuery?: string;
  stream?: boolean;
}

export interface ChatResponse {
  message: Message;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  citations?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export function generateId(): string {
  return crypto.randomUUID();
}
