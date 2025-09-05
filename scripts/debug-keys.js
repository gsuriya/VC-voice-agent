#!/usr/bin/env node

// Debug script to test each API key individually
require('dotenv').config({ path: '.env.local' });

console.log('🔍 JARVIS: Debugging API Keys...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');

console.log('\n🔑 Key Values (first 20 chars):');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL?.substring(0, 20) + '...');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY?.substring(0, 20) + '...');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

// Test Supabase connection
console.log('\n🗄️ Testing Supabase connection...');
try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client created successfully');
    
    // Test a simple query
    supabase.from('emails').select('count').limit(1).then(({ data, error }) => {
        if (error) {
            console.log('❌ Supabase query failed:', error.message);
        } else {
            console.log('✅ Supabase query successful');
        }
    });
    
} catch (error) {
    console.log('❌ Supabase client creation failed:', error.message);
}

// Test OpenAI connection
console.log('\n🧠 Testing OpenAI connection...');
try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('✅ OpenAI client created successfully');
    
    // Test a simple embedding
    openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: 'test'
    }).then(response => {
        console.log('✅ OpenAI embedding test successful');
    }).catch(error => {
        console.log('❌ OpenAI test failed:', error.message);
    });
    
} catch (error) {
    console.log('❌ OpenAI client creation failed:', error.message);
}

console.log('\n🎯 Debug complete!');
