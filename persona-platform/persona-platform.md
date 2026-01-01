---
title: Persona Platform
status: planning
category: AI Infrastructure
tags: [ai, agents, persona, multi-tenant, email, browser-automation, rag, office-automation]
keywords: [langgraph, litellm, pgvector, playwright, docker, nextjs, postgresql]
created: 2025-01-28
---

# Persona Platform

**Multi-tenant agentic AI workspace platform** - A comprehensive system for creating, managing, and running AI personas that can handle office work end-to-end: reading/sending email with attachments, browser automation, desktop VM control, document generation (PowerPoint, spreadsheets, PDFs), and narrated video creation. Each persona runs in isolated containers with its own RAG knowledge base, tool registry, and AI provider keys.

## Concept

**Problem Statement:** Modern office work requires handling repetitive tasks across multiple tools and platforms (email, document creation, browser research, data processing). Manual execution is time-consuming and error-prone. Existing AI assistants lack the ability to perform complex, multi-step office workflows that require accessing external systems, processing attachments, and delivering production-ready outputs.

**Solution Vision:** An agentic platform where users create "personas" (AI identities with custom personalities and capabilities) that can autonomously complete office work tasks. Each persona has isolated access to email, browser automation, desktop VMs, and a searchable tool registry. Personas can remember context through per-persona RAG knowledge bases, execute multi-step workflows (e.g., "read email request → research topic → create PowerPoint → generate video → send response"), and maintain full auditability of all actions.

**Core Philosophy:** 
- **Self-hosted first:** Minimize external API costs, run everything on a single VM where possible
- **Isolation by design:** Each persona runs in its own container with scoped secrets and permissions
- **Tool composability:** Searchable tool registry prevents context window bloat while enabling extensibility
- **Full auditability:** Every action (tool calls, email sends, file accesses) is logged for security and transparency
- **Multi-provider support:** Use LiteLLM for unified access to OpenAI, Anthropic, Groq, local models (Ollama/LM Studio)

**Target Users:** 
- Individual power users who want AI assistants to handle their office work
- Small teams sharing personas for common workflows
- Organizations needing auditable AI automation with isolation

**Success Metrics:**
- Number of personas created
- Tasks completed autonomously (email responses, document generations)
- User retention and daily active usage
- Cost per task (minimize API calls, maximize local execution)

## Core Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (UI)                     │
│  Login | Personas | Runs | Tools | Memory | Admin | Audit   │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  Node.js API Server                          │
│  Auth | Persona Management | Run Orchestration | File Store  │
└───────┬───────────────────────────────────────────┬─────────┘
        │                                           │
┌───────▼────────┐                      ┌──────────▼──────────┐
│  PostgreSQL    │                      │  LangGraph.js       │
│  + pgvector    │                      │  Orchestrator       │
│  (Data + RAG)  │                      │  (Durable Runs)     │
└───────┬────────┘                      └──────────┬──────────┘
        │                                           │
┌───────▼────────┐                      ┌──────────▼──────────┐
│    Redis       │                      │  Health Service     │
│  (Message Bus) │                      │  (Monitoring)       │
└────────────────┘                      └─────────────────────┘
        │                                           │
        │                      ┌────────────────────┼──────────────┐
        │                      │                    │              │
        │          ┌───────────▼──┐  ┌─────────────▼─────┐  ┌─────▼──────────┐
        │          │ LiteLLM Proxy│  │ Tool Registry     │  │ Persona        │
        │          │ (Multi-LLM)  │  │ + Dependencies    │  │ Containers     │
        │          └──────────────┘  └───────────────────┘  └──────┬─────────┘
        │                                                           │
        │                      ┌────────────────────────────────────┘
        │                      │
        │          ┌───────────┼───────────┬───────────┐
        │          │           │           │           │
┌───────▼────┐  ┌──▼─────┐  ┌─▼──────┐  ┌─▼──────────┐
│   Email    │  │Browser │  │Desktop │  │  Office    │
│ (IMAP/SMTP)│  │(Playw.)│  │   VM   │  │  Tools     │
│            │  │        │  │(VNC)   │  │(PPT/XLS)   │
└────────────┘  └────────┘  └────────┘  └────────────┘
                          
        ┌────────────────────────────────────────┐
        │   Tool Executors (Worker Processes)    │
        │   Subscribe to Redis, Execute Tools    │
        └────────────────────────────────────────┘
