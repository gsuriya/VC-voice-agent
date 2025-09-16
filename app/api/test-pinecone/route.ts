import { NextRequest, NextResponse } from 'next/server';
import { 
  testPineconeConnection, 
  getIndexStats, 
  storeVector,
  searchVectors 
} from '@/lib/vector-service';

// CORS handler
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Pinecone setup...');
    
    // Test basic connection
    const connectionTest = await testPineconeConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: connectionTest.error,
        message: connectionTest.message,
      }, { status: 500 });
    }
    
    // Get index statistics
    const stats = await getIndexStats();
    
    return NextResponse.json({
      success: true,
      message: 'Pinecone is working perfectly! 🎉',
      connectionTest,
      indexStats: stats,
      setup: {
        indexName: process.env.PINECONE_INDEX_NAME || 'email-vectors',
        hasApiKey: !!process.env.PINECONE_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error: any) {
    console.error('❌ Pinecone test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Pinecone test failed. Check your configuration.',
      troubleshooting: {
        checkApiKey: 'Verify PINECONE_API_KEY in environment variables',
        checkIndex: 'Ensure your Pinecone index exists and is active',
        checkOpenAI: 'Verify OPENAI_API_KEY for embeddings',
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, text, metadata, namespace, filter } = body;
    
    switch (action) {
      case 'store_test_email':
        // Store a test email vector
        if (!text) {
          return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }
        
        const testId = `test-email-${Date.now()}`;
        await storeVector(testId, text, {
          type: 'test-email',
          from: metadata?.from || 'test@example.com',
          subject: metadata?.subject || 'Test Email',
          ...metadata,
        });
        
        return NextResponse.json({
          success: true,
          message: 'Test email stored successfully',
          id: testId,
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
        
      case 'search_emails':
        // Search for emails
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }
        
        const results = await searchVectors(query, 10, filter || {}, namespace);
        
        return NextResponse.json({
          success: true,
          query,
          results: results.map(result => ({
            id: result.id,
            score: result.score,
            metadata: result.metadata,
          })),
          count: results.length,
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
    }
    
  } catch (error: any) {
    console.error('❌ Pinecone API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}
