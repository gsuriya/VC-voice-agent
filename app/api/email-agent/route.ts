import { NextRequest, NextResponse } from 'next/server';
import { EmailAgent } from '@/lib/email-agent';

export async function POST(request: NextRequest) {
  try {
    const { action, tokens } = await request.json();
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Google API tokens are required' },
        { status: 400 }
      );
    }

    const emailAgent = new EmailAgent();
    emailAgent.setGoogleCredentials(tokens);

    switch (action) {
      case 'process_emails':
        const processResult = await emailAgent.processEmails();
        return NextResponse.json({ 
          success: true, 
          message: 'Emails processed successfully',
          processed: processResult.processed,
          responsesSent: processResult.responsesSent
        });

      case 'get_emails':
        const { GoogleAPIService } = await import('@/lib/google-apis');
        const googleAPI = new GoogleAPIService();
        googleAPI.setCredentials(tokens);
        const emails = await googleAPI.getUnreadEmails(10);
        return NextResponse.json({ emails });

      case 'send_test_email':
        const { to, subject, body } = await request.json();
        if (!to || !subject || !body) {
          return NextResponse.json(
            { error: 'to, subject, and body are required' },
            { status: 400 }
          );
        }
        
        const { GoogleAPIService: GoogleAPI } = await import('@/lib/google-apis');
        const api = new GoogleAPI();
        api.setCredentials(tokens);
        const result = await api.sendEmail(to, subject, body);
        return NextResponse.json({ 
          success: true, 
          messageId: result.id 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in email agent API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tokens = searchParams.get('tokens');

    if (!tokens) {
      return NextResponse.json(
        { error: 'Google API tokens are required' },
        { status: 400 }
      );
    }

    const emailAgent = new EmailAgent();
    emailAgent.setGoogleCredentials(JSON.parse(tokens));

    if (action === 'status') {
      return NextResponse.json({ 
        status: 'active',
        lastProcessed: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in email agent GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
