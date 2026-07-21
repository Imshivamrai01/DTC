import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const indianStudentNames = [
  "Aarav Sharma", "Vivaan Patel", "Aditya Singh", "Vihaan Kumar", "Arjun Gupta",
  "Sai Reddy", "Riyansh Desai", "Krishna Verma", "Ishaan Joshi", "Shaurya Mehta",
  "Aadhya Chawla", "Diya Kapoor", "Saanvi Nair", "Ananya Menon", "Pari Ahuja",
  "Myra Bhatia", "Kriti Jain", "Riya Sen", "Prisha Das", "Aarohi Roy",
  "Rahul Iyer", "Karan Malhotra", "Rohan Soni", "Anjali Trivedi", "Neha Kulkarni",
  "Sneha Saxena", "Pooja Bose", "Priya Chatterjee", "Nisha Pandey", "Swati Thakur",
  "Aryan Chauhan", "Dhruv Agarwal", "Kabir Garg", "Meera Mishra", "Kavya Dubey"
];

const indianTeacherNames = [
  "Dr. Rajesh Khanna", "Prof. Anita Desai", "Mr. Sunil Gavaskar", "Mrs. Kavita Reddy",
  "Dr. Vikram Sarabhai", "Ms. Neha Sharma", "Mr. Amit Patel", "Mrs. Sunita Williams",
  "Dr. Rakesh Roshan", "Ms. Priya Dutt", "Mr. Anand Kumar", "Mrs. Rekha Bhardwaj",
  "Dr. Sameer Khan", "Ms. Fatima Sheikh", "Mr. Harish Salve"
];

const grades = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const sections = ["A", "B", "C"];

async function main() {
  console.log("Starting seed process for Indian Context...");

  // 1. Get the admin tenant
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@school.edu' },
    include: { tenant: true }
  });

  if (!adminUser) {
    throw new Error("Admin user not found. Please run seed-user.mjs first.");
  }

  const tenantId = adminUser.tenantId;
  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Classes
  console.log("Creating classes from LKG to 12...");
  const createdClasses = [];
  for (const grade of grades) {
    for (const section of sections) {
      const name = `${grade}-${section}`;
      // Check if exists
      const existing = await prisma.classroom.findFirst({
        where: { tenantId, grade, section }
      });
      if (existing) {
        createdClasses.push(existing);
      } else {
        const cls = await prisma.classroom.create({
          data: {
            tenantId,
            name,
            grade,
            section
          }
        });
        createdClasses.push(cls);
      }
    }
  }
  console.log(`Created/Verified ${createdClasses.length} classrooms.`);

  // 3. Create Teachers
  console.log("Creating teachers...");
  for (let i = 0; i < indianTeacherNames.length; i++) {
    const fullName = indianTeacherNames[i];
    const parts = fullName.split(' ');
    let firstName = parts[0];
    let lastName = parts.slice(1).join(' ');
    // Handle Dr. / Mr. / Ms.
    if (['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.'].includes(firstName)) {
      firstName = parts[1];
      lastName = parts.slice(2).join(' ') || parts[1];
    }
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@teacher.edu`;
    const phone = `+91987654${i.toString().padStart(4, '0')}`;

    try {
      await prisma.user.upsert({
        where: { tenantId_email: { tenantId, email } },
        update: {},
        create: {
          tenantId,
          email,
          phone,
          password: passwordHash,
          role: 'TEACHER',
          firstName,
          lastName
        }
      });
    } catch (e) {
      console.log(`Skipped ${email} (Maybe phone duplicate)`);
    }
  }

  // 4. Create Students
  console.log("Creating students...");
  for (let i = 0; i < indianStudentNames.length; i++) {
    const fullName = indianStudentNames[i];
    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.edu`;
    const phone = `+91987655${i.toString().padStart(4, '0')}`;

    // Assign to a random class
    const randomClass = createdClasses[Math.floor(Math.random() * createdClasses.length)];

    try {
      await prisma.user.upsert({
        where: { tenantId_email: { tenantId, email } },
        update: {
          studentClassroomId: randomClass.id
        },
        create: {
          tenantId,
          email,
          phone,
          password: passwordHash,
          role: 'STUDENT',
          firstName,
          lastName,
          studentClassroomId: randomClass.id
        }
      });
    } catch (e) {
      console.log(`Skipped ${email} (Maybe phone duplicate)`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
