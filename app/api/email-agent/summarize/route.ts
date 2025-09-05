import { NextRequest, NextResponse } from 'next/server';
import { EmailAgent } from '@/lib/email-agent';

const emailAgent = new EmailAgent();

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    // Get recent emails and create a summary
    const emails = await emailAgent.getRecentEmails(10);
    const eduEmails = emails.filter(email => email.from.includes('.edu'));
    
    if (eduEmails.length === 0) {
      return NextResponse.json({ 
        summary: "No recent .edu emails found to summarize." 
      });
    }

    // Create a summary using AI
    const summary = await emailAgent.generateEmailSummary(eduEmails, command);
    
    return NextResponse.json({ 
      summary: summary || "Unable to generate summary at this time." 
    });
    
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize emails' },
      { status: 500 }
    );
  }
}
