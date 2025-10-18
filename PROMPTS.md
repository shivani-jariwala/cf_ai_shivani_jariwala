# Initial Project Prompt

I want a production-grade, minimal-but-complete clone of the core ideas behind `https://agents.cloudflare.com/`. This clone should demonstrate:

## Core Requirements

### **LLM**: 
Run Llama 3.3 Instruct on Workers AI using `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, streaming responses.

### **Workflow/coordination**: 
Orchestrate multi-step tool calls (RAG retrieval + function tools) via Cloudflare Workflows, persisting workflow state.

### **Realtime chat + optional voice**: 
A Pages front-end with a chat UI and a voice toggle using Cloudflare Realtime (WebRTC), Workers to broker sessions, and Workers AI for STT/TTS.

### **Memory/state**:
- Short-term: Per-session turns in Durable Objects.
- Long-term: Embeddings in Vectorize with a D1 notes/knowledge base (or KV for small prefs).

## Project Layout

A monorepo with pnpm workspaces: `apps/pages-frontend/`, `apps/worker-api/`, `workflow/`, `packages/shared/`, and a root `wrangler.toml`.

## Tech Choices

- Workers AI + AI binding
- Hono for Worker router
- Workflows for orchestration
- Durable Objects for session state
- Vectorize for embeddings
- D1 for note metadata/transcripts
- KV for user prefs
- Cloudflare Realtime for voice

## Features to Implement

### **Chat route (`POST /api/chat`)**:
Store user message in DO, embed/query Vectorize for RAG context, call Llama 3.3 (stream SSE), append assistant message to DO/D1, return usage/citations.

### **Tools**: 
`searchNotes(query)`, `saveNote(title, content)`, `setPreference(key, value)`.

### **Voice (MVP)**: 
Frontend mic button (WebRTC) to capture audio, Worker relays to STT, returns text, streams LLM response, synthesizes TTS back.

### **Pages UI**: 
Minimal chat UI, input box, stop streaming, model switcher, memory toggle, voice toggle, retrieved context snippets, persist `sessionId` to `localStorage`.

## Storage/bindings

Full `wrangler.toml` configuration for AI, KV, D1, Vectorize, Durable Objects, logs, and placement. Include D1 migrations and workflow definitions.

## Code to be Generated

### **Worker API (`apps/worker-api`)**:
- `src/index.ts` (Hono routes)
- `src/llm.ts` (Workers AI client, streaming, OpenAI-compatible path)
- `src/vectorize.ts` (upsert/search helpers)
- `src/do.ts` (SessionDO class)
- `src/db.ts` (D1 schema/helpers)
- `src/kv.ts` (KV wrapper)
- `src/workflow.ts` (Workflows definition)

### **Frontend (`apps/pages-frontend`)**:
- Vite + React app
- Pages Functions proxy
- Components (Chat, Message, Settings, MemoryChips, VoiceToggle)
- `useChat` hook
- WebRTC setup with `RealtimeClient` util

### **RAG demo content**: 
`scripts/seed.ts` to insert demo notes.

### **Testing & DX**: 
`eslint`, `prettier`, TypeScript strict, npm scripts (`dev:worker`, `dev:pages`, `dev:all`, `deploy`), `.dev.vars` example, `README.md` with one-command setup.

## Acceptance Criteria

- Text chat works
- Workflow path exercised
- Memory works
- Voice works
- Deployable via `wrangler deploy` and Pages

## Commands to Include in README

- `pnpm i -w`
- `pnpm run setup`
- `pnpm run dev:all`
- `pnpm run deploy`

## Security & Performance Notes

- Stream SSE with backpressure
- Sanitize input
- Cap tokens
- Timeouts/retries
- Log usage
- Model switch path

## Deliverables

- Working repo
- `README` with screenshots/GIFs
- Clear deploy steps
- Simple styling

## Citations

Specific Cloudflare Docs links for various services.
