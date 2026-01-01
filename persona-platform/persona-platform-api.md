# Persona Platform - API Specifications

**Purpose:** Complete API specifications including all endpoints, request/response formats, authentication, error handling, and WebSocket events.

## Base URL

**Development:** `http://localhost:3000/api`
**Production:** `https://your-domain.com/api`

## Authentication

**Method:** JWT (JSON Web Tokens)

**Header Format:**
```
Authorization: Bearer <token>
```

**Token Generation:**
- Token issued on successful login
- Token expires after 24 hours (configurable)
- Token refresh endpoint available

**Token Refresh:**
- Use `POST /api/auth/refresh` with refresh token
- Refresh token stored in HTTP-only cookie or returned in response

## Demo Accounts

**Demo User:**
- Email: `demo@persona-platform.local`
- Password: `demo123` (or auto-filled on login page)

**Demo Admin:**
- Email: `admin@persona-platform.local`
- Password: `admin123` (or auto-filled on login page)

**Note:** Login page should have buttons that auto-fill these credentials when clicked.

## Endpoints

### Authentication

#### `POST /api/auth/login` - User Login

**Purpose:** Authenticate user and return JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  },
  "token": "jwt-token-string",
  "refreshToken": "refresh-token-string"
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Error (400):**
```json
{
  "error": "Validation error",
  "details": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

#### `POST /api/auth/logout` - User Logout

**Purpose:** Invalidate current session

**Authentication:** Required

**Request:** None (token in header)

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### `POST /api/auth/refresh` - Refresh Token

**Purpose:** Get new access token using refresh token

**Request:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Response (200):**
```json
{
  "token": "new-jwt-token-string",
  "refreshToken": "new-refresh-token-string"
}
```

**Error (401):**
```json
{
  "error": "Invalid or expired refresh token"
}
```

### Users

#### `GET /api/users/me` - Get Current User

**Purpose:** Get current authenticated user details

**Authentication:** Required

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "createdAt": "2025-01-28T00:00:00Z",
  "lastLoginAt": "2025-01-28T12:00:00Z"
}
```

### Personas

#### `GET /api/personas` - List Personas

**Purpose:** Get list of personas (owned by user and shared with user)

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 20) - Items per page
- `search` (string, optional) - Search by name

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Assistant",
      "description": "Personal assistant for office work",
      "ownerId": "uuid",
      "ownerName": "User Name",
      "defaultProvider": "openai",
      "isActive": true,
      "createdAt": "2025-01-28T00:00:00Z",
      "updatedAt": "2025-01-28T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### `GET /api/personas/:id` - Get Persona

**Purpose:** Get persona details

**Authentication:** Required
**Authorization:** User must own persona or be a member

**Response (200):**
```json
{
  "id": "uuid",
  "name": "My Assistant",
  "description": "Personal assistant for office work",
  "systemPrompt": "You are a helpful assistant...",
  "ownerId": "uuid",
  "ownerName": "User Name",
  "defaultProvider": "openai",
  "fallbackProviders": ["anthropic", "groq"],
  "isActive": true,
  "containerId": "docker-container-id",
  "agents": [
    {
      "id": "uuid",
      "name": "Email Triage Agent",
      "description": "Handles email requests",
      "isActive": true
    }
  ],
  "createdAt": "2025-01-28T00:00:00Z",
  "updatedAt": "2025-01-28T00:00:00Z"
}
```

**Error (404):**
```json
{
  "error": "Persona not found"
}
```

**Error (403):**
```json
{
  "error": "Access denied"
}
```

#### `POST /api/personas` - Create Persona

**Purpose:** Create new persona

**Authentication:** Required

**Request:**
```json
{
  "name": "My Assistant",
  "description": "Personal assistant for office work",
  "systemPrompt": "You are a helpful assistant...",
  "defaultProvider": "openai",
  "fallbackProviders": ["anthropic"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "My Assistant",
  "description": "Personal assistant for office work",
  "systemPrompt": "You are a helpful assistant...",
  "ownerId": "uuid",
  "defaultProvider": "openai",
  "fallbackProviders": ["anthropic"],
  "isActive": true,
  "createdAt": "2025-01-28T00:00:00Z",
  "updatedAt": "2025-01-28T00:00:00Z"
}
```

