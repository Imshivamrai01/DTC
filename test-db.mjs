import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("SUCCESS: MongoDB connected successfully!");
    const count = await prisma.tenant.count();
    console.log(`Found ${count} tenants.`);
  } catch (error) {
    console.error("ERROR: Failed to connect to MongoDB.");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
