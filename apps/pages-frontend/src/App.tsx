import { useState, useEffect, useCallback } from 'react';
import { Chat } from './components/Chat';
import { Sidebar } from './components/Sidebar';
import { Settings } from './components/Settings';
import { DebugInfo } from './components/DebugInfo';
import { useChat } from './hooks/useChat';
import { useVoice } from './hooks/useVoice';
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

function App() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [settings, setSettings] = useState({
    model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    memory: true,
    voice: true,
  });

  const { messages, sendMessage, isLoading, error, clearMessages } = useChat(session?.id);
  const { isRecording, startRecording, stopRecording, isVoiceEnabled, checkMicrophonePermission, setOnTranscription } = useVoice();

  // Initialize session
  useEffect(() => {
    const sessionId = localStorage.getItem('cf-agents-session-id') || crypto.randomUUID();
    localStorage.setItem('cf-agents-session-id', sessionId);
    
    setSession({
      id: sessionId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings
    });
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!session || !content || !content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    await sendMessage(userMessage);
  }, [session, sendMessage]);

  // Check microphone permissions on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  // Set up voice transcription callback
  useEffect(() => {
    console.log('🔥 Setting up voice transcription callback in App');
    console.log('🔥 setOnTranscription function:', typeof setOnTranscription);
    console.log('🔥 handleSendMessage function:', typeof handleSendMessage);
    const callback = (transcription: string) => {
      console.log('🔥 Voice transcription received in App:', transcription);
      console.log('🔥 Transcription type in App:', typeof transcription);
      console.log('🔥 Transcription length in App:', transcription?.length);
      // Send the transcribed text to the chat
      if (transcription && typeof transcription === 'string' && transcription.trim()) {
        console.log('🔥 Valid transcription, sending to chat:', transcription);
        handleSendMessage(transcription);
      } else {
        console.log('🔥 Transcription is empty or invalid, skipping:', transcription);
      }
    };
    console.log('🔥 About to call setOnTranscription with callback:', typeof callback);
    setOnTranscription(callback);
    console.log('🔥 Voice transcription callback set in App');
  }, [handleSendMessage, setOnTranscription]); // Added setOnTranscription back to dependencies

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    if (session) {
      setSession({ ...session, settings: newSettings });
    }
  };

  if (!session) {
    return (
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div className="loading">
            <div className="loading-spinner"></div>
            Initializing...
          </div>
        </div>
      </div>
    );
  }

          return (
            <div className="container">
              <DebugInfo />
              <div className="chat-container">
                <Sidebar 
                  session={session}
                  messages={messages}
                  onNewChat={() => {
                    const newSessionId = crypto.randomUUID();
                    localStorage.setItem('cf-agents-session-id', newSessionId);
                    clearMessages(); // Clear current messages
                    setSession({
                      id: newSessionId,
                      messages: [],
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                      settings
                    });
                  }}
                />
        
        <div className="chat-main">
          <div className="chat-header">
            <h1 className="chat-title">CF Agents Demo</h1>
            <p className="chat-subtitle">
              Powered by Cloudflare Workers AI, Durable Objects, and Vectorize
            </p>
          </div>
          
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            error={error}
            isRecording={isRecording}
            onVoiceToggle={handleVoiceToggle}
            isVoiceEnabled={isVoiceEnabled}
            settings={settings}
          />
        </div>
        
        <Settings
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
}

export default App;
