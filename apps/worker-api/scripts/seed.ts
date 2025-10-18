import { DatabaseService } from '../src/db';
import { VectorizeService } from '../src/vectorize';
import { LLMService } from '../src/llm';
function generateId(): string {
  return crypto.randomUUID();
}

// Mock environment for seeding
const mockEnv = {
  DB: {
    prepare: (query: string) => ({
      run: async () => console.log(`Executed: ${query}`),
      bind: (...args: any[]) => ({
        run: async () => console.log(`Executed with bindings: ${query}`, args)
      })
    })
  },
  VEC: {
    upsert: async (vectors: any[]) => console.log('Upserted vectors:', vectors.length),
    query: async (vector: number[], options: any) => ({ matches: [] })
  },
  AI: {
    run: async (model: string, input: any) => {
      console.log(`AI model ${model} called with:`, input);
      return { data: [new Array(768).fill(0.1)] }; // Mock embedding
    }
  }
} as any;

async function seedDatabase() {
  console.log('🌱 Seeding database with demo content...');

  const dbService = new DatabaseService(mockEnv);
  const vectorizeService = new VectorizeService(mockEnv);
  const llmService = new LLMService(mockEnv);

  // Demo notes
  const demoNotes = [
    {
      id: generateId(),
      title: 'Cloudflare Workers AI Overview',
      content: `Cloudflare Workers AI provides serverless AI inference at the edge. It supports multiple models including Llama, Mistral, and specialized models for tasks like text generation, embeddings, and image analysis. The service is designed to run AI workloads close to users for low latency and high performance.

Key features:
- Edge-optimized inference
- Multiple model support
- Automatic scaling
- Global distribution
- Cost-effective pricing`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      title: 'Durable Objects Best Practices',
      content: `Durable Objects are Cloudflare's solution for stateful serverless computing. They provide strong consistency guarantees and can maintain state across requests.

Best practices:
- Use alarms for cleanup tasks
- Implement proper error handling
- Design for eventual consistency
- Use WebSockets for real-time features
- Monitor memory usage
- Implement proper lifecycle management`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      title: 'Vectorize for RAG Applications',
      content: `Vectorize is Cloudflare's vector database service, perfect for building RAG (Retrieval Augmented Generation) applications. It provides fast similarity search over embeddings.

Use cases:
- Semantic search
- Recommendation systems
- Document retrieval
- Knowledge base search
- Content discovery

Integration patterns:
- Embed documents during ingestion
- Query similar content during generation
- Use metadata for filtering
- Implement hybrid search strategies`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ];

  // Initialize database schema
  await dbService.initSchema();
  console.log('✅ Database schema initialized');

  // Insert demo notes
  for (const note of demoNotes) {
    await dbService.createNote(note);
    console.log(`📝 Created note: ${note.title}`);

    // Generate embedding and upsert to Vectorize
    const embedding = await llmService.generateEmbedding(note.content);
    await vectorizeService.upsertNote(note, embedding);
    console.log(`🔍 Generated embedding for: ${note.title}`);
  }

  console.log('🎉 Seeding completed successfully!');
  console.log('\nDemo notes created:');
  demoNotes.forEach(note => {
    console.log(`- ${note.title}`);
  });
}

// Run seeding if called directly
if (import.meta.main) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