**Error (400):**
```json
{
  "error": "Validation error",
  "details": {
    "name": "Name is required",
    "systemPrompt": "System prompt is required"
  }
}
```

#### `PUT /api/personas/:id` - Update Persona

**Purpose:** Update persona configuration

**Authentication:** Required
**Authorization:** User must own persona or be editor member

**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "systemPrompt": "Updated system prompt...",
  "defaultProvider": "anthropic",
  "fallbackProviders": ["openai"]
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "systemPrompt": "Updated system prompt...",
  "ownerId": "uuid",
  "defaultProvider": "anthropic",
  "fallbackProviders": ["openai"],
  "isActive": true,
  "updatedAt": "2025-01-28T12:00:00Z"
}
```

**Error (404):**
```json
{
  "error": "Persona not found"
}
```

**Error (403):**
```json
{
  "error": "Access denied"
}
```

#### `DELETE /api/personas/:id` - Delete Persona

**Purpose:** Delete persona (cascades to agents, runs, documents, etc.)

**Authentication:** Required
**Authorization:** User must own persona

**Response (200):**
```json
{
  "message": "Persona deleted successfully"
}
```

**Error (404):**
```json
{
  "error": "Persona not found"
}
```

**Error (403):**
```json
{
  "error": "Access denied"
}
```

#### `POST /api/personas/:id/members` - Share Persona

**Purpose:** Add member (collaborator) to persona

**Authentication:** Required
**Authorization:** User must own persona

**Request:**
```json
{
  "userEmail": "collaborator@example.com",
  "role": "editor"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "personaId": "uuid",
  "userId": "uuid",
  "userName": "Collaborator Name",
  "userEmail": "collaborator@example.com",
  "role": "editor",
  "createdAt": "2025-01-28T00:00:00Z"
}
```

#### `DELETE /api/personas/:id/members/:memberId` - Remove Member

**Purpose:** Remove member from persona

**Authentication:** Required
**Authorization:** User must own persona

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

### Agents

#### `GET /api/personas/:personaId/agents` - List Agents

**Purpose:** Get list of agents for a persona

**Authentication:** Required
**Authorization:** User must have access to persona

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "personaId": "uuid",
      "name": "Email Triage Agent",
      "description": "Handles email requests",
      "isActive": true,
      "createdAt": "2025-01-28T00:00:00Z"
    }
  ]
}
```

#### `POST /api/personas/:personaId/agents` - Create Agent

**Purpose:** Create new agent for persona

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Request:**
```json
{
  "name": "Email Triage Agent",
  "description": "Handles email requests",
  "systemPromptOverride": "You are an email triage specialist...",
  "preferredProvider": "anthropic"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "personaId": "uuid",
  "name": "Email Triage Agent",
  "description": "Handles email requests",
  "systemPromptOverride": "You are an email triage specialist...",
  "preferredProvider": "anthropic",
  "isActive": true,
  "createdAt": "2025-01-28T00:00:00Z"
}
```

#### `PUT /api/agents/:id` - Update Agent

**Purpose:** Update agent configuration

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Request:**
```json
{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "isActive": false
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "personaId": "uuid",
  "name": "Updated Agent Name",
  "description": "Updated description",
  "isActive": false,
  "updatedAt": "2025-01-28T12:00:00Z"
}
```

#### `DELETE /api/agents/:id` - Delete Agent

**Purpose:** Delete agent

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Response (200):**
```json
{
  "message": "Agent deleted successfully"
}
```

### Runs

#### `GET /api/runs` - List Runs

**Purpose:** Get list of runs (filtered by user, persona, status)

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 20) - Items per page
- `personaId` (UUID, optional) - Filter by persona
- `agentId` (UUID, optional) - Filter by agent
- `status` (string, optional) - Filter by status ('pending', 'running', 'completed', 'failed', 'cancelled')

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "agentId": "uuid",
      "agentName": "Email Triage Agent",
      "personaId": "uuid",
      "personaName": "My Assistant",
      "status": "completed",
      "input": "Create a PowerPoint for HR presentation",
      "output": "PowerPoint created and sent via email",
      "startedAt": "2025-01-28T10:00:00Z",
      "completedAt": "2025-01-28T10:05:00Z",
      "createdAt": "2025-01-28T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### `GET /api/runs/:id` - Get Run

