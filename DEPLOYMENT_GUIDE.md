# 🚀 CF Agents Demo - Complete Deployment Guide

## 📋 **Step-by-Step Deployment**

### **Step 1: Login to Cloudflare**
```bash
wrangler login
```
This will open your browser to authenticate with Cloudflare.

### **Step 2: Create Cloudflare Resources**

#### **Create KV Namespace**
```bash
wrangler kv:namespace create "KV_PREFS"
```
**Output will look like:**
```
🌀 Creating namespace with title "KV_PREFS"
✨ Success! Add the following to your configuration file:
[[kv_namespaces]]
binding = "KV_PREFS"
id = "abc123def456ghi789"
```

#### **Create D1 Database**
```bash
wrangler d1 create agents_db
```
**Output will look like:**
```
🌀 Creating database agents_db
✨ Success! Created new D1 database
Database ID: abc123def456ghi789
Database Name: agents_db
```

#### **Create Vectorize Index**
```bash
wrangler vectorize create agents-memory --dimensions=768
```
**Output will look like:**
```
🌀 Creating vectorize index agents-memory
✨ Success! Created new vectorize index
Index ID: abc123def456ghi789
Index Name: agents-memory
```

#### **Create Durable Objects Namespace**
```bash
wrangler durable-objects namespace create SESSION_DO
```
**Output will look like:**
```
🌀 Creating namespace with title "SESSION_DO"
✨ Success! Add the following to your configuration file:
[[durable_objects.bindings]]
name = "SESSION_DO"
class_name = "SessionDO"
id = "abc123def456ghi789"
```

### **Step 3: Update wrangler.toml**

Replace the placeholder IDs in `apps/worker-api/wrangler.toml`:

```toml
name = "cf-agents-demo"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[ai]
binding = "AI"

[[kv_namespaces]]
binding = "KV_PREFS"
id = "YOUR_ACTUAL_KV_ID"  # Replace this

[[d1_databases]]
binding = "DB"
database_name = "agents_db"
database_id = "YOUR_ACTUAL_D1_ID"  # Replace this

[[vectorize]]
binding = "VEC"
index_name = "agents-memory"
id = "YOUR_ACTUAL_VECTORIZE_ID"  # Replace this

[[durable_objects.bindings]]
name = "SESSION_DO"
class_name = "SessionDO"
id = "YOUR_ACTUAL_DO_ID"  # Replace this

[observability.logs]
enabled = true

[placement]
mode = "smart"
```

### **Step 4: Deploy the Worker**

```bash
cd apps/worker-api
wrangler deploy
```

**After deployment, you'll see output like:**
```
✨ Total Upload: 1.2 MB / gzipped: 0.3 MB
📦 cf-agents-demo.your-subdomain.workers.dev
🌍 https://cf-agents-demo.your-subdomain.workers.dev
```

**🎯 Your Worker URL will be: `https://cf-agents-demo.your-subdomain.workers.dev`**

### **Step 5: Test Your Deployment**

#### **Health Check**
```bash
curl https://cf-agents-demo.your-subdomain.workers.dev/health
```

#### **Chat API Test**
```bash
curl -X POST https://cf-agents-demo.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "messages": [{"role": "user", "content": "Hello!"}]}'
```

#### **Tools API Test**
```bash
curl -X POST https://cf-agents-demo.your-subdomain.workers.dev/api/tools/searchNotes \
  -H "Content-Type: application/json" \
  -d '{"query": "Cloudflare Workers AI"}'
```

### **Step 6: Deploy Frontend (Optional)**

```bash
cd apps/pages-frontend
npm install
npm run build
wrangler pages deploy dist
```

## 🔧 **What to Replace `your-worker` With**

### **Before Deployment:**
- `your-worker` is a placeholder in documentation
- You need to deploy first to get your actual Worker URL

### **After Deployment:**
- Your actual Worker URL will be: `https://cf-agents-demo.your-subdomain.workers.dev`
- Replace `your-worker` with your actual Worker name in all examples

### **Example Replacements:**

**❌ Before (placeholder):**
```bash
curl https://your-worker.workers.dev/health
```

**✅ After (your actual URL):**
```bash
curl https://cf-agents-demo.your-subdomain.workers.dev/health
```

## 📊 **Complete Deployment Checklist**

- [ ] ✅ Login to Cloudflare (`wrangler login`)
- [ ] ✅ Create KV namespace (`wrangler kv:namespace create "KV_PREFS"`)
- [ ] ✅ Create D1 database (`wrangler d1 create agents_db`)
- [ ] ✅ Create Vectorize index (`wrangler vectorize create agents-memory --dimensions=768`)
- [ ] ✅ Create Durable Objects namespace (`wrangler durable-objects namespace create SESSION_DO`)
- [ ] ✅ Update `wrangler.toml` with actual IDs
- [ ] ✅ Deploy Worker (`cd apps/worker-api && wrangler deploy`)
- [ ] ✅ Get your Worker URL from deployment output
- [ ] ✅ Test health endpoint
- [ ] ✅ Test chat API
- [ ] ✅ Test tools API

## 🎯 **Your Final Worker URL**

After successful deployment, your Worker will be available at:
```
https://cf-agents-demo.your-subdomain.workers.dev
```

Replace `your-subdomain` with your actual Cloudflare subdomain.

## 🧪 **Testing Commands with Your URL**

```bash
# Health check
curl https://cf-agents-demo.your-subdomain.workers.dev/health

# Chat API
curl -X POST https://cf-agents-demo.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "messages": [{"role": "user", "content": "Hello!"}]}'

# Tools API
curl -X POST https://cf-agents-demo.your-subdomain.workers.dev/api/tools/searchNotes \
  -H "Content-Type: application/json" \
  -d '{"query": "Cloudflare Workers AI"}'
```

## 🎉 **Success!**

Once deployed, you'll have a fully functional CF Agents demo with:
- ✅ LLM integration (Llama 3.3 70B)
- ✅ Workflow orchestration
- ✅ Voice capabilities
- ✅ Memory management
- ✅ RAG functionality
- ✅ Real-time chat interface

**Your Worker URL is your gateway to the CF Agents demo! 🚀**
