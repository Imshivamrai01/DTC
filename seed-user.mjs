import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const passwordHashAdmin = await bcrypt.hash('admin123', 10);
    const passwordHashTeacher = await bcrypt.hash('teacher123', 10);
    const passwordHashStudent = await bcrypt.hash('student123', 10);
    const passwordHashParent = await bcrypt.hash('parent123', 10);
    const passwordHashCoordinator = await bcrypt.hash('coordinator123', 10);
    
    // Upsert a test tenant
    const tenant = await prisma.tenant.upsert({
      where: { domain: 'demo.school.edu' },
      update: {},
      create: {
        name: 'Demo School',
        domain: 'demo.school.edu',
      }
    });

    const users = [
      { email: 'admin@school.edu', password: passwordHashAdmin, role: 'ADMIN', first: 'System', last: 'Admin' },
      { email: 'teacher@school.edu', password: passwordHashTeacher, role: 'TEACHER', first: 'Demo', last: 'Teacher' },
      { email: 'student@school.edu', password: passwordHashStudent, role: 'STUDENT', first: 'Demo', last: 'Student' },
      { email: 'parent@school.edu', password: passwordHashParent, role: 'PARENT', first: 'Demo', last: 'Parent' },
      { email: 'coordinator@school.edu', password: passwordHashCoordinator, role: 'COORDINATOR', first: 'Demo', last: 'Coordinator' },
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { 
          tenantId_email: {
            tenantId: tenant.id,
            email: u.email
          }
        },
        update: {
          password: u.password
        },
        create: {
          tenantId: tenant.id,
          email: u.email,
          password: u.password,
          role: u.role,
          firstName: u.first,
          lastName: u.last
        }
      });
      console.log(`Seeded user: ${u.email} (${u.role})`);
    }

    console.log(`\nSuccessfully seeded all demo accounts!`);
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
