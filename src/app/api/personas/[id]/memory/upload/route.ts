import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canEditPersona } from '@/lib/auth/permissions';
import { ingestDocument } from '@/lib/rag/ingestion';
import { forbidden, unauthorized, validationError } from '@/lib/api/responses';

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

  const formData = await request.formData();
  const file = formData.get('file');
  const name = (formData.get('name') as string | null) ?? undefined;

  if (!file || typeof file === 'string') {
    return validationError({ file: ['File is required'] });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageRoot = process.env.STORAGE_PATH ?? './storage';
  await fs.mkdir(storageRoot, { recursive: true });

  const fileName = `${crypto.randomUUID()}-${file.name}`;
  const filePath = path.join(storageRoot, fileName);
  await fs.writeFile(filePath, buffer);

  const document = await prisma.document.create({
    data: {
      personaId: id,
      name: name ?? file.name,
      source: 'upload',
      filePath,
      fileSize: BigInt(buffer.length),
      mimeType: file.type,
      status: 'processing',
      uploadedBy: user.id
    }
  });

  await ingestDocument(id, document.id);

  return NextResponse.json({
    id: document.id,
    name: document.name,
    source: document.source,
    fileSize: document.fileSize ? Number(document.fileSize) : null,
    mimeType: document.mimeType,
    status: document.status,
    createdAt: document.createdAt
  }, { status: 201 });
}
