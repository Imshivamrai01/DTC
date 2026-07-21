import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  for (const user of users) {
    console.log(`Teacher: ${user.email}`);
    // try comparing with "Password@123"
    const isMatch = await bcrypt.compare("Password@123", user.password || "");
    console.log(`  Password@123 match: ${isMatch}`);
    
    // try comparing with "Teacher@123" if the user might have used that
    const isMatch2 = await bcrypt.compare("Teacher@123", user.password || "");
    console.log(`  Teacher@123 match: ${isMatch2}`);
  }
}

main().finally(() => prisma.$disconnect());
