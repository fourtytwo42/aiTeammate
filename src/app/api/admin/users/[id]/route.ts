import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { forbidden, notFound, unauthorized, validationError } from '@/lib/api/responses';

const UpdateUserSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
  isActive: z.boolean().optional()
});

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await authenticate(request);
  if (!user) {
    return unauthorized();
  }

  if (user.role !== 'admin') {
    return forbidden('Admin access required');
  }

  const body = await request.json();
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const { id } = await context.params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return notFound('User not found');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    isActive: updated.isActive,
    updatedAt: updated.updatedAt
  });
}
