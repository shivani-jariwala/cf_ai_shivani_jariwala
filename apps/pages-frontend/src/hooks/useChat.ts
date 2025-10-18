import { useState, useCallback, useEffect } from 'react';
// Local types to avoid workspace issues
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

export interface ChatRequest {
  sessionId: string;
  messages: Message[];
  toolsEnabled?: boolean;
  retrievalQuery?: string;
  stream?: boolean;
}

const API_BASE_URL = 'https://cf-agents-api.shivanivinodkumar-jariwala.workers.dev';

export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (sessionId) {
      const savedMessages = localStorage.getItem(`cf-agents-messages-${sessionId}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Failed to parse saved messages:', error);
        }
      }
    }
  }, [sessionId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`cf-agents-messages-${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  const sendMessage = useCallback(async (message: Message) => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    // Add user message to local state
    setMessages(prev => [...prev, message]);

    try {
      const request: ChatRequest = {
        sessionId,
        messages: [...messages, message],
        toolsEnabled: true,
        stream: false
      };

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle JSON response (non-streaming)
      const data = await response.json();
      
      if (data.message) {
        // Add the assistant message to the chat
        setMessages(prev => [...prev, data.message]);
      } else if (data.error) {
        throw new Error(data.error);
      }

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    if (sessionId) {
      localStorage.removeItem(`cf-agents-messages-${sessionId}`);
    }
  }, [sessionId]);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages
  };
}
