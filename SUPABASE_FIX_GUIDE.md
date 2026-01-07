# 🔧 Supabase API Key Fix Guide

## 🚨 **Problem**: Invalid API Key Error

Your current Supabase API key is invalid or expired. Here's how to fix it:

## 📋 **Solution Steps**

### **Option 1: Get New API Keys from Existing Project**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `fbhygmokjxircdzlykuj`
3. **Go to Settings > API**
4. **Copy the new keys**:
   - **Project URL**: `https://fbhygmokjxircdzlykuj.supabase.co`
   - **anon/public key**: Copy the new key
   - **service_role key**: Copy this too (for admin operations)

### **Option 2: Create New Supabase Project**

If the project doesn't exist or is corrupted:

1. **Go to**: https://supabase.com/dashboard
2. **Click**: "New Project"
3. **Fill Details**:
   - **Name**: `FYP Portal 2026`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
4. **Click**: "Create new project"
5. **Wait** for project to be ready (2-3 minutes)

### **Step 2: Update Environment Variables**

#### **Local Environment (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
```

#### **Vercel Environment Variables**
```bash
# Update Vercel environment variables
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL
npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY

# Add new ones
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Step 3: Setup Database Schema**

1. **Go to**: Supabase Dashboard > SQL Editor
2. **Run the migration**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'SUB_ADMIN', 'SUPERVISOR', 'EVALUATOR', 'STUDENT', 'EXTERNAL');

-- 2. APP USERS
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'STUDENT',
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  roll_no TEXT UNIQUE,
  dept TEXT,
  must_change_password BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BATCHES
CREATE TABLE batches (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  program TEXT,
  section TEXT,
  intake_term TEXT,
  current_semester INT CHECK (current_semester IN (6, 7, 8)),
  config_json JSONB DEFAULT '{}'::JSONB,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. GROUPS
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT REFERENCES batches(id) ON DELETE CASCADE,
  name TEXT,
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GROUP MEMBERS
CREATE TABLE group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES app_users(id),
  UNIQUE(group_id, student_id)
);

-- 6. SUPERVISORS
CREATE TABLE supervisors (
  id BIGSERIAL PRIMARY KEY,
  app_user_id UUID REFERENCES app_users(id) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. EVALUATORS
CREATE TABLE evaluators (
  id BIGSERIAL PRIMARY KEY,
  app_user_id UUID REFERENCES app_users(id) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PROJECTS
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  supervisor_id BIGINT REFERENCES supervisors(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. DOC LINKS
CREATE TABLE doc_links (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  semester INT CHECK (semester IN (6, 7, 8)),
  component TEXT CHECK (component IN ('scope','srs','sdd','progress60','progress100')),
  url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  submitted_by UUID REFERENCES app_users(id)
);

-- 10. MARKS
CREATE TABLE marks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  semester INT CHECK (semester IN (6, 7, 8)),
  component TEXT CHECK (component IN ('scope','srs','sdd','progress60','progress100','external')),
  by_role TEXT CHECK (by_role IN ('supervisor','evaluator','external')),
  marker_id UUID REFERENCES app_users(id),
  max_score INT NOT NULL,
  score INT,
  feedback TEXT,
  marked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, semester, component, by_role)
);

-- 11. SETTINGS
CREATE TABLE settings (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT REFERENCES batches(id) UNIQUE,
  visibility_flags JSONB DEFAULT '{"scope6": false, "srs7": false, "sdd7": false, "progress60_8": false, "progress100_8": false, "external8": false}'::JSONB,
  weight_config JSONB DEFAULT '{}'::JSONB,
  windows JSONB DEFAULT '{}'::JSONB,
  supervisor_capacity INT DEFAULT 4
);

-- 12. USER FAVORITES
CREATE TABLE user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluators ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (you can customize these)
CREATE POLICY "Users can view own profile" ON app_users FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY "Public read access to batches" ON batches FOR SELECT USING (true);
```

### **Step 4: Create Super Admin**

1. **Go to**: Authentication > Users
2. **Add User**:
   - **Email**: `admin@fyp.com`
   - **Password**: `admin123`
   - **Auto Confirm**: ✅
3. **Copy User ID**
4. **Go to**: Table Editor > app_users
5. **Insert Row**:
   - **auth_user_id**: (paste UUID)
   - **email**: `admin@fyp.com`
   - **role**: `SUPER_ADMIN`
   - **full_name**: `Super Admin`

### **Step 5: Deploy Updated Code**

```bash
# Update local environment
# Edit .env.local with new keys

# Test locally
npm run dev

# Deploy to Vercel
npx vercel --prod
```

## 🎯 **Quick Fix Commands**

```bash
# 1. Update environment variables
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://YOUR_NEW_PROJECT_ID.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Enter: your_new_anon_key

# 2. Redeploy
npx vercel --prod
```

## ✅ **Verification**

After setup, test:
1. Visit: https://fyp-portal-2026.vercel.app/login
2. Login with: `admin@fyp.com` / `admin123`
3. Should redirect to admin dashboard

## 📞 **Need Help?**

If you need the exact steps or get stuck, let me know and I'll help you through each step!