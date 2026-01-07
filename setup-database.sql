-- FYP Portal Database Setup
-- Run this in Supabase SQL Editor

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

-- 13. SUB ADMIN SCOPES
CREATE TABLE sub_admin_scopes (
  id BIGSERIAL PRIMARY KEY,
  sub_admin_id UUID REFERENCES app_users(id),
  batch_id BIGINT REFERENCES batches(id),
  UNIQUE(sub_admin_id, batch_id)
);

-- Enable RLS on all tables
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
ALTER TABLE sub_admin_scopes ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_app_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role::TEXT FROM app_users WHERE auth_user_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 1 FROM public.app_users 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('SUPER_ADMIN')
  );
END;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Basic RLS Policies
CREATE POLICY "Users can view own profile" ON app_users 
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all users" ON app_users 
  FOR ALL USING (is_admin());

CREATE POLICY "Public read access to batches" ON batches 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage batches" ON batches 
  FOR ALL USING (is_admin());

-- Add more policies as needed...