import type { Context } from 'hono';
import type { Env } from '../types';

export async function healthHandler(c: Context<{ Bindings: Env }>) {
  try {
    // Check all bindings
    const checks = {
      ai: false,
      kv: false,
      db: false,
      vectorize: false,
      durableObjects: false,
    };

    // Test AI binding
    try {
      await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      checks.ai = true;
    } catch (e) {
      console.error('AI binding check failed:', e);
    }

    // Test KV binding
    try {
      await c.env.KV_PREFS.get('health-check');
      checks.kv = true;
    } catch (e) {
      console.error('KV binding check failed:', e);
    }

    // Test D1 binding
    try {
      await c.env.DB.prepare('SELECT 1').first();
      checks.db = true;
    } catch (e) {
      console.error('D1 binding check failed:', e);
    }

    // Test Vectorize binding
    try {
      // Create a proper 768-dimensional vector for testing
      const testVector = new Array(768).fill(0.1);
      await c.env.VEC.query(testVector, { topK: 1 });
      checks.vectorize = true;
    } catch (e) {
      console.error('Vectorize binding check failed:', e);
    }

    // Test Durable Objects binding
    try {
      const testId = c.env.SESSION_DO.idFromName('health-check');
      checks.durableObjects = true;
    } catch (e) {
      console.error('Durable Objects binding check failed:', e);
    }

    const allHealthy = Object.values(checks).every(Boolean);
    const status = allHealthy ? 'healthy' : 'degraded';

    return c.json({
      status,
      timestamp: new Date().toISOString(),
      checks,
      version: '1.0.0',
      environment: 'production'
    }, allHealthy ? 200 : 503);

  } catch (error) {
    console.error('Health check error:', error);
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      version: '1.0.0'
    }, 500);
  }
}
