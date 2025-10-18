import React from 'react';
import { Plus, MessageSquare, Settings } from 'lucide-react';
// Local types to avoid workspace issues
interface ChatSession {
  id: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
  settings: {
    model: string;
    memory: boolean;
    voice: boolean;
  };
}

interface SidebarProps {
  session: ChatSession;
  messages: any[];
  onNewChat: () => void;
}

export function Sidebar({ session, messages, onNewChat }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">CF Agents</h2>
        <p className="sidebar-subtitle">
          Cloudflare Workers AI Demo
        </p>
      </div>

      <div style={{ flex: 1, padding: '1rem' }}>
        <button
          onClick={onNewChat}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '1rem'
          }}
        >
          <Plus size={16} />
          New Chat
        </button>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Current Session
          </h3>
          <div style={{
            padding: '0.75rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageSquare size={14} />
              <span style={{ fontWeight: '500' }}>Session {session.id.slice(0, 8)}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              {messages.length} messages
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Features
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              padding: '0.5rem',
              background: session.settings.memory ? '#dcfce7' : '#f1f5f9',
              border: `1px solid ${session.settings.memory ? '#16a34a' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: session.settings.memory ? '#16a34a' : '#9ca3af'
              }} />
              Memory: {session.settings.memory ? 'On' : 'Off'}
            </div>
            
            <div style={{
              padding: '0.5rem',
              background: session.settings.voice ? '#dcfce7' : '#f1f5f9',
              border: `1px solid ${session.settings.voice ? '#16a34a' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: session.settings.voice ? '#16a34a' : '#9ca3af'
              }} />
              Voice: {session.settings.voice ? 'On' : 'Off'}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Model
          </h3>
          <div style={{
            padding: '0.5rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            {session.settings.model}
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '1rem', 
        borderTop: '1px solid #e2e8f0',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Settings size={14} />
          <span>Powered by Cloudflare</span>
        </div>
        <div>Workers AI • Durable Objects • Vectorize</div>
      </div>
    </div>
  );
}
