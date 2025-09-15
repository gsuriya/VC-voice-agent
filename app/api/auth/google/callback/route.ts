import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Redirect to frontend with error
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/email-agent?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/email-agent?error=no_code`
      );
    }

    const googleAPI = new GoogleAPIService();
    const tokens = await googleAPI.getTokens(code);
    
    // Get user email
    googleAPI.setCredentials(tokens);
    const userEmail = await googleAPI.getUserEmail();

    // Store tokens in session/cookie (for now, redirect with tokens)
    // In production, you'd want to store these securely in a database
    const tokenString = encodeURIComponent(JSON.stringify(tokens));
    
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/email-agent?tokens=${tokenString}&email=${encodeURIComponent(userEmail)}`
    );
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/email-agent?error=callback_failed`
    );
  }
}
