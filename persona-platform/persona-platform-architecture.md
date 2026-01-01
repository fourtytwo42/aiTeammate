# Persona Platform - Architecture

**Purpose:** Complete system architecture design, component breakdown, data flow, and technology choices.

## System Overview

The Persona Platform is a multi-tenant agentic AI workspace system that enables users to create and manage AI personas capable of autonomously completing office work tasks. The system is designed for single-VM deployment with strong isolation between personas, comprehensive auditability, and efficient resource usage.

## Core Architecture Principles

1. **Isolation:** Each persona runs in its own Docker container with scoped secrets and file system access
2. **Auditability:** Every action (tool calls, email sends, file accesses) is logged to PostgreSQL
3. **Cost Efficiency:** Maximize local execution, minimize external API calls, use self-hosted solutions where possible
4. **Extensibility:** Searchable tool registry allows adding new capabilities without context window bloat
5. **Durability:** LangGraph.js ensures agent runs survive crashes and can resume from checkpoints
6. **Multi-Provider:** LiteLLM provides unified interface to multiple LLM providers (OpenAI, Anthropic, Groq, local models)

## Component Breakdown

### 1. Frontend (Next.js)

**Technology:** Next.js 15.x (App Router), React 19.x, TypeScript 5.x, Tailwind CSS 3.x, Shadcn/ui

**Responsibilities:**
- User authentication UI (login with demo account buttons)
- Persona management (create, edit, share, configure)
- Agent run monitoring (real-time updates via WebSocket)
- Tool registry browser (search, enable/disable, configure permissions)
- RAG memory viewer (upload documents, view knowledge, search)
- Audit log viewer (filterable, searchable action history)
- Admin panel (user management, system configuration)

**Key Pages:**
- `/login` - Authentication (with demo account buttons)
- `/dashboard` - Overview of personas and recent runs
- `/personas` - List and manage personas
- `/personas/[id]` - Persona detail (overview, agents, tools, memory, connectors, runs)
- `/runs/[id]` - Run detail view (step-by-step execution timeline)
- `/tools` - Tool registry browser
- `/memory/[personaId]` - RAG knowledge viewer for a persona
- `/admin` - Admin panel (users, audit logs, system config)
- `/audit` - Audit log viewer

**Interactions:**
- REST API calls to Node.js backend
- WebSocket connection for real-time run updates
- File uploads for RAG documents
- Browser-based testing of browser automation tools

### 2. Backend API (Node.js)

**Technology:** Node.js 20.x, Express.js or Next.js API routes, TypeScript 5.x, Prisma ORM

**Responsibilities:**
- REST API endpoints for all frontend operations
- Authentication and authorization (JWT tokens, role-based access)
- Persona CRUD operations
- Run orchestration triggers (queues jobs for LangGraph.js)
- Tool registry management
- RAG document ingestion (file upload → chunking → embedding → storage)
- Audit log querying
- WebSocket server for real-time run updates

**Key API Modules:**
- `auth/` - Authentication endpoints (login, logout, token refresh)
- `users/` - User management (CRUD, roles)
- `personas/` - Persona management (CRUD, sharing, configuration)
- `runs/` - Run management (create, list, get status, cancel)
- `tools/` - Tool registry (search, CRUD, permissions)
- `memory/` - RAG operations (upload, search, delete)
- `connectors/` - Connector configuration (email, browser, desktop VM)
- `admin/` - Admin operations
- `audit/` - Audit log queries

**Interactions:**
- Reads/writes to PostgreSQL via Prisma
- Triggers LangGraph.js runs via job queue
- Communicates with LiteLLM Proxy for LLM calls
- Manages Docker containers (start/stop/restart persona containers)
- Handles file storage (uploads, artifacts, outputs)

### 3. Database (PostgreSQL + pgvector)

**Technology:** PostgreSQL 16.x with pgvector extension

**Responsibilities:**
- Store all relational data (users, personas, runs, tools, audit logs)
- Store vector embeddings for RAG (pgvector extension)
- Enable semantic search over tool descriptions and RAG documents
- Maintain referential integrity and audit trails

