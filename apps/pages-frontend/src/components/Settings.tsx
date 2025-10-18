import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  settings: {
    model: string;
    memory: boolean;
    voice: boolean;
  };
  onSettingsChange: (settings: typeof settings) => void;
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const handleToggle = (key: keyof typeof settings) => {
    if (key === 'model') return; // Model selection handled separately
    
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleModelChange = (model: string) => {
    onSettingsChange({
      ...settings,
      model
    });
  };

  return (
    <div className="settings-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <SettingsIcon size={16} />
        <h3 className="settings-title">Settings</h3>
      </div>

      <div className="setting-item">
        <div>
          <div className="setting-label">Model</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            AI model for responses
          </div>
        </div>
        <select
          value={settings.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="model-select"
        >
          <option value="@cf/meta/llama-3.3-70b-instruct-fp8-fast">
            Llama 3.3 70B (Fast)
          </option>
          <option value="@cf/meta/llama-3.1-8b-instruct">
            Llama 3.1 8B
          </option>
          <option value="@cf/meta/llama-3.1-70b-instruct">
            Llama 3.1 70B
          </option>
        </select>
      </div>

      <div className="setting-item">
        <div>
          <div className="setting-label">Memory</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Enable RAG retrieval from knowledge base
          </div>
        </div>
        <div 
          className={`toggle ${settings.memory ? 'active' : ''}`}
          onClick={() => handleToggle('memory')}
        >
          <div className="toggle-thumb"></div>
        </div>
      </div>

      <div className="setting-item">
        <div>
          <div className="setting-label">Voice</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Enable voice input and output
          </div>
        </div>
        <div 
          className={`toggle ${settings.voice ? 'active' : ''}`}
          onClick={() => handleToggle('voice')}
        >
          <div className="toggle-thumb"></div>
        </div>
      </div>

      {settings.memory && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#64748b', 
            marginBottom: '0.5rem' 
          }}>
            Memory Sources
          </div>
          <div className="memory-chips">
            <div className="memory-chip">Cloudflare Docs</div>
            <div className="memory-chip">Workers AI</div>
            <div className="memory-chip">Durable Objects</div>
            <div className="memory-chip">Vectorize</div>
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem', 
        background: '#f8fafc', 
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
          About this demo
        </div>
        <div>
          This application demonstrates Cloudflare's AI capabilities including Workers AI, 
          Durable Objects for state management, Vectorize for RAG, and Realtime for voice features.
        </div>
      </div>
    </div>
  );
}
