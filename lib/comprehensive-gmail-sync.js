// Comprehensive Gmail sync that fetches ALL emails with pagination
import { google } from 'googleapis';

export class ComprehensiveGmailSync {
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

    // Set credentials from tokens
    setCredentials(tokens) {
        this.setupOAuth2();
        this.oauth2Client.setCredentials(tokens);
        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    // Get ALL emails with pagination
    async getAllEmails() {
        try {
            if (!this.gmail) {
                throw new Error('Gmail API not initialized. Please authenticate first.');
            }

            console.log('📧 Starting comprehensive email sync...');
            
            let allEmails = [];
            let nextPageToken = null;
            let pageCount = 0;
            const maxPages = 50; // Limit to prevent infinite loops
            const pageSize = 500; // Max allowed by Gmail API

            do {
                pageCount++;
                console.log(`📧 Fetching page ${pageCount}...`);
                
                const response = await this.gmail.users.messages.list({
                    userId: 'me',
                    maxResults: pageSize,
                    pageToken: nextPageToken
                });

                const messages = response.data.messages || [];
                console.log(`📧 Found ${messages.length} messages on page ${pageCount}`);

                // Process emails in batches to avoid rate limits
                const batchSize = 10;
                for (let i = 0; i < messages.length; i += batchSize) {
                    const batch = messages.slice(i, i + batchSize);
                    const batchPromises = batch.map(message => this.getEmailDetails(message.id));
                    
                    try {
                        const batchEmails = await Promise.all(batchPromises);
                        const validEmails = batchEmails.filter(email => email !== null);
                        allEmails.push(...validEmails);
                        console.log(`📧 Processed batch ${Math.floor(i/batchSize) + 1}, total emails: ${allEmails.length}`);
                    } catch (error) {
                        console.error(`Error processing batch:`, error.message);
                    }
                    
                    // Small delay to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                nextPageToken = response.data.nextPageToken;
                
                // Safety check to prevent infinite loops
                if (pageCount >= maxPages) {
                    console.log(`⚠️ Reached maximum page limit (${maxPages}), stopping sync`);
                    break;
                }

            } while (nextPageToken);

            console.log(`✅ Comprehensive sync complete! Total emails: ${allEmails.length}`);
            return allEmails;

        } catch (error) {
            console.error('Error in comprehensive email sync:', error);
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
