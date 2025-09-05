// Real Gmail API service for fetching actual emails
import { google } from 'googleapis';

export class RealGmailAPIService {
    constructor() {
        this.oauth2Client = null;
        this.gmail = null;
    }

    // Set up OAuth2 client
    setupOAuth2() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:3000/api/auth/google/callback'  // Fixed redirect URI
        );
    }

    // Get authorization URL
    getAuthUrl() {
        this.setupOAuth2();
        
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    // Set credentials from tokens
    setCredentials(tokens) {
        this.setupOAuth2();
        this.oauth2Client.setCredentials(tokens);
        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    // Get recent emails from Gmail
    async getRecentEmails(maxResults = 1000) {
        try {
            if (!this.gmail) {
                throw new Error('Gmail API not initialized. Please authenticate first.');
            }

            console.log(`📧 Fetching ${maxResults} recent emails from Gmail...`);
            
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults: maxResults
                // Removed inbox filter to get ALL emails
            });

            const messages = response.data.messages || [];
            console.log(`📧 Found ${messages.length} messages in Gmail`);

            const emails = [];
            
            for (const message of messages) {
                try {
                    const email = await this.getEmailDetails(message.id);
                    if (email) {
                        emails.push(email);
                    }
                } catch (error) {
                    console.error(`Error fetching email ${message.id}:`, error.message);
                }
            }

            console.log(`📧 Successfully processed ${emails.length} emails`);
            return emails;

        } catch (error) {
            console.error('Error fetching emails from Gmail:', error);
            throw error;
        }
    }

    // Get detailed email information
    async getEmailDetails(messageId) {
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });

            const message = response.data;
            const headers = message.payload.headers;
            
            // Extract email details
            const getHeader = (name) => {
                const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
                return header ? header.value : '';
            };

            const from = getHeader('From');
            const to = getHeader('To');
            const subject = getHeader('Subject');
            const date = getHeader('Date');
            
            // Extract body text
            let body = '';
            if (message.payload.body && message.payload.body.data) {
                body = Buffer.from(message.payload.body.data, 'base64').toString();
            } else if (message.payload.parts) {
                // Look for text/plain part
                const textPart = message.payload.parts.find(part => 
                    part.mimeType === 'text/plain'
                );
                if (textPart && textPart.body && textPart.body.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString();
                }
            }

            // Create snippet from body
            const snippet = body.substring(0, 200) + (body.length > 200 ? '...' : '');

            return {
                id: messageId,
                threadId: message.threadId,
                from: from,
                to: to,
                subject: subject,
                body: body,
                snippet: snippet,
                date: new Date(date).toISOString()
            };

        } catch (error) {
            console.error(`Error getting email details for ${messageId}:`, error.message);
            return null;
        }
    }

    // Test connection
    async testConnection() {
        try {
            if (!this.gmail) {
                throw new Error('Gmail API not initialized');
            }
            
            const response = await this.gmail.users.getProfile({
                userId: 'me'
            });
            
            return {
                success: true,
                email: response.data.emailAddress,
                messagesTotal: response.data.messagesTotal
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}
