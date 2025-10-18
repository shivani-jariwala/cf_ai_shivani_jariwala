import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
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

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  error: string | null;
  isRecording: boolean;
  onVoiceToggle: () => void;
  isVoiceEnabled: boolean;
  settings: {
    model: string;
    memory: boolean;
    voice: boolean;
  };
}

export function Chat({ 
  messages, 
  onSendMessage, 
  isLoading, 
  error, 
  isRecording, 
  onVoiceToggle, 
  isVoiceEnabled,
  settings 
}: ChatProps) {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <div className="messages-container">
        {messages.length === 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#64748b',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>
              Welcome to CF Agents Demo
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Start a conversation with the AI assistant powered by Cloudflare Workers AI.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onSendMessage('What can you help me with?')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f1f5f9',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                What can you help me with?
              </button>
              <button
                onClick={() => onSendMessage('Tell me about Cloudflare Workers AI')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f1f5f9',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Tell me about Workers AI
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? 'U' : 'AI'}
            </div>
            <div>
              <div className="message-content">
                {message.content}
                {message.metadata?.citations && message.metadata.citations.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    Sources: {message.metadata.citations.length} reference(s)
                  </div>
                )}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div>
              <div className="message-content">
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Thinking...
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Type your message here..."
            className="input-field"
            rows={1}
            disabled={isLoading}
            style={{ 
              minHeight: '44px',
              maxHeight: '120px',
              resize: 'none'
            }}
          />
          
          {settings.voice && (
            <button
              type="button"
              onClick={onVoiceToggle}
              disabled={isLoading}
              className={`voice-button ${isRecording ? 'recording' : ''} ${!isVoiceEnabled ? 'disabled' : ''}`}
              title={isRecording ? 'Stop recording' : isVoiceEnabled ? 'Start recording' : 'Microphone not available'}
              style={{
                opacity: !isVoiceEnabled ? 0.5 : 1,
                cursor: !isVoiceEnabled ? 'not-allowed' : 'pointer'
              }}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isComposing}
            className="send-button"
          >
            {isLoading ? (
              <Loader2 size={16} className="loading-spinner" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </>
  );
}
