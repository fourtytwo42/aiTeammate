import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canAccessPersona } from '@/lib/auth/permissions';
import { forbidden, unauthorized } from '@/lib/api/responses';

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

  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20');
  const skip = (page - 1) * limit;

  const [total, documents] = await Promise.all([
    prisma.document.count({ where: { personaId: id } }),
    prisma.document.findMany({
      where: { personaId: id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { uploader: true, _count: { select: { chunks: true } } }
    })
  ]);

  return NextResponse.json({
    data: documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      source: doc.source,
      fileSize: doc.fileSize ? Number(doc.fileSize) : null,
      mimeType: doc.mimeType,
      status: doc.status,
      chunkCount: doc._count.chunks,
      uploadedBy: doc.uploadedBy,
      uploadedByName: doc.uploader.name,
      createdAt: doc.createdAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}
