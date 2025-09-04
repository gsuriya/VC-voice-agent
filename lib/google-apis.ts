import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleAPIService {
  private oauth2Client: OAuth2Client;
  private gmail: any;
  private calendar: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Set credentials for authenticated user
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Get authorization URL for OAuth flow
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Gmail API methods
  async getUnreadEmails(maxResults: number = 10) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults
      });

      const messages = response.data.messages || [];
      const detailedMessages = await Promise.all(
        messages.map(async (message: any) => {
          const detail = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          return this.parseEmail(detail.data);
        })
      );

      return detailedMessages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async getRecentEmails(maxResults: number = 20) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults
      });

      const messages = response.data.messages || [];
      const detailedMessages = await Promise.all(
        messages.map(async (message: any) => {
          const detail = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          return this.parseEmail(detail.data);
        })
      );

      return detailedMessages;
    } catch (error) {
      console.error('Error fetching recent emails:', error);
      throw error;
    }
  }

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
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: 'primary' }]
        }
      });

      return response.data.calendars.primary.busy || [];
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  }

  async createEvent(eventDetails: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
  }) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventDetails
      });

      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Helper method to parse email data
  private parseEmail(emailData: any) {
    const headers = emailData.payload.headers;
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    let body = '';
    if (emailData.payload.body.data) {
      body = Buffer.from(emailData.payload.body.data, 'base64').toString();
    } else if (emailData.payload.parts) {
      const textPart = emailData.payload.parts.find((part: any) => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    }

    return {
      id: emailData.id,
      threadId: emailData.threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body: body,
      snippet: emailData.snippet
    };
  }
}
