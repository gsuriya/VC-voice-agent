import { NextRequest, NextResponse } from 'next/server';
import { batchStoreVectors } from '@/lib/vector-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, action } = body;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Demo Gmail sync for ${userEmail}`);

    // Create realistic demo emails based on a typical professional's inbox
    const demoEmails = [
      {
        id: 'real-1',
        from: 'Sarah Chen <sarah.chen@techstartup.io>',
        to: userEmail,
        subject: 'Q4 Product Roadmap Review - Action Required',
        snippet: 'Hi! I need your input on the Q4 product roadmap. Could you review the attached document and share your thoughts on the AI features section?',
        body: 'Hi there!\n\nI hope you\'re doing well. I\'m reaching out because I need your valuable input on our Q4 product roadmap.\n\nCould you please review the attached document and share your thoughts, particularly on:\n- The AI features section\n- Timeline feasibility\n- Resource allocation\n\nWe\'re planning to finalize this by Friday, so any feedback before then would be greatly appreciated.\n\nThanks!\nSarah',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        labelIds: ['UNREAD', 'IMPORTANT'],
      },
      {
        id: 'real-2',
        from: 'John Martinez <j.martinez@venturecapital.com>',
        to: userEmail,
        subject: 'Meeting Follow-up: Investment Discussion',
        snippet: 'Thank you for the productive meeting yesterday. I wanted to follow up on our discussion about the Series A funding round...',
        body: 'Hi,\n\nThank you for the productive meeting yesterday. I wanted to follow up on our discussion about the Series A funding round.\n\nAs discussed, we\'re very interested in leading the round. Here are the next steps:\n\n1. Due diligence materials review\n2. Technical deep dive with our team\n3. Financial projections analysis\n\nCould you please send over the requested documents by next Tuesday? Our team is excited to move forward quickly.\n\nBest regards,\nJohn Martinez\nPartner, Venture Capital Associates',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        labelIds: ['STARRED'],
      },
      {
        id: 'real-3',
        from: 'Microsoft Teams <noreply@teams.microsoft.com>',
        to: userEmail,
        subject: 'Meeting Invitation: Weekly Team Standup',
        snippet: 'You\'re invited to join the Weekly Team Standup meeting on Thursday at 10:00 AM...',
        body: 'Meeting: Weekly Team Standup\nTime: Thursday, October 12, 2023 at 10:00 AM - 10:30 AM\nLocation: Microsoft Teams Meeting\n\nAgenda:\n- Sprint progress update\n- Blockers and challenges\n- Next week priorities\n\nJoin Microsoft Teams Meeting\nClick here to join the meeting',
        date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        labelIds: ['CATEGORY_UPDATES'],
      },
      {
        id: 'real-4',
        from: 'Dr. Emily Watson <emily.watson@techuniversity.edu>',
        to: userEmail,
        subject: 'Research Collaboration Opportunity',
        snippet: 'I came across your recent work on AI applications and would love to discuss a potential research collaboration...',
        body: 'Dear Colleague,\n\nI hope this email finds you well. I came across your recent work on AI applications and was thoroughly impressed by your innovative approach.\n\nI\'m writing to explore a potential research collaboration opportunity. Our lab at Tech University is working on similar problems, and I believe our combined expertise could lead to some breakthrough results.\n\nWould you be interested in a brief call next week to discuss this further? I\'m available most afternoons.\n\nLooking forward to hearing from you.\n\nBest regards,\nDr. Emily Watson\nProfessor of Computer Science\nTech University',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        labelIds: [],
      },
      {
        id: 'real-5',
        from: 'Alex Thompson <alex@designstudio.com>',
        to: userEmail,
        subject: 'UI/UX Design Feedback Needed',
        snippet: 'Hey! I\'ve finished the initial mockups for the dashboard redesign. Could you take a look and share your thoughts?',
        body: 'Hey!\n\nI\'ve finished the initial mockups for the dashboard redesign project we discussed. The designs focus on improving user engagement and simplifying the workflow.\n\nKey changes include:\n- Cleaner navigation structure\n- Improved data visualization\n- Mobile-responsive design\n- Dark mode support\n\nCould you take a look and share your thoughts? I\'m particularly interested in your feedback on the user flow and any technical constraints I should consider.\n\nFigma link: [Design Mockups]\n\nThanks!\nAlex',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        labelIds: ['UNREAD'],
      },
      {
        id: 'real-6',
        from: 'LinkedIn <notifications@linkedin.com>',
        to: userEmail,
        subject: 'Your post is getting attention!',
        snippet: 'Your recent post about AI in healthcare has received 150+ likes and 25 comments...',
        body: 'Hi there,\n\nYour recent post about "AI in Healthcare: Transforming Patient Care" is getting great engagement!\n\nStats so far:\n- 150+ likes\n- 25 comments\n- 12 shares\n- 500+ profile views\n\nSeveral industry leaders have commented, including executives from major healthcare companies. This could be a great networking opportunity!\n\nCheck out your notifications to see who\'s engaging with your content.\n\nBest,\nThe LinkedIn Team',
        date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        labelIds: ['CATEGORY_SOCIAL'],
      },
    ];

    console.log(`📦 Processing ${demoEmails.length} demo emails for vector storage...`);

    // Prepare emails for vector storage
    const vectorData = demoEmails.map(email => {
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
        id: `demo_${userEmail}_${email.id}`, // Multi-tenant ID
        text: embeddingText,
        metadata: {
          // Email identifiers
          messageId: email.id,
          
          // Email content
          from: email.from,
          fromName: extractName(email.from),
          to: email.to,
          subject: email.subject,
          snippet: email.snippet,
          
          // Timestamps
          date: email.date,
          
          // Gmail metadata
          labels: email.labelIds,
          isUnread: email.labelIds?.includes('UNREAD') || false,
          isImportant: email.labelIds?.includes('IMPORTANT') || false,
          isStarred: email.labelIds?.includes('STARRED') || false,
          
          // Multi-tenant isolation
          userEmail: userEmail,
          
          // Email type classification
          emailType: classifyEmailType(email),
        },
      };
    });

    console.log('🔄 Storing demo vectors in Pinecone...');
    
    // Store in vector database with batching
    const storedIds = await batchStoreVectors(vectorData);
    
    console.log(`✅ Successfully synced ${storedIds.length} demo emails to vector database`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${storedIds.length} realistic demo emails`,
      totalEmails: storedIds.length,
      userEmail,
      isTestData: false,
      isDemoData: true,
      sampleEmails: demoEmails.slice(0, 3).map(email => ({
        from: email.from,
        subject: email.subject,
        date: email.date,
      })),
    });

  } catch (error: any) {
    console.error('❌ Error syncing demo Gmail:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to sync demo Gmail emails',
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
  
  // Meeting/Calendar
  if (subject.includes('meeting') || subject.includes('calendar') || 
      subject.includes('invite') || body.includes('teams') || body.includes('zoom')) {
    return 'meeting';
  }
  
  // Business/Work
  if (subject.includes('investment') || subject.includes('funding') ||
      subject.includes('roadmap') || subject.includes('project') ||
      from.includes('venture') || body.includes('due diligence')) {
    return 'business';
  }

  // Research/Academic
  if (from.includes('university') || from.includes('.edu') || 
      subject.includes('research') || body.includes('collaboration')) {
    return 'research';
  }

  // Design/Creative
  if (subject.includes('design') || subject.includes('mockup') ||
      body.includes('figma') || from.includes('design')) {
    return 'design';
  }

  // Social/Notifications
  if (from.includes('linkedin') || from.includes('notifications') ||
      subject.includes('getting attention')) {
    return 'social';
  }
  
  // Personal
  return 'personal';
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Demo Gmail Sync API',
    usage: 'POST with userEmail to sync realistic demo emails',
    description: 'Creates professional-looking demo emails to test semantic search',
    example: {
      userEmail: 'user@example.com',
    },
  });
}
