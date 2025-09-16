import { PrismaClient } from '@prisma/client';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let pinecone: Pinecone | null = null;
let vectorIndex: any = null;

// Initialize Pinecone
async function initializePinecone() {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    
    try {
      vectorIndex = pinecone.index(process.env.PINECONE_INDEX_NAME || 'email-vectors');
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error);
    }
  }
  return { pinecone, vectorIndex };
}

// Generate embeddings for text
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Store email in database with vector embedding
export async function storeEmail(emailData: any, userEmail: string) {
  try {
    // Create text for embedding (subject + snippet + from)
    const embeddingText = `${emailData.subject || ''} ${emailData.snippet || ''} ${emailData.from || ''}`.trim();
    
    // Generate embedding
    const embedding = await generateEmbedding(embeddingText);
    
    // Store in PostgreSQL
    const email = await prisma.email.create({
      data: {
        messageId: emailData.id,
        threadId: emailData.threadId,
        historyId: emailData.historyId,
        from: emailData.from || '',
        fromName: extractName(emailData.from),
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to || ''],
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        subject: emailData.subject || '',
        snippet: emailData.snippet || '',
        body: emailData.body || null,
        htmlBody: emailData.htmlBody || null,
        sentAt: emailData.internalDate ? new Date(parseInt(emailData.internalDate)) : new Date(),
        labels: emailData.labelIds || [],
        isUnread: emailData.labelIds?.includes('UNREAD') || false,
        isImportant: emailData.labelIds?.includes('IMPORTANT') || false,
        isStarred: emailData.labelIds?.includes('STARRED') || false,
        userEmail,
        embedding,
      },
    });

    // Store in Pinecone for vector search
    await initializePinecone();
    if (vectorIndex) {
      try {
        await vectorIndex.upsert([
          {
            id: email.id,
            values: embedding,
            metadata: {
              messageId: email.messageId,
              from: email.from,
              fromName: email.fromName,
              subject: email.subject,
              snippet: email.snippet,
              sentAt: email.sentAt.toISOString(),
              userEmail: email.userEmail,
              labels: email.labels,
            },
          },
        ]);
      } catch (error) {
        console.error('Error storing in Pinecone:', error);
        // Continue even if Pinecone fails
      }
    }

    // Update or create contact
    await upsertContact(emailData.from, userEmail);

    return email;
  } catch (error) {
    console.error('Error storing email:', error);
    throw error;
  }
}

