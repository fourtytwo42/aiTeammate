import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { canEditPersona } from '@/lib/auth/permissions';
import { forbidden, notFound, unauthorized } from '@/lib/api/responses';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; documentId: string }> }
) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  const { id, documentId } = await context.params;
  const canEdit = await canEditPersona(user.id, id);
  if (!canEdit) {
    return forbidden();
  }

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) {
    return notFound('Document not found');
  }

  if (document.filePath) {
    await fs.rm(document.filePath, { force: true });
  }

  await prisma.document.delete({ where: { id: documentId } });
  return NextResponse.json({ message: 'Document deleted successfully' });
}
