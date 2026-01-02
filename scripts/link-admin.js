require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkAdmin() {
    console.log('Logging in as admin...');
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@fyp.com',
        password: 'password12' // User provided password
    });

    if (loginError) {
        console.error('Login Failed:', loginError.message);
        return;
    }

    console.log('Login successful. User ID:', user.id);
    console.log('Linking to app_users table...');

    const { error: insertError } = await supabase
        .from('app_users')
        .insert([
            {
                auth_user_id: user.id,
                email: user.email,
                full_name: 'Super Admin',
                role: 'SUPER_ADMIN'
            }
        ]);

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            console.log('Success! User was already linked.');
        } else {
            console.error('Failed to link user:', insertError.message);
            console.log('Please run the SQL manually in Supabase Dashboard SQL Editor:');
            console.log(`INSERT INTO app_users (auth_user_id, email, full_name, role) VALUES ('${user.id}', 'admin@fyp.com', 'Super Admin', 'SUPER_ADMIN');`);
        }
    } else {
        console.log('Success! Admin user linked to SUPER_ADMIN role.');
    }
}

linkAdmin();
