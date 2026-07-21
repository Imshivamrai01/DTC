import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultHash = await bcrypt.hash("Password@123", 10);
  
  await prisma.user.updateMany({
    where: { role: 'TEACHER' },
    data: { password: defaultHash }
  });

  console.log("Forced reset all teachers to Password@123");
}

main().finally(() => prisma.$disconnect());
