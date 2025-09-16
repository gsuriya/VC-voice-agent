import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleAPIService {
  private oauth2Client: OAuth2Client;
  private gmail: any;
  private calendar: any;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Generate OAuth URL for user authentication
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.setCredentials(tokens);
    return tokens;
  }

  // Set credentials for API calls
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Get user's email address
  async getUserEmail(): Promise<string> {
    try {
      const response = await this.gmail.users.getProfile({ userId: 'me' });
      return response.data.emailAddress;
    } catch (error) {
      console.error('Error getting user email:', error);
      throw error;
    }
  }

  // Get unread emails
  async getUnreadEmails(maxResults: number = 10) {
    try {
      console.log('Fetching unread emails...');
      
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults
      });

      if (!response.data.messages) {
        return [];
      }

      const emails = [];
      for (const message of response.data.messages) {
        const emailData = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });

        const headers = emailData.data.payload.headers;
        const fromHeader = headers.find((h: any) => h.name === 'From');
        const subjectHeader = headers.find((h: any) => h.name === 'Subject');
        const dateHeader = headers.find((h: any) => h.name === 'Date');

        emails.push({
          id: message.id,
          from: fromHeader?.value || 'Unknown',
          subject: subjectHeader?.value || 'No Subject',
          snippet: emailData.data.snippet,
          date: dateHeader?.value || new Date().toISOString()
        });
      }

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Get recent emails (read and unread)
  async getRecentEmails(maxResults: number = 20) {
    try {
      console.log(`Fetching ${maxResults} recent emails...`);
      
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults
      });

      if (!response.data.messages) {
        return [];
      }

      const emails = [];
      for (const message of response.data.messages) {
        const emailData = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });

        const headers = emailData.data.payload.headers;
        const fromHeader = headers.find((h: any) => h.name === 'From');
        const subjectHeader = headers.find((h: any) => h.name === 'Subject');
        const dateHeader = headers.find((h: any) => h.name === 'Date');

        emails.push({
          id: message.id,
          from: fromHeader?.value || 'Unknown',
          subject: subjectHeader?.value || 'No Subject',
          snippet: emailData.data.snippet,
          date: dateHeader?.value || new Date().toISOString()
        });
      }

      return emails;
    } catch (error) {
      console.error('Error fetching recent emails:', error);
      throw error;
    }
  }

  // Get ALL emails with pagination (for syncing to vector database)
  async getAllEmails(query: string = '', maxResults: number = 1000) {
    try {
      console.log(`🚀 Starting bulk email sync... Target: ${maxResults} emails`);
      
      const allEmails = [];
      let pageToken = '';
      let totalFetched = 0;
      let pageCount = 0;

      while (totalFetched < maxResults) {
        const batchSize = Math.min(500, maxResults - totalFetched); // Gmail API max is 500
        pageCount++;
        
        console.log(`📦 Fetching batch ${pageCount} (${batchSize} emails)...`);
        
        const listParams: any = {
          userId: 'me',
          maxResults: batchSize,
        };
        
        if (query) {
          listParams.q = query;
        }
        
        if (pageToken) {
          listParams.pageToken = pageToken;
        }

        const response = await this.gmail.users.messages.list(listParams);

        if (!response.data.messages || response.data.messages.length === 0) {
          console.log('✅ No more emails to fetch');
          break;
        }

        console.log(`📧 Processing ${response.data.messages.length} email metadata...`);

        // Fetch detailed email data in batches to avoid rate limits
        const batchDetails = [];
        for (let i = 0; i < response.data.messages.length; i += 10) {
          const batch = response.data.messages.slice(i, i + 10);
          
          const batchPromises = batch.map(async (message) => {
            try {
              const emailData = await this.gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'full' // Get full email content
              });

              return this.parseDetailedEmailData(emailData.data);
            } catch (error) {
              console.error(`❌ Error fetching email ${message.id}:`, error);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          batchDetails.push(...batchResults.filter(email => email !== null));
          
          // Small delay to respect rate limits
          if (i + 10 < response.data.messages.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        allEmails.push(...batchDetails);
        totalFetched += batchDetails.length;
        
        console.log(`✅ Batch ${pageCount} complete. Total emails: ${totalFetched}/${maxResults}`);

        // Check if there are more pages
        pageToken = response.data.nextPageToken;
        if (!pageToken) {
          console.log('✅ Reached end of email list');
          break;
        }

        // Delay between pages to be nice to Gmail API
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`🎉 Email sync complete! Fetched ${allEmails.length} emails total`);
      return allEmails;

    } catch (error) {
      console.error('❌ Error in getAllEmails:', error);
      throw error;
    }
  }

  // Parse detailed email data
  private parseDetailedEmailData(emailData: any) {
    const headers = emailData.payload.headers || [];
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Extract email body
    let body = '';
    let htmlBody = '';
    
    if (emailData.payload.body?.data) {
      body = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
    } else if (emailData.payload.parts) {
      // Multi-part email
      for (const part of emailData.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return {
      id: emailData.id,
      threadId: emailData.threadId,
      historyId: emailData.historyId,
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      subject: getHeader('Subject'),
      snippet: emailData.snippet || '',
      body: body.substring(0, 10000), // Limit body size
      htmlBody: htmlBody.substring(0, 10000),
      date: getHeader('Date'),
      internalDate: emailData.internalDate,
      labelIds: emailData.labelIds || [],
      // Additional metadata
      messageId: getHeader('Message-ID'),
      references: getHeader('References'),
      inReplyTo: getHeader('In-Reply-To'),
    };
  }

  // Send email
  async sendEmail(to: string, subject: string, body: string) {
    try {
      console.log(`Attempting to send email to: ${to}`);
      console.log(`Subject: ${subject}`);
      
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(message).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      console.log('Sending email via Gmail API...');
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      console.log('Email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Calendar API methods
  async getAvailability(startDate: string, endDate: string) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar availability:', error);
      throw error;
    }
  }

  async createCalendarEvent(event: any) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Refresh access token if needed
  async refreshTokenIfNeeded() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Gmail Push Notifications
  async setupGmailWatch(topicName: string) {
    try {
      console.log('🔔 Setting up Gmail push notifications...');
      
      const response = await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: topicName,
          labelIds: ['INBOX'], // Watch for inbox changes
          labelFilterAction: 'include'
        }
      });

      console.log('✅ Gmail watch setup successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error setting up Gmail watch:', error);
      throw error;
    }
  }

  async stopGmailWatch() {
    try {
      const response = await this.gmail.users.stop({
        userId: 'me'
      });
      
      console.log('🛑 Gmail watch stopped');
      return response.data;
    } catch (error) {
      console.error('❌ Error stopping Gmail watch:', error);
      throw error;
    }
  }

  async getGmailHistory(startHistoryId: string) {
    try {
      const response = await this.gmail.users.history.list({
        userId: 'me',
        startHistoryId: startHistoryId,
        labelId: 'INBOX'
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error getting Gmail history:', error);
      throw error;
    }
  }
}
