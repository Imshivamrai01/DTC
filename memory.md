# EdTech SaaS Platform - Project Memory & PRD

## 🎯 Overall Goal
To build a comprehensive, multi-role EdTech SaaS platform that streamlines school administration, academic tracking, and communication between the school and parents/students. The system should be robust, feature-rich, and provide an excellent, modern user experience (Dark/Light mode, responsive).

---

## 👥 User Roles
The platform supports 6 distinct roles:
1. **Admin**: Full system access, oversees all operations, creates notices, manages overall data.
2. **Coordinator**: Manages academic operations, timetables, exams, and teacher/student assignments.
3. **Junior Coordinator**: Assists the coordinator with specific delegated tasks.
4. **Teacher**: Manages their assigned classes, takes attendance, grades exams, and tracks student progress.
5. **Student**: Views their own timetable, attendance, exam results (with class ranks), and school notices.
6. **Parent**: Monitors their child's (or children's) attendance, academic performance, schedule, and receives school updates.

---

## 🚀 Implemented Features

### 1. Dashboard & Layout
- Role-based dynamic sidebar navigation.
- Modern UI with dark/light mode toggle.
- Aggregated stats and quick-access widgets for each role.

### 2. User & Directory Management
- CRUD operations for Students, Teachers, and Coordinators.
- Extended profiles for students (Parents' details, previous school, etc.).
- Linking mechanism to tie Parent accounts to Student accounts.

### 3. Academics & Classes
- **Classroom Management**: Creating classes (e.g., Class 10-A).
- **Subject Management (CBSE)**: Support for varied subjects based on class level (e.g., Primary, Middle, Science, Commerce, Arts).
- **Teacher Assignments**: Mapping teachers to specific subjects and classrooms.
- **Timetable**: Scheduling classes for different days and times.

### 4. Exams & Grading (Evaluation Workflow)
- Creating class-specific exams (Mid Terms, Finals) with precise subject mapping.
- **Grading System**: Teachers can input marks for their assigned subjects.
- **Evaluation Workflow**: Tracking the status of exam paper checking (`PENDING`, `EVALUATED`, `PUBLISHED`).
- **Results View**: Students and parents can view detailed report cards with total marks, percentage, and grades (A, B, C, etc.).

### 5. Communication
- **Notices & Announcements**: Admin and Coordinators can publish notices with file attachments.
- Dedicated `Notices` sections built for Students and Parents to easily view updates and download attachments.

### 6. Mock Data Generation
- Robust script (`generate-mock.ts`) to populate the database with realistic, structured data (CBSE subjects, realistic users, logical grade distributions, and attendance logs) to test the platform.

---

## ⏳ Pending / Upcoming Features (To-Do)

### 1. Complaints & Helpdesk Module
- **Goal**: Allow students and parents to raise tickets/complaints (e.g., bus issue, bullying, infrastructure).
- **Tasks**: Build UI for ticket creation, a resolution dashboard for Admin/Coordinator, and status tracking (`OPEN`, `IN_PROGRESS`, `RESOLVED`).

### 2. Advanced Result Analytics & Class Rank
- **Goal**: Show competitive standing.
- **Tasks**: Calculate and display **Class Rank** dynamically on the Student/Parent results dashboard based on total marks obtained in the exam.

### 3. Report Card PDF Generation
- **Goal**: Offline access to results.
- **Tasks**: Add a "Download Report Card" button that generates a beautifully formatted PDF of the student's exam results.

### 4. Junior Coordinator Flow
- **Goal**: Granular access control.
- **Tasks**: Define specific access limits and customize the dashboard specifically for Junior Coordinators so they don't have full admin-level destructive rights.

### 5. Fees & Payments (Optional/Future Scope)
- **Goal**: Financial management.
- **Tasks**: Track fee payments, generate invoices, and integrate a payment gateway for parents.
