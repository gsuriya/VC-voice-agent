import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';

// GET: Redirect to Google OAuth
export async function GET(request: NextRequest) {
  try {
    const googleAPI = new GoogleAPIService();
    const authUrl = googleAPI.getAuthUrl();
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}

// POST: Exchange code for tokens
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const googleAPI = new GoogleAPIService();
    const tokens = await googleAPI.getTokens(code);
    
    // Get user email for verification
    googleAPI.setCredentials(tokens);
    const userEmail = await googleAPI.getUserEmail();

    return NextResponse.json({
      success: true,
      tokens,
      userEmail
    });
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.json(
      { error: 'Failed to exchange code for tokens' },
      { status: 500 }
    );
  }
}
