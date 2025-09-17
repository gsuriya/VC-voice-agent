import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';
import { 
  semanticSearchEmails,
  getUserEmails,
  getUnreadEmails,
  storeEmail,
  prisma
} from '@/lib/email-service';
import OpenAI from 'openai';

// Add CORS support
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EmailAction {
  intent: 'search' | 'reply' | 'compose' | 'forward' | 'manage' | 'summarize';
  confidence: number;
  parameters: {
    // Search parameters
    query?: string;
    sender?: string;
    recipient?: string;
    timeframe?: string;
    emailType?: 'unread' | 'important' | 'starred' | 'all';
    limit?: number;
    
    // Reply/Compose parameters
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body?: string;
    replyTo?: string; // email ID to reply to
    threadId?: string;
    
    // Management parameters
    action?: 'mark_read' | 'archive' | 'delete' | 'star' | 'label';
    emailIds?: string[];
    
    // Context
    context?: 'current_thread' | 'specific_email' | 'new_email';
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, tokens, userEmail } = body;
    
    if (!tokens || !userEmail) {
      return NextResponse.json(
        { error: 'Tokens and userEmail are required' },
        { status: 400 }
      );
    }

    // Initialize Google API
    const googleAPI = new GoogleAPIService();
    googleAPI.setCredentials(tokens);

    // Parse the natural language command
    const emailAction = await parseEmailCommand(query);
    
    console.log('🤖 Parsed email action:', emailAction);

    // Execute the appropriate action
    const result = await executeEmailAction(emailAction, googleAPI, userEmail);
    
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error in enhanced email agent:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

async function parseEmailCommand(query: string): Promise<EmailAction> {
  try {
    const analysisPrompt = `
Analyze this email command and extract the intent and all parameters:
Command: "${query}"

Respond with a JSON object containing:
{
  "intent": "search|reply|compose|forward|manage|summarize",
  "confidence": 0.0-1.0,
  "parameters": {
    // For search:
    "query": "search terms",
    "sender": "email or name",
    "recipient": "email or name", 
    "timeframe": "latest|today|recent|this week|last month",
    "emailType": "unread|important|starred|all",
    "limit": number,
    
    // For reply/compose:
    "to": ["email1", "email2"],
    "cc": ["email1", "email2"], 
    "bcc": ["email1", "email2"],
    "subject": "subject line",
    "body": "email content",
    "replyTo": "email_id",
    "threadId": "thread_id",
    "context": "current_thread|specific_email|new_email",
    
    // For management:
    "action": "mark_read|archive|delete|star|label",
    "emailIds": ["id1", "id2"]
  }
}

EXAMPLES:
"what is my latest email" → {
  "intent": "search",
  "confidence": 0.95,
  "parameters": {"timeframe": "latest", "limit": 1}
}

"respond to grace in this thread and cc john" → {
  "intent": "reply", 
  "confidence": 0.9,
  "parameters": {"to": ["grace"], "cc": ["john"], "context": "current_thread"}
}

"show me emails from sarah about the project" → {
  "intent": "search",
  "confidence": 0.85, 
  "parameters": {"sender": "sarah", "query": "project", "limit": 10}
}

"compose email to john@company.com about meeting" → {
  "intent": "compose",
  "confidence": 0.9,
  "parameters": {"to": ["john@company.com"], "subject": "meeting", "context": "new_email"}
}

"mark these emails as read" → {
  "intent": "manage",
  "confidence": 0.8,
  "parameters": {"action": "mark_read"}
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert email command parser. Always return valid JSON that matches the schema exactly. Be precise about confidence scores."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Set defaults
    return {
      intent: parsed.intent || 'search',
      confidence: parsed.confidence || 0.5,
      parameters: {
        limit: 10,
        emailType: 'all',
        ...parsed.parameters
      }
    };

  } catch (error) {
    console.error('Error parsing email command:', error);
    // Return default search action
    return {
      intent: 'search',
      confidence: 0.3,
      parameters: { query, limit: 10, emailType: 'all' }
    };
  }
}

async function executeEmailAction(
  action: EmailAction, 
  googleAPI: GoogleAPIService, 
  userEmail: string
): Promise<any> {
  
  switch (action.intent) {
    case 'search':
      return await handleSearch(action, userEmail);
      
    case 'reply':
      return await handleReply(action, googleAPI, userEmail);
      
    case 'compose':
      return await handleCompose(action, googleAPI, userEmail);
      
    case 'forward':
      return await handleForward(action, googleAPI, userEmail);
      
    case 'manage':
      return await handleManage(action, googleAPI, userEmail);
      
    case 'summarize':
      return await handleSummarize(action, userEmail);
      
    default:
      return {
        success: false,
        error: `Unknown intent: ${action.intent}`,
        suggestion: "Try asking me to search, reply, compose, forward, manage, or summarize emails."
      };
  }
}

async function handleSearch(action: EmailAction, userEmail: string) {
  try {
    let emails = [];
    const params = action.parameters;
    
    if (params.timeframe === 'latest' || params.query === 'latest') {
      // Get latest emails
      emails = await getUserEmails(userEmail, params.limit || 1);
    } else if (params.emailType === 'unread') {
      // Get unread emails
      emails = await getUnreadEmails(userEmail, params.limit || 10);
    } else if (params.query || params.sender) {
      // Use semantic search
      let searchQuery = params.query || '';
      if (params.sender) {
        searchQuery += ` from:${params.sender}`;
      }
      emails = await semanticSearchEmails(searchQuery, userEmail, params.limit || 10);
    } else {
      // Get general emails
      emails = await getUserEmails(userEmail, params.limit || 10);
    }

    // Apply additional filters
    if (params.emailType === 'unread') {
      emails = emails.filter(email => email.isUnread);
    } else if (params.emailType === 'important') {
      emails = emails.filter(email => email.isImportant);
    } else if (params.emailType === 'starred') {
      emails = emails.filter(email => email.isStarred);
    }

    // Generate response
    const response = await generateSearchResponse(emails, action.parameters);
    
    return {
      success: true,
      intent: 'search',
      response,
      emails: emails.slice(0, 5), // Return top 5 for display
      totalFound: emails.length,
      confidence: action.confidence
    };

  } catch (error) {
    console.error('Error in search handler:', error);
    return {
      success: false,
      error: 'Failed to search emails',
      response: "Sorry, I couldn't search your emails right now. Please try again."
    };
  }
}

async function handleReply(action: EmailAction, googleAPI: GoogleAPIService, userEmail: string) {
  try {
    const params = action.parameters;
    
    // If replying to a thread or specific email, we need to find it first
    let originalEmail = null;
    
    if (params.context === 'current_thread' && params.to) {
      // Find the latest email from the specified person
      const senderName = params.to[0];
      const emails = await semanticSearchEmails(`from:${senderName}`, userEmail, 1);
      originalEmail = emails[0];
    }
    
    if (!originalEmail) {
      return {
        success: false,
        error: 'Could not find the email to reply to',
        response: "I couldn't find the email you want to reply to. Can you be more specific?",
        needsMoreInfo: true,
        suggestions: [
          "Try: 'reply to the latest email from Grace'",
          "Or: 'show me emails from Grace first'"
        ]
      };
    }

    // Generate AI reply content
    const replyContent = await generateReplyContent(originalEmail, params);
    
    // Prepare recipients
    const to = originalEmail.from;
    const cc = params.cc || [];
    const bcc = params.bcc || [];
    const subject = originalEmail.subject.startsWith('Re:') 
      ? originalEmail.subject 
      : `Re: ${originalEmail.subject}`;

    return {
      success: true,
      intent: 'reply',
      response: `I've drafted a reply to ${originalEmail.fromName || originalEmail.from}${cc.length > 0 ? ` with ${cc.join(', ')} CC'd` : ''}${bcc.length > 0 ? ` and ${bcc.length} BCC recipient(s)` : ''}. Here's the draft:`,
      draft: {
        to,
        cc,
        bcc,
        subject,
        body: replyContent,
        originalEmail: {
          id: originalEmail.id,
          from: originalEmail.from,
          subject: originalEmail.subject,
          snippet: originalEmail.snippet
        }
      },
      confidence: action.confidence,
      readyToSend: true
    };

  } catch (error) {
    console.error('Error in reply handler:', error);
    return {
      success: false,
      error: 'Failed to compose reply',
      response: "Sorry, I couldn't compose a reply right now. Please try again."
    };
  }
}

