# TutorDesk

TutorDesk is a lightweight learning management system for independent tutors and their students. Teachers manage subjects, lessons, assignments, fees, and notifications from a single dashboard; students access enrolled content, submit work, and track fees.

Built with **Next.js**, **NextAuth**, **Prisma**, and **PostgreSQL** (recommended: [Neon](https://neon.tech)).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Set `DATABASE_URL` to your Neon (or other PostgreSQL) connection string. Set `AUTH_SECRET` to a long random string (for example `openssl rand -base64 32`).

3. Push the schema to the database:

   ```bash
   npx prisma db push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000/setup](http://localhost:3000/setup) on first visit to create the teacher account. After setup, sign in at `/login`.

## Features

- **Teacher setup** — One-time `/setup` flow to create the primary teacher account
- **Authentication** — Email/password login with role-based access (teacher vs student)
- **Students** — Create and manage student accounts, grades, and enrollment
- **Subjects & enrollments** — Organize courses and assign students to subjects
- **Lessons** — Publish PDF and video lessons to enrolled students
- **Assignments** — Grade-wide or individual assignments with submission and review workflow
- **Fees** — Fee records with student submission and teacher review
- **Notifications** — In-app alerts for assignments, lessons, fees, and account status
- **WhatsApp contact** — Login page link to message the teacher on WhatsApp

## Deploy on Vercel

1. Push the repository to GitHub and import the project in [Vercel](https://vercel.com).
2. Add environment variables in the Vercel project settings: `DATABASE_URL`, `AUTH_SECRET` (same as local).
3. Use a hosted PostgreSQL database (Neon works well with serverless). Run `npx prisma db push` against production once, or use a build/deploy step that applies migrations.
4. Deploy. Visit `/setup` on the production URL before anyone else to create the teacher account.
5. For file uploads in production, configure persistent storage or set `UPLOAD_DIR` / `NEXT_PUBLIC_UPLOAD_BASE` if you extend the default local `public/uploads` behavior.

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Development server       |
| `npm run build`   | Production build         |
| `npm run start`   | Run production build     |
| `npm run lint`    | ESLint                   |
