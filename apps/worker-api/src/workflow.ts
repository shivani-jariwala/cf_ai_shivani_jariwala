import type { Env } from './types';

// Local types to avoid workspace issues
interface WorkflowState {
  id: string;
  sessionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
}

interface WorkflowStep {
  id: string;
  type: 'embedding' | 'search' | 'llm' | 'tool';
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  error?: string;
}

interface EmbeddingRequest {
  text: string;
  model?: string;
}

interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export class WorkflowService {
  constructor(private env: Env) {}

  async createWorkflow(sessionId: string, data: any): Promise<string> {
    const workflowId = crypto.randomUUID();
    
    // Store workflow state in D1
    const dbService = new (await import('./db')).DatabaseService(this.env);
    await this.env.DB.prepare(`
      INSERT INTO workflows (id, session_id, status, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      workflowId,
      sessionId,
      'pending',
      JSON.stringify(data),
      Date.now(),
      Date.now()
    ).run();

    return workflowId;
  }

  async updateWorkflowState(workflowId: string, state: Partial<WorkflowState>): Promise<void> {
    await this.env.DB.prepare(`
      UPDATE workflows 
      SET status = ?, data = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      state.status || 'running',
      JSON.stringify(state.data || {}),
      Date.now(),
      workflowId
    ).run();
  }

  async getWorkflowState(workflowId: string): Promise<WorkflowState | null> {
    const result = await this.env.DB.prepare(`
      SELECT * FROM workflows WHERE id = ?
    `).bind(workflowId).first();

    if (!result) return null;

    return {
      sessionId: result.session_id as string,
      step: 0,
      status: result.status as 'pending' | 'running' | 'completed' | 'failed',
      data: JSON.parse(result.data as string),
    };
  }

  // Workflow step implementations
  async step1_EmbedChunks(text: string): Promise<EmbeddingResponse> {
    const llmService = new (await import('./llm')).LLMService(this.env);
    const embedding = await llmService.generateEmbedding(text);
    
    return {
      embedding,
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      usage: {
        promptTokens: text.length / 4, // Rough estimate
        totalTokens: text.length / 4,
      }
    };
  }

  async step2_UpsertToVectorize(noteId: string, embedding: number[], metadata: any): Promise<void> {
    const vectorizeService = new (await import('./vectorize')).VectorizeService(this.env);
    await vectorizeService.upsertNote({
      id: noteId,
      title: metadata.title,
      content: metadata.content,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    }, embedding);
  }

  async step3_SearchVectorize(query: string, limit: number = 5): Promise<any[]> {
    const vectorizeService = new (await import('./vectorize')).VectorizeService(this.env);
    return await vectorizeService.searchNotes(query, limit);
  }

  async step4_GenerateLLMResponse(messages: any[], context: any[]): Promise<string> {
    const llmService = new (await import('./llm')).LLMService(this.env);
    
    // Add context to messages
    const contextMessage = {
      role: 'system',
      content: `Context from knowledge base:\n${context.map(c => `- ${c.title}: ${c.content}`).join('\n')}`
    };
    
    const enhancedMessages = [contextMessage, ...messages];
    
    // Generate response (simplified for workflow)
    const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: enhancedMessages,
      max_tokens: 1024,
      temperature: 0.7,
    });
    
    return response.response;
  }

  async step5_PersistResults(sessionId: string, results: any): Promise<void> {
    const dbService = new (await import('./db')).DatabaseService(this.env);
    // Persist results to database
    await dbService.saveTranscript(sessionId, JSON.stringify(results));
  }
}
