# Demo Credentials

Here are the test accounts to log into the EdTech Platform. You can use these credentials after running `node seed-user.mjs` to populate the database.

| Role | Email ID | Password |
|---|---|---|
| **Admin** | `admin@school.edu` | `admin123` |
| **Teacher** | `teacher@school.edu` | `teacher123` |
| **Student** | `student@school.edu` | `student123` |
| **Parent** | `parent@school.edu` | `parent123` |
| **Coordinator** | `coordinator@school.edu` | `coordinator123` |

### Note
Make sure the database is synced and seeded first. If you are setting this up on a new machine:
1. Allow your IP address in MongoDB Atlas.
2. Run `npx prisma db push` to sync the schema.
3. Run `node seed-user.mjs` to create the above accounts.
4. Run `npm run dev` and go to `http://localhost:3000/login`.
