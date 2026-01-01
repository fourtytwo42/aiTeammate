# Persona Platform - Database Schema

**Purpose:** Complete PostgreSQL database schema with pgvector configuration, all tables, relationships, indexes, and validation rules.

## Database Overview

**Technology:** PostgreSQL 16.x with pgvector extension

**Purpose:** 
- Store all relational data (users, personas, runs, tools, audit logs)
- Store vector embeddings for RAG (pgvector extension)
- Enable semantic search over tool descriptions and RAG documents

**Design Principles:**
- Normalized schema (minimize redundancy)
- Comprehensive audit logging (all actions tracked)
- Efficient indexing (fast queries)
- Vector storage optimized for retrieval (pgvector)

## Extension Setup

**pgvector Extension:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Purpose:** Enable vector similarity search for embeddings (tool discovery, RAG retrieval)

## Schema Definitions

### Users and Authentication

#### Table: `users`

**Purpose:** User accounts, authentication, roles

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `email` (VARCHAR(255), unique, not null, indexed)
- `password_hash` (VARCHAR(255), not null) - bcrypt hash
- `name` (VARCHAR(255), nullable)
- `role` (VARCHAR(50), not null, default: 'user') - 'admin' | 'user'
- `is_active` (BOOLEAN, not null, default: true)
- `created_at` (TIMESTAMP, not null, default: `now()`)
- `updated_at` (TIMESTAMP, not null, default: `now()`)
- `last_login_at` (TIMESTAMP, nullable)

**Indexes:**
- `idx_users_email` on `email` (unique, for fast login lookups)
- `idx_users_role` on `role` (for admin queries)

**Validation:**
- Email must be valid format (application-level validation)
- Role must be 'admin' or 'user'

**Relationships:**
- One-to-many with `personas` (user owns personas)
- One-to-many with `persona_members` (user can be member of personas)
- One-to-many with `runs` (user creates runs)
- One-to-many with `audit_events` (user performs actions)

#### Table: `sessions`

**Purpose:** JWT session tokens (optional: for token blacklisting)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `user_id` (UUID, foreign key to `users.id`, not null, on delete: cascade)
- `token_hash` (VARCHAR(255), not null, indexed) - JWT token hash
- `expires_at` (TIMESTAMP, not null, indexed)
- `created_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_sessions_token_hash` on `token_hash` (for token validation)
- `idx_sessions_expires_at` on `expires_at` (for cleanup of expired sessions)

**Relationships:**
- Many-to-one with `users`

### Personas and Agents

#### Table: `personas`

