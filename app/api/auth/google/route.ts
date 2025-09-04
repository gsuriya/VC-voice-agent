import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';

export async function GET(request: NextRequest) {
  try {
    const googleAPI = new GoogleAPIService();
    const authUrl = googleAPI.getAuthUrl();
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}

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
    
    // In a real application, you'd store these tokens securely
    // For now, we'll return them (in production, store in database)
    return NextResponse.json({ 
      success: true, 
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      }
    });
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.json(
      { error: 'Failed to exchange authorization code' },
      { status: 500 }
    );
  }
}

