import { prisma } from '@/lib/db/prisma';
import { encrypt, decrypt } from './encryption';

export async function setSecret(personaId: string, secretType: string, keyName: string, value: string) {
  const encryptedValue = encrypt(value);
  return prisma.secret.upsert({
    where: {
      personaId_secretType_keyName: {
        personaId,
        secretType: secretType as any,
        keyName
      }
    },
    update: { encryptedValue },
    create: {
      personaId,
      secretType: secretType as any,
      keyName,
      encryptedValue
    }
  });
}

export async function getSecret(personaId: string, secretType: string, keyName: string) {
  const secret = await prisma.secret.findUnique({
    where: {
      personaId_secretType_keyName: {
        personaId,
        secretType: secretType as any,
        keyName
      }
    }
  });

  if (!secret) return null;
  return decrypt(secret.encryptedValue);
}
