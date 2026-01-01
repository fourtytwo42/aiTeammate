# Architecture

## Summary
The system uses a Next.js frontend with API routes, Prisma for data access, PostgreSQL with pgvector, Redis for the message bus, and LangGraph for orchestration.

## Components
- Frontend: Next.js App Router
- API: Next.js API routes
- Database: PostgreSQL 16 with pgvector
- Message bus: Redis 7
- Orchestrator: LangGraph.js
- LLM gateway: LiteLLM proxy
