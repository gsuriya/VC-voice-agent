import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';
import { batchStoreVectors } from '@/lib/vector-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userEmail, maxResults = 100 } = body;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting simple Gmail sync for ${userEmail} - ${maxResults} emails`);

    if (action === 'sync_with_chrome_extension') {
      // This will work with your existing Chrome extension OAuth
      console.log('📧 Creating test emails for demo...');
      
      // For now, let's create some test emails to demonstrate
      const testEmails = [
        {
          id: 'test-1',
          from: 'maggie@company.com',
          subject: 'Quarterly Review Meeting',
          snippet: 'Hi, let\'s schedule our quarterly review meeting for next week.',
          body: 'Hi there, I wanted to follow up on our quarterly review meeting. Can we schedule it for next week? I have some important metrics to share.',
          date: new Date().toISOString(),
        },
        {
          id: 'test-2', 
          from: 'john.smith@startup.io',
          subject: 'Investment Proposal Discussion',
          snippet: 'Following up on our investment discussion...',
          body: 'Thank you for the great meeting yesterday. I wanted to follow up on our investment proposal discussion and share some additional materials.',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'test-3',
          from: 'sarah@venture.capital',
          subject: 'Due Diligence Documents',
          snippet: 'Please find the due diligence documents attached...',
          body: 'Hi, please find the due diligence documents attached. Let me know if you need any additional information for the investment review.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      console.log(`📦 Processing ${testEmails.length} test emails for vector storage...`);

      // Prepare emails for vector storage
      const vectorData = testEmails.map(email => {
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
            
            // Email content
            from: email.from,
            fromName: extractName(email.from),
            subject: email.subject,
            snippet: email.snippet,
            
            // Timestamps
            date: email.date,
            
            // Multi-tenant isolation
            userEmail: userEmail,
            
            // Email type classification
            emailType: classifyEmailType(email),
          },
        };
      });

      console.log('🔄 Storing vectors in Pinecone...');
      
      // Store in vector database with batching
      const storedIds = await batchStoreVectors(vectorData);
      
      console.log(`✅ Successfully synced ${storedIds.length} test emails to vector database`);

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${storedIds.length} test emails`,
        totalEmails: storedIds.length,
        userEmail,
        isTestData: true,
        sampleEmails: testEmails.map(email => ({
          from: email.from,
          subject: email.subject,
          date: email.date,
        })),
      });
    }

    if (action === 'sync_real_emails') {
      // Handle real Gmail emails from Chrome extension
      const { emails } = body;
      
      if (!emails || !Array.isArray(emails)) {
        return NextResponse.json(
          { error: 'emails array is required' },
          { status: 400 }
        );
      }

      console.log(`📦 Processing ${emails.length} real Gmail emails for vector storage...`);

      // Prepare emails for vector storage
      const vectorData = emails.map(email => {
        // Create rich text for embedding (subject + snippet + from)
        const embeddingText = [
          email.subject || '',
          email.snippet || '',
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
          },
        };
      });

      console.log('🔄 Storing real Gmail vectors in Pinecone...');
      
      // Store in vector database with batching
      const storedIds = await batchStoreVectors(vectorData);
      
      console.log(`✅ Successfully synced ${storedIds.length} real emails to vector database`);

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${storedIds.length} real Gmail emails`,
        totalEmails: storedIds.length,
        userEmail,
        isTestData: false,
        sampleEmails: emails.slice(0, 3).map(email => ({
          from: email.from,
          subject: email.subject,
          date: email.date,
        })),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

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
  
  // Meeting/Calendar
  if (subject.includes('meeting') || subject.includes('calendar') || 
      subject.includes('invite') || body.includes('zoom') || body.includes('calendar')) {
    return 'meeting';
  }
  
  // Business/Work
  if (subject.includes('proposal') || subject.includes('contract') ||
      subject.includes('invoice') || subject.includes('quote') ||
      subject.includes('investment') || subject.includes('due diligence')) {
    return 'business';
  }
  
  // Personal
  return 'personal';
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Simple Gmail Sync API',
    usage: 'POST with userEmail to sync test emails',
    example: {
      action: 'sync_with_chrome_extension',
      userEmail: 'user@example.com',
      maxResults: 100,
    },
  });
}