**Purpose:** Persona definitions, configuration, ownership

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `name` (VARCHAR(255), not null)
- `description` (TEXT, nullable)
- `system_prompt` (TEXT, not null) - Personality/system message for LLM
- `owner_id` (UUID, foreign key to `users.id`, not null, on delete: cascade)
- `default_provider` (VARCHAR(50), not null, default: 'openai') - Default LLM provider
- `fallback_providers` (JSONB, nullable) - Array of fallback provider names
- `is_active` (BOOLEAN, not null, default: true)
- `container_id` (VARCHAR(255), nullable) - Docker container ID (if running)
- `created_at` (TIMESTAMP, not null, default: `now()`)
- `updated_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_personas_owner_id` on `owner_id` (for user's personas query)
- `idx_personas_name` on `name` (for search)

**Validation:**
- Name must be non-empty
- System prompt must be non-empty

**Relationships:**
- Many-to-one with `users` (owner)
- One-to-many with `persona_members` (sharing)
- One-to-many with `agents`
- One-to-many with `runs`
- One-to-many with `documents` (RAG documents)
- One-to-many with `persona_tools` (tool permissions)

#### Table: `persona_members`

**Purpose:** Persona sharing (collaborators can edit settings)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `persona_id` (UUID, foreign key to `personas.id`, not null, on delete: cascade)
- `user_id` (UUID, foreign key to `users.id`, not null, on delete: cascade)
- `role` (VARCHAR(50), not null, default: 'editor') - 'editor' | 'viewer'
- `created_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_persona_members_persona_id` on `persona_id` (for persona's members query)
- `idx_persona_members_user_id` on `user_id` (for user's shared personas query)
- Unique constraint on `(persona_id, user_id)` (user can't be member twice)

**Relationships:**
- Many-to-one with `personas`
- Many-to-one with `users`

#### Table: `agents`

**Purpose:** Agent definitions within personas (each persona can have multiple agents)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `persona_id` (UUID, foreign key to `personas.id`, not null, on delete: cascade)
- `name` (VARCHAR(255), not null) - e.g., "Email Triage Agent", "Slides Agent"
- `description` (TEXT, nullable)
- `system_prompt_override` (TEXT, nullable) - Override persona's system prompt
- `preferred_provider` (VARCHAR(50), nullable) - Override persona's default provider
- `tool_permissions` (JSONB, nullable) - Override tool permissions (array of tool IDs)
- `is_active` (BOOLEAN, not null, default: true)
- `created_at` (TIMESTAMP, not null, default: `now()`)
- `updated_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_agents_persona_id` on `persona_id` (for persona's agents query)

**Relationships:**
- Many-to-one with `personas`
- One-to-many with `runs` (agent executes runs)

### Runs and Execution

#### Table: `runs`

**Purpose:** Agent run instances (execution of a task)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `agent_id` (UUID, foreign key to `agents.id`, not null)
- `persona_id` (UUID, foreign key to `personas.id`, not null, indexed)
- `user_id` (UUID, foreign key to `users.id`, not null, indexed) - User who triggered run
- `trace_id` (VARCHAR(255), not null, unique, indexed) - Unique trace ID for observability (format: `run-{uuid}`)
- `status` (VARCHAR(50), not null, default: 'pending') - 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
- `input` (TEXT, not null) - User input/task description
- `output` (TEXT, nullable) - Final output/result
- `error_message` (TEXT, nullable) - Error message if failed
- `started_at` (TIMESTAMP, nullable)
- `completed_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP, not null, default: `now()`, indexed)

**Indexes:**
- `idx_runs_persona_id` on `persona_id` (for persona's runs query)
- `idx_runs_user_id` on `user_id` (for user's runs query)
- `idx_runs_status` on `status` (for status filtering)
- `idx_runs_created_at` on `created_at` (for chronological ordering)

**Relationships:**
- Many-to-one with `agents`
- Many-to-one with `personas`
- Many-to-one with `users`
- One-to-many with `run_steps` (steps within run)
- One-to-many with `artifacts` (files created during run)

#### Table: `run_steps`

**Purpose:** Individual steps within a run (LLM calls, tool executions)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `run_id` (UUID, foreign key to `runs.id`, not null, on delete: cascade, indexed)
- `step_number` (INTEGER, not null) - Order of step in run
- `step_type` (VARCHAR(50), not null) - 'llm_call' | 'tool_call' | 'rag_retrieval' | 'error'
- `tool_id` (UUID, foreign key to `tools.id`, nullable) - If step_type is 'tool_call'
- `input` (JSONB, nullable) - Step input (LLM prompt, tool parameters)
- `output` (JSONB, nullable) - Step output (LLM response, tool result)
- `duration_ms` (INTEGER, nullable) - Execution time in milliseconds
- `created_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_run_steps_run_id` on `run_id` (for run's steps query)
- `idx_run_steps_step_number` on `(run_id, step_number)` (for ordering)

**Relationships:**
- Many-to-one with `runs`
- Many-to-one with `tools` (if tool call)

### Tools Registry

#### Table: `tools`

**Purpose:** Tool registry (all available tools)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `name` (VARCHAR(255), not null, unique)
- `description` (TEXT, not null) - Tool description (used for vector search)
- `category` (VARCHAR(100), nullable) - Tool category (e.g., 'office', 'browser', 'email')
- `schema` (JSONB, not null) - OpenAI function calling schema (name, description, parameters)
- `code` (TEXT, nullable) - Tool implementation code (if custom tool)
- `code_type` (VARCHAR(50), nullable) - 'python' | 'javascript' | 'builtin'
- `is_builtin` (BOOLEAN, not null, default: false) - Is this a built-in tool?
- `created_by` (UUID, foreign key to `users.id`, nullable) - User who created (if custom)
- `created_at` (TIMESTAMP, not null, default: `now()`)
- `updated_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_tools_name` on `name` (unique, for tool lookup)
- `idx_tools_category` on `category` (for category filtering)
- `idx_tools_description` - GIN index on `description` for full-text search (optional)

**Vector Index:**
- `description_embedding` (vector(1536), nullable) - Embedding of description (for semantic search)
- Vector index on `description_embedding` (pgvector)

**Relationships:**
- One-to-many with `tool_dependencies` (tool has dependencies)
- One-to-many with `tool_dependencies` via `depends_on_tool_id` (tool is a dependency)

**Relationships:**
- Many-to-one with `users` (creator, if custom tool)
- One-to-many with `persona_tools` (tool permissions)
- One-to-many with `tool_runs` (tool execution logs)
- One-to-many with `run_steps` (steps that use this tool)

#### Table: `persona_tools`

**Purpose:** Tool permissions per persona (which tools a persona can use)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `persona_id` (UUID, foreign key to `personas.id`, not null, on delete: cascade)
- `tool_id` (UUID, foreign key to `tools.id`, not null, on delete: cascade)
- `is_enabled` (BOOLEAN, not null, default: true)
- `config` (JSONB, nullable) - Tool-specific configuration (e.g., API keys, limits)
- `created_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_persona_tools_persona_id` on `persona_id` (for persona's tools query)
- `idx_persona_tools_tool_id` on `tool_id` (for tool's personas query)
- Unique constraint on `(persona_id, tool_id)` (persona can't have same tool twice)

**Relationships:**
- Many-to-one with `personas`
- Many-to-one with `tools`

#### Table: `tool_runs`

**Purpose:** Tool execution logs (detailed logs of tool invocations)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `tool_id` (UUID, foreign key to `tools.id`, not null, indexed)
- `run_id` (UUID, foreign key to `runs.id`, not null, on delete: cascade, indexed)
- `run_step_id` (UUID, foreign key to `run_steps.id`, nullable)
- `trace_id` (VARCHAR(255), not null, indexed) - Trace ID from parent run (for observability)
- `input` (JSONB, not null) - Tool input parameters
- `output` (JSONB, nullable) - Tool output/result
- `error` (TEXT, nullable) - Error message if tool failed
- `duration_ms` (INTEGER, nullable) - Execution time in milliseconds
- `created_at` (TIMESTAMP, not null, default: `now()`, indexed)

**Indexes:**
- `idx_tool_runs_tool_id` on `tool_id` (for tool usage analytics)
- `idx_tool_runs_run_id` on `run_id` (for run's tool calls query)
- `idx_tool_runs_created_at` on `created_at` (for chronological ordering)

**Relationships:**
- Many-to-one with `tools`
- Many-to-one with `runs`
- Many-to-one with `run_steps`

#### Table: `tool_dependencies`

**Purpose:** Tool dependency graph (which tools depend on which other tools)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `tool_id` (UUID, foreign key to `tools.id`, not null, on delete: cascade, indexed)
- `depends_on_tool_id` (UUID, foreign key to `tools.id`, not null, on delete: cascade, indexed)
- `dependency_type` (VARCHAR(50), not null, default: 'requires') - 'requires' | 'recommends' | 'optional'
- `created_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_tool_dependencies_tool_id` on `tool_id` (for tool's dependencies query)
- `idx_tool_dependencies_depends_on` on `depends_on_tool_id` (for reverse lookup)
- Unique constraint on `(tool_id, depends_on_tool_id)` (prevent duplicate dependencies)

**Relationships:**
- Many-to-one with `tools` (tool that has dependency)
- Many-to-one with `tools` via `depends_on_tool_id` (tool that is depended upon)

### RAG (Memory) System

#### Table: `documents`

**Purpose:** RAG document metadata (per-persona knowledge base)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `persona_id` (UUID, foreign key to `personas.id`, not null, on delete: cascade, indexed)
- `name` (VARCHAR(255), not null) - Document name
- `source` (VARCHAR(255), nullable) - Source (e.g., 'upload', 'repo', 'url')
- `source_url` (TEXT, nullable) - Source URL if applicable
- `file_path` (TEXT, nullable) - File path in storage
- `file_size` (BIGINT, nullable) - File size in bytes
- `mime_type` (VARCHAR(100), nullable) - MIME type
- `status` (VARCHAR(50), not null, default: 'processing') - 'processing' | 'completed' | 'failed'
- `error_message` (TEXT, nullable) - Error if processing failed
- `uploaded_by` (UUID, foreign key to `users.id`, not null)
- `created_at` (TIMESTAMP, not null, default: `now()`, indexed)
- `updated_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_documents_persona_id` on `persona_id` (for persona's documents query)
- `idx_documents_status` on `status` (for processing status queries)
- `idx_documents_created_at` on `created_at` (for chronological ordering)

**Relationships:**
- Many-to-one with `personas`
- Many-to-one with `users` (uploader)
- One-to-many with `chunks` (document chunks)

#### Table: `chunks`

**Purpose:** Document chunks with embeddings (for vector search)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `document_id` (UUID, foreign key to `documents.id`, not null, on delete: cascade, indexed)
- `persona_id` (UUID, foreign key to `personas.id`, not null, indexed) - Denormalized for efficient filtering
- `chunk_index` (INTEGER, not null) - Index of chunk in document
- `text` (TEXT, not null) - Chunk text content
- `token_count` (INTEGER, nullable) - Approximate token count
- `embedding` (vector(1536), not null) - Embedding vector (pgvector)
- `is_curated` (BOOLEAN, not null, default: false) - True if this is a curated summary (generated by memory curator)
- `source_chunk_ids` (UUID[], nullable) - Array of chunk IDs that were summarized into this curated chunk (if is_curated = true)
- `metadata` (JSONB, nullable) - Additional metadata (e.g., page number, section)
- `created_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_chunks_document_id` on `document_id` (for document's chunks query)
- `idx_chunks_persona_id` on `persona_id` (for persona filtering in vector search)
- Vector index on `embedding` (pgvector HNSW index) - For similarity search

**Vector Index Configuration:**
```sql
CREATE INDEX idx_chunks_embedding ON chunks USING hnsw (embedding vector_cosine_ops);
```

**Relationships:**
- Many-to-one with `documents`
- Many-to-one with `personas` (denormalized for filtering)

#### Table: `persona_health_metrics`

**Purpose:** Persona container health metrics (CPU, RAM, disk usage, LLM call counts)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `persona_id` (UUID, foreign key to `personas.id`, not null, on delete: cascade, indexed)
- `cpu_percent` (DECIMAL(5,2), nullable) - CPU usage percentage (0-100)
- `memory_mb` (INTEGER, nullable) - Memory usage in MB
- `memory_percent` (DECIMAL(5,2), nullable) - Memory usage percentage (0-100)
- `disk_usage_gb` (DECIMAL(10,2), nullable) - Disk usage in GB
- `llm_calls_count` (INTEGER, not null, default: 0) - LLM API calls in this period
- `estimated_cost` (DECIMAL(10,4), nullable) - Estimated cost in USD (if tracking provider costs)
- `active_runs_count` (INTEGER, not null, default: 0) - Number of active runs
- `measured_at` (TIMESTAMP, not null, default: `now()`, indexed)

**Indexes:**
- `idx_persona_health_persona_id` on `persona_id` (for persona's health query)
- `idx_persona_health_measured_at` on `measured_at` (for time-series queries)
- Composite index on `(persona_id, measured_at)` for efficient persona timeline queries

**Retention:**
- Metrics stored for 30 days (configurable)
- Older metrics can be aggregated (hourly averages) and archived
- Cleanup job runs daily to remove metrics older than retention period

**Relationships:**
- Many-to-one with `personas`

### Email System

#### Table: `emails`

**Purpose:** Email messages (received and sent)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `persona_id` (UUID, foreign key to `personas.id`, not null, indexed)
- `run_id` (UUID, foreign key to `runs.id`, nullable) - Run that sent/received this email
- `direction` (VARCHAR(50), not null) - 'inbound' | 'outbound'
- `message_id` (VARCHAR(255), nullable) - Email message ID (from IMAP/SMTP)
- `thread_id` (VARCHAR(255), nullable) - Thread ID for grouping conversations
- `from_email` (VARCHAR(255), not null)
- `to_email` (VARCHAR(255), not null)
- `cc` (TEXT, nullable) - CC addresses (comma-separated)
- `bcc` (TEXT, nullable) - BCC addresses (comma-separated)
- `subject` (TEXT, nullable)
- `body_text` (TEXT, nullable) - Plain text body
- `body_html` (TEXT, nullable) - HTML body
- `received_at` (TIMESTAMP, nullable) - When email was received (for inbound)
- `sent_at` (TIMESTAMP, nullable) - When email was sent (for outbound)
- `created_at` (TIMESTAMP, not null, default: `now()`, indexed)

**Indexes:**
- `idx_emails_persona_id` on `persona_id` (for persona's emails query)
- `idx_emails_run_id` on `run_id` (for run's emails query)
- `idx_emails_thread_id` on `thread_id` (for thread grouping)
- `idx_emails_created_at` on `created_at` (for chronological ordering)

**Relationships:**
- Many-to-one with `personas`
- Many-to-one with `runs`
- One-to-many with `attachments` (email attachments)

#### Table: `attachments`

**Purpose:** Email attachments and file artifacts

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `email_id` (UUID, foreign key to `emails.id`, nullable, on delete: cascade) - If attachment to email
- `run_id` (UUID, foreign key to `runs.id`, nullable, indexed) - If artifact from run
- `name` (VARCHAR(255), not null) - File name
- `file_path` (TEXT, not null) - File path in storage
- `file_size` (BIGINT, not null) - File size in bytes
- `mime_type` (VARCHAR(100), nullable) - MIME type
- `created_at` (TIMESTAMP, not null, default: `now()`, indexed)

**Indexes:**
- `idx_attachments_email_id` on `email_id` (for email's attachments query)
- `idx_attachments_run_id` on `run_id` (for run's artifacts query)

**Relationships:**
- Many-to-one with `emails`
- Many-to-one with `runs` (artifacts)

### Secrets and Configuration

#### Table: `secrets`

**Purpose:** Encrypted secrets (provider keys, email credentials)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `persona_id` (UUID, foreign key to `personas.id`, not null, on delete: cascade, indexed)
- `secret_type` (VARCHAR(50), not null) - 'llm_provider_key' | 'email_imap' | 'email_smtp' | 'other'
- `key_name` (VARCHAR(255), not null) - e.g., 'openai_api_key', 'gmail_imap_password'
- `encrypted_value` (TEXT, not null) - Encrypted secret value
- `created_at` (TIMESTAMP, not null, default: `now()`)
- `updated_at` (TIMESTAMP, not null, default: `now()`)

**Indexes:**
- `idx_secrets_persona_id` on `persona_id` (for persona's secrets query)
- Unique constraint on `(persona_id, secret_type, key_name)` (one secret per type/key per persona)

**Encryption:**
- Secrets encrypted at application level (before storing)
- Use AES-256-GCM or similar
- Master encryption key stored in environment variable (never in DB)

**Relationships:**
- Many-to-one with `personas`

### Audit System

#### Table: `audit_events`

**Purpose:** Comprehensive audit log (all actions in the system)

**Fields:**
- `id` (UUID, primary key, default: `gen_random_uuid()`)
- `user_id` (UUID, foreign key to `users.id`, nullable, indexed) - User who performed action
- `persona_id` (UUID, foreign key to `personas.id`, nullable, indexed) - Persona involved (if applicable)
- `run_id` (UUID, foreign key to `runs.id`, nullable, indexed) - Run involved (if applicable)
- `event_type` (VARCHAR(100), not null, indexed) - e.g., 'tool_call', 'email_sent', 'email_received', 'rag_retrieval', 'file_access'
- `event_category` (VARCHAR(50), not null) - 'action' | 'access' | 'error' | 'system'
- `description` (TEXT, not null) - Human-readable description
- `metadata` (JSONB, nullable) - Additional event data (tool name, file path, etc.)
- `ip_address` (VARCHAR(45), nullable) - IP address (if applicable)
- `created_at` (TIMESTAMP, not null, default: `now()`, indexed)

**Indexes:**
- `idx_audit_events_user_id` on `user_id` (for user's actions query)
- `idx_audit_events_persona_id` on `persona_id` (for persona's actions query)
- `idx_audit_events_run_id` on `run_id` (for run's actions query)
- `idx_audit_events_event_type` on `event_type` (for event type filtering)
- `idx_audit_events_created_at` on `created_at` (for chronological ordering, time-range queries)
- Composite index on `(persona_id, created_at)` for persona timeline queries

**Retention:**
- Audit events should be retained indefinitely (or as per compliance requirements)
- Can be archived to cold storage if needed (implement retention policy)

**Fields (continued):**
- `trace_id` (VARCHAR(255), nullable, indexed) - Trace ID from run (for correlation)

**Relationships:**
- Many-to-one with `users` (optional - system events may not have user)
- Many-to-one with `personas` (optional)
- Many-to-one with `runs` (optional)

## Relationships Summary

**User → Personas:** One-to-many (user owns personas)
**User → Persona Members:** One-to-many (user is member of shared personas)
**User → Runs:** One-to-many (user triggers runs)
**User → Documents:** One-to-many (user uploads documents)
**User → Tools:** One-to-many (user creates custom tools)
**User → Audit Events:** One-to-many (user performs actions)

**Persona → Agents:** One-to-many (persona has agents)
**Persona → Runs:** One-to-many (persona executes runs)
**Persona → Documents:** One-to-many (persona has RAG documents)
**Persona → Chunks:** One-to-many (persona has document chunks)
**Persona → Emails:** One-to-many (persona sends/receives emails)
**Persona → Persona Tools:** One-to-many (persona has tool permissions)
**Persona → Secrets:** One-to-many (persona has secrets)

**Agent → Runs:** One-to-many (agent executes runs)

**Run → Run Steps:** One-to-many (run has steps)
**Run → Artifacts:** One-to-many (run creates artifacts)
**Run → Emails:** One-to-many (run sends/receives emails)
**Run → Tool Runs:** One-to-many (run executes tools)

**Tool → Persona Tools:** One-to-many (tool has persona permissions)
**Tool → Tool Runs:** One-to-many (tool is executed)
**Tool → Run Steps:** One-to-many (tool is called in steps)
**Tool → Tool Dependencies:** One-to-many (tool has dependencies)
**Tool → Tool Dependencies (via depends_on_tool_id):** One-to-many (tool is a dependency)

**Persona → Health Metrics:** One-to-many (persona has health metrics over time)

**Document → Chunks:** One-to-many (document has chunks)

**Email → Attachments:** One-to-many (email has attachments)

## Indexes Summary

**Primary Indexes (for joins):**
- All foreign key columns indexed
- Composite indexes for common query patterns

**Performance Indexes:**
- `created_at` timestamps indexed (for chronological ordering, time-range queries)
- `status` columns indexed (for status filtering)
- Composite indexes for persona + timestamp queries

**Vector Indexes:**
- `tools.description_embedding` - HNSW index for tool discovery
- `chunks.embedding` - HNSW index for RAG retrieval

**Full-Text Search (Optional):**
- GIN indexes on text columns if full-text search needed (e.g., `tools.description`)

## Migration Strategy

**Initial Setup:**
1. Create database and enable pgvector extension
2. Create all tables in dependency order (users first, audit_events last)
3. Create all indexes
4. Create vector indexes (after data is loaded)

**Future Migrations:**
- Use Prisma migrations for schema changes
- Vector indexes can be created/updated independently
- Consider migration strategy for adding new vector dimensions (if embedding model changes)

## Data Retention Policies

**Audit Events:**
- Retain indefinitely (or per compliance requirements)
- Archive old events to cold storage if needed
- Implement cleanup job for very old events (if retention policy defined)

**Runs and Steps:**
- Retain indefinitely (or configurable retention per persona)
- Can archive completed runs after N days
- Steps can be archived/deleted with runs

**Tool Runs:**
- Retain indefinitely (for analytics)
- Can archive after N days if needed

**Documents and Chunks:**
- Retain until explicitly deleted by user
- Chunks deleted when document deleted (cascade)