**Key Tables (see Database Schema artifact for details):**
- `users` - User accounts, roles, authentication
- `personas` - Persona definitions, configuration, ownership
- `persona_members` - Persona sharing (collaborators)
- `agents` - Agent definitions within personas
- `runs` - Agent run instances (status, input, output, trace_id)
- `run_steps` - Individual steps within a run (tool calls, LLM calls)
- `tools` - Tool registry (name, description, schema, code)
- `tool_dependencies` - Tool dependency graph (which tools depend on others)
- `persona_tools` - Tool permissions per persona
- `tool_runs` - Tool execution logs (input, output, errors, trace_id)
- `documents` - RAG document metadata
- `chunks` - Document chunks with embeddings (pgvector, includes curated summaries)
- `persona_health_metrics` - Health metrics per persona (CPU, RAM, LLM calls)
- `emails` - Email messages (received and sent)
- `attachments` - Email attachments and file artifacts
- `audit_events` - Comprehensive audit log (with trace_id for correlation)
- `secrets` - Encrypted secrets (provider keys, email credentials)

**Interactions:**
- Read/write via Prisma ORM from Node.js API
- Vector search queries via pgvector (tool discovery, RAG retrieval)
- Direct queries from LangGraph.js orchestrator (if needed)

### 4. Agent Orchestrator (LangGraph.js)

