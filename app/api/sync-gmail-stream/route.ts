import { NextRequest } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';
import { batchStoreVectors } from '@/lib/vector-service';

// CORS handler
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const body = await request.json();
  const { tokens, userEmail, maxResults = 1000, namespace } = body;

  // Create a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!tokens || !userEmail) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: 'Missing tokens or email' }) + '\n'));
          controller.close();
          return;
        }

        console.log(`🚀 Starting streaming Gmail sync for ${userEmail} - ${maxResults} emails`);
        
        // Send initial progress
        controller.enqueue(encoder.encode(JSON.stringify({ 
          type: 'start', 
          message: 'Starting email sync...',
          progress: 0 
        }) + '\n'));

        // Initialize Google API
        const googleAPI = new GoogleAPIService();
        googleAPI.setCredentials(tokens);

        // Fetch emails
        controller.enqueue(encoder.encode(JSON.stringify({ 
          type: 'status', 
          message: 'Fetching emails from Gmail...',
          progress: 0 
        }) + '\n'));

        const emails = await googleAPI.getAllEmails('', maxResults);
        console.log(`📧 Fetched ${emails.length} emails from Gmail`);

        if (emails.length === 0) {
          controller.enqueue(encoder.encode(JSON.stringify({ 
            type: 'complete', 
            message: 'No emails to sync',
            progress: 0,
            total: 0 
          }) + '\n'));
          controller.close();
          return;
        }

        // Process emails in batches with real progress
        const batchSize = 10;
        let processed = 0;

        for (let i = 0; i < emails.length; i += batchSize) {
          const batch = emails.slice(i, Math.min(i + batchSize, emails.length));
          
          // Prepare batch for vector storage
          const vectorData = batch.map(email => {
            const embeddingText = [
              email.subject || '',
              email.snippet || '',
              email.body || '',
              email.from || '',
              extractName(email.from) || '',
            ].filter(text => text.length > 0).join(' ').trim();

            return {
              id: `email_${userEmail}_${email.id}`,
              text: embeddingText,
              metadata: {
                messageId: email.id,
                threadId: email.threadId,
                from: email.from,
                fromName: extractName(email.from),
                to: email.to,
                subject: email.subject,
                snippet: email.snippet,
                date: email.date,
                internalDate: email.internalDate,
                labels: email.labelIds,
                isUnread: email.labelIds?.includes('UNREAD') || false,
                isImportant: email.labelIds?.includes('IMPORTANT') || false,
                isStarred: email.labelIds?.includes('STARRED') || false,
                userEmail: userEmail,
                emailType: classifyEmailType(email),
              },
            };
          });

          // Store batch in Pinecone
          await batchStoreVectors(vectorData, namespace || userEmail);
          
          processed += batch.length;
          
          // Send progress update
          controller.enqueue(encoder.encode(JSON.stringify({ 
            type: 'progress', 
            message: `Processing emails...`,
            progress: processed,
            total: emails.length,
            percentage: Math.round((processed / emails.length) * 100)
          }) + '\n'));
        }

        // Send completion
        controller.enqueue(encoder.encode(JSON.stringify({ 
          type: 'complete', 
          message: `Successfully synced ${emails.length} emails`,
          progress: emails.length,
          total: emails.length,
          percentage: 100
        }) + '\n'));

        console.log(`✅ Successfully synced ${emails.length} emails for ${userEmail}`);
        
      } catch (error) {
        console.error('❌ Sync error:', error);
        controller.enqueue(encoder.encode(JSON.stringify({ 
          type: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }) + '\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Helper functions
function extractName(emailString: string): string | null {
  if (!emailString) return null;
  const match = emailString.match(/^(.*?)\s*<.*>$/);
  if (match) return match[1].trim();
  const beforeAt = emailString.split('@')[0];
  return beforeAt.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function classifyEmailType(email: any): string {
  const subject = (email.subject || '').toLowerCase();
  const from = (email.from || '').toLowerCase();
  
  if (from.includes('noreply') || from.includes('no-reply')) return 'automated';
  if (subject.includes('invoice') || subject.includes('payment')) return 'financial';
  if (subject.includes('meeting') || subject.includes('calendar')) return 'calendar';
  if (email.labelIds?.includes('CATEGORY_PROMOTIONS')) return 'promotion';
  if (email.labelIds?.includes('CATEGORY_SOCIAL')) return 'social';
  if (email.labelIds?.includes('CATEGORY_UPDATES')) return 'update';
  
  return 'personal';
}