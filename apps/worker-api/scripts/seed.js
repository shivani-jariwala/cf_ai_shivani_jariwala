// JavaScript version of seed script for Node.js compatibility
const { generateId } = require('@cf-agents/shared');

async function seedDatabase() {
  console.log('🌱 Seeding database with demo content...');

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

  console.log('🎉 Seeding completed successfully!');
  console.log('\nDemo notes created:');
  demoNotes.forEach(note => {
    console.log(`- ${note.title}`);
  });
}

// Run seeding
seedDatabase().catch(console.error);
