import { NextRequest, NextResponse } from 'next/server';
import { EmailAgent } from '@/lib/email-agent';

const emailAgent = new EmailAgent();

export async function GET(request: NextRequest) {
  try {
    // Get recent emails and filter for .edu
    const emails = await emailAgent.getRecentEmails(20);
    const eduEmails = emails.filter(email => email.from.includes('.edu'));
    
    // Format the emails for display
    const formattedEmails = eduEmails.map(email => ({
      from: email.from,
      subject: email.subject,
      snippet: email.snippet || email.body?.substring(0, 100) + '...',
      date: email.date
    }));
    
    return NextResponse.json({ 
      emails: formattedEmails,
      count: formattedEmails.length
    });
    
  } catch (error) {
    console.error('Edu emails error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve .edu emails' },
      { status: 500 }
    );
  }
}
