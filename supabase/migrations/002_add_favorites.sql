-- Add user favorites table for project bookmarking
CREATE TABLE user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_project_id ON user_favorites(project_id);

-- Add RLS policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own favorites
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- Add updated_at column to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;