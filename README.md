# FYP Portal 2026

A comprehensive Final Year Project (FYP) management system for universities, built with **Next.js 14**, **Supabase**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Role-Based Access Control**:
  - **Super Admin / Sub Admin**: Manage batches, faculty assignments, publish results, and view audit logs.
  - **Supervisor**: Manage assigned groups, mark evaluations (Scope, SRS, SDD, etc.).
  - **Evaluator**: Independent marking for assigned groups.
  - **External**: Final year external evaluation interface.
  - **Student**: Dashboard to create groups, submit project proposals, and upload deliverables (Google Drive links).

- **Multi-Semester Management**:
  - Automatically handles 6th, 7th, and 8th semester flows.
  - Distinct deliverables and marking criteria for each semester.
  - "Promote Semester" workflow to move batches forward.

- **Automated Logging**:
  - Audit logs for critical administrative actions.

- **Reports**:
  - Export project lists, marks, and allocations to CSV (Excel).
  - Printer-friendly views for Result Sheets.

## Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Tailwind CSS + Shadcn Elements
- **Icons**: Lucide React

## Setup Instructions

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Initialization

Run the initialization SQL script located at `supabase/migrations/001_init.sql` in your Supabase SQL Editor. This will:
- Create all necessary tables (`batches`, `projects`, `groups`, `marks`, `app_users`, etc.).
- Set up RLS policies.
- Create initial triggers and functions.

### 3. Create First Admin

You need to manually insert the first Super Admin user into Supabase.
1. Sign up a user via the Supabase Auth UI or use the `create-admin.js` script helper logic.
2. Insert a corresponding row into `public.app_users` with role `SUPER_ADMIN`.

```sql
-- Example SQL to promote a user to Super Admin
INSERT INTO public.app_users (auth_user_id, email, full_name, role)
VALUES ('replace-with-uuid', 'admin@example.com', 'Super Admin', 'SUPER_ADMIN');
```

### 4. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Project Structure

- `app/(auth)`: Login, Password Change.
- `app/(admin)`: Admin Dashboard (Batches, Assignments, Reports, Audit).
- `app/(student)`: Student content.
- `app/(supervisor)`: Supervisor interfaces.
- `app/(evaluator)`: Evaluator interfaces.
- `app/(external)`: External examiner interfaces.
- `lib/`: Utilities, Supabase Clients, Audit Loggers.
- `components/`: Reusable UI components.

## License

Proprietary / University Use.