// Extract name from email address
function extractName(emailString: string): string | null {
  if (!emailString) return null;
  
  const match = emailString.match(/^(.+?)\s*<.+>$/);
  if (match) {
    return match[1].replace(/['"]/g, '').trim();
  }
  
  // If no name, extract from email address
  const emailMatch = emailString.match(/<(.+)>/) || [null, emailString];
  const email = emailMatch[1];
  const namePart = email.split('@')[0];
  return namePart.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Upsert contact information
async function upsertContact(fromString: string, userEmail: string) {
  if (!fromString) return;

  const emailMatch = fromString.match(/<(.+)>/) || [null, fromString];
  const email = emailMatch[1];
  const name = extractName(fromString);

  if (!email) return;

  try {
    const existingContact = await prisma.contact.findUnique({
      where: { email },
    });

    if (existingContact) {
      // Update existing contact
      await prisma.contact.update({
        where: { email },
        data: {
          name: name || existingContact.name,
          emailCount: { increment: 1 },
          lastEmailAt: new Date(),
        },
      });
    } else {
      // Create new contact
      const firstName = name?.split(' ')[0] || null;
      const lastName = name?.split(' ').slice(1).join(' ') || null;
      const domain = email.split('@')[1];

      await prisma.contact.create({
        data: {
          email,
          name,
          firstName,
          lastName,
          domain,
          emailCount: 1,
          lastEmailAt: new Date(),
          userEmail,
        },
      });
    }
  } catch (error) {
    console.error('Error upserting contact:', error);
  }
}

// Semantic search for emails
export async function semanticSearchEmails(query: string, userEmail: string, limit: number = 10) {
  try {
    console.log('🔍 Performing semantic search for:', query);
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    await initializePinecone();
    
    let vectorResults: any[] = [];
    
    // Try Pinecone first for semantic search
    if (vectorIndex) {
      try {
        const pineconeResults = await vectorIndex.query({
          vector: queryEmbedding,
          topK: limit * 2, // Get more to filter by user
          includeMetadata: true,
          filter: { userEmail },
        });
        
        vectorResults = pineconeResults.matches || [];
      } catch (error) {
        console.error('Pinecone query failed:', error);
      }
    }
    
    // If we have vector results, get full email data
    if (vectorResults.length > 0) {
      const emailIds = vectorResults.map(result => result.id);
      
      const emails = await prisma.email.findMany({
        where: {
          id: { in: emailIds },
          userEmail,
        },
        orderBy: { sentAt: 'desc' },
        take: limit,
      });
      
      // Sort by vector similarity score
      const emailMap = new Map(emails.map(email => [email.id, email]));
      const sortedEmails = vectorResults
        .map(result => ({
          email: emailMap.get(result.id),
          score: result.score,
        }))
        .filter(item => item.email)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .map(item => item.email);
      
      return sortedEmails;
    }
    
    // Fallback to text search if no vector results
    return await textSearchEmails(query, userEmail, limit);
    
  } catch (error) {
    console.error('Error in semantic search:', error);
    // Fallback to text search
    return await textSearchEmails(query, userEmail, limit);
  }
}

// Text-based search fallback
async function textSearchEmails(query: string, userEmail: string, limit: number = 10) {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  
  return await prisma.email.findMany({
    where: {
      userEmail,
      OR: [
        {
          subject: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          snippet: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          from: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          fromName: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });
}

// Smart query processing
export async function processSmartQuery(query: string, userEmail: string) {
  try {
    // Store the query
    console.log('🤖 Processing smart query:', query);
    
    // Analyze query intent using OpenAI
    const analysisPrompt = `
Analyze this email query and extract the intent and parameters:
Query: "${query}"

Respond with a JSON object containing:
{
  "intent": "search|count|filter|draft|action",
  "searchTerms": ["term1", "term2"],
  "sender": "email or name if mentioned",
  "timeframe": "recent|today|this week|last month|specific date",
  "emailType": "unread|important|starred|all",
  "action": "reply|forward|delete|mark_read" (if applicable),
  "limit": number of results to return
}

Examples:
- "Show me Maggie's emails" → {"intent": "search", "sender": "maggie", "limit": 10}
- "Last 5 emails from john@company.com" → {"intent": "search", "sender": "john@company.com", "limit": 5}
- "Unread emails about the meeting" → {"intent": "search", "searchTerms": ["meeting"], "emailType": "unread"}
`;

    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an email query analyzer. Return only valid JSON.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      max_tokens: 300,
      temperature: 0,
    });

    let queryParams;
    try {
      queryParams = JSON.parse(analysis.choices[0]?.message?.content || '{}');
    } catch {
      queryParams = { intent: 'search', limit: 10 };
    }

    console.log('📊 Query analysis:', queryParams);

    // Execute the appropriate search
    let results = [];
    
    if (queryParams.intent === 'search') {
      // Build search query
      let searchQuery = query;
      if (queryParams.sender) {
        searchQuery += ` ${queryParams.sender}`;
      }
      if (queryParams.searchTerms) {
        searchQuery += ` ${queryParams.searchTerms.join(' ')}`;
      }
      
      results = await semanticSearchEmails(searchQuery, userEmail, queryParams.limit || 10);
      
      // Apply additional filters
      if (queryParams.emailType === 'unread') {
        results = results.filter(email => email.isUnread);
      }
      if (queryParams.emailType === 'important') {
        results = results.filter(email => email.isImportant);
      }
      if (queryParams.emailType === 'starred') {
        results = results.filter(email => email.isStarred);
      }
    }

    // Generate natural language response
    const responsePrompt = `
Based on the user's query "${query}" and the following email results, provide a helpful natural language response:

Query Analysis: ${JSON.stringify(queryParams)}
Results: ${results.length} emails found

Email summaries:
${results.slice(0, 5).map(email => 
  `- From: ${email.fromName || email.from}\n  Subject: ${email.subject}\n  Date: ${email.sentAt.toLocaleDateString()}\n  Snippet: ${email.snippet.substring(0, 100)}...`
).join('\n\n')}

Provide a conversational response that:
1. Confirms what was found
2. Highlights the most relevant results
3. Offers to help with follow-up actions

Keep it concise but helpful.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful email assistant. Provide clear, conversational responses about email search results.",
        },
        {
          role: "user",
          content: responsePrompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const naturalResponse = response.choices[0]?.message?.content || 
      `Found ${results.length} emails matching your query.`;

    // Store the query for learning
    await prisma.emailQuery.create({
      data: {
        query,
        response: naturalResponse,
        userEmail,
        matchedEmails: results.map(email => email.id),
        queryType: 'semantic',
      },
    });

    return {
      success: true,
      response: naturalResponse,
      emails: results,
      queryParams,
    };

  } catch (error) {
    console.error('Error processing smart query:', error);
    return {
      success: false,
      error: 'Failed to process query',
      response: 'Sorry, I had trouble processing your request. Please try again.',
    };
  }
}

// Get emails for a user
export async function getUserEmails(userEmail: string, limit: number = 50, offset: number = 0) {
  return await prisma.email.findMany({
    where: { userEmail },
    orderBy: { sentAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

// Get unread emails
export async function getUnreadEmails(userEmail: string, limit: number = 20) {
  return await prisma.email.findMany({
    where: {
      userEmail,
      isUnread: true,
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });
}

// Bulk store emails
export async function bulkStoreEmails(emails: any[], userEmail: string) {
  const results = [];
  
  for (const emailData of emails) {
    try {
      const stored = await storeEmail(emailData, userEmail);
      results.push(stored);
    } catch (error) {
      console.error('Error storing email:', emailData.id, error);
    }
  }
  
  return results;
}

export { prisma };
