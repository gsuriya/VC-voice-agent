// Test Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('emails')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        
        // Test if emails table exists
        const { data: tableData, error: tableError } = await supabase
            .from('emails')
            .select('*')
            .limit(1);
        
        if (tableError) {
            console.error('❌ Emails table error:', tableError.message);
            return false;
        }
        
        console.log('✅ Emails table accessible');
        console.log('📊 Current email count:', tableData?.length || 0);
        
        return true;
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
}

testConnection();
