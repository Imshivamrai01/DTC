import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.grade.deleteMany();
  await prisma.evaluationWorkflow.deleteMany();
  await prisma.examPaper.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('Seeding database...');
  // 1. Create a Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo International School',
      domain: 'demo.edtech.com',
    },
  });
  console.log(`Created Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Create Admin
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@demo.com',
      role: 'ADMIN',
    },
  });

  // 3. Create a Teacher
  const teacher = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'teacher@demo.com',
      phone: '+1 555-0100',
      role: 'TEACHER',
    },
  });

  // 4. Create a Classroom and Subject
  const classroom = await prisma.classroom.create({
    data: {
      tenantId: tenant.id,
      name: '10-A Science',
      grade: '10',
      section: 'A',
    },
  });

  const subject = await prisma.subject.create({
    data: {
      tenantId: tenant.id,
      name: 'Physics',
      code: 'PHY101',
    },
  });

  // 5. Create Students
  const studentsData = [
    { firstName: 'John', lastName: 'Doe', email: 'john@demo.com', phone: '+1 555-0101' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@demo.com', phone: '+1 555-0102' },
    { firstName: 'Alex', lastName: 'Johnson', email: 'alex@demo.com', phone: '+1 555-0103' },
  ];

  const students = [];
  for (const s of studentsData) {
    const student = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        role: 'STUDENT',
      },
    });
    students.push(student);
  }

  // 6. Create Exam and Papers
  const exam = await prisma.exam.create({
    data: {
      tenantId: tenant.id,
      name: 'Mid-Term Physics Assessment',
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // + 7 days
    },
  });

  const examPaper = await prisma.examPaper.create({
    data: {
      examId: exam.id,
      subjectId: subject.id,
      maxMarks: 100,
      passingMarks: 40,
      date: new Date(),
    }
  });

  await prisma.evaluationWorkflow.create({
    data: {
      examPaperId: examPaper.id,
      assignedTeacherId: teacher.id,
      status: 'PENDING',
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
