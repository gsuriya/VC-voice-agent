#!/usr/bin/env node

// JARVIS Email Intelligence Setup Script
// This script initializes the database and syncs all emails

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { GoogleAPIService } from '../lib/google-apis.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function setupEmailIntelligence() {
    console.log('🤖 JARVIS: Setting up Email Intelligence System...');
    
    try {
        // Initialize services
        const googleAPI = new GoogleAPIService();
        
        console.log('📧 Step 1: Testing Gmail API connection...');
        
        // Test Gmail API connection
        try {
            const emails = await googleAPI.getRecentEmails(5);
            console.log(`✅ Gmail API connected. Found ${emails.length} recent emails.`);
        } catch (error) {
            console.error('❌ Gmail API connection failed:', error.message);
            console.log('💡 Please ensure you have:');
            console.log('   1. Set up Google OAuth credentials');
            console.log('   2. Connected your Google account');
            console.log('   3. Enabled Gmail API');
            return;
        }
        
        console.log('🗄️ Step 2: Testing database connection...');
        
        // Test database connection
        try {
            const { data, error } = await supabase.from('emails').select('count').limit(1);
            if (error) throw error;
            console.log('✅ Database connected successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            console.log('💡 Please ensure you have:');
            console.log('   1. Created a Supabase project');
            console.log('   2. Run the database/schema.sql script');
            console.log('   3. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local');
            return;
        }
        
        console.log('🔄 Step 3: Syncing emails to database...');
        
        // Sync emails in batches
        let synced = 0;
        let errors = 0;
        let nextPageToken = '';
        const batchSize = 50;

        do {
            try {
                console.log(`📧 Fetching batch of ${batchSize} emails...`);
                const emails = await googleAPI.getRecentEmails(batchSize, nextPageToken);
                
                if (emails.length === 0) break;
                
                for (const email of emails) {
                    try {
                        // Generate embedding for semantic search
                        const embedding = await generateEmbedding(email.body + ' ' + email.subject);
                        
                        // Prepare metadata
                        const metadata = {
                            isEdu: email.from.includes('.edu'),
                            senderDomain: email.from.split('@')[1] || '',
                            priority: determinePriority(email),
                            category: categorizeEmail(email),
                            sentiment: analyzeSentiment(email.body)
                        };

                        // Store in Supabase
                        const { error } = await supabase
                            .from('emails')
                            .upsert({
                                id: email.id,
                                thread_id: email.threadId,
                                from_email: email.from,
                                to_email: email.to,
                                subject: email.subject,
                                body: email.body,
                                date: email.date,
                                snippet: email.snippet,
                                embedding: embedding,
                                metadata: metadata,
                                created_at: new Date().toISOString()
                            });

                        if (error) {
                            console.error(`Error storing email ${email.id}:`, error);
                            errors++;
                        } else {
                            synced++;
                        }
                    } catch (error) {
                        console.error(`Error processing email ${email.id}:`, error);
                        errors++;
                    }
                }
                
                console.log(`✅ Synced ${synced} emails so far...`);
                
                // Check if there are more emails
                nextPageToken = emails.length === batchSize ? 'next' : '';
                
            } catch (error) {
                console.error('Error in batch processing:', error);
                break;
            }
        } while (nextPageToken);

        console.log(`✅ Email sync complete: ${synced} synced, ${errors} errors`);
        
        console.log('📊 Step 4: Generating email insights...');
        
        // Get insights
        const { data: insights } = await supabase
            .from('emails')
            .select('from_email, metadata')
            .limit(1000);
        
        const totalEmails = synced;
        const eduEmails = insights?.filter(email => email.metadata?.isEdu).length || 0;
        
        console.log('📈 Email Insights:');
        console.log(`   Total emails: ${totalEmails}`);
        console.log(`   .edu emails: ${eduEmails}`);
        
        console.log('🎉 JARVIS Email Intelligence System is ready!');
        console.log('');
        console.log('🚀 You can now:');
        console.log('   • Ask questions about your emails');
        console.log('   • Search for specific content');
        console.log('   • Get intelligent summaries');
        console.log('   • Draft responses to any email');
        console.log('   • Find meeting requests and urgent items');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

// Helper functions
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text.substring(0, 8000) // Limit text length
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return [];
    }
}

function determinePriority(email) {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'deadline', 'important'];
    const body = (email.body + ' ' + email.subject).toLowerCase();
    
    if (urgentKeywords.some(keyword => body.includes(keyword))) {
        return 'high';
    }
    
    if (email.from.includes('.edu') || email.subject.toLowerCase().includes('meeting')) {
        return 'medium';
    }
    
    return 'low';
}

function categorizeEmail(email) {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();
    
    if (subject.includes('meeting') || body.includes('meeting') || body.includes('call')) {
        return 'meeting';
    }
    if (subject.includes('project') || body.includes('project')) {
        return 'project';
    }
    if (subject.includes('assignment') || body.includes('homework') || body.includes('due')) {
        return 'academic';
    }
    if (subject.includes('job') || body.includes('career') || body.includes('internship')) {
        return 'career';
    }
    if (body.includes('thank') || body.includes('thanks')) {
        return 'gratitude';
    }
    
    return 'general';
}

function analyzeSentiment(text) {
    const positiveWords = ['thank', 'great', 'excellent', 'good', 'happy', 'pleased'];
    const negativeWords = ['urgent', 'problem', 'issue', 'concern', 'disappointed', 'unhappy'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

// Run setup
setupEmailIntelligence();
