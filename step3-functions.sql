-- Step 3: Create Functions and Policies
-- Run this after step 2

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
  ) IS NOT NULL;
END;
$$ LANGUAGE SQL SECURITY DEFINER;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON app_users;
DROP POLICY IF EXISTS "Admins can view all users" ON app_users;
DROP POLICY IF EXISTS "Public read access to batches" ON batches;
DROP POLICY IF EXISTS "Admins can manage batches" ON batches;

-- Basic RLS Policies
CREATE POLICY "Users can view own profile" ON app_users 
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all users" ON app_users 
  FOR ALL USING (is_admin());

CREATE POLICY "Public read access to batches" ON batches 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage batches" ON batches 
  FOR ALL USING (is_admin());

SELECT 'Functions and policies created successfully!' as message;