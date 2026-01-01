import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona, canEditPersona } from '@/lib/auth/permissions';
import { forbidden, notFound, unauthorized, validationError } from '@/lib/api/responses';
import { setSecret } from '@/lib/security/secrets';

const ProviderConfigSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().min(1).optional(),
  isEnabled: z.boolean().optional()
});

const ProviderDefaultsSchema = z.object({
  defaultProvider: z.string().min(1),
  fallbackProviders: z.array(z.string()).optional()
});

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canAccess = await canAccessPersona(user.id, id);
  if (!canAccess) {
    return forbidden();
  }

  const persona = await prisma.persona.findUnique({
    where: { id },
    include: { providerConfigs: true }
  });

  if (!persona) {
    return notFound('Persona not found');
  }

  const configs = await Promise.all(
    persona.providerConfigs.map(async (config) => {
      const secret = await prisma.secret.findUnique({
        where: {
          personaId_secretType_keyName: {
            personaId: id,
            secretType: 'llm_provider_key',
            keyName: config.provider
          }
        }
      });

      return {
        id: config.id,
        provider: config.provider,
        model: config.model,
        baseUrl: config.baseUrl,
        isEnabled: config.isEnabled,
        hasApiKey: Boolean(secret)
      };
    })
  );

  return NextResponse.json({
    defaultProvider: persona.defaultProvider,
    fallbackProviders: persona.fallbackProviders ?? [],
    configs
  });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canEdit = await canEditPersona(user.id, id);
  if (!canEdit) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = ProviderDefaultsSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const updated = await prisma.persona.update({
    where: { id },
    data: {
      defaultProvider: parsed.data.defaultProvider,
      fallbackProviders: parsed.data.fallbackProviders ?? []
    }
  });

  return NextResponse.json({
    defaultProvider: updated.defaultProvider,
    fallbackProviders: updated.fallbackProviders ?? []
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const canEdit = await canEditPersona(user.id, id);
  if (!canEdit) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = ProviderConfigSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const config = await prisma.providerConfig.upsert({
    where: {
      personaId_provider: {
        personaId: id,
        provider: parsed.data.provider
      }
    },
    update: {
      model: parsed.data.model,
      baseUrl: parsed.data.baseUrl,
      isEnabled: parsed.data.isEnabled ?? true
    },
    create: {
      personaId: id,
      provider: parsed.data.provider,
      model: parsed.data.model,
      baseUrl: parsed.data.baseUrl,
      isEnabled: parsed.data.isEnabled ?? true
    }
  });

  if (parsed.data.apiKey) {
    await setSecret(id, 'llm_provider_key', parsed.data.provider, parsed.data.apiKey);
  }

  return NextResponse.json({
    id: config.id,
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl,
    isEnabled: config.isEnabled
  }, { status: 201 });
}
