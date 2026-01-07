-- Step 2: Create Tables
-- Run this after step 1

-- APP USERS table
CREATE TABLE IF NOT EXISTS app_users (
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

-- BATCHES table
CREATE TABLE IF NOT EXISTS batches (
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

-- GROUPS table
CREATE TABLE IF NOT EXISTS groups (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT REFERENCES batches(id) ON DELETE CASCADE,
  name TEXT,
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GROUP MEMBERS table
CREATE TABLE IF NOT EXISTS group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES app_users(id),
  UNIQUE(group_id, student_id)
);

-- SUPERVISORS table
CREATE TABLE IF NOT EXISTS supervisors (
  id BIGSERIAL PRIMARY KEY,
  app_user_id UUID REFERENCES app_users(id) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- EVALUATORS table
CREATE TABLE IF NOT EXISTS evaluators (
  id BIGSERIAL PRIMARY KEY,
  app_user_id UUID REFERENCES app_users(id) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PROJECTS table
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  supervisor_id BIGINT REFERENCES supervisors(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DOC LINKS table
CREATE TABLE IF NOT EXISTS doc_links (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  semester INT CHECK (semester IN (6, 7, 8)),
  component TEXT CHECK (component IN ('scope','srs','sdd','progress60','progress100')),
  url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  submitted_by UUID REFERENCES app_users(id)
);

-- MARKS table
CREATE TABLE IF NOT EXISTS marks (
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

-- SETTINGS table
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT REFERENCES batches(id) UNIQUE,
  visibility_flags JSONB DEFAULT '{"scope6": false, "srs7": false, "sdd7": false, "progress60_8": false, "progress100_8": false, "external8": false}'::JSONB,
  weight_config JSONB DEFAULT '{}'::JSONB,
  windows JSONB DEFAULT '{}'::JSONB,
  supervisor_capacity INT DEFAULT 4
);

-- USER FAVORITES table
CREATE TABLE IF NOT EXISTS user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- SUB ADMIN SCOPES table
CREATE TABLE IF NOT EXISTS sub_admin_scopes (
  id BIGSERIAL PRIMARY KEY,
  sub_admin_id UUID REFERENCES app_users(id),
  batch_id BIGINT REFERENCES batches(id),
  UNIQUE(sub_admin_id, batch_id)
);

SELECT 'All tables created successfully!' as message;