import { useState, useEffect } from 'react';

export function DebugInfo() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [lastTest, setLastTest] = useState<any>(null);

  const testAPI = async () => {
    try {
      const response = await fetch('https://cf-agents-api.shivanivinodkumar-jariwala.workers.dev/health');
      const data = await response.json();
      setApiStatus('Connected ✅');
      setLastTest(data);
    } catch (error: unknown) {
      setApiStatus('Failed ❌');
      setLastTest({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testChat = async () => {
    try {
      const response = await fetch('https://cf-agents-api.shivanivinodkumar-jariwala.workers.dev/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'debug-test',
          messages: [
            {
              id: 'test-1',
              role: 'user',
              content: 'Debug test message',
              timestamp: Date.now()
            }
          ],
          toolsEnabled: true,
          stream: false
        })
      });
      const data = await response.json();
      setLastTest(data);
    } catch (error: unknown) {
      setLastTest({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4>🔧 Debug Info</h4>
      <p><strong>API Status:</strong> {apiStatus}</p>
      <button onClick={testAPI} style={{ marginRight: '5px' }}>Test Health</button>
      <button onClick={testChat}>Test Chat</button>
      {lastTest && (
        <div style={{ marginTop: '10px', fontSize: '10px' }}>
          <strong>Last Response:</strong>
          <pre style={{ 
            background: '#fff', 
            padding: '5px', 
            borderRadius: '3px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            {JSON.stringify(lastTest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
