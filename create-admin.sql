-- Step 4: Create Super Admin Entry
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the actual UUID from Authentication > Users

INSERT INTO app_users (
  auth_user_id, 
  email, 
  role, 
  full_name, 
  must_change_password
) VALUES (
  'YOUR_AUTH_USER_ID_HERE',  -- Replace this with actual UUID
  'admin@fyp.com',
  'SUPER_ADMIN',
  'Super Admin',
  false
);

-- Verify the admin was created
SELECT 
  id,
  email,
  role,
  full_name,
  created_at
FROM app_users 
WHERE role = 'SUPER_ADMIN';

SELECT 'Super Admin created successfully!' as message;