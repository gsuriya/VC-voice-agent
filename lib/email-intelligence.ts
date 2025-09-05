import { EmailDatabase, EmailRecord } from './email-database';
import { GoogleAPIService } from './google-apis';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class EmailIntelligence {
  private emailDB: EmailDatabase;
  private googleAPI: GoogleAPIService;

  constructor() {
    this.emailDB = new EmailDatabase();
    this.googleAPI = new GoogleAPIService();
  }

  setGoogleCredentials(tokens: any) {
    this.googleAPI.setCredentials(tokens);
  }

  // Sync all emails to database
  async syncAllEmails(): Promise<{ synced: number; errors: number }> {
    try {
      console.log('🔄 Starting full email sync...');
      
      let synced = 0;
      let errors = 0;
      let nextPageToken = '';

      do {
        // Get emails in batches
        const emails = await this.googleAPI.getRecentEmails(100, nextPageToken);
        
        for (const email of emails) {
          try {
            await this.emailDB.storeEmail(email);
            synced++;
          } catch (error) {
            console.error(`Error storing email ${email.id}:`, error);
            errors++;
          }
        }

        // Check if there are more emails
        nextPageToken = emails.length === 100 ? 'next' : '';
        
        console.log(`📧 Synced ${synced} emails so far...`);
      } while (nextPageToken);

      console.log(`✅ Email sync complete: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('Error syncing emails:', error);
      throw error;
    }
  }

  // Answer any question about emails
  async answerQuestion(question: string): Promise<string> {
    try {
      console.log(`🤔 Processing question: ${question}`);
      
      // Use the database to answer the question
      const answer = await this.emailDB.answerEmailQuestion(question);
      
      console.log(`✅ Generated answer for: ${question}`);
      return answer;
    } catch (error) {
      console.error('Error answering question:', error);
      return 'I apologize, but I encountered an error while processing your question. Please try again.';
    }
  }

  // Semantic search through emails
  async searchEmails(query: string, limit: number = 10): Promise<EmailRecord[]> {
    try {
      console.log(`🔍 Searching emails for: ${query}`);
      
      const results = await this.emailDB.semanticSearch(query, limit);
      
      console.log(`✅ Found ${results.length} relevant emails`);
      return results;
    } catch (error) {
      console.error('Error searching emails:', error);
      return [];
    }
  }

  // Get comprehensive email summary
  async getEmailSummary(timeframe: string = 'last week'): Promise<string> {
    try {
      console.log(`📊 Generating email summary for: ${timeframe}`);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe.toLowerCase()) {
        case 'last week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'last month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'last 3 months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Get emails from the timeframe
      const emails = await this.emailDB.searchEmails({
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        limit: 100
      });

      if (emails.length === 0) {
        return `No emails found for ${timeframe}.`;
      }

      // Generate AI summary
      const summary = await this.emailDB.analyzeEmailContent(emails);
      
      console.log(`✅ Generated summary for ${emails.length} emails`);
      return summary;
    } catch (error) {
      console.error('Error generating email summary:', error);
      return 'Unable to generate email summary at this time.';
    }
  }

  // Find emails from specific sender
  async findEmailsFrom(sender: string, limit: number = 10): Promise<EmailRecord[]> {
    try {
      console.log(`👤 Finding emails from: ${sender}`);
      
      const emails = await this.emailDB.searchEmails({
        from: sender,
        limit
      });
      
      console.log(`✅ Found ${emails.length} emails from ${sender}`);
      return emails;
    } catch (error) {
      console.error('Error finding emails from sender:', error);
      return [];
    }
  }

  // Find emails by subject
  async findEmailsBySubject(subject: string, limit: number = 10): Promise<EmailRecord[]> {
    try {
      console.log(`📝 Finding emails with subject: ${subject}`);
      
      const emails = await this.emailDB.searchEmails({
        subject: subject,
        limit
      });
      
      console.log(`✅ Found ${emails.length} emails with subject containing "${subject}"`);
      return emails;
    } catch (error) {
      console.error('Error finding emails by subject:', error);
      return [];
    }
  }

  // Get email insights and analytics
  async getEmailInsights(): Promise<any> {
    try {
      console.log('📈 Generating email insights...');
      
      const insights = await this.emailDB.getEmailInsights();
      
      console.log('✅ Generated email insights');
      return insights;
    } catch (error) {
      console.error('Error getting email insights:', error);
      return {};
    }
  }

  // Draft intelligent response to any email
  async draftResponseToEmail(emailId: string, context?: string): Promise<string> {
    try {
      console.log(`✍️ Drafting response to email: ${emailId}`);
      
      // Find the email
      const emails = await this.emailDB.searchEmails({ subject: emailId, limit: 1 });
      
      if (emails.length === 0) {
        return 'Email not found. Please provide a valid email ID.';
      }

      const email = emails[0];
      
      // Generate response using AI
      const prompt = `
      You are Pranav, a student at NYU Stern. Draft a response to this email:
      
      From: ${email.from}
      Subject: ${email.subject}
      Body: ${email.body}
      
      ${context ? `Additional context: ${context}` : ''}
      
      Instructions:
      1. Respond as a professional college student
      2. Be helpful and concise
      3. Address all points in the original email
      4. Always end with "Best, Pranav"
      5. If they're asking for a meeting, suggest some availability
      
      Generate an appropriate response:
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      let draft = response.choices[0].message.content || 'Unable to generate draft.';
      
      // Ensure it ends with "Best, Pranav"
      if (!draft.includes('Best, Pranav')) {
        draft += '\n\nBest, Pranav';
      }
      
      console.log(`✅ Generated response draft for email: ${emailId}`);
      return draft;
    } catch (error) {
      console.error('Error drafting response:', error);
      return 'Unable to generate response draft at this time.';
    }
  }

  // Find meeting requests and scheduling needs
  async findMeetingRequests(): Promise<EmailRecord[]> {
    try {
      console.log('📅 Finding meeting requests...');
      
      const emails = await this.emailDB.searchEmails({
        category: 'meeting',
        limit: 20
      });
      
      console.log(`✅ Found ${emails.length} meeting-related emails`);
      return emails;
    } catch (error) {
      console.error('Error finding meeting requests:', error);
      return [];
    }
  }

  // Find urgent emails that need attention
  async findUrgentEmails(): Promise<EmailRecord[]> {
    try {
      console.log('🚨 Finding urgent emails...');
      
      const emails = await this.emailDB.searchEmails({
        priority: 'high',
        limit: 20
      });
      
      console.log(`✅ Found ${emails.length} urgent emails`);
      return emails;
    } catch (error) {
      console.error('Error finding urgent emails:', error);
      return [];
    }
  }

  // Process natural language email queries
  async processEmailQuery(query: string): Promise<any> {
    try {
      console.log(`🧠 Processing email query: ${query}`);
      
      const lowerQuery = query.toLowerCase();
      
      // Route to appropriate handler based on query type
      if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
        const timeframe = this.extractTimeframe(query);
        return { type: 'summary', data: await this.getEmailSummary(timeframe) };
      }
      
      if (lowerQuery.includes('from') && lowerQuery.includes('email')) {
        const sender = this.extractSender(query);
        return { type: 'emails_from', data: await this.findEmailsFrom(sender) };
      }
      
      if (lowerQuery.includes('subject') || lowerQuery.includes('about')) {
        const subject = this.extractSubject(query);
        return { type: 'emails_by_subject', data: await this.findEmailsBySubject(subject) };
      }
      
      if (lowerQuery.includes('meeting') || lowerQuery.includes('schedule')) {
        return { type: 'meeting_requests', data: await this.findMeetingRequests() };
      }
      
      if (lowerQuery.includes('urgent') || lowerQuery.includes('important')) {
        return { type: 'urgent_emails', data: await this.findUrgentEmails() };
      }
      
      if (lowerQuery.includes('draft') || lowerQuery.includes('respond')) {
        const emailId = this.extractEmailId(query);
        return { type: 'draft_response', data: await this.draftResponseToEmail(emailId) };
      }
      
      // Default to semantic search
      return { type: 'semantic_search', data: await this.searchEmails(query) };
    } catch (error) {
      console.error('Error processing email query:', error);
      return { type: 'error', data: 'Unable to process your query at this time.' };
    }
  }

  // Helper methods for query parsing
  private extractTimeframe(query: string): string {
    if (query.includes('last month')) return 'last month';
    if (query.includes('last 3 months')) return 'last 3 months';
    if (query.includes('last week')) return 'last week';
    return 'last week';
  }

  private extractSender(query: string): string {
    const match = query.match(/from\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    return match ? match[1] : '';
  }

  private extractSubject(query: string): string {
    const match = query.match(/about\s+"([^"]+)"/i) || query.match(/subject\s+"([^"]+)"/i);
    return match ? match[1] : query.replace(/.*about\s+/i, '').replace(/.*subject\s+/i, '');
  }

  private extractEmailId(query: string): string {
    const match = query.match(/email\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    return match ? match[1] : '';
  }
}