```

**Key Components:**

1. **Next.js Frontend** - User interface with dynamic persona themes, storytelling cards, and responsive layouts for managing personas, viewing runs, uploading documents to RAG, configuring tools
2. **Node.js API** - REST API for frontend, handles authentication, persona management, run orchestration
3. **PostgreSQL + pgvector** - Primary database (users, personas, runs, audit logs) + vector storage for RAG (per-persona embeddings)
4. **LangGraph.js** - Durable agent orchestration with trace ID propagation (handles multi-step workflows, state persistence, crash recovery)
5. **LiteLLM Proxy** - Unified OpenAI-compatible gateway to multiple LLM providers (OpenAI, Anthropic, Groq, Ollama, LM Studio)
6. **Tool Registry** - Searchable database of available tools with dependency graph (vector search on tool descriptions, minimal context injection)
7. **Redis Message Bus** - Asynchronous tool execution decoupling (pub/sub, queues, enables horizontal scaling)
8. **Persona Health Service** - Resource monitoring and alerting (CPU, RAM, LLM call tracking, cost monitoring)
9. **Persona Containers** - Docker containers (one per persona) with isolated workspaces, secrets, tool execution environment
10. **Connectors** - Email (IMAP/SMTP), Browser (Playwright), Desktop VM (VNC/NoVNC), Office Tools (PPT/XLS/PDF generation)
11. **Memory Curator** - Background job for automatic summarization of long conversations and document collections

### Technology Stack Summary

**Frontend:**
- Next.js 15.x (App Router)
- React 19.x
- TypeScript 5.x
- Tailwind CSS 3.x
- Shadcn/ui components

**Backend:**
- Node.js 20.x
- Express.js or Next.js API routes
- TypeScript 5.x
- Prisma ORM
- PostgreSQL 16.x with pgvector extension
- Redis 7.x (message bus, pub/sub, queues)

**AI/Agent Infrastructure:**
- LangGraph.js (orchestration)
- LiteLLM Proxy (multi-provider LLM gateway)
- OpenAI-compatible function calling (tool use standard)

**RAG/Memory:**
- pgvector (vector embeddings in PostgreSQL)
- Local embedding models (for generating embeddings)

**Tool Execution:**
- Docker (persona containers)
- gVisor (optional sandboxing for untrusted tools)
- Playwright (browser automation)
- Office libraries (PptxGenJS, ExcelJS, PDF generation)

**Communication:**
- IMAP/SMTP (email)
- VNC/NoVNC (desktop VM access)

**Deployment:**
- Single VM deployment (Docker Compose)
- PostgreSQL + Next.js + Worker processes

## Status

**Current Phase:** Planning / Architecture Design

**Next Steps:**
- [ ] Finalize database schema design (users, personas, runs, tools, RAG)
- [ ] Design API endpoints (authentication, persona CRUD, run management, tool registry)
- [ ] Define persona container specification (volumes, secrets, capabilities)
- [ ] Research and specify tool registry implementation (vector search, tool discovery)
- [ ] Design RAG ingestion and retrieval pipeline (chunking, embedding, retrieval)
- [ ] Specify LangGraph.js workflow patterns (task planning, tool execution, error handling)
- [ ] Design audit logging system (what to log, retention, query patterns)

## Project Artifacts

**Required Artifacts:**
- [Architecture Details](persona-platform-architecture.md) - Complete system design, component breakdown, data flow, technology choices
- [Database Schema](persona-platform-database.md) - Complete PostgreSQL schema with pgvector configuration, all tables, relationships, indexes
- [API Specifications](persona-platform-api.md) - All API endpoints, request/response formats, authentication, error handling
- [Implementation Guide](persona-platform-implementation.md) - Setup instructions, development workflow, coding patterns, deployment guide
- [UI Design & Styling](persona-platform-ui-design.md) - Pre-decided frontend layout, color palette, component states, motion, and styling guide

**Future Artifacts (as needed):**
- Security Threat Model - Attack vectors, isolation boundaries, sandboxing strategies
- Tool Registry Design - Tool discovery, vector search implementation, tool execution patterns
- RAG Pipeline Design - Document ingestion, chunking strategies, embedding models, retrieval algorithms
- Persona Container Specification - Docker image structure, volume mounts, secret injection, capability policies
