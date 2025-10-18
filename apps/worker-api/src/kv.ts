import type { Env } from './types';

export class KVService {
  constructor(private env: Env) {}

  async getPreference(key: string): Promise<string | null> {
    try {
      return await this.env.KV_PREFS.get(key);
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  async setPreference(key: string, value: string): Promise<void> {
    try {
      await this.env.KV_PREFS.put(key, value);
    } catch (error) {
      console.error('KV set error:', error);
      throw new Error('Failed to save preference');
    }
  }

  async deletePreference(key: string): Promise<void> {
    try {
      await this.env.KV_PREFS.delete(key);
    } catch (error) {
      console.error('KV delete error:', error);
      throw new Error('Failed to delete preference');
    }
  }

  async listPreferences(prefix: string = ''): Promise<Array<{ key: string; value: string }>> {
    try {
      const list = await this.env.KV_PREFS.list({ prefix });
      const results = [];
      
      for (const key of list.keys) {
        const value = await this.env.KV_PREFS.get(key.name);
        if (value) {
          results.push({ key: key.name, value });
        }
      }
      
      return results;
    } catch (error) {
      console.error('KV list error:', error);
      return [];
    }
  }
}
