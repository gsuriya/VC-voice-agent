-- JARVIS Email Database Schema
-- This creates the tables needed for email storage and semantic search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    snippet TEXT,
    embedding VECTOR(1536), -- OpenAI ada-002 embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emails_from ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_subject ON emails(subject);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_metadata ON emails USING GIN(metadata);

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION match_emails(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id TEXT,
    thread_id TEXT,
    from_email TEXT,
    to_email TEXT,
    subject TEXT,
    body TEXT,
    date TIMESTAMP WITH TIME ZONE,
    snippet TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE SQL
AS $$
    SELECT
        emails.id,
        emails.thread_id,
        emails.from_email,
        emails.to_email,
        emails.subject,
        emails.body,
        emails.date,
        emails.snippet,
        emails.metadata,
        1 - (emails.embedding <=> query_embedding) AS similarity
    FROM emails
    WHERE 1 - (emails.embedding <=> query_embedding) > match_threshold
    ORDER BY emails.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get email insights
CREATE OR REPLACE FUNCTION get_email_insights()
RETURNS TABLE (
    total_emails BIGINT,
    edu_emails BIGINT,
    recent_emails BIGINT,
    top_senders JSONB,
    categories JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM emails) as total_emails,
        (SELECT COUNT(*) FROM emails WHERE metadata->>'isEdu' = 'true') as edu_emails,
        (SELECT COUNT(*) FROM emails WHERE date > NOW() - INTERVAL '7 days') as recent_emails,
        (SELECT jsonb_object_agg(sender, count) FROM (
            SELECT 
                split_part(from_email, '@', 2) as sender,
                COUNT(*) as count
            FROM emails
            GROUP BY split_part(from_email, '@', 2)
            ORDER BY count DESC
            LIMIT 10
        ) t) as top_senders,
        (SELECT jsonb_object_agg(category, count) FROM (
            SELECT 
                metadata->>'category' as category,
                COUNT(*) as count
            FROM emails
            WHERE metadata->>'category' IS NOT NULL
            GROUP BY metadata->>'category'
            ORDER BY count DESC
            LIMIT 10
        ) t) as categories;
END;
$$ LANGUAGE plpgsql;
