import { NextRequest, NextResponse } from 'next/server';

// CORS handler
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Demo authentication endpoint that simulates OAuth
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      );
    }

    // Simulate successful OAuth with demo tokens
    const demoTokens = {
      access_token: `demo_access_token_${Date.now()}`,
      refresh_token: `demo_refresh_token_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
    };

    console.log(`✅ Demo auth successful for ${userEmail}`);

    return NextResponse.json({
      success: true,
      tokens: demoTokens,
      userEmail: userEmail,
      isDemo: true,
      message: 'Demo authentication successful - ready to sync emails',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error: any) {
    console.error('❌ Demo auth error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Demo Authentication API',
    description: 'Simulates Google OAuth for testing without real credentials',
    usage: 'POST with userEmail to get demo tokens',
  });
}
