const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getAdminId() {
    const email = 'admin@fyp.com';
    const password = 'adminPassword123';

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Error signing in:', error.message);
        return;
    }

    if (data.user) {
        console.log(`FULL_UUID:${data.user.id}`);
    } else {
        console.log('No user found');
    }
}

getAdminId();
