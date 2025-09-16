import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';
import { batchStoreVectors } from '@/lib/vector-service';

// CORS handler
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens, userEmail, maxResults = 500 } = body;
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Google API tokens are required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required for multi-tenant isolation' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting Gmail sync for ${userEmail} - ${maxResults} emails`);

    let emails = [];

    // Check if this is demo tokens (fallback)
    if (tokens.access_token?.startsWith('demo_access_token')) {
      console.log('📧 Using demo Gmail data for user:', userEmail);
      
      // Create personalized demo emails for the user
      emails = [
        {
          id: `personal-1-${Date.now()}`,
          from: 'Sarah Chen <sarah.chen@techstartup.io>',
          to: userEmail,
          subject: `Hi ${userEmail.split('@')[0]}, Q4 Product Roadmap Review`,
          snippet: `Hi ${userEmail.split('@')[0]}! I need your input on the Q4 product roadmap. Could you review the attached document?`,
          body: `Hi ${userEmail.split('@')[0]}!\n\nI hope you're doing well. I need your valuable input on our Q4 product roadmap.\n\nCould you please review the attached document and share your thoughts on:\n- The AI features section\n- Timeline feasibility\n- Resource allocation\n\nThanks!\nSarah`,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          labelIds: ['UNREAD', 'IMPORTANT'],
          threadId: 'thread-1',
          historyId: 'hist-1',
        },
        {
          id: `personal-2-${Date.now()}`,
          from: 'John Martinez <j.martinez@venturecapital.com>',
          to: userEmail,
          subject: 'Investment Discussion Follow-up',
          snippet: `Thank you ${userEmail.split('@')[0]} for the productive meeting. I wanted to follow up on our Series A discussion...`,
          body: `Hi ${userEmail.split('@')[0]},\n\nThank you for the productive meeting yesterday. I wanted to follow up on our discussion about the Series A funding round.\n\nWe're very interested in leading the round. Next steps:\n1. Due diligence materials\n2. Technical deep dive\n3. Financial projections\n\nBest regards,\nJohn Martinez`,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          labelIds: ['STARRED'],
          threadId: 'thread-2',
          historyId: 'hist-2',
        },
        {
          id: `personal-3-${Date.now()}`,
          from: `Your Boss <boss@${userEmail.split('@')[1] || 'company.com'}>`,
          to: userEmail,
          subject: 'Weekly 1:1 Meeting - Important Updates',
          snippet: `Hi ${userEmail.split('@')[0]}, let's discuss the project updates and your career goals in our 1:1...`,
          body: `Hi ${userEmail.split('@')[0]},\n\nLet's use our weekly 1:1 to discuss:\n- Project updates and blockers\n- Your career development goals\n- Team feedback and process improvements\n\nLooking forward to our chat!\n\nBest,\nYour Manager`,
          date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          labelIds: ['UNREAD'],
          threadId: 'thread-3',
          historyId: 'hist-3',
        },
        {
          id: `personal-4-${Date.now()}`,
          from: 'LinkedIn <notifications@linkedin.com>',
          to: userEmail,
          subject: `${userEmail.split('@')[0]}, your profile is getting attention!`,
          snippet: 'Your recent post about AI innovations has received 200+ likes and 30 comments...',
          body: `Hi ${userEmail.split('@')[0]},\n\nYour recent post about AI innovations is performing great!\n\nStats:\n- 200+ likes\n- 30 comments\n- 15 shares\n- 800+ profile views\n\nSeveral tech leaders have engaged with your content.\n\nBest,\nLinkedIn Team`,
          date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          labelIds: ['CATEGORY_SOCIAL'],
          threadId: 'thread-4',
          historyId: 'hist-4',
        },
      ];
      
      console.log(`✅ Generated ${emails.length} personalized demo emails`);
    } else {
      // Real Gmail API flow
      console.log('📧 Fetching real emails from Gmail API...');
      const googleAPI = new GoogleAPIService();
      googleAPI.setCredentials(tokens);

      // Fetch all emails from Gmail
      emails = await googleAPI.getAllEmails('', maxResults);
      console.log(`✅ Fetched ${emails.length} real emails from Gmail`);
    }
    
    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No emails found to sync',
        totalEmails: 0,
      });
    }

    // Limit initial sync to avoid timeout
    const MAX_EMAILS_PER_SYNC = 50; // Start with 50 emails
    const emailsToSync = emails.slice(0, MAX_EMAILS_PER_SYNC);
    
    console.log(`📦 Processing ${emailsToSync.length} emails (of ${emails.length} total) for vector storage...`);
    
    if (emails.length > MAX_EMAILS_PER_SYNC) {
      console.log(`ℹ️ Limiting initial sync to ${MAX_EMAILS_PER_SYNC} emails to avoid timeout. You can sync more later.`);
    }

    // Prepare emails for vector storage
    const vectorData = emailsToSync.map(email => {
      // Create rich text for embedding (subject + body + from)
      const embeddingText = [
        email.subject || '',
        email.snippet || '',
        email.body || '',
        email.from || '',
        // Include sender name for better matching
        extractName(email.from) || '',
      ].filter(text => text.length > 0).join(' ').trim();

      return {
        id: `email_${userEmail}_${email.id}`, // Multi-tenant ID
        text: embeddingText,
        metadata: {
          // Email identifiers
          messageId: email.id,
          threadId: email.threadId,
          historyId: email.historyId,
          
          // Email content
          from: email.from,
          fromName: extractName(email.from),
          to: email.to,
          subject: email.subject,
          snippet: email.snippet,
          
          // Timestamps
          date: email.date,
          internalDate: email.internalDate,
          
          // Gmail metadata
          labels: email.labelIds,
          isUnread: email.labelIds?.includes('UNREAD') || false,
          isImportant: email.labelIds?.includes('IMPORTANT') || false,
          isStarred: email.labelIds?.includes('STARRED') || false,
          
          // Multi-tenant isolation
          userEmail: userEmail,
          
          // Email type classification
          emailType: classifyEmailType(email),
          
          // Threading
          messageId: email.messageId,
          references: email.references,
          inReplyTo: email.inReplyTo,
        },
      };
    });

    console.log('🔄 Storing vectors in Pinecone...');
    
    // Store in vector database with batching
    const storedIds = await batchStoreVectors(vectorData);
    
    console.log(`✅ Successfully synced ${storedIds.length} emails to vector database`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${storedIds.length} emails`,
      totalEmails: storedIds.length,
      userEmail,
      sampleEmails: emails.slice(0, 3).map(email => ({
        from: email.from,
        subject: email.subject,
        date: email.date,
      })),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error: any) {
    console.error('❌ Error syncing Gmail:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to sync Gmail emails',
    }, { status: 500 });
  }
}

// Helper function to extract name from email address
function extractName(emailString: string): string | null {
  if (!emailString) return null;
  
  const match = emailString.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].replace(/['"]/g, '').trim();
  }
  
  // If no name, extract from email address
  const emailMatch = emailString.match(/<(.+)>/) || [null, emailString];
  const email = emailMatch[1];
  if (!email) return null;
  
  const namePart = email.split('@')[0];
  return namePart.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Helper function to classify email type
function classifyEmailType(email: any): string {
  const subject = (email.subject || '').toLowerCase();
  const from = (email.from || '').toLowerCase();
  const body = (email.body || '').toLowerCase();
  
  // Newsletter/Marketing
  if (subject.includes('newsletter') || subject.includes('unsubscribe') || 
      body.includes('unsubscribe') || from.includes('no-reply')) {
    return 'newsletter';
  }
  
  // Meeting/Calendar
  if (subject.includes('meeting') || subject.includes('calendar') || 
      subject.includes('invite') || body.includes('zoom') || body.includes('calendar')) {
    return 'meeting';
  }
  
  // Notifications
  if (from.includes('notification') || from.includes('alert') ||
      subject.includes('notification') || subject.includes('alert')) {
    return 'notification';
  }
  
  // Business/Work
  if (subject.includes('proposal') || subject.includes('contract') ||
      subject.includes('invoice') || subject.includes('quote')) {
    return 'business';
  }
  
  // Personal
  return 'personal';
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Gmail Sync API',
    usage: 'POST with tokens and userEmail to sync emails',
    example: {
      tokens: 'your_gmail_oauth_tokens',
      userEmail: 'user@example.com',
      maxResults: 500,
    },
  });
}
