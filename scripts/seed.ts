import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function seed() {
  const demoUserPassword = await hashPassword('demo123');
  const demoAdminPassword = await hashPassword('admin123');

  await prisma.user.upsert({
    where: { email: 'demo@persona-platform.local' },
    update: {},
    create: {
      email: 'demo@persona-platform.local',
      name: 'Demo User',
      role: 'user',
      passwordHash: demoUserPassword
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@persona-platform.local' },
    update: {},
    create: {
      email: 'admin@persona-platform.local',
      name: 'Demo Admin',
      role: 'admin',
      passwordHash: demoAdminPassword
    }
  });

  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@persona-platform.local' }
  });

  if (!demoUser) {
    throw new Error('Demo user missing');
  }

  const tools = [
    {
      name: 'generate_powerpoint',
      description: 'Generate PowerPoint presentation (.pptx)',
      category: 'office',
      schema: {
        name: 'generate_powerpoint',
        description: 'Generate PowerPoint presentation',
        parameters: {
          type: 'object',
          properties: {
            slides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          },
          required: ['slides']
        }
      },
      isBuiltin: true
    },
    {
      name: 'send_email',
      description: 'Send email with optional attachments',
      category: 'email',
      schema: {
        name: 'send_email',
        description: 'Send email',
        parameters: {
          type: 'object',
          properties: {
            to: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' }
          },
          required: ['to', 'subject', 'body']
        }
      },
      isBuiltin: true
    },
    {
      name: 'browser_navigate',
      description: 'Navigate a browser to a URL',
      category: 'browser',
      schema: {
        name: 'browser_navigate',
        description: 'Navigate to a URL',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string' }
          },
          required: ['url']
        }
      },
      isBuiltin: true
    }
  ];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { name: tool.name },
      update: {},
      create: tool
    });
  }

  let persona = await prisma.persona.findFirst({
    where: { name: 'Atlas', ownerId: demoUser.id }
  });

  if (!persona) {
    persona = await prisma.persona.create({
      data: {
        name: 'Atlas',
        description: 'Ops orchestrator with email triage',
        systemPrompt: 'You are Atlas, an operations assistant.',
        ownerId: demoUser.id,
        defaultProvider: 'openai',
        fallbackProviders: ['anthropic', 'groq'],
        isActive: true
      }
    });
  }

  const existingAgent = await prisma.agent.findFirst({
    where: { name: 'Email Triage Agent', personaId: persona.id }
  });

  if (!existingAgent) {
    await prisma.agent.create({
      data: {
        personaId: persona.id,
        name: 'Email Triage Agent',
        description: 'Handles inbound email requests'
      }
    });
  }

  const toolRecords = await prisma.tool.findMany();
  for (const tool of toolRecords) {
    await prisma.personaTool.upsert({
      where: {
        personaId_toolId: {
          personaId: persona.id,
          toolId: tool.id
        }
      },
      update: {},
      create: {
        personaId: persona.id,
        toolId: tool.id
      }
    });
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
