-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create emails table
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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS match_emails(VECTOR, FLOAT, INTEGER);

-- Create the vector search function
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
$$;