**Purpose:** Get run details with steps

**Authentication:** Required
**Authorization:** User must have access to persona

**Response (200):**
```json
{
  "id": "uuid",
  "agentId": "uuid",
  "agentName": "Email Triage Agent",
  "personaId": "uuid",
  "personaName": "My Assistant",
  "userId": "uuid",
  "userName": "User Name",
  "status": "completed",
  "input": "Create a PowerPoint for HR presentation",
  "output": "PowerPoint created and sent via email",
  "errorMessage": null,
  "startedAt": "2025-01-28T10:00:00Z",
  "completedAt": "2025-01-28T10:05:00Z",
  "createdAt": "2025-01-28T10:00:00Z",
  "steps": [
    {
      "id": "uuid",
      "stepNumber": 1,
      "stepType": "llm_call",
      "input": {
        "messages": [...]
      },
      "output": {
        "message": "...",
        "toolCalls": [...]
      },
      "durationMs": 1500,
      "createdAt": "2025-01-28T10:00:01Z"
    },
    {
      "id": "uuid",
      "stepNumber": 2,
      "stepType": "tool_call",
      "toolId": "uuid",
      "toolName": "generate_powerpoint",
      "input": {
        "slides": [...]
      },
      "output": {
        "filePath": "/workspace/presentation.pptx"
      },
      "durationMs": 3000,
      "createdAt": "2025-01-28T10:00:04Z"
    }
  ],
  "artifacts": [
    {
      "id": "uuid",
      "name": "presentation.pptx",
      "filePath": "/workspace/presentation.pptx",
      "fileSize": 1024000,
      "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "createdAt": "2025-01-28T10:00:04Z"
    }
  ]
}
```

#### `POST /api/runs` - Create Run

**Purpose:** Trigger new agent run

**Authentication:** Required

**Request:**
```json
{
  "agentId": "uuid",
  "input": "Create a PowerPoint for HR presentation about Q1 results"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "agentId": "uuid",
  "personaId": "uuid",
  "status": "pending",
  "input": "Create a PowerPoint for HR presentation about Q1 results",
  "createdAt": "2025-01-28T10:00:00Z"
}
```

**Error (400):**
```json
{
  "error": "Validation error",
  "details": {
    "agentId": "Agent ID is required",
    "input": "Input is required"
  }
}
```

#### `POST /api/runs/:id/cancel` - Cancel Run

**Purpose:** Cancel running or pending run

**Authentication:** Required
**Authorization:** User must have access to persona

**Response (200):**
```json
{
  "id": "uuid",
  "status": "cancelled",
  "updatedAt": "2025-01-28T10:05:00Z"
}
```

### Tools

#### `GET /api/tools` - List Tools

**Purpose:** Get list of available tools (with optional search)

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 50) - Items per page
- `category` (string, optional) - Filter by category
- `search` (string, optional) - Search by name/description

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "generate_powerpoint",
      "description": "Generate PowerPoint presentation (.pptx)",
      "category": "office",
      "isBuiltin": true,
      "schema": {
        "name": "generate_powerpoint",
        "description": "Generate PowerPoint presentation",
        "parameters": {
          "type": "object",
          "properties": {
            "slides": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "title": {"type": "string"},
                  "content": {"type": "string"}
                }
              }
            }
          }
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

#### `POST /api/tools/search` - Search Tools (Vector Search)

**Purpose:** Semantic search for tools (used by agents for tool discovery)

**Authentication:** Required

**Request:**
```json
{
  "query": "generate presentation slides",
  "limit": 5
}
```

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "generate_powerpoint",
      "description": "Generate PowerPoint presentation (.pptx)",
      "category": "office",
      "similarity": 0.95
    }
  ]
}
```

#### `GET /api/tools/:id` - Get Tool

**Purpose:** Get tool details with full schema

**Authentication:** Required

**Response (200):**
```json
{
  "id": "uuid",
  "name": "generate_powerpoint",
  "description": "Generate PowerPoint presentation (.pptx)",
  "category": "office",
  "schema": {
    "name": "generate_powerpoint",
    "description": "Generate PowerPoint presentation",
    "parameters": {
      "type": "object",
      "properties": {
        "slides": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {"type": "string"},
              "content": {"type": "string"}
            }
          }
        }
      },
      "required": ["slides"]
    }
  },
  "codeType": "builtin",
  "isBuiltin": true,
  "createdAt": "2025-01-28T00:00:00Z"
}
```

#### `GET /api/personas/:personaId/tools` - Get Persona's Tools

**Purpose:** Get tools enabled for a persona

**Authentication:** Required
**Authorization:** User must have access to persona

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "toolId": "uuid",
      "toolName": "generate_powerpoint",
      "toolDescription": "Generate PowerPoint presentation (.pptx)",
      "isEnabled": true,
      "config": {}
    }
  ]
}
```

