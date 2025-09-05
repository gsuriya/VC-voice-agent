// Supabase-based email storage with vector search capabilities
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class SupabaseEmailStorage {
    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
        this.openai = openai;
    }

    // Store emails with embeddings in Supabase
    async storeEmails(emails) {
        try {
            console.log(`📧 Storing ${emails.length} emails in Supabase...`);
            
            const emailsWithEmbeddings = [];
            
            for (const email of emails) {
                try {
                    // Generate embedding for semantic search
                    const embeddingResponse = await this.openai.embeddings.create({
                        model: 'text-embedding-ada-002',
                        input: `${email.subject} ${email.body}`,
                    });
                    
                    const embedding = embeddingResponse.data[0].embedding;
                    
                    emailsWithEmbeddings.push({
                        id: email.id,
                        thread_id: email.threadId,
                        from_email: email.from,
                        to_email: email.to,
                        subject: email.subject,
                        body: email.body,
                        snippet: email.snippet,
                        date: new Date(email.date).toISOString(),
                        embedding: embedding,
                        stored_at: new Date().toISOString()
                    });
                    
                    console.log(`📧 Generated embedding for email: ${email.subject}`);
                } catch (error) {
                    console.error(`Error generating embedding for email ${email.id}:`, error.message);
                    // Store without embedding if embedding fails
                    emailsWithEmbeddings.push({
                        id: email.id,
                        thread_id: email.threadId,
                        from_email: email.from,
                        to_email: email.to,
                        subject: email.subject,
                        body: email.body,
                        snippet: email.snippet,
                        date: new Date(email.date).toISOString(),
                        embedding: null,
                        stored_at: new Date().toISOString()
                    });
                }
            }
            
            // Insert emails into Supabase
            const { data, error } = await this.supabase
                .from('emails')
                .upsert(emailsWithEmbeddings, { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                })
                .select();
            
            if (error) {
                console.error('Error storing emails in Supabase:', error);
                throw error;
            }
            
            console.log(`✅ Successfully stored ${data.length} emails in Supabase`);
            return data;
            
        } catch (error) {
            console.error('Supabase storage error:', error);
            throw error;
        }
    }

    // Get all emails from Supabase
    async getAllEmails() {
        try {
            const { data, error } = await this.supabase
                .from('emails')
                .select('*')
                .order('date', { ascending: false });
            
            if (error) {
                console.error('Error fetching emails from Supabase:', error);
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error('Error getting emails:', error);
            return [];
        }
    }

    // Semantic search using vector embeddings
    async searchEmails(query, limit = 10) {
        try {
            // Generate embedding for the search query
            const embeddingResponse = await this.openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: query,
            });
            
            const queryEmbedding = embeddingResponse.data[0].embedding;
            
            // Use Supabase's vector similarity search
            const { data, error } = await this.supabase.rpc('match_emails', {
                query_embedding: queryEmbedding,
                match_threshold: 0.78,
                match_count: limit
            });
            
            if (error) {
                console.error('Error searching emails:', error);
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error('Vector search error:', error);
            // Fallback to text search if vector search fails
            return this.textSearchEmails(query, limit);
        }
    }

    // Fallback text search
    async textSearchEmails(query, limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('emails')
                .select('*')
                .or(`subject.ilike.%${query}%,body.ilike.%${query}%,from_email.ilike.%${query}%`)
                .order('date', { ascending: false })
                .limit(limit);
            
            if (error) {
                console.error('Error in text search:', error);
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error('Text search error:', error);
            return [];
        }
    }

    // Get emails from specific sender
    async getEmailsFrom(sender) {
        try {
            const { data, error } = await this.supabase
                .from('emails')
                .select('*')
                .ilike('from_email', `%${sender}%`)
                .order('date', { ascending: false });
            
            if (error) {
                console.error('Error fetching emails from sender:', error);
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error('Error getting emails from sender:', error);
            return [];
        }
    }

    // Get recent emails
    async getRecentEmails(count = 10) {
        try {
            const { data, error } = await this.supabase
                .from('emails')
                .select('*')
                .order('date', { ascending: false })
                .limit(count);
            
            if (error) {
                console.error('Error fetching recent emails:', error);
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error('Error getting recent emails:', error);
            return [];
        }
    }

    // Get storage stats
    async getStats() {
        try {
            const { count, error } = await this.supabase
                .from('emails')
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.error('Error getting stats:', error);
                throw error;
            }
            
            const { data: latestEmail } = await this.supabase
                .from('emails')
                .select('date')
                .order('date', { ascending: false })
                .limit(1)
                .single();
            
            return {
                totalEmails: count || 0,
                lastSync: new Date().toISOString(),
                latestEmail: latestEmail?.date || null
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                totalEmails: 0,
                lastSync: null,
                latestEmail: null
            };
        }
    }

    // Clear all emails (for testing)
    async clearAllEmails() {
        try {
            const { error } = await this.supabase
                .from('emails')
                .delete()
                .neq('id', 'dummy'); // Delete all records
            
            if (error) {
                console.error('Error clearing emails:', error);
                throw error;
            }
            
            console.log('✅ All emails cleared from Supabase');
            return true;
        } catch (error) {
            console.error('Error clearing emails:', error);
            return false;
        }
    }
}
