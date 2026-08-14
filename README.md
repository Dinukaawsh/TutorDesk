# TutorDesk

TutorDesk is a full-featured learning management system for independent tutors and their students. One teacher deployment serves a single tutoring practice; students sign in to access enrolled subjects, lessons, assignments, fees, announcements, and inquiries.

## Tech stack

- **Next.js** (App Router) with React Server Components and Server Actions
- **NextAuth** (Auth.js) for email/password authentication and role-based sessions
- **Prisma** ORM with **PostgreSQL** (Neon or any hosted Postgres)
- **Cloudinary** for PDFs, images, avatars, submissions, fee proofs, and inquiry attachments
- **Radix UI** primitives with **Tailwind CSS** (shadcn-style components under `components/ui/`)
- **Zod** for form and action validation
- **react-icons** / **lucide-react** for icons

## License keys (one deployment per client)

TutorDesk is licensed for **one production deployment per tutoring business**, with a **unique key per client**.

1. Set `LICENSE_SIGNING_SECRET` when generating keys (see `scripts/generate-license.ts`).
2. The app verifies `TUTORDESK_LICENSE_KEY` at runtime via `lib/license.ts` (must match the signing secret baked into the build for verification).
3. Invalid, missing, or expired keys redirect users to `/license-error`.

Generate a key for a client:

```bash
npx tsx scripts/generate-license.ts "Client Name" 2027-12-31
```

Add the output to the deployment environment as `TUTORDESK_LICENSE_KEY`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Required variables (see `.env.example`):

   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — long random string for session encryption
   - `TUTORDESK_LICENSE_KEY` — client license (see above)
   - Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

3. Push the database schema:

   ```bash
   npx prisma db push
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000/setup](http://localhost:3000/setup) on first visit to create the **teacher** account, then sign in at `/login`.

## Authentication

- **Teacher setup** — one-time `/setup` creates the primary teacher (guarded so it cannot be repeated).
- **Login** — `/login` for teachers and students; disabled students are blocked with a reason.
- **Forced password change** — students created or reset by the teacher may be required to change password at `/student/change-password`.
- **Middleware** — protects `/teacher/*` and `/student/*` routes by role; validates license.

## Features

### Students (teacher)

- Create and edit student profiles (grade, school, stream, phone, WhatsApp, avatar).
- Enroll students in subjects; fee records are created for the current month on enrollment.
- Filter by search, grade, subject, account status, and fee status.
- Disable/enable accounts (with reason and notifications); bulk enable/disable via bottom action bar.
- Reset passwords; view modal with contact info and WhatsApp link.

### Subjects

- CRUD subjects with color, description, and optional monthly fee/currency.
- Enrollments link students to subjects for lessons, assignments, fees, and targeted announcements.

### Lessons

- PDF (upload) or video (YouTube/Vimeo/URL) lessons per subject and grade.
- Publish/unpublish; students see only published lessons for enrolled subjects and matching grade.
- Notifications on publish.

### Assignments

- Grade-wide or individual assignments with deadlines and optional teacher attachment.
- Students submit files; late flagging; teacher grading (marks, feedback, pass/fail workflow).
- Notifications for publish, submit, and grade events.

### Fees

- Monthly fee records per student/subject; statuses: Unpaid, Pending (proof submitted), Paid.
- Students upload proof; teachers approve, reject, mark paid manually, or bulk approve/reject (bottom bar).
- Dashboard and student list show aggregated payment status for the current month.

### Notifications

- In-app notification bell and full list pages for teacher and student.
- Types include assignments, lessons, fees, account status, deadline reminders, announcements, and inquiries.
- Mark read individually or all at once; optional deep links.

### Announcements

- Teachers publish announcements to **everyone**, a **subject**, a **grade**, or **subject + grade**.
- Targeted students receive `ANNOUNCEMENT_PUBLISHED` notifications.
- Students see only announcements that match their enrollments and grade.

### Inquiries

- Students submit inquiries (title, body, optional attachments) while status is **OPEN**.
- Students may edit OPEN inquiries; each edit stores history in `InquiryEdit`.
- Teachers view inquiries, compare original vs current content and edit history, set status (Open / Reviewed / Closed), and add notes.
- Notifications: `INQUIRY_SUBMITTED`, `INQUIRY_UPDATED`, `INQUIRY_STATUS_CHANGED`.

### Dashboards

- **Teacher** — filters by subject, grade, month/year; stats; student overview table with quick view/edit/disable; recent homework and fee activity.
- **Student** — enrolled subjects, pending assignments, deadlines, recent submissions.

### UI patterns

- **Modals** — `FormModal`, `ViewModal`, and `ConfirmModal` for create/edit/view/confirm flows across the app.
- **Bottom action bar** — fixed bottom popup (`components/ui/bottom-action-bar.tsx`) for bulk student and fee actions when rows are selected.
- **WhatsApp** — login page teacher contact; student view modals show phone and WhatsApp via `getWhatsAppLink` in `lib/utils.ts`.

## Cloudinary

Uploads go through `lib/cloudinary.ts` and helpers in `lib/uploads.ts` (lessons, assignments, submissions, fees, inquiries, avatars). Configure Cloudinary credentials in the environment; without them, uploads will fail at runtime.

## Deploy

1. Push the repo to GitHub and import into [Vercel](https://vercel.com) (or similar Node host).
2. Set all environment variables for production (database, auth, license, Cloudinary).
3. Run `npx prisma db push` against the production database once (or add to CI).
4. Deploy and complete `/setup` on the production URL before sharing the site.
5. Issue a unique `TUTORDESK_LICENSE_KEY` per client deployment.

## Scripts

| Command | Description |
| -------- | ------------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npx prisma db push` | Sync schema to database |
| `npx prisma studio` | Browse data |
| `npx tsx scripts/generate-license.ts` | Generate client license key |

## Project layout (high level)

- `app/` — routes for auth, teacher, student, license error
- `actions/` — Server Actions for domain logic
- `components/` — UI by feature (students, fees, lessons, modals, etc.)
- `schemas/` — Zod schemas
- `lib/` — auth, prisma, notifications, uploads, license, fees
- `content/navigation.ts` — nav labels and sidebar items
- `prisma/schema.prisma` — data model
