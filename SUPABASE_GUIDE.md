# Supabase Setup Guide (Step-by-Step)

Since you are new to Supabase, follow these exact steps to get your database running.

## Part 1: Create Project & Get Keys

1.  **Go to Supabase**: Open [supabase.com](https://supabase.com) and click **"Start your project"**.
2.  **Sign In**: Log in with GitHub or your email.
3.  **New Project**:
    *   Click **"New project"**.
    *   Choose your **Organization** (if asked).
    *   **Name**: `FYP_Portal_2026`
    *   **Database Password**: **IMPORTANT** - Type a strong password and **SAVE IT** in a notepad. You might need it later.
    *   **Region**: Choose a region close to you (e.g., Singapore, Mumbai, or London).
    *   Click **"Create new project"**.
4.  **Wait**: It will take about 1-2 minutes for the database to set up.
5.  **Get API Keys**:
    *   Once the project is "Active" (green dot), scroll down on the dashboard or go to **Settings (Gear Icon) > API**.
    *   Find **Project URL**: Copy this (e.g., `https://xyz.supabase.co`).
    *   Find **anon / public** Key: Copy this long string.

## Part 2: Connect Your Code

1.  Open your project in VS Code.
2.  Find the file `.env.local` (create it if it doesn't exist).
3.  Paste your keys like this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-long-anon-key-here
```

## Part 3: Run Database Migration (Create Tables)

We need to tell Supabase to create the tables (`users`, `projects`, `batches`, etc.).

1.  **In VS Code**: Open the file `supabase/migrations/001_init.sql`.
2.  **Copy All**: Select all the text (Ctrl+A) and Copy (Ctrl+C).
3.  **In Supabase Dashboard**:
    *   Look at the left sidebar. Click on the **SQL Editor** icon (looks like a terminal `>_`).
    *   Click **"New Query"**.
    *   **Paste** the code you copied.
    *   Click **"Run"** (bottom right button).
    *   **Success**: It should say "Success" or "No rows returned".

## Part 4: Review Tables (Optional)

1.  Click the **Table Editor** icon (looks like a spreadsheet table) on the left sidebar.
2.  You should now see tables like:
    *   `app_users`
    *   `batches`
    *   `projects`
    *   `groups`
    *   `supervisors`, etc.

## Part 5: Create the First Admin User

Since the app is empty, you can't log in yet. You need to create the first Super Admin manually.

**Method A: Using the Helper Script (Recommended)**
1.  Open your VS Code terminal.
2.  Run this command:
    ```bash
    node scripts/create-admin.js
    ```
3.  Follow the prompts. It will ask for the URL and Service Role Key (found in **Settings > API**, right under the anon key).

**Method B: Manual (If script fails)**
1.  **Go to Supabase > Authentication**:
    *   Click **Users** -> **Add User**.
    *   Email: `admin@fyp.com`
    *   Password: `password123` (or whatever you want).
    *   Click "Create User".
    *   **Copy the User UUID**: It looks like `123e4567-e89b...`.
2.  **Go to Table Editor > `app_users` table**:
    *   Click **"Insert Row"**.
    *   **auth\_user\_id**: Paste the UUID you copied.
    *   **email**: `admin@fyp.com`
    *   **full\_name**: `Super Admin`
    *   **role**: `SUPER_ADMIN`
    *   Click **"Save"**.

## Part 6: Log In

1.  Run your app: `npm run dev`.
2.  Go to `http://localhost:3000/login`.
3.  Log in with the email/password you just created.
4.  You should be redirected to the Admin Dashboard!
