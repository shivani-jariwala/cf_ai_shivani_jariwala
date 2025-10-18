export interface Env {
  AI: Ai;
  KV_PREFS: KVNamespace;
  DB: D1Database;
  VEC: Vectorize;
  SESSION_DO: DurableObjectNamespace;
  REALTIME_APP_ID?: string;
  REALTIME_TOKEN?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
}

export interface Ai {
  run(model: string, input: any): Promise<any>;
}
