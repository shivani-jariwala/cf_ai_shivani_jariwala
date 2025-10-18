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

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface VoiceConfig {
  enabled: boolean;
  language: string;
  voice: string;
  speed: number;
}

export interface RealtimeSession {
  id: string;
  token: string;
  url: string;
}

export interface WorkflowState {
  sessionId: string;
  step: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data: Record<string, any>;
  error?: string;
}

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}
