import type { Env } from './types';
// Local types to avoid workspace issues
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export class DatabaseService {
  constructor(private env: Env) {}

  async initSchema(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS transcripts (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        status TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`
    ];

    for (const query of queries) {
      await this.env.DB.prepare(query).run();
    }
  }

  async createNote(note: Note): Promise<void> {
    const stmt = this.env.DB.prepare(`
      INSERT INTO notes (id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      note.id,
      note.title,
      note.content,
      note.createdAt,
      note.updatedAt
    ).run();
  }

  async getNote(id: string): Promise<Note | null> {
    const stmt = this.env.DB.prepare(`
      SELECT * FROM notes WHERE id = ?
    `);
    
    const result = await stmt.bind(id).first();
    if (!result) return null;
    
    return {
      id: result.id as string,
      title: result.title as string,
      content: result.content as string,
      createdAt: result.created_at as number,
      updatedAt: result.updated_at as number,
    };
  }

  async updateNote(note: Note): Promise<void> {
    const stmt = this.env.DB.prepare(`
      UPDATE notes 
      SET title = ?, content = ?, updated_at = ?
      WHERE id = ?
    `);
    
    await stmt.bind(
      note.title,
      note.content,
      note.updatedAt,
      note.id
    ).run();
  }

  async deleteNote(id: string): Promise<void> {
    const stmt = this.env.DB.prepare(`
      DELETE FROM notes WHERE id = ?
    `);
    
    await stmt.bind(id).run();
  }

  async listNotes(limit: number = 50, offset: number = 0): Promise<Note[]> {
    const stmt = this.env.DB.prepare(`
      SELECT * FROM notes 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const results = await stmt.bind(limit, offset).all();
    
    return results.results.map(row => ({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
    }));
  }

  async saveTranscript(sessionId: string, content: string): Promise<string> {
    const id = crypto.randomUUID();
    const stmt = this.env.DB.prepare(`
      INSERT INTO transcripts (id, session_id, content, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    await stmt.bind(id, sessionId, content, Date.now()).run();
    return id;
  }

  async getTranscripts(sessionId: string): Promise<Array<{ id: string; content: string; createdAt: number }>> {
    const stmt = this.env.DB.prepare(`
      SELECT id, content, created_at FROM transcripts 
      WHERE session_id = ? 
      ORDER BY created_at DESC
    `);
    
    const results = await stmt.bind(sessionId).all();
    
    return results.results.map(row => ({
      id: row.id as string,
      content: row.content as string,
      createdAt: row.created_at as number,
    }));
  }
}
