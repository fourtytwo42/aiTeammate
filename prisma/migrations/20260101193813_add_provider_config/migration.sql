-- CreateTable
CREATE TABLE "ProviderConfig" (
    "id" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100),
    "baseUrl" VARCHAR(255),
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderConfig_personaId_idx" ON "ProviderConfig"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderConfig_personaId_provider_key" ON "ProviderConfig"("personaId", "provider");

-- AddForeignKey
ALTER TABLE "ProviderConfig" ADD CONSTRAINT "ProviderConfig_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
