# CF Agents Demo

A production-grade clone of Cloudflare Agents demonstrating LLM integration, Workflows orchestration, Realtime voice capabilities, and RAG with memory management.

## 🌐 Live Demo

**Frontend**: https://ad1213b9.cf-agents-demo.pages.dev

Try the live demo to experience:
- Real-time chat with Llama 3.3 70B
- Voice transcription and synthesis
- Memory persistence across sessions
- RAG-powered knowledge retrieval

## 🚀 Features

- **LLM Integration**: Llama 3.3 70B Instruct on Workers AI with streaming responses
- **Workflow Orchestration**: Multi-step tool calls via Cloudflare Workflows
- **Realtime Voice**: WebRTC-based voice input/output using Cloudflare Realtime
- **Memory Management**: 
  - Short-term: Durable Objects for session state
  - Long-term: Vectorize embeddings + D1 knowledge base
- **RAG Capabilities**: Semantic search and retrieval from knowledge base
- **Modern UI**: React frontend with clean chat interface

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Worker API    │    │  Cloudflare AI │
│   (Pages)       │◄──►│   (Hono Router) │◄──►│  (Workers AI)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Durable Objects│
                    │   (Session State)│
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   Vectorize     │    │   D1 Database   │
                    │   (Embeddings)  │    │   (Knowledge)   │
                    └─────────────────┘    └─────────────────┘
```

## 📦 Project Structure

```
cf-agents-demo/
├── apps/
│   ├── pages-frontend/     # React + Vite frontend
│   └── worker-api/         # Hono Worker API
├── packages/
│   └── shared/             # Shared types and utilities
├── scripts/
│   └── setup.js           # Setup automation
└── wrangler.toml          # Cloudflare configuration
```

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Cloudflare Workers + Hono
- **AI**: Workers AI (Llama 3.3, Whisper, TTS)
- **Storage**: D1 (SQL), KV (preferences), Vectorize (embeddings)
- **State**: Durable Objects (session management)
- **Voice**: Cloudflare Realtime (WebRTC)
- **Orchestration**: Cloudflare Workflows

## 🚀 Quick Start

### Prerequisites

- Node.js v20.0.0 or higher
- pnpm package manager
- Cloudflare account with Workers AI enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cf-agents-demo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Cloudflare resources**
   ```bash
   pnpm run setup
   ```

4. **Start development servers**
   ```bash
   pnpm run dev:all
   ```

5. **Open the application**
   - Frontend: http://localhost:5173/
   - API: http://localhost:8787/

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm run dev:all          # Start both frontend and worker
pnpm run dev:worker       # Start worker API only
pnpm run dev:pages        # Start frontend only

# Deployment
pnpm run deploy           # Deploy to Cloudflare

# Setup
pnpm run setup            # Setup Cloudflare resources
```

### Environment Variables

Create `.dev.vars` file in the root directory (this file is gitignored):

```bash
# Cloudflare Account ID
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Realtime (optional for voice features)
REALTIME_APP_ID=your_realtime_app_id
REALTIME_TOKEN=your_realtime_token
```

**⚠️ Security Note**: Never commit sensitive environment variables to the repository. Use Cloudflare secrets for production deployment.

## 🎯 Key Features

### Chat Interface
- Real-time streaming responses
- Message persistence across sessions
- Voice input/output capabilities
- Memory management with RAG

### Voice Features
- WebRTC-based audio capture
- Speech-to-text using Workers AI
- Text-to-speech synthesis
- Real-time audio streaming

### Memory System
- Session state in Durable Objects
- Knowledge base in D1 database
- Semantic search with Vectorize
- User preferences in KV storage

## 🚀 Deployment

### Prerequisites
- Cloudflare account with Workers AI enabled
- Wrangler CLI installed and authenticated

### Deploy to Cloudflare

1. **Deploy Worker API**
   ```bash
   cd apps/worker-api
   wrangler deploy
   ```

2. **Deploy Frontend to Pages**
   ```bash
   cd apps/pages-frontend
   wrangler pages deploy dist
   ```

### Production Configuration

Update the following for production:
- Set proper CORS origins in `apps/worker-api/src/index.ts`
- Configure environment variables
- Set up custom domains
- Enable proper logging and monitoring

## 📚 API Endpoints

### Chat
- `POST /api/chat` - Send message and get AI response

### Voice
- `POST /api/voice/session` - Create voice session
- `POST /api/voice/transcribe` - Convert speech to text
- `POST /api/voice/synthesize` - Convert text to speech

### Tools
- `POST /api/tools/searchNotes` - Search knowledge base
- `POST /api/tools/saveNote` - Save new note
- `POST /api/tools/setPreference` - Set user preference

### Health
- `GET /health` - API health check

## 🔍 Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js v20.0.0 or higher
2. **Wrangler Version**: Update to the latest version with `npm install -g wrangler@latest`
3. **CORS Issues**: Check that frontend URL is allowed in CORS configuration
4. **Voice Features**: Ensure microphone permissions are granted

### Debug Mode

Enable debug logging by setting `DEBUG=true` in your environment variables.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔒 Security

This project follows security best practices:

- **Environment Variables**: All secrets stored in environment variables
- **No Hardcoded Keys**: No API keys or tokens in source code
- **CORS Protection**: Properly configured cross-origin policies
- **Input Validation**: All user inputs are sanitized
- **Secure Storage**: D1, KV, and Vectorize with proper access controls

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Cloudflare documentation for Workers AI

---

**Built with ❤️ using Cloudflare Workers AI, Durable Objects, and Vectorize**