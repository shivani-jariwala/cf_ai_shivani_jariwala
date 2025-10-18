import type { Context } from 'hono';
import type { Env } from '../types';

// Local types to avoid workspace issues
export interface RealtimeSession {
  id: string;
  token: string;
  url: string;
}

export interface VoiceConfig {
  voice: string;
  speed: number;
  language: string;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export const voiceHandler = {
  async createSession(c: Context<{ Bindings: Env }>) {
    try {
      const { userId } = await c.req.json();
      
      if (!c.env.REALTIME_APP_ID || !c.env.REALTIME_TOKEN) {
        return c.json({ error: 'Realtime not configured' }, 500);
      }

      // Create Realtime session
      const sessionId = generateId();
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${c.env.REALTIME_APP_ID}/realtime/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.REALTIME_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          capabilities: ['audio']
        })
      });

      if (!response.ok) {
        throw new Error(`Realtime API error: ${response.statusText}`);
      }

      const sessionData = await response.json();
      
      const session: RealtimeSession = {
        id: sessionId,
        token: sessionData.token,
        url: sessionData.url
      };

      return c.json({
        success: true,
        session,
        message: 'Realtime session created'
      });

    } catch (error) {
      console.error('Create session error:', error);
      return c.json({ error: 'Failed to create voice session' }, 500);
    }
  },

  async transcribe(c: Context<{ Bindings: Env }>) {
    console.log("--- Transcribe handler started ---"); // <-- ADD
    try {
      const formData = await c.req.formData();
      const audioFile = formData.get('audio') as File;

      if (!audioFile) {
        console.log("Audio file not found in form data"); // <-- ADD
        return c.json({ error: 'Audio file is required' }, 400);
      }
      console.log(`Audio file received: ${audioFile.name}, Size: ${audioFile.size}`); // <-- ADD

      // Convert audio to text using Workers AI
      const audioBuffer = await audioFile.arrayBuffer();
      const audioData = new Uint8Array(audioBuffer);
      console.log("Audio buffer created, size:", audioBuffer.byteLength); // <-- ADD

      console.log(">>> Calling AI STT model (@cf/openai/whisper)..."); // <-- ADD BEFORE AI CALL
      const response = await c.env.AI.run('@cf/openai/whisper', {
        audio: Array.from(audioData),
        // model: 'whisper-1' // You might not need this line if using the standard whisper model
      });
      console.log("<<< AI STT response received:", response); // <-- ADD AFTER AI CALL

      const transcription = response.text;
      console.log("Extracted transcription:", transcription); // <-- ADD

      return c.json({
        success: true,
        transcription: transcription || 'AI_RETURNED_NULL_OR_EMPTY', // <-- Modify return slightly for clarity
        language: response.language || 'en',
        duration: response.duration || 0
      });

    } catch (error) {
      console.error('Transcribe error:', error); // Keep this
      return c.json({ error: 'Failed to transcribe audio' }, 500);
    } finally {
      console.log("--- Transcribe handler finished ---"); // <-- ADD
    }
  },

  async synthesize(c: Context<{ Bindings: Env }>) {
    try {
      const { text, voice = 'alloy', speed = 1.0 } = await c.req.json();
      
      if (!text) {
        return c.json({ error: 'Text is required' }, 400);
      }

      // Generate speech using Workers AI
      const response = await c.env.AI.run('@cf/openai/tts-1', {
        text,
        voice,
        speed
      });

      // Return audio data as base64
      const audioData = response.audio;
      const base64Audio = btoa(String.fromCharCode(...audioData));

      return c.json({
        success: true,
        audio: base64Audio,
        format: 'mp3',
        duration: response.duration || 0
      });

    } catch (error) {
      console.error('Synthesize error:', error);
      return c.json({ error: 'Failed to synthesize speech' }, 500);
    }
  }
};