**Technology:** LangGraph.js (LangChain's durable orchestration framework)

**Responsibilities:**
- Execute agent runs with state persistence
- Handle multi-step workflows (planning, tool execution, iteration)
- Manage context window (retrieve relevant RAG chunks, tool schemas)
- Coordinate tool calls (execute tools, handle errors, retry logic)
- Stream run updates to frontend (via WebSocket)
- Resume runs from checkpoints (crash recovery)

**Key Workflow Patterns:**
1. **Task Planning:** LLM generates step-by-step plan from user input
2. **Tool Discovery:** Query tool registry (vector search) for relevant tools
3. **Tool Execution:** Call tools, handle errors, retry with backoff
4. **Context Management:** Retrieve relevant RAG chunks, maintain conversation history
5. **Iteration:** LLM decides if more steps needed, loops until complete
6. **Completion:** Final output generation, artifact creation, email sending

**State Management:**
- Run state stored in PostgreSQL (via LangGraph checkpointer)
- State includes: current step, tool results, LLM responses, artifacts created
- Enables resuming interrupted runs

**Interactions:**
- Calls LiteLLM Proxy for LLM completions
- Queries PostgreSQL for tool registry, RAG chunks
- Executes tools in persona containers (Docker API)
- Streams updates to WebSocket server
- Logs all actions to audit_events table

### 5. LLM Gateway (LiteLLM Proxy)

**Technology:** LiteLLM Proxy (open-source unified LLM gateway)

**Responsibilities:**
- Provide unified OpenAI-compatible API to multiple LLM providers
- Route requests to configured providers (OpenAI, Anthropic, Groq, Ollama, LM Studio)
- Handle authentication (provider-specific API keys)
- Support function calling (tool use) across all providers
- Rate limiting and cost tracking
- Fallback logic (if one provider fails, try another)

**Configuration:**
- Per-persona provider routing (each persona can have default + fallback providers)
- Provider keys stored in encrypted `secrets` table
- Local providers (Ollama, LM Studio) use localhost endpoints
- Cloud providers (OpenAI, Anthropic) use their APIs

**Interactions:**
- Receives requests from LangGraph.js orchestrator
- Routes to appropriate provider API
- Returns standardized response format (OpenAI-compatible)
- Logs usage for cost tracking

### 6. Tool Registry

**Technology:** PostgreSQL + pgvector (vector search on tool descriptions)

**Responsibilities:**
- Store all available tools (name, description, JSON schema, code/implementation)
- Enable semantic search over tool descriptions
- Manage tool permissions per persona
- Track tool usage and performance

**Tool Discovery Pattern:**
1. Agent needs to perform action (e.g., "generate PowerPoint")
2. Agent calls `ToolSearch(query)` function
3. System embeds query, searches tool descriptions via pgvector
4. Returns top-K relevant tools (just IDs and minimal signatures)
5. Agent requests full schemas for selected tools
6. System injects only those tool schemas into LLM context (prevents context bloat)

**Tool Storage:**
- `tools` table: Metadata (name, description, category, permissions)
- Tool code: Stored as files or in database (code column)
- Tool schemas: JSON Schema definitions (OpenAI function calling format)
- Tool examples: Example usage for better LLM understanding

**Built-in Tools:**
- `generate_powerpoint` - Create .pptx files (PptxGenJS)
- `generate_spreadsheet` - Create .xlsx files (ExcelJS)
- `generate_pdf` - Create PDF documents
- `read_email` - Read email messages (IMAP)
- `send_email` - Send email with attachments (SMTP)
- `browser_navigate` - Navigate browser (Playwright)
- `browser_click` - Click element (Playwright)
- `browser_fill` - Fill form (Playwright)
- `browser_snapshot` - Capture page screenshot (Playwright)
- `desktop_screenshot` - Capture desktop screenshot (VNC)
- `rag_search` - Search persona's RAG knowledge base
- `web_search` - Search the web (if allowed)
- `generate_image` - Generate image (Stable Diffusion or API)
- `generate_speech` - Generate TTS audio (local or API)
- `create_video` - Create video from images/audio (ffmpeg)

**Custom Tools:**
- Administrators can add custom tools (Python/Node.js functions)
- Tools stored in registry, executed in persona containers
- Tools can be shared across personas or persona-specific

**Tool Dependency Graph:**
- Tools can declare dependencies on other tools (e.g., `generate_video` depends on `generate_powerpoint`, `generate_speech`)
- Stored in `tool_dependencies` table (tool_id, depends_on_tool_id)
- Used by agents to avoid redundant tool chains
- Helps LLM understand tool relationships (injected as examples in system prompt)
- Enables smart tool sequencing (agent knows to call dependencies first)

**Interactions:**
- Queried by LangGraph.js orchestrator for tool discovery
- Tools executed via message bus (Redis), results returned to orchestrator
- Tool dependency graph queried to suggest tool sequences
- Results logged to `tool_runs` table with trace IDs
- Tool usage tracked in audit logs with trace IDs

### 7. Persona Containers (Docker)

**Technology:** Docker, gVisor (optional sandboxing)

**Responsibilities:**
- Isolate persona execution environment
- Provide workspace for file operations
- Execute tools in isolated context
- Mount secrets and credentials
- Enforce resource limits (CPU, RAM, disk)

**Container Structure:**
- **Base Image:** Node.js 20.x with tool execution runtime
- **Volumes:**
  - `/workspace` - Persona's file workspace (persistent)
  - `/cache` - Browser profiles, temp files (persistent)
  - `/models` - Optional: local LLM models (read-only, shared)
  - `/tools` - Tool code (read-only, mounted from registry)
- **Secrets (injected):**
  - Provider API keys (OpenAI, Anthropic, etc.)
  - Email credentials (IMAP/SMTP)
  - Other persona-specific secrets
- **Capabilities:**
  - Network access (with egress allowlist if configured)
  - File system access (scoped to volumes)
  - Docker socket access (for tool execution, if needed)

**Container Lifecycle:**
- Created when persona is first used
- Started when run begins
- Stopped when run completes (or after idle timeout)
- Persisted volumes survive container restarts

**Sandboxing (Optional):**
- gVisor can provide stronger isolation for untrusted tools
- Use gVisor runtime for persona containers if security is critical
- Trade-off: Slightly higher overhead, better security

**Interactions:**
- Started/stopped by Node.js API (Docker API)
- Tools executed inside containers (Docker exec)
- Files written to `/workspace` volume
- Logs streamed to audit system

### 8. Email Connector

**Technology:** IMAP/SMTP (Node.js libraries: ImapFlow, Nodemailer)

**Responsibilities:**
- Read incoming emails (IMAP polling or push notifications)
- Send outgoing emails (SMTP)
- Handle attachments (download, process, attach to outgoing)
- Parse email content (HTML, plain text, attachments)

**Configuration:**
- Per-persona email accounts (IMAP/SMTP credentials)
- Stored in encrypted `secrets` table
- OAuth support for Gmail/Outlook (future enhancement)

**Email Flow:**
1. Incoming email arrives → IMAP listener triggers
2. Email stored in `emails` table (with attachments in `attachments` table)
3. LangGraph.js run triggered (if persona configured for email auto-processing)
4. Agent processes email, generates response
5. Agent calls `send_email` tool
6. Email sent via SMTP, logged to audit

**Interactions:**
- IMAP listeners run as background processes (one per persona email account)
- Email credentials stored in encrypted secrets
- Attachments processed by tools (read, extract, use)
- Outgoing emails sent via SMTP, logged to audit

### 9. Browser Connector (Playwright)

**Technology:** Playwright (Node.js browser automation)

**Responsibilities:**
- Launch and control headless browsers (Chromium, Firefox, WebKit)
- Navigate pages, interact with elements (click, fill, select)
- Capture screenshots and page content
- Execute JavaScript in browser context
- Handle authentication (cookies, sessions)

**Browser Profile:**
- Each persona has isolated browser profile (stored in `/cache` volume)
- Cookies and sessions persist across runs
- Can be configured per-persona

**Browser Tools:**
- `browser_navigate(url)` - Navigate to URL
- `browser_click(selector)` - Click element
- `browser_fill(selector, text)` - Fill input field
- `browser_select(selector, value)` - Select dropdown
- `browser_snapshot()` - Capture screenshot
- `browser_extract(selector)` - Extract text/content
- `browser_execute(code)` - Execute JavaScript

**Interactions:**
- Tools executed in persona containers
- Browser launched inside container (headless mode)
- Screenshots saved to `/workspace` volume
- Content extracted and passed back to agent

### 10. Desktop VM Connector

**Technology:** VNC/NoVNC (remote desktop protocol)

**Responsibilities:**
- Connect to Linux VM for desktop automation
- Capture screenshots of desktop
- Send keyboard/mouse input (if needed)
- Execute commands on desktop

**Configuration:**
- VM endpoint (VNC server address/port)
- Authentication credentials
- Stored per-persona in encrypted secrets

**Use Cases:**
- Run desktop applications that can't be automated via API
- Access legacy systems
- Perform complex UI interactions

**Interactions:**
- Tools executed from persona containers
- VNC client connects to external VM
- Screenshots and commands executed remotely
- Results passed back to agent

### 11. Office Tools (Document Generation)

**Technology:** PptxGenJS (PowerPoint), ExcelJS (Spreadsheets), PDF libraries

**Responsibilities:**
- Generate PowerPoint presentations (.pptx)
- Generate Excel spreadsheets (.xlsx)
- Generate PDF documents
- Process existing documents (read, modify)

**PowerPoint Generation:**
- Create slides with text, images, charts
- Apply templates and themes
- Export to .pptx format
- Support for narration/video generation (combined with TTS)

**Spreadsheet Generation:**
- Create workbooks with multiple sheets
- Populate data, apply formulas
- Format cells (colors, borders, fonts)
- Export to .xlsx format

**PDF Generation:**
- Create PDFs from HTML or templates
- Combine multiple documents
- Add watermarks, signatures

**Interactions:**
- Tools executed in persona containers
- Documents generated in `/workspace` volume
- Files attached to emails or returned as artifacts
- Logged to audit system

### 12. Message Bus (Redis/NATS)

**Technology:** Redis 7.x (preferred) or NATS (alternative)

**Responsibilities:**
- Decouple tool execution from container lifecycle
- Enable asynchronous tool execution with retry logic
- Support horizontal scaling of tool executors
- Provide pub/sub for run status updates
- Queue tool execution requests

**Why Redis over NATS:**
- Redis is simpler to deploy (single binary)
- Better suited for single-VM deployment
- Built-in persistence options (RDB/AOF)
- Excellent Node.js client support
- Can also be used for caching and rate limiting

**Message Patterns:**
- Tool execution requests published to `tool:execute:{personaId}` channels
- Tool executors subscribe to channels, process requests, publish results
- Results consumed by orchestrator, stored in database
- Enables retry logic (failed tools can be requeued)
- Supports priority queues (urgent tools processed first)

**Interactions:**
- LangGraph orchestrator publishes tool execution requests
- Tool executors (worker processes) subscribe and execute tools
- Results published back to result channels
- Orchestrator consumes results and continues workflow

### 13. Observability & Tracing

**Technology:** OpenTelemetry (optional), custom trace ID generation

**Responsibilities:**
- Generate unique trace IDs for each run
- Propagate trace IDs through all tool calls and LLM requests
- Correlate logs, audit events, and run steps
- Enable end-to-end debugging of complex workflows
- Track performance metrics (tool latency, LLM response time)

**Trace ID Format:**
- UUID v4: `run-{uuid}` format
- Stored in `runs.trace_id` column
- Included in all audit events, tool runs, and run steps
- Propagated via HTTP headers (X-Trace-ID) and message metadata

**Implementation:**
- Trace ID generated when run is created
- Passed through LangGraph state
- Included in all tool execution requests
- Stored in audit logs for correlation
- Displayed in frontend run detail view

**Performance Tracking:**
- Tool execution latency tracked in `tool_runs.duration_ms`
- LLM call latency tracked in `run_steps.duration_ms`
- Aggregate metrics available in admin dashboard
- Helps identify slow tools or LLM providers

**Interactions:**
- Generated by API when run is created
- Stored in run record, passed to orchestrator
- Included in all downstream operations
- Queried for debugging and performance analysis

### 14. Persona Health Service

**Technology:** Node.js worker process, Docker stats API, PostgreSQL

**Responsibilities:**
- Monitor persona container resource usage (CPU, RAM, disk)
- Track LLM API call counts and costs per persona
- Detect runaway agents (excessive resource usage)
- Generate alerts for admins
- Provide health metrics in admin dashboard

**Monitoring Metrics:**
- Container CPU usage (%)
- Container memory usage (MB)
- Disk usage (GB) in persona workspace
- LLM API calls (count per hour/day)
- Estimated costs (if tracking provider costs)
- Active run count per persona

**Health Checks:**
- Periodic checks (every 30 seconds) of container stats
- Store metrics in `persona_health_metrics` table
- Alert if CPU > 80% for >5 minutes
- Alert if memory > 90% of limit
- Alert if >100 LLM calls per hour (configurable threshold)

**Admin Dashboard:**
- Real-time health metrics per persona
- Historical usage graphs
- Cost tracking and projections
- Alert history and resolution

**Interactions:**
- Reads Docker container stats via Docker API
- Queries LiteLLM Proxy for API call counts
- Stores metrics in database
- Sends alerts via WebSocket to admin dashboard
- Used by admin UI to display health status

### 15. RAG System (Memory)

**Technology:** pgvector (PostgreSQL vector extension), local embedding models

**Responsibilities:**
- Store per-persona knowledge base (documents, facts)
- Generate embeddings for semantic search
- Retrieve relevant context for agent queries
- Manage document lifecycle (ingest, update, delete)
- Automatic summarization of long conversations (memory curator)

**RAG Pipeline:**
1. **Ingestion:** User uploads document → stored in `documents` table
2. **Chunking:** Document split into chunks (~500-1200 tokens)
3. **Embedding:** Each chunk embedded using local embedding model
4. **Storage:** Chunks + embeddings stored in `chunks` table (pgvector)
5. **Retrieval:** Query embedded → vector search → top-K relevant chunks
6. **Injection:** Relevant chunks prepended to LLM context

**Embedding Models:**
- Use local embedding model (e.g., InstructorXL, E5-large)
- Run in same VM (CPU or GPU)
- No external API costs
- Embeddings generated on ingestion, cached

**Chunking Strategy:**
- Overlapping chunks (sliding window) for better retrieval
- Chunk size: ~500-1200 tokens (configurable)
- Metadata stored: source document, chunk index, timestamp

**Retrieval Strategy:**
- Cosine similarity search via pgvector
- Filter by persona (only retrieve persona's documents)
- Recency boost (prefer recent documents)
- Top-K retrieval (configurable, default 5-10 chunks)

**Memory Curator Job:**
- Background worker that runs periodically (daily or weekly)
- Identifies long conversation threads or document collections
- Uses LLM to generate summaries (key points, decisions, outcomes)
- Stores summaries as new "curated" chunks in RAG system
- Enables efficient retrieval without re-reading entire conversations
- Helps maintain knowledge base quality as it grows

**Interactions:**
- Documents uploaded via API, processed by background job
- Embeddings generated locally, stored in pgvector
- Retrieval queries from LangGraph.js orchestrator
- Results injected into LLM context
- Memory curator job runs periodically, generates summaries

## Data Flow

### Request Flow: Create and Execute Run

1. **User Action:** User clicks "Run Agent" in frontend, provides input (e.g., email request)
2. **API Call:** Frontend sends `POST /api/runs` with persona ID and input
3. **Authentication:** API validates JWT token, checks persona access
4. **Run Creation:** API creates `runs` record in PostgreSQL, status = "pending"
5. **Job Queue:** API enqueues run job (BullMQ or similar)
6. **Orchestrator Start:** LangGraph.js worker picks up job, starts orchestrator
7. **Context Retrieval:** Orchestrator retrieves persona config, RAG chunks (if needed), tool registry
8. **LLM Call:** Orchestrator calls LiteLLM with system prompt + user input + context
9. **Tool Discovery:** LLM responds with tool calls → orchestrator queries tool registry (with dependency graph)
10. **Tool Execution:** Tool execution requests published to Redis message bus
11. **Tool Executor:** Worker process subscribes to message bus, executes tool in persona container
12. **Result Return:** Tool results published back to message bus, consumed by orchestrator
13. **Iteration:** LLM called again with tool results, decides next steps
14. **Trace Propagation:** Trace ID included in all operations for observability
15. **Completion:** LLM generates final output, orchestrator creates artifacts
16. **Email Send:** If needed, orchestrator calls `send_email` tool via message bus
17. **Run Complete:** Run status updated to "completed", results stored, health metrics updated
18. **Frontend Update:** WebSocket sends update to frontend (with trace ID), user sees results

### Event Flow: Incoming Email Processing

1. **Email Arrives:** IMAP listener detects new email
2. **Email Storage:** Email + attachments stored in `emails` and `attachments` tables
3. **Trigger Check:** System checks if persona has email auto-processing enabled
4. **Run Creation:** If enabled, system creates run with email content as input
5. **Agent Execution:** Normal run flow (steps 6-14 above)
6. **Response Email:** Agent generates response, sends via SMTP
7. **Audit Log:** All actions logged to `audit_events` table

### State Synchronization

**Run State:**
- Stored in PostgreSQL via LangGraph checkpointer
- Includes: current step, tool results, LLM responses, artifacts
- Enables crash recovery (runs can resume from last checkpoint)

**Persona Configuration:**
- Stored in `personas` table
- Changes require container restart (if runtime config changed)
- Tool permissions updated immediately (no restart needed)

**RAG Knowledge:**
- Documents ingested asynchronously (background job)
- Embeddings generated and stored immediately after ingestion
- Retrieval always queries latest embeddings (no caching needed)

## Technology Choices

### Next.js 15.x (Frontend Framework)

**Why:** Server-side rendering, built-in API routes, excellent TypeScript support, great developer experience

**Alternatives Considered:**
- Remix (rejected - smaller ecosystem, less mature)
- Vite + React (rejected - no SSR, would need separate API server)
- SvelteKit (rejected - smaller ecosystem, team familiarity with React)

**Trade-offs:**
- Monolithic deployment (frontend + API in one app)
- Can split to separate frontend/API if needed later

### PostgreSQL 16.x + pgvector (Database)

**Why:** 
- Mature, reliable relational database
- pgvector extension provides vector search (no external vector DB needed)
- Single database for relational data + vectors (simplifies architecture)
- Excellent tooling (Prisma support, migrations)

**Alternatives Considered:**
- PostgreSQL + Pinecone (rejected - external service, costs money)
- PostgreSQL + Weaviate (rejected - external service, adds complexity)
- ChromaDB (rejected - separate database, adds deployment complexity)
- FAISS (rejected - in-memory only, no persistence)

**Trade-offs:**
- Vector search performance slightly slower than specialized vector DBs
- Acceptable for scale (thousands of documents per persona)

### LangGraph.js (Orchestration)

**Why:**
- Durable orchestration (state persistence, crash recovery)
- Built for agentic workflows (multi-step, tool use)
- Excellent TypeScript support
- Active development, good documentation

**Alternatives Considered:**
- Custom orchestration loop (rejected - would need to implement state persistence, error handling)
- LangChain agents (rejected - less durable, harder to customize)
- AutoGen (rejected - more complex, overkill for single-agent personas)
- Temporal (rejected - more complex, designed for microservices)

**Trade-offs:**
- Learning curve (LangGraph patterns)
- Tied to LangChain ecosystem (but flexible enough)

### LiteLLM Proxy (LLM Gateway)

**Why:**
- Unified OpenAI-compatible API for all providers
- Handles authentication, rate limiting, fallbacks
- Open-source, actively maintained
- Supports function calling across providers

**Alternatives Considered:**
- Custom proxy (rejected - would need to implement all provider-specific logic)
- Direct provider APIs (rejected - too much provider-specific code)
- OpenAI SDK only (rejected - doesn't support multiple providers)

**Trade-offs:**
- Additional component to deploy
- Worth it for multi-provider support

### Docker (Containerization)

**Why:**
- Industry standard for containerization
- Excellent tooling and ecosystem
- Easy to deploy and manage
- Good isolation for personas

**Alternatives Considered:**
- VM per persona (rejected - too heavy, slow startup)
- Process isolation only (rejected - insufficient isolation)
- Kubernetes (rejected - overkill for single-VM deployment)

**Trade-offs:**
- Container overhead (minimal)
- Can use gVisor for stronger sandboxing if needed

### Playwright (Browser Automation)

**Why:**
- Modern, reliable browser automation
- Supports Chromium, Firefox, WebKit
- Excellent API and documentation
- Handles modern web apps well

**Alternatives Considered:**
- Puppeteer (rejected - Chromium only, less maintained)
- Selenium (rejected - older, less reliable, slower)
- Cypress (rejected - designed for testing, not automation)

**Trade-offs:**
- Requires browser binaries (adds container size)
- Worth it for reliability

### Redis (Message Bus)

**Why:**
- Lightweight, fast in-memory data store
- Excellent pub/sub and queue capabilities
- Simple deployment (single binary)
- Built-in persistence options (RDB/AOF)
- Excellent Node.js client support (ioredis)

**Alternatives Considered:**
- NATS (rejected - adds complexity, Redis sufficient for single-VM)
- RabbitMQ (rejected - more complex, overkill)
- BullMQ (rejected - requires Redis anyway, can use Redis directly)
- In-process queues (rejected - doesn't enable horizontal scaling)

**Trade-offs:**
- In-memory (requires persistence configuration for durability)
- Single point of failure (but Redis is reliable)
- Can add Redis Cluster later for HA

### OpenTelemetry / Custom Tracing

**Why:**
- Trace IDs essential for debugging complex multi-step workflows
- Enables correlation of logs, audit events, and run steps
- Performance tracking helps optimize slow operations
- Custom implementation sufficient for MVP (OpenTelemetry optional)

**Alternatives Considered:**
- Full OpenTelemetry stack (deferred - adds complexity, custom trace IDs sufficient)
- No tracing (rejected - essential for debugging)
- Log aggregation only (rejected - trace IDs needed for correlation)

**Trade-offs:**
- Custom implementation simpler for MVP
- Can upgrade to OpenTelemetry later if needed
- Trace IDs provide 80% of observability benefit

## Security Considerations

**Isolation:**
- Personas run in separate Docker containers
- File system access scoped to volumes
- Network access can be restricted (egress allowlist)
- Secrets injected at runtime (not in images)

**Authentication:**
- JWT tokens for API authentication
- Encrypted secrets storage (provider keys, email credentials)
- Role-based access control (admin, user)

**Auditability:**
- All actions logged to `audit_events` table
- Tool executions logged with inputs/outputs
- Email sends/receives logged
- File accesses logged

**Sandboxing:**
- Optional gVisor runtime for stronger isolation
- Tool execution in containers (isolated from host)
- Resource limits (CPU, RAM, disk)

## Scalability Considerations

**Single-VM Deployment:**
- Designed for single VM initially
- PostgreSQL + Next.js + Worker processes on one machine
- Sufficient for dozens of personas, hundreds of concurrent runs

**Future Scaling:**
- Can split to multiple VMs (separate DB, API, workers)
- Can use managed PostgreSQL (e.g., AWS RDS, Supabase)
- Can use container orchestration (Kubernetes) if needed
- Stateless API servers can scale horizontally

**Resource Usage:**
- LLM calls are the main resource consumer (API costs or local GPU)
- Vector search is fast (pgvector handles thousands of chunks efficiently)
- Container overhead is minimal (containers idle when not in use)

