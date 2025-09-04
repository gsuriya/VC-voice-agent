import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';

export async function POST(request: NextRequest) {
  try {
    const { tokens } = await request.json();
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Google API tokens are required' },
        { status: 400 }
      );
    }

    console.log('Testing Gmail API with tokens:', tokens);
    
    const googleAPI = new GoogleAPIService();
    googleAPI.setCredentials(tokens);
    
    // Test getting emails
    console.log('Attempting to get unread emails...');
    const emails = await googleAPI.getUnreadEmails(5);
    console.log('Successfully got emails:', emails.length);
    
    return NextResponse.json({ 
      success: true, 
      emailCount: emails.length,
      emails: emails.map(email => ({
        from: email.from,
        subject: email.subject,
        snippet: email.snippet
      }))
    });
  } catch (error) {
    console.error('Error testing Gmail API:', error);
    return NextResponse.json(
      { 
        error: 'Gmail API test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

