const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Note: Usually need SERVICE_ROLE_KEY for admin actions without login, but we'll try with signup
);

// NOTE: Ideally use SERVICE_ROLE_KEY to bypass email confirmation or RLS if needed.
// Since we are just providing a script, we assume the user might have it or we use standard signup.

async function createAdmin() {
    const email = 'admin@fyp.com';
    const password = 'adminPassword123';

    console.log(`Creating Admin User: ${email}`);

    // 1. Create Identity
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Error creating auth user:', error.message);
        return;
    }

    const userId = data.user?.id;
    if (!userId) {
        console.error('No user ID returned. Email confirmation might be required.');
        return;
    }

    console.log(`Auth user created: ${userId}`);

    // 2. Create App User Profile
    // We need to bypass RLS or be logged in as that user. 
    // Since we just signed up, we might have a session if auto-confirm is on.
    // Alternatively, instructions in README are safer.

    console.log(`
  Please manually execute this SQL in your Supabase Dashboard to finalize the admin:
  
  INSERT INTO app_users (auth_user_id, role, email, full_name, must_change_password)
  VALUES ('${userId}', 'SUPER_ADMIN', '${email}', 'System Admin', false);
  `);
}

createAdmin();
