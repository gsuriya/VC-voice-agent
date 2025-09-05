import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'Email intelligence system is working!',
      status: 'online',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    // Simple test response
    return NextResponse.json({ 
      result: `I received your query: "${query}". The email intelligence system is working, but we need to sync your emails first to provide real answers.`,
      status: 'test_mode'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    );
  }
}
