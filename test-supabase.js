// Simple test to check Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fbhygmokjxircdzlykuj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaHlnbW9ranhpcmNkemx5a3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDY0NzQsImV4cCI6MjA4MjkyMjQ3NH0.AhO6Bf5ljXN_o0_sQk9gyCxY1EBsWLl5FpOI6Ur4BWg';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // Test basic connection
        const { data, error } = await supabase.from('app_users').select('count').limit(1);
        
        if (error) {
            console.error('❌ Connection failed:', error.message);
            console.error('Error details:', error);
        } else {
            console.log('✅ Connection successful!');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('❌ Exception:', err.message);
    }
}

testConnection();