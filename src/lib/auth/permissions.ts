import { prisma } from '@/lib/db/prisma';

export async function canAccessPersona(userId: string, personaId: string): Promise<boolean> {
  const persona = await prisma.persona.findFirst({
    where: {
      id: personaId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    select: { id: true }
  });

  return Boolean(persona);
}

export async function canEditPersona(userId: string, personaId: string): Promise<boolean> {
  const persona = await prisma.persona.findFirst({
    where: {
      id: personaId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: 'editor' } } }
      ]
    },
    select: { id: true }
  });

  return Boolean(persona);
}
