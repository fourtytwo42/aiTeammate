import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { unauthorized, validationError } from '@/lib/api/responses';

const CreatePersonaSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  systemPrompt: z.string().min(1),
  defaultProvider: z.string().default('openai'),
  fallbackProviders: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const search = request.nextUrl.searchParams.get('search')?.trim();
  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20');
  const skip = (page - 1) * limit;

  const where = {
    OR: [
      { ownerId: user.id },
      { members: { some: { userId: user.id } } }
    ],
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {})
  };

  const [total, personas] = await Promise.all([
    prisma.persona.count({ where }),
    prisma.persona.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { owner: true }
    })
  ]);

  return NextResponse.json({
    data: personas.map((persona) => ({
      id: persona.id,
      name: persona.name,
      description: persona.description,
      ownerId: persona.ownerId,
      ownerName: persona.owner.name,
      defaultProvider: persona.defaultProvider,
      isActive: persona.isActive,
      createdAt: persona.createdAt,
      updatedAt: persona.updatedAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function POST(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = CreatePersonaSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const persona = await prisma.persona.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      systemPrompt: parsed.data.systemPrompt,
      defaultProvider: parsed.data.defaultProvider,
      fallbackProviders: parsed.data.fallbackProviders,
      ownerId: user.id
    }
  });

  return NextResponse.json(persona, { status: 201 });
}