async function handleCompose(action: EmailAction, googleAPI: GoogleAPIService, userEmail: string) {
  try {
    const params = action.parameters;
    
    if (!params.to || params.to.length === 0) {
      return {
        success: false,
        error: 'No recipients specified',
        response: "Who would you like to send this email to?",
        needsMoreInfo: true
      };
    }

    // Generate email content if not provided
    let emailBody = params.body;
    if (!emailBody) {
      emailBody = await generateComposeContent(params);
    }

    const subject = params.subject || 'New Message';

    return {
      success: true,
      intent: 'compose',
      response: `I've drafted a new email to ${params.to.join(', ')}${params.cc ? ` with ${params.cc.join(', ')} CC'd` : ''}. Here's the draft:`,
      draft: {
        to: params.to,
        cc: params.cc || [],
        bcc: params.bcc || [],
        subject,
        body: emailBody
      },
      confidence: action.confidence,
      readyToSend: true
    };

  } catch (error) {
    console.error('Error in compose handler:', error);
    return {
      success: false,
      error: 'Failed to compose email',
      response: "Sorry, I couldn't compose the email right now. Please try again."
    };
  }
}

async function handleForward(action: EmailAction, googleAPI: GoogleAPIService, userEmail: string) {
  // TODO: Implement forward functionality
  return {
    success: false,
    error: 'Forward functionality not yet implemented',
    response: "Email forwarding is coming soon! For now, try searching, replying, or composing emails."
  };
}

async function handleManage(action: EmailAction, googleAPI: GoogleAPIService, userEmail: string) {
  // TODO: Implement email management (mark read, archive, etc.)
  return {
    success: false,
    error: 'Email management functionality not yet implemented', 
    response: "Email management features are coming soon! For now, try searching, replying, or composing emails."
  };
}

async function handleSummarize(action: EmailAction, userEmail: string) {
  try {
    const params = action.parameters;
    
    // Get emails to summarize
    let emails = [];
    if (params.sender) {
      emails = await semanticSearchEmails(`from:${params.sender}`, userEmail, params.limit || 10);
    } else if (params.emailType === 'unread') {
      emails = await getUnreadEmails(userEmail, params.limit || 10);
    } else {
      emails = await getUserEmails(userEmail, params.limit || 10);
    }

    if (emails.length === 0) {
      return {
        success: true,
        intent: 'summarize',
        response: "No emails found to summarize.",
        confidence: action.confidence
      };
    }

    // Generate summary
    const summary = await generateEmailSummary(emails);

    return {
      success: true,
      intent: 'summarize',
      response: summary,
      emailCount: emails.length,
      confidence: action.confidence
    };

  } catch (error) {
    console.error('Error in summarize handler:', error);
    return {
      success: false,
      error: 'Failed to summarize emails',
      response: "Sorry, I couldn't summarize your emails right now. Please try again."
    };
  }
}

async function generateSearchResponse(emails: any[], params: any): Promise<string> {
  if (emails.length === 0) {
    return "I couldn't find any emails matching your criteria. Try adjusting your search terms.";
  }

  if (params.timeframe === 'latest' || params.limit === 1) {
    const email = emails[0];
    return `Your latest email is from ${email.fromName || email.from} with the subject "${email.subject}". It was sent ${formatDate(email.sentAt)}. ${email.snippet}`;
  }

  const count = emails.length;
  const preview = emails.slice(0, 3);
  
  let response = `Found ${count} email${count > 1 ? 's' : ''}. Here are the most relevant:\n\n`;
  
  preview.forEach((email, index) => {
    response += `${index + 1}. **${email.subject}**\n   From: ${email.fromName || email.from}\n   Date: ${formatDate(email.sentAt)}\n   ${email.snippet.substring(0, 100)}...\n\n`;
  });

  if (count > 3) {
    response += `And ${count - 3} more email${count - 3 > 1 ? 's' : ''}...`;
  }

  return response;
}

async function generateReplyContent(originalEmail: any, params: any): Promise<string> {
  const prompt = `
Generate a professional email reply to:

From: ${originalEmail.fromName || originalEmail.from}
Subject: ${originalEmail.subject}
Content: ${originalEmail.snippet || originalEmail.body || 'No content'}

Requirements:
- Professional and appropriate tone
- Acknowledge their message
- Provide a helpful response
- Keep it concise
- Don't include signature (will be added automatically)

Reply:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional email assistant. Generate concise, helpful email replies that sound natural and professional."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 300,
    temperature: 0.7
  });

  return response.choices[0]?.message?.content || "Thank you for your email. I'll review this and get back to you soon.";
}

