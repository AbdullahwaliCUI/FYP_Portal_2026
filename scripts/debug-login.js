require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Attempting login for admin@fyp.com...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@fyp.com',
        password: 'password123'
    });

    if (error) {
        console.error('Login Failed!');
        console.error('Error Message:', error.message);
        console.error('Error Status:', error.status);
        if (error.message.includes('Email not confirmed')) {
            console.log('\n--- DIAGNOSIS: Email Not Confirmed ---');
            console.log('You need to go to Supabase Dashboard > Authentication > Users.');
            console.log('Find admin@fyp.com and click "Confirm" or check "Auto Confirm Email" when creating.');
        }
    } else {
        console.log('Login Successful!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('Details Verified. The issue might be in the Next.js app flow or database role.');

        // Check app_users
        const { data: appUser, error: roleError } = await supabase
            .from('app_users')
            .select('*')
            .eq('auth_user_id', data.user.id)
            .single();

        if (roleError || !appUser) {
            console.error('\n--- CRITICAL: User missing from public.app_users table ---');
            console.error('The Auth user exists, but the profile in "app_users" table is missing.');
            console.log('Please run the SQL INSERT command provided earlier.');
        } else {
            console.log('Role found in app_users:', appUser.role);
        }
    }
}

testLogin();
