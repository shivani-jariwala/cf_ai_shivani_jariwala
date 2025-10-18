#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up CF Agents Demo...\n');

// Check if wrangler is installed
try {
  execSync('wrangler --version', { stdio: 'pipe' });
  console.log('✅ Wrangler CLI found');
} catch (error) {
  console.log('❌ Wrangler CLI not found. Installing...');
  execSync('npm install -g wrangler', { stdio: 'inherit' });
}

// Create KV namespace
console.log('\n📦 Creating KV namespace...');
try {
  const kvOutput = execSync('wrangler kv:namespace create "KV_PREFS"', { 
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', 'apps', 'worker-api')
  });
  console.log('✅ KV namespace created');
  console.log('📝 Add this to your wrangler.toml:');
  console.log(kvOutput);
} catch (error) {
  console.log('⚠️  KV namespace may already exist or failed to create');
}

// Create D1 database
console.log('\n🗄️  Creating D1 database...');
try {
  const d1Output = execSync('wrangler d1 create agents_db', { 
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', 'apps', 'worker-api')
  });
  console.log('✅ D1 database created');
  console.log('📝 Add this to your wrangler.toml:');
  console.log(d1Output);
} catch (error) {
  console.log('⚠️  D1 database may already exist or failed to create');
}

// Create Vectorize index
console.log('\n🔍 Creating Vectorize index...');
try {
  const vectorizeOutput = execSync('wrangler vectorize create agents-memory --dimensions=768', { 
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', 'apps', 'worker-api')
  });
  console.log('✅ Vectorize index created');
  console.log('📝 Add this to your wrangler.toml:');
  console.log(vectorizeOutput);
} catch (error) {
  console.log('⚠️  Vectorize index may already exist or failed to create');
}

// Create Durable Objects namespace
console.log('\n🔗 Creating Durable Objects namespace...');
try {
  const doOutput = execSync('wrangler durable-objects namespace create SESSION_DO', { 
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', 'apps', 'worker-api')
  });
  console.log('✅ Durable Objects namespace created');
  console.log('📝 Add this to your wrangler.toml:');
  console.log(doOutput);
} catch (error) {
  console.log('⚠️  Durable Objects namespace may already exist or failed to create');
}

// Create .dev.vars file if it doesn't exist
const devVarsPath = path.join(__dirname, '..', '.dev.vars');
if (!fs.existsSync(devVarsPath)) {
  console.log('\n📝 Creating .dev.vars file...');
  const devVarsContent = `# Copy this to .dev.vars and fill in your values
# Get these from Cloudflare Dashboard

# AI Model Configuration
AI_MODEL_ID=@cf/meta/llama-3.3-70b-instruct-fp8-fast

# Realtime Configuration
REALTIME_APP_ID=your-realtime-app-id
REALTIME_TOKEN=your-realtime-token

# Optional: External API keys if using fallback providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
`;
  fs.writeFileSync(devVarsPath, devVarsContent);
  console.log('✅ .dev.vars file created');
}

console.log('\n🎉 Setup completed!');
console.log('\nNext steps:');
console.log('1. Update wrangler.toml with the IDs from the commands above');
console.log('2. Fill in your .dev.vars file with actual values');
console.log('3. Run: pnpm run dev:all');
console.log('4. Run: pnpm run seed (to populate demo data)');
