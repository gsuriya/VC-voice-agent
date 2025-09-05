// Gmail authentication API
import { RealGmailAPIService } from '../../../lib/real-gmail-api';

export async function GET(request) {
    try {
        const gmailAPI = new RealGmailAPIService();
        const authUrl = gmailAPI.getAuthUrl();
        
        return Response.json({
            success: true,
            authUrl: authUrl
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (error) {
        console.error('Gmail auth error:', error);
        return Response.json(
            { error: 'Failed to get auth URL', details: error.message },
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

export async function POST(request) {
    try {
        const { code } = await request.json();
        
        if (!code) {
            return Response.json(
                { error: 'Authorization code is required' },
                { status: 400 }
            );
        }

        const gmailAPI = new RealGmailAPIService();
        gmailAPI.setupOAuth2();
        
        // Exchange code for tokens
        const { tokens } = await gmailAPI.oauth2Client.getToken(code);
        gmailAPI.setCredentials(tokens);
        
        // Test connection
        const testResult = await gmailAPI.testConnection();
        
        if (testResult.success) {
            return Response.json({
                success: true,
                message: 'Gmail connected successfully',
                email: testResult.email,
                messagesTotal: testResult.messagesTotal,
                tokens: tokens
            }, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });
        } else {
            return Response.json(
                { error: 'Failed to connect to Gmail', details: testResult.error },
                { status: 500 }
            );
        }
        
    } catch (error) {
        console.error('Gmail token exchange error:', error);
        return Response.json(
            { error: 'Failed to exchange code for tokens', details: error.message },
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
