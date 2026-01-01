import { prisma } from '@/lib/db/prisma';

export async function searchTools(query: string, limit = 5) {
  const tools = await prisma.tool.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: limit
  });

  return tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    similarity: 0
  }));
}
