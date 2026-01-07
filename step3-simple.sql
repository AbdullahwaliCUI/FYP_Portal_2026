-- Step 3: Simple Functions and Policies
-- Run this after step 2

-- Simple helper function
CREATE OR REPLACE FUNCTION get_app_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role_result TEXT;
BEGIN
  SELECT role::TEXT INTO user_role_result 
  FROM app_users 
  WHERE auth_user_id = user_id;
  
  RETURN user_role_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_result BOOLEAN DEFAULT FALSE;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.app_users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'SUPER_ADMIN'
  ) INTO is_admin_result;
  
  RETURN is_admin_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can view own profile" ON app_users 
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Public read access to batches" ON batches 
  FOR SELECT USING (true);

SELECT 'Basic setup completed successfully!' as message;