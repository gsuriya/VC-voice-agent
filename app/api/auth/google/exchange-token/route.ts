import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: 'No authorization code provided' 
      }, { status: 400 });
    }

    console.log('Exchanging code for tokens...');
    
    const googleAPI = new GoogleAPIService();
    const tokens = await googleAPI.getTokens(code);
    
    // Get user email
    googleAPI.setCredentials(tokens);
    const userEmail = await googleAPI.getUserEmail();

    console.log('Token exchange successful for:', userEmail);

    return NextResponse.json({
      success: true,
      tokens: tokens,
      userEmail: userEmail
    });

  } catch (error) {
    console.error('Error in token exchange:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Token exchange failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
