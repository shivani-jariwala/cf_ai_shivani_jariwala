import type { Context } from 'hono';
import type { Env } from '../types';

// Local types to avoid workspace issues
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const toolsHandler = {
  async searchNotes(c: Context<{ Bindings: Env }>) {
    try {
      const { query, limit = 5 } = await c.req.json();
      
      if (!query || typeof query !== 'string') {
        return c.json({ error: 'Query is required' }, 400);
      }

      const vectorizeService = new (await import('../vectorize')).VectorizeService(c.env);
      const results = await vectorizeService.searchNotes(query, limit);

      return c.json({
        results,
        query,
        count: results.length
      });

    } catch (error) {
      console.error('Search notes error:', error);
      return c.json({ error: 'Failed to search notes' }, 500);
    }
  },

  async saveNote(c: Context<{ Bindings: Env }>) {
    try {
      const { title, content, sessionId } = await c.req.json();
      
      if (!title || !content) {
        return c.json({ error: 'Title and content are required' }, 400);
      }

      const noteId = generateId();
      const now = Date.now();
      
      const note: Note = {
        id: noteId,
        title,
        content,
        createdAt: now,
        updatedAt: now,
      };

      // Save to D1 database
      const dbService = new (await import('../db')).DatabaseService(c.env);
      await dbService.createNote(note);

      // Generate embedding and save to Vectorize
      const llmService = new (await import('../llm')).LLMService(c.env);
      const embedding = await llmService.generateEmbedding(content);
      
      const vectorizeService = new (await import('../vectorize')).VectorizeService(c.env);
      await vectorizeService.upsertNote(note, embedding);

      // Trigger workflow if sessionId provided
      if (sessionId) {
        const workflowService = new (await import('../workflow')).WorkflowService(c.env);
        const workflowId = await workflowService.createWorkflow(sessionId, {
          action: 'saveNote',
          noteId,
          title,
          content
        });
        
        // Execute workflow steps
        await workflowService.step2_UpsertToVectorize(noteId, embedding, {
          title,
          content,
          createdAt: now,
          updatedAt: now
        });
        
        await workflowService.updateWorkflowState(workflowId, {
          status: 'completed',
          data: { noteId, workflowId }
        });
      }

      return c.json({
        success: true,
        noteId,
        note,
        message: 'Note saved successfully'
      });

    } catch (error) {
      console.error('Save note error:', error);
      return c.json({ error: 'Failed to save note' }, 500);
    }
  },

  async setPreference(c: Context<{ Bindings: Env }>) {
    try {
      const { key, value, userId } = await c.req.json();
      
      if (!key || value === undefined) {
        return c.json({ error: 'Key and value are required' }, 400);
      }

      const kvService = new (await import('../kv')).KVService(c.env);
      const prefKey = userId ? `${userId}:${key}` : key;
      
      await kvService.setPreference(prefKey, value);

      return c.json({
        success: true,
        key: prefKey,
        value,
        message: 'Preference saved successfully'
      });

    } catch (error) {
      console.error('Set preference error:', error);
      return c.json({ error: 'Failed to save preference' }, 500);
    }
  }
};
