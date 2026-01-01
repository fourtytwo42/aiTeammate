-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "PersonaMemberRole" AS ENUM ('editor', 'viewer');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "RunStepType" AS ENUM ('llm_call', 'tool_call', 'rag_retrieval', 'error');

-- CreateEnum
CREATE TYPE "ToolCodeType" AS ENUM ('python', 'javascript', 'builtin');

-- CreateEnum
CREATE TYPE "ToolDependencyType" AS ENUM ('requires', 'recommends', 'optional');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "EmailDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "SecretType" AS ENUM ('llm_provider_key', 'email_imap', 'email_smtp', 'other');

-- CreateEnum
CREATE TYPE "AuditEventCategory" AS ENUM ('action', 'access', 'error', 'system');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "defaultProvider" VARCHAR(50) NOT NULL,
    "fallbackProviders" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "containerId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaMember" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "PersonaMemberRole" NOT NULL DEFAULT 'editor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonaMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "systemPromptOverride" TEXT,
    "preferredProvider" VARCHAR(50),
    "toolPermissions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "traceId" VARCHAR(255) NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'pending',
    "input" TEXT NOT NULL,
    "output" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunStep" (
    "id" UUID NOT NULL,
    "runId" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepType" "RunStepType" NOT NULL,
    "toolId" UUID,
    "input" JSONB,
    "output" JSONB,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(100),
    "schema" JSONB NOT NULL,
    "code" TEXT,
    "codeType" "ToolCodeType",
    "isBuiltin" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "descriptionEmbedding" vector,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaTool" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "toolId" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonaTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolRun" (
    "id" UUID NOT NULL,
    "toolId" UUID NOT NULL,
    "runId" UUID NOT NULL,
    "runStepId" UUID,
    "traceId" VARCHAR(255) NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolDependency" (
    "id" UUID NOT NULL,
    "toolId" UUID NOT NULL,
    "dependsOnToolId" UUID NOT NULL,
    "dependencyType" "ToolDependencyType" NOT NULL DEFAULT 'requires',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "source" VARCHAR(255),
    "sourceUrl" TEXT,
    "filePath" TEXT,
    "fileSize" BIGINT,
    "mimeType" VARCHAR(100),
    "status" "DocumentStatus" NOT NULL DEFAULT 'processing',
    "errorMessage" TEXT,
    "uploadedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chunk" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "embedding" vector NOT NULL,
    "isCurated" BOOLEAN NOT NULL DEFAULT false,
    "sourceChunkIds" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaHealthMetric" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "cpuPercent" DECIMAL(5,2),
    "memoryMb" INTEGER,
    "memoryPercent" DECIMAL(5,2),
    "diskUsageGb" DECIMAL(10,2),
    "llmCallsCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(10,4),
    "activeRunsCount" INTEGER NOT NULL DEFAULT 0,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonaHealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "runId" UUID,
    "direction" "EmailDirection" NOT NULL,
    "messageId" VARCHAR(255),
    "threadId" VARCHAR(255),
    "fromEmail" VARCHAR(255) NOT NULL,
    "toEmail" VARCHAR(255) NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "subject" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "receivedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" UUID NOT NULL,
    "emailId" UUID,
    "runId" UUID,
    "name" VARCHAR(255) NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Secret" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "secretType" "SecretType" NOT NULL,
    "keyName" VARCHAR(255) NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "personaId" UUID,
    "runId" UUID,
    "traceId" VARCHAR(255),
    "eventType" VARCHAR(100) NOT NULL,
    "eventCategory" "AuditEventCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_tokenHash_idx" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Persona_ownerId_idx" ON "Persona"("ownerId");

-- CreateIndex
CREATE INDEX "Persona_name_idx" ON "Persona"("name");

-- CreateIndex
CREATE INDEX "PersonaMember_personaId_idx" ON "PersonaMember"("personaId");

-- CreateIndex
CREATE INDEX "PersonaMember_userId_idx" ON "PersonaMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonaMember_personaId_userId_key" ON "PersonaMember"("personaId", "userId");

-- CreateIndex
CREATE INDEX "Agent_personaId_idx" ON "Agent"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Run_traceId_key" ON "Run"("traceId");

-- CreateIndex
CREATE INDEX "Run_personaId_idx" ON "Run"("personaId");

-- CreateIndex
CREATE INDEX "Run_userId_idx" ON "Run"("userId");

-- CreateIndex
CREATE INDEX "Run_status_idx" ON "Run"("status");

-- CreateIndex
CREATE INDEX "Run_createdAt_idx" ON "Run"("createdAt");

-- CreateIndex
CREATE INDEX "RunStep_runId_idx" ON "RunStep"("runId");

-- CreateIndex
CREATE INDEX "RunStep_runId_stepNumber_idx" ON "RunStep"("runId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_name_key" ON "Tool"("name");

-- CreateIndex
CREATE INDEX "Tool_category_idx" ON "Tool"("category");

-- CreateIndex
CREATE INDEX "PersonaTool_personaId_idx" ON "PersonaTool"("personaId");

-- CreateIndex
CREATE INDEX "PersonaTool_toolId_idx" ON "PersonaTool"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonaTool_personaId_toolId_key" ON "PersonaTool"("personaId", "toolId");

-- CreateIndex
CREATE INDEX "ToolRun_toolId_idx" ON "ToolRun"("toolId");

-- CreateIndex
CREATE INDEX "ToolRun_runId_idx" ON "ToolRun"("runId");

-- CreateIndex
CREATE INDEX "ToolRun_createdAt_idx" ON "ToolRun"("createdAt");

-- CreateIndex
CREATE INDEX "ToolDependency_toolId_idx" ON "ToolDependency"("toolId");

-- CreateIndex
CREATE INDEX "ToolDependency_dependsOnToolId_idx" ON "ToolDependency"("dependsOnToolId");

-- CreateIndex
CREATE UNIQUE INDEX "ToolDependency_toolId_dependsOnToolId_key" ON "ToolDependency"("toolId", "dependsOnToolId");

-- CreateIndex
CREATE INDEX "Document_personaId_idx" ON "Document"("personaId");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE INDEX "Chunk_documentId_idx" ON "Chunk"("documentId");

-- CreateIndex
CREATE INDEX "Chunk_personaId_idx" ON "Chunk"("personaId");

-- CreateIndex
CREATE INDEX "PersonaHealthMetric_personaId_idx" ON "PersonaHealthMetric"("personaId");

-- CreateIndex
CREATE INDEX "PersonaHealthMetric_measuredAt_idx" ON "PersonaHealthMetric"("measuredAt");

-- CreateIndex
CREATE INDEX "PersonaHealthMetric_personaId_measuredAt_idx" ON "PersonaHealthMetric"("personaId", "measuredAt");

-- CreateIndex
CREATE INDEX "Email_personaId_idx" ON "Email"("personaId");

-- CreateIndex
CREATE INDEX "Email_runId_idx" ON "Email"("runId");

-- CreateIndex
CREATE INDEX "Email_threadId_idx" ON "Email"("threadId");

-- CreateIndex
CREATE INDEX "Email_createdAt_idx" ON "Email"("createdAt");

-- CreateIndex
CREATE INDEX "Attachment_emailId_idx" ON "Attachment"("emailId");

-- CreateIndex
CREATE INDEX "Attachment_runId_idx" ON "Attachment"("runId");

-- CreateIndex
CREATE INDEX "Attachment_createdAt_idx" ON "Attachment"("createdAt");

-- CreateIndex
CREATE INDEX "Secret_personaId_idx" ON "Secret"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Secret_personaId_secretType_keyName_key" ON "Secret"("personaId", "secretType", "keyName");

-- CreateIndex
CREATE INDEX "AuditEvent_userId_idx" ON "AuditEvent"("userId");

-- CreateIndex
CREATE INDEX "AuditEvent_personaId_idx" ON "AuditEvent"("personaId");

-- CreateIndex
CREATE INDEX "AuditEvent_runId_idx" ON "AuditEvent"("runId");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_idx" ON "AuditEvent"("eventType");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_traceId_idx" ON "AuditEvent"("traceId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaMember" ADD CONSTRAINT "PersonaMember_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaMember" ADD CONSTRAINT "PersonaMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunStep" ADD CONSTRAINT "RunStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunStep" ADD CONSTRAINT "RunStep_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaTool" ADD CONSTRAINT "PersonaTool_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaTool" ADD CONSTRAINT "PersonaTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolRun" ADD CONSTRAINT "ToolRun_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolRun" ADD CONSTRAINT "ToolRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolRun" ADD CONSTRAINT "ToolRun_runStepId_fkey" FOREIGN KEY ("runStepId") REFERENCES "RunStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolDependency" ADD CONSTRAINT "ToolDependency_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolDependency" ADD CONSTRAINT "ToolDependency_dependsOnToolId_fkey" FOREIGN KEY ("dependsOnToolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaHealthMetric" ADD CONSTRAINT "PersonaHealthMetric_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE SET NULL ON UPDATE CASCADE;