#### `POST /api/personas/:personaId/tools` - Enable Tool for Persona

**Purpose:** Enable tool for persona

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Request:**
```json
{
  "toolId": "uuid",
  "config": {
    "maxFileSize": 10485760
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "personaId": "uuid",
  "toolId": "uuid",
  "toolName": "generate_powerpoint",
  "isEnabled": true,
  "config": {
    "maxFileSize": 10485760
  },
  "createdAt": "2025-01-28T00:00:00Z"
}
```

#### `PUT /api/personas/:personaId/tools/:toolId` - Update Tool Permission

**Purpose:** Update tool permission/config for persona

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Request:**
```json
{
  "isEnabled": false,
  "config": {
    "maxFileSize": 5242880
  }
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "personaId": "uuid",
  "toolId": "uuid",
  "isEnabled": false,
  "config": {
    "maxFileSize": 5242880
  },
  "updatedAt": "2025-01-28T12:00:00Z"
}
```

### Memory (RAG)

#### `GET /api/personas/:personaId/memory` - List Documents

**Purpose:** Get list of documents in persona's RAG knowledge base

**Authentication:** Required
**Authorization:** User must have access to persona

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 20) - Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Company Handbook.pdf",
      "source": "upload",
      "fileSize": 1048576,
      "mimeType": "application/pdf",
      "status": "completed",
      "chunkCount": 150,
      "uploadedBy": "uuid",
      "uploadedByName": "User Name",
      "createdAt": "2025-01-28T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

#### `POST /api/personas/:personaId/memory/upload` - Upload Document

