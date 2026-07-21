import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'teacher@demo.com' } });
  console.log('Hash in DB:', user?.password);
  
  const testHash = await bcrypt.hash("Password@123", 10);
  console.log('Fresh hash of Password@123:', testHash);
}

main().finally(() => prisma.$disconnect());