async function generateComposeContent(params: any): Promise<string> {
  const prompt = `
Compose a professional email with these details:
- Subject: ${params.subject || 'New Message'}
- Context: ${params.body || 'General professional communication'}

Generate a complete, professional email body that:
- Has an appropriate greeting
- Is clear and concise
- Maintains professional tone
- Includes a clear call-to-action or next steps if needed
- Don't include signature (will be added automatically)

Email body:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: "You are a professional email assistant. Generate clear, professional email content."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 400,
    temperature: 0.7
  });

  return response.choices[0]?.message?.content || "I hope this email finds you well. I wanted to reach out regarding [subject]. Please let me know if you have any questions.";
}

async function generateEmailSummary(emails: any[]): Promise<string> {
  const emailSummaries = emails.slice(0, 10).map(email => 
    `- ${email.fromName || email.from}: ${email.subject} (${formatDate(email.sentAt)})`
  ).join('\n');

  const prompt = `
Summarize these recent emails:

${emailSummaries}

Provide a concise summary highlighting:
- Key senders and topics
- Important or urgent items
- Overall themes
- Any action items implied

Summary:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an email assistant. Provide clear, actionable email summaries."
      },
      {
        role: "user", 
        content: prompt
      }
    ],
    max_tokens: 300,
    temperature: 0.7
  });

  return response.choices[0]?.message?.content || `You have ${emails.length} emails. The most recent ones are from ${emails.slice(0, 3).map(e => e.fromName || e.from).join(', ')}.`;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    return 'just now';
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} hour${Math.floor(diffHours) > 1 ? 's' : ''} ago`;
  } else if (diffHours < 168) { // 7 days
    return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;
  } else {
    return d.toLocaleDateString();
  }
}
