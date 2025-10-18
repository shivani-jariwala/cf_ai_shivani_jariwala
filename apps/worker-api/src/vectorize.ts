import type { Env } from './types';
import type { SearchResult } from './shared-types';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  embedding?: number[];
}

export class VectorizeService {
  constructor(private env: Env) {}

  async upsertNote(note: Note, embedding: number[]): Promise<void> {
    try {
      await this.env.VEC.upsert([
        {
          id: note.id,
          values: embedding,
          metadata: {
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          }
        }
      ]);
    } catch (error) {
      console.error('Vectorize upsert error:', error);
      throw new Error('Failed to upsert note to vector database');
    }
  }

  async searchNotes(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // First, generate embedding for the query
      const llmService = new (await import('./llm')).LLMService(this.env);
      const queryEmbedding = await llmService.generateEmbedding(query);
      
      // Search in Vectorize
      const results = await this.env.VEC.query(queryEmbedding, {
        topK: limit,
        returnMetadata: true,
        returnValues: false,
      });
      
      return results.matches.map(match => ({
        id: match.id,
        title: match.metadata?.title || '',
        content: match.metadata?.content || '',
        score: match.score,
        metadata: match.metadata,
      }));
    } catch (error) {
      console.error('Vectorize search error:', error);
      throw new Error('Failed to search notes');
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      await this.env.VEC.deleteByIds([noteId]);
    } catch (error) {
      console.error('Vectorize delete error:', error);
      throw new Error('Failed to delete note from vector database');
    }
  }

  async getNoteById(noteId: string): Promise<SearchResult | null> {
    try {
      const results = await this.env.VEC.getByIds([noteId]);
      if (results.length === 0) return null;
      
      const result = results[0];
      return {
        id: result.id,
        title: result.metadata?.title || '',
        content: result.metadata?.content || '',
        score: 1.0,
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Vectorize getById error:', error);
      return null;
    }
  }
}
