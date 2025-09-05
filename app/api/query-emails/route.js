// API endpoint for semantic email queries
import { emailStorage } from '../../../lib/shared-email-storage';
import GPTSemanticSearch from '../../../lib/gpt-semantic-search';

// Global instances
const gptSearch = new GPTSemanticSearch();

export async function POST(request) {
    try {
        const { query } = await request.json();
        
        if (!query) {
            return Response.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }
        
        console.log(`🤖 Processing query: "${query}"`);
        
        // Use Supabase semantic search to find relevant emails
        const relevantEmails = await emailStorage.searchEmails(query, 15);
        
        if (relevantEmails.length === 0) {
            return Response.json({
                success: true,
                result: "No emails found matching your query. Please sync your emails first by calling /api/sync-emails"
            });
        }
        
        // Use GPT to process the query with relevant emails
        const result = await gptSearch.answerQuestion(relevantEmails, query);
        
        // Get total email count
        const stats = await emailStorage.getStats();
        
        return Response.json({
            success: true,
            result: result,
            emailCount: relevantEmails.length,
            totalEmails: stats.totalEmails
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
        
    } catch (error) {
        console.error('Query error:', error);
        return Response.json(
            { error: 'Failed to process query', details: error.message },
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
        const stats = await emailStorage.getStats();
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
