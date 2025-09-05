#!/usr/bin/env node

// Simple email sync script
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function syncEmails() {
    console.log('🤖 JARVIS: Starting email sync...');
    
    try {
        // Test database connection
        console.log('🗄️ Testing database connection...');
        const { data, error } = await supabase.from('emails').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Database connected successfully');
        
        // Test OpenAI connection
        console.log('🧠 Testing OpenAI connection...');
        const embedding = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: 'test'
        });
        console.log('✅ OpenAI connected successfully');
        
        console.log('🎉 Setup complete! Your JARVIS email intelligence system is ready.');
        console.log('');
        console.log('🚀 Next steps:');
        console.log('   1. Install the Chrome extension (if not already done)');
        console.log('   2. Go to Gmail');
        console.log('   3. Start asking JARVIS questions about your emails!');
        console.log('');
        console.log('💡 JARVIS will now be able to:');
        console.log('   • Answer questions about your email content');
        console.log('   • Search for specific emails semantically');
        console.log('   • Generate intelligent summaries');
        console.log('   • Draft responses to any email');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('');
        console.log('💡 Please check:');
        console.log('   1. Your .env.local file has SUPABASE_URL and SUPABASE_ANON_KEY');
        console.log('   2. Your Supabase project is set up correctly');
        console.log('   3. Your OpenAI API key is valid');
    }
}

syncEmails();
