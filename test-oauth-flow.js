// Test OAuth flow to get real Gmail tokens
import { ComprehensiveGmailSync } from './lib/comprehensive-gmail-sync.js';
import { emailStorage } from './lib/shared-email-storage.js';

async function testOAuthFlow() {
    console.log('🧪 Testing OAuth flow...');
    
    // Step 1: Get auth URL
    const authResponse = await fetch('http://localhost:3000/api/gmail-auth');
    const authData = await authResponse.json();
    
    if (!authData.success) {
        console.error('❌ Failed to get auth URL:', authData.error);
        return;
    }
    
    console.log('✅ Auth URL generated successfully');
    console.log('🔗 Please visit this URL to authorize:');
    console.log(authData.authUrl);
    console.log('\n📋 After authorization, copy the code from the URL and run:');
    console.log('node test-oauth-flow.js [AUTHORIZATION_CODE]');
}

async function testWithCode(code) {
    console.log('🧪 Testing with authorization code...');
    
    try {
        // Step 2: Exchange code for tokens
        const tokenResponse = await fetch('http://localhost:3000/api/gmail-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.success) {
            console.error('❌ Failed to get tokens:', tokenData.error);
            return;
        }
        
        console.log('✅ Tokens received successfully');
        console.log('📧 Email:', tokenData.email);
        console.log('📊 Total messages:', tokenData.messagesTotal);
        
        // Step 3: Test sync with real tokens
        console.log('\n🔄 Testing email sync...');
        const syncResponse = await fetch('http://localhost:3000/api/sync-emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokens: tokenData.tokens })
        });
        
        const syncData = await syncResponse.json();
        
        if (!syncData.success) {
            console.error('❌ Sync failed:', syncData.error);
            return;
        }
        
        console.log('✅ Email sync successful!');
        console.log('📧 Synced emails:', syncData.stats.totalEmails);
        
        // Step 4: Test query
        console.log('\n🤖 Testing email query...');
        const queryResponse = await fetch('http://localhost:3000/api/query-emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'summarize my latest email from spotify' })
        });
        
        const queryData = await queryResponse.json();
        
        if (!queryData.success) {
            console.error('❌ Query failed:', queryData.error);
            return;
        }
        
        console.log('✅ Query successful!');
        console.log('🤖 Result:', queryData.result);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Check if authorization code provided
const code = process.argv[2];

if (code) {
    testWithCode(code);
} else {
    testOAuthFlow();
}
