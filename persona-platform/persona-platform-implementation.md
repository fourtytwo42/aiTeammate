# Persona Platform - Implementation Guide

**Complete implementation guide, development setup, coding patterns, deployment strategy, and testing requirements.**

## Table of Contents

1. [Project Structure](#project-structure)
2. [Development Setup](#development-setup)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Development Phases](#development-phases)
6. [Coding Patterns & Conventions](#coding-patterns--conventions)
7. [Authentication Implementation](#authentication-implementation)
8. [Persona Container Implementation](#persona-container-implementation)
9. [LangGraph.js Orchestration Implementation](#langgraphjs-orchestration-implementation)
10. [Tool Registry Implementation](#tool-registry-implementation)
11. [RAG System Implementation](#rag-system-implementation)
12. [Email Connector Implementation](#email-connector-implementation)
13. [Browser Connector Implementation](#browser-connector-implementation)
14. [Office Tools Implementation](#office-tools-implementation)
15. [LiteLLM Proxy Setup](#litellm-proxy-setup)
16. [Error Handling & Retry Logic](#error-handling--retry-logic)
17. [Testing Strategy](#testing-strategy)
18. [Deployment Strategy](#deployment-strategy)
19. [Performance Optimization](#performance-optimization)

## Project Structure

```
persona-platform/
├── .env.local                    # Local environment variables
├── .env.example                  # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── docker-compose.yml            # Docker Compose for local development
├── Dockerfile                    # Dockerfile for persona containers
├── prisma/
│   ├── schema.prisma            # Prisma schema
│   └── migrations/              # Database migrations
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── personas/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── runs/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── tools/
│   │   │   │   └── page.tsx
│   │   │   ├── memory/
│   │   │   │   └── [personaId]/
│   │   │   │       └── page.tsx
│   │   │   ├── admin/            # Admin-only routes
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── audit/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                  # API routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── refresh/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   │   └── me/
│   │   │   │       └── route.ts
│   │   │   ├── personas/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── agents/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── tools/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── memory/
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   │   ├── upload/
│   │   │   │   │   │   │   └── route.ts
│   │   │   │   │   │   └── search/
│   │   │   │   │   │       └── route.ts
│   │   │   │   │   └── connectors/
│   │   │   │   │       └── route.ts
│   │   │   │   └── [id]/members/
│   │   │   │       └── route.ts
│   │   │   ├── agents/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── runs/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/cancel/
│   │   │   │       └── route.ts
│   │   │   ├── tools/
│   │   │   │   ├── route.ts
│   │   │   │   ├── search/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── audit/
│   │   │   │   └── route.ts
│   │   │   └── admin/
│   │   │       ├── users/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts
│   │   │       └── settings/
│   │   │           └── route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── personas/
│   │   │   ├── PersonaList.tsx
│   │   │   ├── PersonaCard.tsx
│   │   │   ├── PersonaDetail.tsx
│   │   │   └── PersonaForm.tsx
│   │   ├── runs/
│   │   │   ├── RunList.tsx
│   │   │   ├── RunDetail.tsx
│   │   │   ├── RunTimeline.tsx
│   │   │   └── RunStep.tsx
│   │   ├── tools/
│   │   │   ├── ToolList.tsx
│   │   │   ├── ToolCard.tsx
│   │   │   └── ToolSearch.tsx
│   │   └── memory/
│   │       ├── DocumentList.tsx
│   │       ├── DocumentUpload.tsx
│   │       └── RAGSearch.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts         # Prisma client
│   │   ├── auth/
│   │   │   ├── jwt.ts            # JWT utilities
│   │   │   └── middleware.ts     # Auth middleware
│   │   ├── orchestrator/
│   │   │   ├── langgraph.ts      # LangGraph.js setup
│   │   │   ├── runner.ts         # Run orchestrator
│   │   │   └── state.ts          # State management
│   │   ├── tools/
│   │   │   ├── registry.ts       # Tool registry
│   │   │   ├── search.ts         # Tool search (vector)
│   │   │   ├── executor.ts       # Tool executor
│   │   │   └── builtin/          # Built-in tools
│   │   │       ├── powerpoint.ts
│   │   │       ├── spreadsheet.ts
│   │   │       ├── email.ts
│   │   │       ├── browser.ts
│   │   │       └── ...
│   │   ├── rag/
│   │   │   ├── ingestion.ts      # Document ingestion
│   │   │   ├── chunking.ts       # Text chunking
│   │   │   ├── embedding.ts      # Embedding generation
│   │   │   └── retrieval.ts      # Vector search
│   │   ├── containers/
│   │   │   ├── docker.ts         # Docker API client
│   │   │   ├── manager.ts        # Container manager
│   │   │   └── secrets.ts        # Secret injection
│   │   ├── email/
│   │   │   ├── imap.ts           # IMAP client
│   │   │   ├── smtp.ts           # SMTP client
│   │   │   └── processor.ts      # Email processing
│   │   ├── llm/
│   │   │   ├── litellm.ts        # LiteLLM client
│   │   │   └── providers.ts      # Provider configuration
│   │   └── audit/
│   │       └── logger.ts         # Audit logging
│   ├── workers/
│   │   ├── run-worker.ts         # Run execution worker
│   │   ├── email-worker.ts       # Email polling worker
│   │   └── rag-worker.ts         # RAG ingestion worker
│   └── types/
│       ├── persona.ts
│       ├── run.ts
│       ├── tool.ts
│       └── api.ts
├── tools/                         # Tool implementations (executed in containers)
│   ├── generate_powerpoint/
│   │   └── index.js
│   ├── generate_spreadsheet/
│   │   └── index.js
│   └── ...
└── docs/                          # Documentation
    └── README.md
```

## Development Setup

### Prerequisites

**Required:**
- Node.js 20.x
- PostgreSQL 16.x (with pgvector extension)
- Docker & Docker Compose (for persona containers)
- npm 10.x or yarn 1.22.x

**Optional (for local LLM testing):**
- Ollama (for local LLM testing)
- LM Studio (alternative local LLM)

### Installation Steps

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-org/persona-platform.git
   cd persona-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up database:**
   ```bash
   # Start PostgreSQL (via Docker or local installation)
   docker-compose up -d postgres

   # Run migrations
   npm run db:migrate
   # or
   npx prisma migrate dev
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Access application:**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`

### Database Setup

**PostgreSQL with pgvector:**

1. **Install pgvector extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Run Prisma migrations:**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed database (optional):**
   ```bash
   npx prisma db seed
   ```

**Seed data includes:**
- Demo user and admin accounts
- Built-in tools
- Sample personas (optional)

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/persona_platform?schema=public"

# Authentication
JWT_SECRET="your-jwt-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-token-secret-min-32-chars"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption (for secrets storage)
ENCRYPTION_KEY="your-encryption-key-32-chars-exactly"

# LiteLLM Proxy
LITELLM_PROXY_URL="http://localhost:4000"

# Redis (Message Bus)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # Optional

# Docker
DOCKER_SOCKET_PATH="/var/run/docker.sock"

# File Storage
STORAGE_PATH="./storage"
MAX_FILE_SIZE=104857600  # 100MB

# Email (optional, for email connector)
SMTP_FROM_EMAIL="noreply@yourdomain.com"
SMTP_FROM_NAME="Persona Platform"

# LLM Providers (optional, for testing)
OPENAI_API_KEY="sk-..."  # Optional: for testing
ANTHROPIC_API_KEY="sk-ant-..."  # Optional: for testing
GROQ_API_KEY="gsk_..."  # Optional: for testing
```

### Optional Variables

```bash
# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"  # debug, info, warn, error
LOG_FILE="./logs/app.log"

# CORS
CORS_ORIGIN="http://localhost:3000"

# WebSocket
WEBSOCKET_PORT=3001
```

## Development Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
- [ ] Database schema and migrations
- [ ] Authentication system (JWT)
- [ ] User management (CRUD)
- [ ] Basic API structure
- [ ] Frontend authentication pages

### Phase 2: Persona Management (Weeks 3-4)
- [ ] Persona CRUD APIs
- [ ] Persona sharing (members)
- [ ] Frontend persona management UI
- [ ] Docker container management
- [ ] Secret management (encryption)

### Phase 3: Tool Registry (Weeks 5-6)
- [ ] Tool registry database schema
- [ ] Built-in tool implementations
- [ ] Tool search (vector search)
- [ ] Tool permission system
- [ ] Frontend tool browser

### Phase 4: RAG System (Weeks 7-8)
- [ ] Document upload and storage
- [ ] Text chunking pipeline
- [ ] Embedding generation (local model)
- [ ] Vector storage (pgvector)
- [ ] RAG retrieval API
- [ ] Frontend RAG UI

### Phase 5: LangGraph.js Orchestration (Weeks 9-10)
- [ ] LangGraph.js setup
- [ ] Run state management
- [ ] Trace ID generation and propagation
- [ ] Redis message bus setup
- [ ] Tool execution via message bus
- [ ] LiteLLM Proxy integration
- [ ] Run workflow implementation

### Phase 6: Connectors (Weeks 11-12)
- [ ] Email connector (IMAP/SMTP)
- [ ] Browser connector (Playwright)
- [ ] Desktop VM connector (VNC)
- [ ] Connector configuration UI

### Phase 7: Advanced Features (Weeks 13-14)
- [ ] Persona health service (monitoring worker)
- [ ] Memory curator job (automatic summarization)
- [ ] Tool dependency graph implementation
- [ ] Observability dashboard (trace ID correlation)
- [ ] Dynamic persona themes in frontend
- [ ] Storytelling cards (dashboard metrics)

### Phase 8: Frontend & Polish (Weeks 15-16)
- [ ] Run detail view with trace IDs
- [ ] Real-time updates (WebSocket)
- [ ] Admin panel with health metrics
- [ ] Audit log viewer with trace correlation
- [ ] Responsive layout implementation
- [ ] Error handling and validation
- [ ] Testing and bug fixes

## Coding Patterns & Conventions

### TypeScript

**Strict Mode:** Enabled
- `strict: true` in tsconfig.json
- No implicit `any`
- Strict null checks

**Naming Conventions:**
- Files: `kebab-case.ts` or `PascalCase.tsx` (components)
- Functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### API Routes

**Pattern:** Next.js App Router API routes

**Structure:**
```typescript
// app/api/personas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const personas = await prisma.persona.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      }
    });

    return NextResponse.json({ data: personas });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database Access

**Pattern:** Prisma ORM with singleton client

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Error Handling

**Pattern:** Consistent error responses

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Authentication Middleware

**Pattern:** Reusable authentication middleware

```typescript
// lib/auth/middleware.ts
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export async function authenticate(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
}
```

## Authentication Implementation

### JWT Token Generation

```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}
```

### Password Hashing

```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

## Frontend Experience & Styling Decisions

- The frontend implementation follows `persona-platform-ui-design.md` without deviation. Layout (left rail, center workspace, right utility column), color palette, typography, and motion are locked in.
- **Color palette tokens:** primary accent `#7E5DFF`, secondary accent `#FFA726`, background `#0B0F1E`, panel `#13182B`, outline `rgba(255,255,255,0.08)`, gradient `linear-gradient(135deg,#7E5DFF,#4DA0FC)`. These tokens feed Tailwind variables (`--color-primary`, etc.).
- **Typography tokens:** Headers use `Space Grotesk` (48/34/26), body uses `Inter` (16). Buttons use uppercase with `letter-spacing: 0.08em` and weight 600.
- **Component utilities:** Implement `.glass-panel`, `.neon-button`, `.shimmer-surface`, and `.line-timeline` classes to encapsulate blur effects, gradients, and shadows. Apply these consistently as described in the design doc.
- **Motion:** All focus states use `box-shadow: 0 0 0 3px rgba(126,93,255,0.35)` with `transition: transform 220ms cubic-bezier(0.22,1,0.36,1)`; reduced-motion mode disables shimmer and pulsing.
- **Component states:** Login card, persona tiles, run timeline items follow the state tables (idle, hover, running, failed) outlined in the UI doc.
- This section leaves styling decisions fully determined so the frontend can be implemented with no open questions.

## Persona Container Implementation

### Docker Container Management

```typescript
// lib/containers/docker.ts
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function createPersonaContainer(personaId: string): Promise<string> {
  const container = await docker.createContainer({
    Image: 'persona-platform:latest',
    name: `persona-${personaId}`,
    Env: [`PERSONA_ID=${personaId}`],
    HostConfig: {
      Binds: [
        `${STORAGE_PATH}/personas/${personaId}/workspace:/workspace`,
        `${STORAGE_PATH}/personas/${personaId}/cache:/cache`,
      ],
      Memory: 2 * 1024 * 1024 * 1024, // 2GB
      CpuShares: 512,
    },
  });

  await container.start();
  return container.id;
}

export async function stopPersonaContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.stop();
}

export async function execInContainer(
  containerId: string,
  command: string[]
): Promise<string> {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: command,
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({ hijack: true, stdin: false });
  // Handle stream output...
  return output;
}
```

## LangGraph.js Orchestration Implementation

### LangGraph Setup

```typescript
// lib/orchestrator/langgraph.ts
import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// Define state interface
interface RunState {
  messages: any[];
  toolResults: any[];
  currentStep: number;
}

// Create graph
const workflow = new StateGraph<RunState>({
  channels: {
    messages: { reducer: (x, y) => x.concat(y), default: () => [] },
    toolResults: { reducer: (x, y) => x.concat(y), default: () => [] },
    currentStep: { reducer: (x, y) => y ?? x, default: () => 0 },
  },
});

// Add nodes
workflow.addNode('llm', llmNode);
workflow.addNode('tools', toolNode);
workflow.addEdge(START, 'llm');
workflow.addConditionalEdges('llm', shouldContinue);
workflow.addEdge('tools', 'llm');
workflow.addEdge('llm', END);

const app = workflow.compile();
```

### Run Execution

```typescript
// lib/orchestrator/runner.ts
import { prisma } from '@/lib/db/prisma';
import { app } from './langgraph';

export async function executeRun(runId: string): Promise<void> {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { agent: { include: { persona: true } } },
  });

  if (!run) throw new Error('Run not found');

  // Update status
  await prisma.run.update({
    where: { id: runId },
    data: { status: 'running', startedAt: new Date() },
  });

  try {
    // Execute LangGraph workflow
    const result = await app.invoke({
      messages: [{ role: 'user', content: run.input }],
      toolResults: [],
      currentStep: 0,
    });

    // Update run with output
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'completed',
        output: result.messages[result.messages.length - 1].content,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      },
    });
  }
}
```

## Redis Message Bus Implementation

### Redis Setup

```typescript
// lib/message-bus/redis.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

export { redis };
```

### Tool Execution Publisher

```typescript
// lib/message-bus/publisher.ts
import { redis } from './redis';

export async function publishToolExecution(
  personaId: string,
  toolId: string,
  parameters: any,
  traceId: string
): Promise<void> {
  const message = {
    personaId,
    toolId,
    parameters,
    traceId,
    timestamp: Date.now(),
  };

  await redis.publish(`tool:execute:${personaId}`, JSON.stringify(message));
}
```

### Tool Executor (Worker)

```typescript
// workers/tool-executor.ts
import { redis } from '@/lib/message-bus/redis';
import { executeTool } from '@/lib/tools/executor';
import { prisma } from '@/lib/db/prisma';

export async function startToolExecutor() {
  const subscriber = redis.duplicate();
  await subscriber.subscribe('tool:execute:*');

  subscriber.on('message', async (channel, message) => {
    const { personaId, toolId, parameters, traceId } = JSON.parse(message);

    try {
      const startTime = Date.now();
      const result = await executeTool(personaId, toolId, parameters);
      const durationMs = Date.now() - startTime;

      // Log tool execution
      await prisma.toolRun.create({
        data: {
          toolId,
          runId: null, // Will be set by orchestrator
          traceId,
          input: parameters,
          output: result,
          durationMs,
        },
      });

      // Publish result back
      await redis.publish(`tool:result:${traceId}`, JSON.stringify({
        toolId,
        result,
        traceId,
        durationMs,
      }));
    } catch (error) {
      await redis.publish(`tool:error:${traceId}`, JSON.stringify({
        toolId,
        error: error.message,
        traceId,
      }));
    }
  });
}
```

## Observability & Tracing Implementation

### Trace ID Generation

```typescript
// lib/observability/trace.ts
import { v4 as uuidv4 } from 'uuid';

export function generateTraceId(): string {
  return `run-${uuidv4()}`;
}

export function extractTraceId(headers: Record<string, string>): string | null {
  return headers['x-trace-id'] || null;
}
```

### Trace Propagation

```typescript
// lib/orchestrator/runner.ts
import { generateTraceId } from '@/lib/observability/trace';

export async function executeRun(runId: string): Promise<void> {
  const run = await prisma.run.findUnique({ where: { id: runId } });
  if (!run) throw new Error('Run not found');

  // Generate or use existing trace ID
  const traceId = run.traceId || generateTraceId();
  if (!run.traceId) {
    await prisma.run.update({
      where: { id: runId },
      data: { traceId },
    });
  }

  // Include trace ID in all operations
  // ... rest of execution
}
```

### Audit Logging with Trace ID

```typescript
// lib/audit/logger.ts
import { prisma } from '@/lib/db/prisma';

export async function logAuditEvent(data: {
  userId?: string;
  personaId?: string;
  runId?: string;
  traceId?: string;
  eventType: string;
  description: string;
  metadata?: any;
}): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      userId: data.userId,
      personaId: data.personaId,
      runId: data.runId,
      traceId: data.traceId,
      eventType: data.eventType,
      eventCategory: 'action',
      description: data.description,
      metadata: data.metadata || {},
    },
  });
}
```

## Persona Health Service Implementation

### Health Monitor Worker

```typescript
// workers/health-monitor.ts
import Docker from 'dockerode';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/message-bus/redis';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function startHealthMonitor() {
  setInterval(async () => {
    const personas = await prisma.persona.findMany({
      where: { isActive: true, containerId: { not: null } },
    });

    for (const persona of personas) {
      if (!persona.containerId) continue;

      try {
        const container = docker.getContainer(persona.containerId);
        const stats = await container.stats({ stream: false });

        // Calculate CPU and memory usage
        const cpuPercent = calculateCpuPercent(stats);
        const memoryMb = stats.memory_stats.usage / 1024 / 1024;
        const memoryPercent = (memoryMb / (stats.memory_stats.limit / 1024 / 1024)) * 100;

        // Get LLM call count (from LiteLLM or Redis counter)
        const llmCalls = await getLlmCallCount(persona.id);

        // Store health metrics
        await prisma.personaHealthMetric.create({
          data: {
            personaId: persona.id,
            cpuPercent,
            memoryMb: Math.round(memoryMb),
            memoryPercent,
            llmCallsCount: llmCalls,
            activeRunsCount: await getActiveRunsCount(persona.id),
          },
        });

        // Check for alerts
        if (cpuPercent > 80 || memoryPercent > 90) {
          await sendHealthAlert(persona.id, { cpuPercent, memoryPercent });
        }
      } catch (error) {
        console.error(`Health check failed for persona ${persona.id}:`, error);
      }
    }
  }, 30000); // Every 30 seconds
}

function calculateCpuPercent(stats: any): number {
  // CPU calculation from Docker stats
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const numCpus = stats.cpu_stats.online_cpus;
  return (cpuDelta / systemDelta) * numCpus * 100;
}
```

## Memory Curator Implementation

### Memory Curator Job

```typescript
// workers/memory-curator.ts
import { prisma } from '@/lib/db/prisma';
import { generateEmbedding } from '@/lib/rag/embedding';

export async function runMemoryCurator() {
  // Find personas with large conversation/document collections
  const personas = await prisma.persona.findMany({
    where: { isActive: true },
    include: {
      chunks: {
        where: { isCurated: false },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  for (const persona of personas) {
    // Group chunks by document or conversation thread
    const chunksToSummarize = persona.chunks.slice(0, 100); // Last 100 chunks

    if (chunksToSummarize.length < 20) continue; // Skip if too few chunks

    // Generate summary using LLM
    const summaryText = await generateSummary(chunksToSummarize.map(c => c.text));

    // Create embedding for summary
    const embedding = await generateEmbedding(summaryText);

    // Store as curated chunk
    await prisma.chunk.create({
      data: {
        documentId: null, // Curated chunks aren't tied to a document
        personaId: persona.id,
        chunkIndex: 0,
        text: summaryText,
        tokenCount: estimateTokenCount(summaryText),
        embedding,
        isCurated: true,
        sourceChunkIds: chunksToSummarize.map(c => c.id),
      },
    });
  }
}

async function generateSummary(texts: string[]): Promise<string> {
  // Use LiteLLM to generate summary
  // Implementation depends on LLM provider
  return 'Summary text...';
}
```

## Tool Dependency Graph Implementation

### Tool Dependency Queries

```typescript
// lib/tools/dependencies.ts
import { prisma } from '@/lib/db/prisma';

export async function getToolDependencies(toolId: string): Promise<any[]> {
  return await prisma.toolDependency.findMany({
    where: { toolId },
    include: {
      dependsOnTool: {
        select: { id: true, name: true, description: true },
      },
    },
  });
}

export async function getToolDependencyChain(toolId: string): Promise<string[]> {
  // Recursive query to get all dependencies
  const visited = new Set<string>();
  const chain: string[] = [];

  async function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const deps = await getToolDependencies(id);
    for (const dep of deps) {
      await traverse(dep.dependsOnToolId);
      chain.push(dep.dependsOnToolId);
    }
  }

  await traverse(toolId);
  return chain;
}
```

## Tool Registry Implementation

### Tool Search (Vector Search with Dependencies)

```typescript
// lib/tools/search.ts
import { prisma } from '@/lib/db/prisma';
import { generateEmbedding } from '@/lib/rag/embedding';

export async function searchTools(query: string, limit: number = 5): Promise<any[]> {
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Vector search in pgvector
  const tools = await prisma.$queryRaw`
    SELECT
      t.id,
      t.name,
      t.description,
      t.category,
      1 - (t.description_embedding <=> ${queryEmbedding}::vector) as similarity
    FROM tools t
    WHERE t.description_embedding IS NOT NULL
    ORDER BY t.description_embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `;

  return tools;
}
```

### Tool Execution (via Message Bus)

```typescript
// lib/tools/executor.ts
import { publishToolExecution } from '@/lib/message-bus/publisher';
import { redis } from '@/lib/message-bus/redis';

export async function executeTool(
  personaId: string,
  toolId: string,
  parameters: any,
  traceId: string
): Promise<any> {
  // Publish tool execution request
  await publishToolExecution(personaId, toolId, parameters, traceId);

  // Wait for result (with timeout)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscriber.unsubscribe();
      reject(new Error('Tool execution timeout'));
    }, 300000); // 5 minute timeout

    const subscriber = redis.duplicate();
    subscriber.subscribe(`tool:result:${traceId}`, `tool:error:${traceId}`);

    subscriber.on('message', (channel, message) => {
      clearTimeout(timeout);
      subscriber.unsubscribe();

      const data = JSON.parse(message);
      if (channel.includes('error')) {
        reject(new Error(data.error));
      } else {
        resolve(data.result);
      }
    });
  });
}
```

## RAG System Implementation

### Document Ingestion

```typescript
// lib/rag/ingestion.ts
import { chunkText } from './chunking';
import { generateEmbedding } from './embedding';
import { prisma } from '@/lib/db/prisma';

export async function ingestDocument(
  personaId: string,
  documentId: string
): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document) throw new Error('Document not found');

  // Read document text
  const text = await readDocumentText(document.filePath);

  // Chunk text
  const chunks = chunkText(text, { chunkSize: 1000, overlap: 200 });

  // Generate embeddings and store
  for (const [index, chunk] of chunks.entries()) {
    const embedding = await generateEmbedding(chunk.text);

    await prisma.chunk.create({
      data: {
        documentId: document.id,
        personaId: personaId,
        chunkIndex: index,
        text: chunk.text,
        tokenCount: estimateTokenCount(chunk.text),
        embedding: embedding,
      },
    });
  }

  // Update document status
  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'completed' },
  });
}
```

### RAG Retrieval (with Curated Chunks)

```typescript
// lib/rag/retrieval.ts
import { prisma } from '@/lib/db/prisma';
import { generateEmbedding } from './embedding';

export async function searchRAG(
  personaId: string,
  query: string,
  limit: number = 5,
  preferCurated: boolean = true
): Promise<any[]> {
  const queryEmbedding = await generateEmbedding(query);

  // Prioritize curated chunks if available
  const chunks = await prisma.$queryRaw`
    SELECT
      c.id,
      c.text,
      c.document_id,
      d.name as document_name,
      c.is_curated,
      1 - (c.embedding <=> ${queryEmbedding}::vector) as similarity,
      CASE WHEN c.is_curated THEN 1 ELSE 0 END as curated_boost
    FROM chunks c
    LEFT JOIN documents d ON d.id = c.document_id
    WHERE c.persona_id = ${personaId}
    ORDER BY 
      curated_boost DESC,
      c.embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `;

  return chunks;
}
```

## Email Connector Implementation

### IMAP Email Reading

```typescript
// lib/email/imap.ts
import { ImapFlow } from 'imapflow';

export async function connectIMAP(config: {
  host: string;
  port: number;
  username: string;
  password: string;
}): Promise<ImapFlow> {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: true,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  await client.connect();
  return client;
}

export async function readEmails(
  client: ImapFlow,
  limit: number = 10
): Promise<any[]> {
  const mailbox = await client.mailboxOpen('INBOX');
  const messages = [];

  for await (const message of client.fetch('1:*', { envelope: true, bodyStructure: true })) {
    messages.push(message);
    if (messages.length >= limit) break;
  }

  return messages;
}
```

## Browser Connector Implementation

### Playwright Browser Control

```typescript
// lib/browser/playwright.ts
import { chromium, Browser, Page } from 'playwright';

export async function launchBrowser(personaId: string): Promise<Browser> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  return browser;
}

export async function navigate(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
}

export async function takeScreenshot(page: Page): Promise<Buffer> {
  return await page.screenshot({ fullPage: true });
}
```

## Office Tools Implementation

### PowerPoint Generation

```typescript
// lib/tools/builtin/powerpoint.ts
import PptxGenJS from 'pptxgenjs';

export async function generatePowerPoint(slides: any[]): Promise<Buffer> {
  const pptx = new PptxGenJS();

  for (const slide of slides) {
    const slideObj = pptx.addSlide();
    slideObj.addText(slide.title, { x: 1, y: 1, w: 8, h: 1 });
    slideObj.addText(slide.content, { x: 1, y: 2, w: 8, h: 5 });
  }

  return await pptx.write({ outputType: 'nodebuffer' });
}
```

## LiteLLM Proxy Setup

### Configuration

```yaml
# litellm_config.yaml
model_list:
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: os.environ/OPENAI_API_KEY
  - model_name: claude-3-opus
    litellm_params:
      model: anthropic/claude-3-opus-20240229
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: ollama-llama3
    litellm_params:
      model: ollama/llama3
      api_base: http://localhost:11434
```

### Client Usage

```typescript
// lib/llm/litellm.ts
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: process.env.LITELLM_PROXY_URL,
  apiKey: 'not-needed', // LiteLLM handles auth
});

export async function chatCompletion(messages: any[], tools?: any[]): Promise<any> {
  return await client.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
    tools: tools,
  });
}
```

## Error Handling & Retry Logic

### Retry Pattern

```typescript
// lib/utils/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error('Retry failed');
}
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/auth/jwt.test.ts
import { generateToken, verifyToken } from '@/lib/auth/jwt';

describe('JWT', () => {
  it('should generate and verify token', () => {
    const token = generateToken('user-123');
    const payload = verifyToken(token);
    expect(payload.userId).toBe('user-123');
  });
});
```

### Integration Tests

```typescript
// __tests__/api/personas.test.ts
import { POST } from '@/app/api/personas/route';

describe('POST /api/personas', () => {
  it('should create persona', async () => {
    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Persona',
        systemPrompt: 'You are a test assistant',
      }),
    }));

    expect(response.status).toBe(201);
  });
});
```

## Deployment Strategy

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: persona_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/persona_platform
    depends_on:
      - postgres
    volumes:
      - ./storage:/app/storage
      - /var/run/docker.sock:/var/run/docker.sock

volumes:
  postgres_data:
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] Docker containers built
- [ ] File storage mounted
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

## Performance Optimization

### Database Indexing
- All foreign keys indexed
- Vector indexes on embedding columns
- Composite indexes for common query patterns

### Caching
- Tool registry cached (refresh on updates)
- Embeddings cached (same text = same embedding)
- Run results cached (if idempotent)

### Connection Pooling
- Prisma connection pooling enabled
- Database connection limits configured
- Worker processes for background jobs

