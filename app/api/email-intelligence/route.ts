import { NextRequest, NextResponse } from 'next/server';
import { EmailIntelligence } from '@/lib/email-intelligence';

const emailIntelligence = new EmailIntelligence();

export async function POST(request: NextRequest) {
  try {
    const { action, query, ...params } = await request.json();
    
    console.log(`🤖 Processing email intelligence request: ${action}`);
    
    let result;
    
    switch (action) {
      case 'answer_question':
        result = await emailIntelligence.answerQuestion(query);
        break;
        
      case 'search_emails':
        result = await emailIntelligence.searchEmails(query, params.limit || 10);
        break;
        
      case 'get_summary':
        result = await emailIntelligence.getEmailSummary(params.timeframe || 'last week');
        break;
        
      case 'find_emails_from':
        result = await emailIntelligence.findEmailsFrom(params.sender, params.limit || 10);
        break;
        
      case 'find_emails_by_subject':
        result = await emailIntelligence.findEmailsBySubject(params.subject, params.limit || 10);
        break;
        
      case 'get_insights':
        result = await emailIntelligence.getEmailInsights();
        break;
        
      case 'find_meeting_requests':
        result = await emailIntelligence.findMeetingRequests();
        break;
        
      case 'find_urgent_emails':
        result = await emailIntelligence.findUrgentEmails();
        break;
        
      case 'draft_response':
        result = await emailIntelligence.draftResponseToEmail(params.emailId, params.context);
        break;
        
      case 'process_query':
        result = await emailIntelligence.processEmailQuery(query);
        break;
        
      case 'sync_emails':
        result = await emailIntelligence.syncAllEmails();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    console.log(`✅ Email intelligence request completed: ${action}`);
    return NextResponse.json({ result });
    
  } catch (error) {
    console.error('Email intelligence error:', error);
    return NextResponse.json(
      { error: 'Failed to process email intelligence request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'insights') {
      const insights = await emailIntelligence.getEmailInsights();
      return NextResponse.json({ insights });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email intelligence GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get email insights' },
      { status: 500 }
    );
  }
}
