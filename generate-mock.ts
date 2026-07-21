import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbseSubjects = [
  'English',
  'Hindi',
  'Mathematics',
  'Science',
  'Social Studies',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Physical Education',
  'Art & Craft',
  'Environmental Studies (EVS)',
  'Accountancy',
  'Business Studies',
  'Economics',
  'History',
  'Geography',
  'Political Science',
  'Sanskrit'
];

async function main() {
  console.log('Fetching tenant and classrooms...');
  const classrooms = await prisma.classroom.findMany({
    orderBy: { grade: 'asc' }
  });

  if (classrooms.length === 0) {
    console.log('No classrooms found.');
    return;
  }
  const tenantId = classrooms[0].tenantId;

  console.log('Upserting all CBSE subjects...');
  const existingSubjects = await prisma.subject.findMany({ where: { tenantId } });
  const subjectMap = new Map(existingSubjects.map(s => [s.name, s.id]));

  for (const subName of cbseSubjects) {
    if (!subjectMap.has(subName)) {
      const newSub = await prisma.subject.create({
        data: { name: subName, tenantId }
      });
      subjectMap.set(subName, newSub.id);
    }
  }

  console.log('Clearing old mock data (Grades, Attendances, Exams, etc.)...');
  // Delete EvaluationWorkflow first to satisfy foreign key constraints
  await prisma.evaluationWorkflow.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.examPaper.deleteMany();
  await prisma.exam.deleteMany();

  console.log('Fetching all students...');
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', tenantId },
    include: { studentClassroom: true }
  });
  console.log(`Found ${students.length} students.`);
  
  const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER', tenantId } });
  const firstTeacherId = teacher?.id || 'placeholder_teacher_id';

  console.log('Generating Class-Specific Exams and Grades...');
  for (const classroom of classrooms) {
    // Determine subject subset based on grade
    let classSubjects: string[] = [];
    const gradeNum = parseInt(classroom.grade) || 0;
    
    if (classroom.grade === 'LKG' || classroom.grade === 'UKG' || (gradeNum >= 1 && gradeNum <= 5)) {
      classSubjects = ['English', 'Hindi', 'Mathematics', 'Environmental Studies (EVS)', 'Computer Science', 'Art & Craft'];
    } else if (gradeNum >= 6 && gradeNum <= 10) {
      classSubjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Sanskrit'];
    } else if (gradeNum === 11 || gradeNum === 12) {
      // Default to Science stream for mock
      classSubjects = ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Physical Education'];
    } else {
      classSubjects = ['English', 'Mathematics'];
    }

    // Create Exams for this classroom
    const availableSubjects = Array.from(subjectMap.entries())
      .filter(([name, id]) => classSubjects.includes(name))
      .map(([name, id]) => ({ id, name }));
    
    if (availableSubjects.length === 0) continue;

    for (const type of ['MID_TERM', 'FINAL'] as const) {
      const isPast = type === 'MID_TERM';
      const examName = type === 'MID_TERM' ? 'Mid Term Examination' : 'Final Examination';
      const startDate = isPast ? new Date('2026-10-01') : new Date('2027-03-01');
      const endDate = isPast ? new Date('2026-10-15') : new Date('2027-03-15');

      const classroomTransactions = [];
      const examObj = await prisma.exam.create({
        data: {
          tenantId,
          name: examName,
          startDate,
          endDate,
          classroomId: classroom.id
        }
      });

      const createdPapers = [];

      for (const subject of availableSubjects) {
        const paper = await prisma.examPaper.create({
          data: {
            examId: examObj.id,
            subjectId: subject.id,
            date: startDate,
            maxMarks: 100,
            passingMarks: 33
          }
        });
        createdPapers.push(paper);

        classroomTransactions.push(prisma.evaluationWorkflow.create({
          data: {
            examPaper: { connect: { id: paper.id } },
            status: isPast ? 'PUBLISHED' : 'NOT_STARTED',
            assignedTeacherId: firstTeacherId 
          }
        }));
      }

      const classStudents = students.filter(s => s.studentClassroom?.id === classroom.id);
      const gradesData = [];
      const attendanceData = [];

      for (const student of classStudents) {
        if (isPast) {
          for (const paper of createdPapers) {
            const num = parseInt(student.id.slice(-4), 16) || 0;
            const obtained = (num % 30) + 65; 
            gradesData.push({
              examPaperId: paper.id,
              studentId: student.id,
              marksObtained: obtained,
              teacherRemarks: obtained > 80 ? 'Excellent performance' : 'Keep working hard',
              isVerified: true
            });
          }
        }

        if (isPast) {
          for (let i = 1; i <= 5; i++) {
            attendanceData.push({
              studentId: student.id,
              classroomId: classroom.id,
              date: new Date(`2026-11-0${i}`),
              status: i % 5 === 0 ? 'ABSENT' : 'PRESENT'
            });
          }
        }
      }

      if (gradesData.length > 0) {
        classroomTransactions.push(prisma.grade.createMany({ data: gradesData }));
      }
      if (attendanceData.length > 0) {
        classroomTransactions.push(prisma.attendance.createMany({ data: attendanceData }));
      }

      await prisma.$transaction(classroomTransactions);
    }
  }

  console.log('Successfully generated class-specific mock data!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
