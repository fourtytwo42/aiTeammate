import { prisma } from '@/lib/db/prisma';

export async function startHealthMonitor() {
  const personas = await prisma.persona.findMany({ where: { isActive: true } });
  return personas.length;
}
