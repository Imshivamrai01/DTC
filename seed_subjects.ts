import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get a tenantId to attach these subjects to. We will attach to all tenants (or just the first one if there's only one).
  const tenants = await prisma.tenant.findMany();
  if (tenants.length === 0) {
    console.log("No tenants found. Can't seed subjects.");
    return;
  }
  
  const subjects = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'English', code: 'ENG' },
    { name: 'Hindi', code: 'HIN' },
    { name: 'Social Studies', code: 'SST' },
    { name: 'Computer Science', code: 'CS' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'Biology', code: 'BIO' },
    { name: 'Physical Education', code: 'PE' },
    { name: 'Art & Craft', code: 'ART' },
  ];

  for (const tenant of tenants) {
    console.log(`Seeding subjects for tenant ${tenant.id} (${tenant.name})...`);

    for (const subject of subjects) {
      // Check if subject exists
      const existing = await prisma.subject.findFirst({
        where: { name: subject.name, tenantId: tenant.id }
      });
      
      if (!existing) {
        await prisma.subject.create({
          data: {
            name: subject.name,
            code: subject.code,
            tenantId: tenant.id
          }
        });
        console.log(`Added subject: ${subject.name}`);
      } else {
        console.log(`Subject ${subject.name} already exists.`);
      }
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
