import OpenAI from 'openai';
import { GoogleAPIService } from './google-apis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class EmailAgent {
  private googleAPI: GoogleAPIService;
  private processedEmails: Set<string> = new Set();
  private startTime: Date;

  constructor() {
    this.googleAPI = new GoogleAPIService();
    this.startTime = new Date();
  }

  setGoogleCredentials(tokens: any) {
    this.googleAPI.setCredentials(tokens);
  }

  resetStartTime() {
    this.startTime = new Date();
    this.processedEmails.clear();
    console.log(`🔄 Reset start time to: ${this.startTime.toISOString()}`);
  }

  // Process emails and send responses
  async processEmails(): Promise<{ processed: number; responsesSent: number }> {
    try {
      console.log('🔍 Checking for new emails...');
      
      // Get recent emails (last 5 to reduce API calls)
      const emails = await this.googleAPI.getRecentEmails(5);
      console.log(`📧 Found ${emails.length} recent emails`);
      
      let processed = 0;
      let responsesSent = 0;

      for (const email of emails) {
        try {
          // Extract email address from the "from" field
          const fromMatch = email.from.match(/<(.+)>/) || email.from.match(/([^\s]+@[^\s]+)/);
          const senderEmail = fromMatch ? fromMatch[1] || fromMatch[0] : email.from;
          
          // ONLY respond to .edu emails
          if (!senderEmail.toLowerCase().endsWith('.edu')) {
            continue;
          }
          
          // CRITICAL: Only process emails that arrived AFTER the program started
          const emailDate = new Date(email.date);
          if (emailDate < this.startTime) {
            continue;
          }
          
          // CRITICAL: Check if we've already processed this email
          if (this.processedEmails.has(email.id)) {
            continue;
          }
          
          console.log(`🤖 Processing NEW .edu email from ${senderEmail}: "${email.subject}"`);
          
          // Mark as processed FIRST to prevent any spam
          this.processedEmails.add(email.id);
          
          // Use AI to determine if this .edu email needs a response
          console.log(`🧠 AI analyzing .edu email from ${senderEmail}...`);
          const shouldRespond = await this.shouldRespondToEmail(email);
          
          if (!shouldRespond) {
            console.log(`❌ AI determined NO response needed for .edu email from ${senderEmail}`);
            processed++;
            continue;
          }
          
          console.log(`✅ AI determined response IS needed for .edu email from ${senderEmail}`);
          
          // Generate appropriate response
          console.log(`📝 Generating response for ${senderEmail}...`);
          const response = await this.generateResponse(email);
          
          if (response) {
            console.log(`📧 SENDING EMAIL to ${senderEmail}`);
            console.log(`📧 Subject: Re: ${email.subject}`);
            console.log(`📧 Response preview: ${response.substring(0, 100)}...`);
            
            await this.googleAPI.sendEmail(
              senderEmail,
              `Re: ${email.subject}`,
              response
            );
            
            console.log(`✅ EMAIL SENT SUCCESSFULLY to ${senderEmail}`);
            responsesSent++;
          } else {
            console.log(`❌ No response generated for email from ${senderEmail}`);
          }
          
          processed++;
        } catch (error) {
          console.error(`❌ Error processing email ${email.id}:`, error);
        }
      }
      
      console.log(`🎉 Email processing complete: ${processed} processed, ${responsesSent} responses sent`);
      return { processed, responsesSent };
    } catch (error) {
      console.error('Error processing emails:', error);
      throw error;
    }
  }

  // AI function to determine if an email needs a response
  async shouldRespondToEmail(email: any): Promise<boolean> {
    const prompt = `
    You are an AI assistant helping Pranav, a student at NYU Stern, manage his emails.

    Your job is to determine if this email needs a response. ONLY respond if:
    1. It's a direct question or request
    2. Someone is asking for a meeting/call
    3. It's a professional inquiry that requires a response
    4. It's from someone he should respond to

    DO NOT respond to:
    - Spam or promotional emails
    - Automated emails
    - Emails that don't require a response
    - Newsletters or notifications
    - Emails that are just informational

    Email details:
    From: ${email.from}
    Subject: ${email.subject}
    Body: ${email.body}

    Respond with ONLY "YES" if this email needs a response, or "NO" if it doesn't.
    Be very conservative - only say YES if it clearly needs a response.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const result = response.choices[0].message.content?.trim().toUpperCase();
      return result === 'YES';
    } catch (error) {
      console.error('Error determining if email needs response:', error);
      return false; // Default to not responding if there's an error
    }
  }

  // Generate appropriate response
  async generateResponse(email: any): Promise<string> {
    const prompt = `
    You are Pranav, a student at NYU Stern. Generate a professional response to this email:

    From: ${email.from}
    Subject: ${email.subject}
    Body: ${email.body}

    Respond professionally as a student at NYU Stern. Be helpful and concise.
    Always end with "Best, Pranav"
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      let responseText = response.choices[0].message.content || 'Thank you for your email. I will get back to you soon.';
      
      // Ensure it ends with "Best, Pranav"
      if (!responseText.includes('Best, Pranav')) {
        responseText += '\n\nBest, Pranav';
      }
      
      return responseText;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Thank you for your email. I will get back to you soon.\n\nBest, Pranav';
    }
  }
}