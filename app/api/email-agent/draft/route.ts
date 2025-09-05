import { NextRequest, NextResponse } from 'next/server';
import { EmailAgent } from '@/lib/email-agent';

const emailAgent = new EmailAgent();

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    // Get the latest email to draft a follow-up
    const emails = await emailAgent.getRecentEmails(5);
    const latestEmail = emails[0];
    
    if (!latestEmail) {
      return NextResponse.json({ 
        draft: "No recent emails found to draft a follow-up." 
      });
    }

    // Generate a draft response
    const draft = await emailAgent.generateDraftResponse(latestEmail, command);
    
    return NextResponse.json({ 
      draft: draft || "Unable to generate draft at this time." 
    });
    
  } catch (error) {
    console.error('Draft error:', error);
    return NextResponse.json(
      { error: 'Failed to draft email' },
      { status: 500 }
    );
  }
}
