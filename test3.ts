import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'amit.patel@teacher.edu' } });
  console.log('User found:', user?.email);
  console.log('Password hash:', user?.password);
  
  if (user?.password) {
    const isMatch = await bcrypt.compare("Password@123", user.password);
    console.log('Matches Password@123?', isMatch);
  }
}

main().finally(() => prisma.$disconnect());