**Purpose:** Upload document to persona's RAG knowledge base

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Request:** Multipart form data
- `file` (file, required) - Document file
- `name` (string, optional) - Document name (defaults to filename)

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Company Handbook.pdf",
  "source": "upload",
  "fileSize": 1048576,
  "mimeType": "application/pdf",
  "status": "processing",
  "createdAt": "2025-01-28T00:00:00Z"
}
```

**Note:** Document processing (chunking, embedding) happens asynchronously. Check status via GET endpoint.

#### `POST /api/personas/:personaId/memory/search` - Search RAG

**Purpose:** Semantic search in persona's RAG knowledge base

**Authentication:** Required
**Authorization:** User must have access to persona

**Request:**
```json
{
  "query": "What is our company policy on remote work?",
  "limit": 5
}
```

**Response (200):**
```json
{
  "results": [
    {
      "chunkId": "uuid",
      "documentId": "uuid",
      "documentName": "Company Handbook.pdf",
      "text": "Remote work policy: Employees can work remotely up to 3 days per week...",
      "similarity": 0.92,
      "metadata": {
        "page": 15,
        "chunkIndex": 42
      }
    }
  ]
}
```

#### `DELETE /api/personas/:personaId/memory/:documentId` - Delete Document

**Purpose:** Delete document from persona's RAG knowledge base (cascades to chunks)

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Response (200):**
```json
{
  "message": "Document deleted successfully"
}
```

### Connectors

#### `GET /api/personas/:personaId/connectors` - Get Connector Configuration

**Purpose:** Get connector configuration (email, browser, desktop VM)

**Authentication:** Required
**Authorization:** User must have access to persona

**Response (200):**
```json
{
  "email": {
    "enabled": true,
    "imapHost": "imap.gmail.com",
    "imapPort": 993,
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "username": "user@gmail.com"
  },
  "browser": {
    "enabled": true,
    "profilePath": "/cache/browser-profile"
  },
  "desktopVm": {
    "enabled": false,
    "vncHost": null,
    "vncPort": null
  }
}
```

#### `PUT /api/personas/:personaId/connectors/email` - Configure Email Connector

**Purpose:** Configure email connector (IMAP/SMTP credentials)

**Authentication:** Required
**Authorization:** User must have editor access to persona

**Request:**
```json
{
  "enabled": true,
  "imapHost": "imap.gmail.com",
  "imapPort": 993,
  "imapUsername": "user@gmail.com",
  "imapPassword": "app-password",
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUsername": "user@gmail.com",
  "smtpPassword": "app-password"
}
```

**Response (200):**
```json
{
  "enabled": true,
  "imapHost": "imap.gmail.com",
  "imapPort": 993,
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "username": "user@gmail.com",
  "updatedAt": "2025-01-28T12:00:00Z"
}
```

**Note:** Passwords are encrypted before storage.

### Audit Logs

#### `GET /api/audit` - Get Audit Logs

**Purpose:** Get audit log entries (filterable)

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 50) - Items per page
- `userId` (UUID, optional) - Filter by user
- `personaId` (UUID, optional) - Filter by persona
- `runId` (UUID, optional) - Filter by run
- `eventType` (string, optional) - Filter by event type
- `eventCategory` (string, optional) - Filter by category ('action', 'access', 'error', 'system')
- `startDate` (ISO 8601, optional) - Start date
- `endDate` (ISO 8601, optional) - End date

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "User Name",
      "personaId": "uuid",
      "personaName": "My Assistant",
      "runId": "uuid",
      "eventType": "tool_call",
      "eventCategory": "action",
      "description": "Tool 'generate_powerpoint' executed",
      "metadata": {
        "toolName": "generate_powerpoint",
        "durationMs": 3000
      },
      "createdAt": "2025-01-28T10:00:04Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

### Admin

#### `GET /api/admin/users` - List Users (Admin Only)

**Purpose:** Get list of all users

**Authentication:** Required
**Authorization:** Admin role required

**Query Parameters:**
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 20)
- `role` (string, optional) - Filter by role
- `search` (string, optional) - Search by email/name

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-01-28T00:00:00Z",
      "lastLoginAt": "2025-01-28T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `PUT /api/admin/users/:id` - Update User (Admin Only)

**Purpose:** Update user (role, active status)

**Authentication:** Required
**Authorization:** Admin role required

**Request:**
```json
{
  "role": "admin",
  "isActive": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",
  "isActive": true,
  "updatedAt": "2025-01-28T12:00:00Z"
}
```

## WebSocket Events

**Connection:** `ws://localhost:3000/ws` (or `wss://` for production)

**Authentication:** Send JWT token in query parameter: `?token=<jwt-token>`

### Client → Server Events

#### `subscribe:run` - Subscribe to Run Updates

**Purpose:** Subscribe to real-time updates for a run

**Message:**
```json
{
  "type": "subscribe:run",
  "runId": "uuid"
}
```

### Server → Client Events

#### `run:update` - Run Status Update

**Purpose:** Notify client of run status/step updates

**Message:**
```json
{
  "type": "run:update",
  "runId": "uuid",
  "status": "running",
  "step": {
    "id": "uuid",
    "stepNumber": 2,
    "stepType": "tool_call",
    "toolName": "generate_powerpoint",
    "status": "completed",
    "durationMs": 3000
  }
}
```

#### `run:completed` - Run Completed

**Purpose:** Notify client that run has completed

**Message:**
```json
{
  "type": "run:completed",
  "runId": "uuid",
  "status": "completed",
  "output": "PowerPoint created and sent via email"
}
```

#### `run:error` - Run Error

**Purpose:** Notify client of run error

**Message:**
```json
{
  "type": "run:error",
  "runId": "uuid",
  "error": "Tool execution failed: generate_powerpoint",
  "errorMessage": "File size exceeds limit"
}
```

## Error Handling

**Standard Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details (optional)
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authorization failed)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate resource)
- `500` - Internal Server Error

**Common Error Codes:**
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INTERNAL_ERROR` - Internal server error

## Rate Limiting

**Limits (per user):**
- API requests: 100 requests per minute
- File uploads: 10 uploads per minute
- Run creation: 5 runs per minute

**Headers:**
- `X-RateLimit-Limit` - Rate limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp

**Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

