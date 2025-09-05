import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EmailRecord {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  snippet: string;
  embedding?: number[];
  metadata?: {
    isEdu: boolean;
    senderDomain: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
}

export class EmailDatabase {
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  // Store email in database with vector embedding
  async storeEmail(email: EmailRecord): Promise<void> {
    try {
      // Generate embedding for semantic search
      const embedding = await this.generateEmbedding(email.body + ' ' + email.subject);
      
      // Prepare metadata
      const metadata = {
        isEdu: email.from.includes('.edu'),
        senderDomain: email.from.split('@')[1] || '',
        priority: this.determinePriority(email),
        category: this.categorizeEmail(email),
        sentiment: this.analyzeSentiment(email.body),
        ...email.metadata
      };

      // Store in Supabase
      const { error } = await supabase
        .from('emails')
        .upsert({
          id: email.id,
          thread_id: email.threadId,
          from_email: email.from,
          to_email: email.to,
          subject: email.subject,
          body: email.body,
          date: email.date,
          snippet: email.snippet,
          embedding: embedding,
          metadata: metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing email:', error);
        throw error;
      }

      console.log(`✅ Stored email: ${email.subject} from ${email.from}`);
    } catch (error) {
      console.error('Error in storeEmail:', error);
      throw error;
    }
  }

  // Generate vector embedding for semantic search
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8000) // Limit text length
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  // Semantic search through emails
  async semanticSearch(query: string, limit: number = 10): Promise<EmailRecord[]> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);

      // Search using vector similarity
      const { data, error } = await supabase.rpc('match_emails', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit
      });

      if (error) {
        console.error('Error in semantic search:', error);
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        threadId: row.thread_id,
        from: row.from_email,
        to: row.to_email,
        subject: row.subject,
        body: row.body,
        date: row.date,
        snippet: row.snippet,
        metadata: row.metadata
      }));
    } catch (error) {
      console.error('Error in semanticSearch:', error);
      return [];
    }
  }

  // Search emails by specific criteria
  async searchEmails(criteria: {
    from?: string;
    subject?: string;
    dateRange?: { start: string; end: string };
    category?: string;
    priority?: string;
    isEdu?: boolean;
    limit?: number;
  }): Promise<EmailRecord[]> {
    try {
      let query = supabase.from('emails').select('*');

      if (criteria.from) {
        query = query.ilike('from_email', `%${criteria.from}%`);
      }

      if (criteria.subject) {
        query = query.ilike('subject', `%${criteria.subject}%`);
      }

      if (criteria.dateRange) {
        query = query
          .gte('date', criteria.dateRange.start)
          .lte('date', criteria.dateRange.end);
      }

      if (criteria.category) {
        query = query.eq('metadata->category', criteria.category);
      }

      if (criteria.priority) {
        query = query.eq('metadata->priority', criteria.priority);
      }

      if (criteria.isEdu !== undefined) {
        query = query.eq('metadata->isEdu', criteria.isEdu);
      }

      query = query.order('date', { ascending: false });
      query = query.limit(criteria.limit || 50);

      const { data, error } = await query;

      if (error) {
        console.error('Error searching emails:', error);
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        threadId: row.thread_id,
        from: row.from_email,
        to: row.to_email,
        subject: row.subject,
        body: row.body,
        date: row.date,
        snippet: row.snippet,
        metadata: row.metadata
      }));
    } catch (error) {
      console.error('Error in searchEmails:', error);
      return [];
    }
  }

  // Get email statistics and insights
  async getEmailInsights(): Promise<any> {
    try {
      const { data: totalEmails } = await supabase
        .from('emails')
        .select('id', { count: 'exact' });

      const { data: eduEmails } = await supabase
        .from('emails')
        .select('id', { count: 'exact' })
        .eq('metadata->isEdu', true);

      const { data: recentEmails } = await supabase
        .from('emails')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      // Analyze email patterns
      const senders = recentEmails?.reduce((acc: any, email: any) => {
        const domain = email.from_email.split('@')[1];
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {});

      const categories = recentEmails?.reduce((acc: any, email: any) => {
        const category = email.metadata?.category || 'uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        totalEmails: totalEmails?.length || 0,
        eduEmails: eduEmails?.length || 0,
        topSenders: Object.entries(senders || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10),
        categories: Object.entries(categories || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10),
        recentActivity: recentEmails?.slice(0, 5) || []
      };
    } catch (error) {
      console.error('Error getting email insights:', error);
      return {};
    }
  }

  // AI-powered email analysis
  async analyzeEmailContent(emails: EmailRecord[]): Promise<string> {
    try {
      const emailSummaries = emails.map(email => 
        `From: ${email.from}\nSubject: ${email.subject}\nBody: ${email.body.substring(0, 500)}...\n---`
      ).join('\n');

      const prompt = `
      Analyze these emails and provide insights:
      
      ${emailSummaries}
      
      Please provide:
      1. Key topics and themes
      2. Important requests or action items
      3. Meeting requests or scheduling needs
      4. Urgent items that need attention
      5. Overall email activity patterns
      
      Be concise but comprehensive.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      return response.choices[0].message.content || 'Unable to analyze emails.';
    } catch (error) {
      console.error('Error analyzing email content:', error);
      return 'Unable to analyze emails at this time.';
    }
  }

  // Generate intelligent response to email questions
  async answerEmailQuestion(question: string): Promise<string> {
    try {
      // First, find relevant emails using semantic search
      const relevantEmails = await this.semanticSearch(question, 5);
      
      if (relevantEmails.length === 0) {
        return "I couldn't find any relevant emails to answer your question. Please try rephrasing or ask about a different topic.";
      }

      // Prepare context from relevant emails
      const context = relevantEmails.map(email => 
        `From: ${email.from}\nSubject: ${email.subject}\nDate: ${email.date}\nBody: ${email.body.substring(0, 1000)}...\n---`
      ).join('\n');

      const prompt = `
      You are JARVIS, an AI assistant helping Pranav manage his emails. 
      
      Question: ${question}
      
      Relevant emails:
      ${context}
      
      Please provide a comprehensive answer based on the email content. If you need more specific information, suggest what to search for.
      Be helpful and provide actionable insights.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      return response.choices[0].message.content || 'Unable to answer your question.';
    } catch (error) {
      console.error('Error answering email question:', error);
      return 'Unable to answer your question at this time.';
    }
  }

  // Helper methods
  private determinePriority(email: EmailRecord): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'deadline', 'important'];
    const body = (email.body + ' ' + email.subject).toLowerCase();
    
    if (urgentKeywords.some(keyword => body.includes(keyword))) {
      return 'high';
    }
    
    if (email.from.includes('.edu') || email.subject.toLowerCase().includes('meeting')) {
      return 'medium';
    }
    
    return 'low';
  }

  private categorizeEmail(email: EmailRecord): string {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();
    
    if (subject.includes('meeting') || body.includes('meeting') || body.includes('call')) {
      return 'meeting';
    }
    if (subject.includes('project') || body.includes('project')) {
      return 'project';
    }
    if (subject.includes('assignment') || body.includes('homework') || body.includes('due')) {
      return 'academic';
    }
    if (subject.includes('job') || body.includes('career') || body.includes('internship')) {
      return 'career';
    }
    if (body.includes('thank') || body.includes('thanks')) {
      return 'gratitude';
    }
    
    return 'general';
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['thank', 'great', 'excellent', 'good', 'happy', 'pleased'];
    const negativeWords = ['urgent', 'problem', 'issue', 'concern', 'disappointed', 'unhappy'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}
