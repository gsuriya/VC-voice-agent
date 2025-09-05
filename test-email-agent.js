// Test the EmailAgent directly
import { EmailAgent } from './lib/email-agent.js';

async function testEmailAgent() {
    console.log('🧪 Testing EmailAgent directly...');
    
    try {
        const emailAgent = new EmailAgent();
        
        // Test with mock tokens
        const mockTokens = {
            access_token: 'mock_token',
            refresh_token: 'mock_refresh',
            expiry_date: Date.now() + 3600000
        };
        
        emailAgent.setGoogleCredentials(mockTokens);
        
        console.log('📧 Running processEmails...');
        const result = await emailAgent.processEmails();
        
        console.log('✅ ProcessEmails result:', result);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testEmailAgent();
