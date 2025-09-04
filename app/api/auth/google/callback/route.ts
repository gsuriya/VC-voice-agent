import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/email-agent?error=oauth_error', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/email-agent?error=no_code', request.url));
    }

    const googleAPI = new GoogleAPIService();
    const tokens = await googleAPI.getTokens(code);
    
    // Store tokens in a secure way - for now we'll pass them via URL params
    // In production, store these in a database with proper encryption
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    };
    
    const tokenString = encodeURIComponent(JSON.stringify(tokenData));
    return NextResponse.redirect(new URL(`/email-agent?success=true&tokens=${tokenString}`, request.url));
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(new URL('/email-agent?error=callback_error', request.url));
  }
}
