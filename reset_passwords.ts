import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  
  const defaultHash = await bcrypt.hash("Password@123", 10);
  
  let count = 0;
  for (const user of users) {
    if (!user.password) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: defaultHash }
      });
      count++;
      console.log(`Set password for ${user.email}`);
    }
  }
  console.log(`Updated ${count} teachers with a default password.`);
}

main().finally(() => prisma.$disconnect());
