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
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
