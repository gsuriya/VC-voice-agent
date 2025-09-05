#!/usr/bin/env node

// JARVIS Email Intelligence Setup Script
// This script initializes the database and syncs all emails

const { EmailIntelligence } = require('../lib/email-intelligence');
const { GoogleAPIService } = require('../lib/google-apis');

async function setupEmailIntelligence() {
    console.log('🤖 JARVIS: Setting up Email Intelligence System...');
    
    try {
        // Initialize services
        const emailIntelligence = new EmailIntelligence();
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
        
        console.log('🗄️ Step 2: Setting up database...');
        
        // Note: Database setup should be done manually with Supabase
        console.log('⚠️  Please ensure you have:');
        console.log('   1. Created a Supabase project');
        console.log('   2. Run the database/schema.sql script');
        console.log('   3. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local');
        
        console.log('🔄 Step 3: Syncing emails to database...');
        
        // Sync all emails
        const syncResult = await emailIntelligence.syncAllEmails();
        console.log(`✅ Email sync complete: ${syncResult.synced} synced, ${syncResult.errors} errors`);
        
        console.log('📊 Step 4: Generating email insights...');
        
        // Get insights
        const insights = await emailIntelligence.getEmailInsights();
        console.log('📈 Email Insights:');
        console.log(`   Total emails: ${insights.totalEmails}`);
        console.log(`   .edu emails: ${insights.eduEmails}`);
        console.log(`   Top senders: ${insights.topSenders?.slice(0, 3).map(([domain, count]) => `${domain} (${count})`).join(', ')}`);
        
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

// Run setup
setupEmailIntelligence();
