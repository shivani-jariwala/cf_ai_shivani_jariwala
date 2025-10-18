import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { stream } from 'hono/streaming';
import { chatHandler } from './routes/chat';
import { chatHandlerSimple } from './routes/chat-simple';
import { toolsHandler } from './routes/tools';
import { voiceHandler } from './routes/voice';
import { voiceHandlerSimple } from './routes/voice-simple';
import { healthHandler } from './routes/health';
import type { Env } from './types';
import { SessionDO } from './do';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-pages-domain.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger());

// Routes
app.get('/health', healthHandler);
app.post('/api/chat', chatHandlerSimple);
app.post('/api/tools/searchNotes', toolsHandler.searchNotes);
app.post('/api/tools/saveNote', toolsHandler.saveNote);
app.post('/api/tools/setPreference', toolsHandler.setPreference);
app.post('/api/voice/session', voiceHandlerSimple.createSession);
app.post('/api/voice/transcribe', voiceHandlerSimple.transcribe);
app.post('/api/voice/synthesize', voiceHandlerSimple.synthesize);

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;

export { SessionDO };