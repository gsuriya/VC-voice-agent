// API endpoint to sync emails from Gmail
import { ComprehensiveGmailSync } from '../../../lib/comprehensive-gmail-sync';
import { emailStorage } from '../../../lib/shared-email-storage';

export async function POST(request) {
    try {
        console.log('🔄 Starting email sync...');
        
        const { tokens } = await request.json();
        
        if (!tokens) {
            return Response.json(
                { error: 'Gmail authentication required. Please connect your Gmail account first.' },
                { 
                    status: 401,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    }
                }
            );
        }
        
        const gmailAPI = new ComprehensiveGmailSync();
        gmailAPI.setCredentials(tokens);
        
        // Test connection first
        const testResult = await gmailAPI.testConnection();
        if (!testResult.success) {
            return Response.json(
                { error: 'Gmail connection failed', details: testResult.error },
                { 
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    }
                }
            );
        }
        
        // Get ALL emails from Gmail with pagination
        const emails = await gmailAPI.getAllEmails();
        console.log(`📧 Retrieved ${emails.length} emails from Gmail`);
        
        // Store emails
        emailStorage.storeEmails(emails);
        
        const stats = emailStorage.getStats();
        
        return Response.json({
            success: true,
            message: `Synced ${emails.length} emails from ${testResult.email}`,
            stats: stats,
            gmailInfo: {
                email: testResult.email,
                totalMessages: testResult.messagesTotal
            }
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
        
    } catch (error) {
        console.error('Email sync error:', error);
        return Response.json(
            { error: 'Failed to sync emails', details: error.message },
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}

export async function GET(request) {
    try {
        const stats = emailStorage.getStats();
        return Response.json({
            success: true,
            stats: stats
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return Response.json(
            { error: 'Failed to get stats' },
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}

export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
