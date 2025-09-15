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
}
