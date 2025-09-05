// Script to set up Supabase table for emails
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupSupabaseTable() {
    try {
        console.log('🔧 Setting up Supabase table for emails...');
        
        // Check if table exists
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'emails');
        
        if (tablesError) {
            console.error('Error checking tables:', tablesError);
            return;
        }
        
        if (tables && tables.length > 0) {
            console.log('✅ Emails table already exists');
        } else {
            console.log('📝 Creating emails table...');
            
            // Create the emails table
            const { error: createError } = await supabase.rpc('exec_sql', {
                sql: `
                    CREATE TABLE IF NOT EXISTS emails (
                        id TEXT PRIMARY KEY,
                        thread_id TEXT,
                        from_email TEXT,
                        to_email TEXT,
                        subject TEXT,
                        body TEXT,
                        snippet TEXT,
                        date TIMESTAMPTZ,
                        embedding VECTOR(1536),
                        stored_at TIMESTAMPTZ DEFAULT NOW()
                    );
                `
            });
            
            if (createError) {
                console.error('Error creating table:', createError);
                return;
            }
            
            console.log('✅ Emails table created');
        }
        
        // Create the vector search function
        console.log('🔍 Setting up vector search function...');
        
        const { error: functionError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE OR REPLACE FUNCTION match_emails (
                    query_embedding VECTOR(1536),
                    match_threshold FLOAT,
                    match_count INT
                )
                RETURNS TABLE (
                    id TEXT,
                    thread_id TEXT,
                    from_email TEXT,
                    to_email TEXT,
                    subject TEXT,
                    body TEXT,
                    snippet TEXT,
                    date TIMESTAMPTZ,
                    similarity FLOAT
                )
                LANGUAGE plpgsql
                AS $$
                BEGIN
                    RETURN QUERY
                    SELECT
                        emails.id,
                        emails.thread_id,
                        emails.from_email,
                        emails.to_email,
                        emails.subject,
                        emails.body,
                        emails.snippet,
                        emails.date,
                        1 - (emails.embedding <=> query_embedding) AS similarity
                    FROM emails
                    WHERE emails.embedding IS NOT NULL
                    AND 1 - (emails.embedding <=> query_embedding) > match_threshold
                    ORDER BY (emails.embedding <=> query_embedding) ASC
                    LIMIT match_count;
                END;
                $$
            `
        });
        
        if (functionError) {
            console.error('Error creating function:', functionError);
            return;
        }
        
        console.log('✅ Vector search function created');
        
        // Test the connection
        const { data: testData, error: testError } = await supabase
            .from('emails')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.error('Error testing connection:', testError);
            return;
        }
        
        console.log('✅ Supabase connection successful');
        console.log('🎉 Setup complete! Your emails will now be stored persistently in Supabase.');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

setupSupabaseTable();
