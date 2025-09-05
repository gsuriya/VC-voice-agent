import { NextRequest, NextResponse } from 'next/server';
import { RealGmailAPIService } from '@/lib/real-gmail-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('https://mail.google.com?error=oauth_error', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('https://mail.google.com?error=no_code', request.url));
    }

    const gmailAPI = new RealGmailAPIService();
    gmailAPI.setupOAuth2();
    
    // Exchange code for tokens
    const { tokens } = await gmailAPI.oauth2Client.getToken(code);
    
    // Store tokens in localStorage via JavaScript
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    };
    
    // Create a page that stores tokens in localStorage and redirects to Gmail
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>JARVIS Authentication</title>
      </head>
      <body>
        <h2>JARVIS Authentication Complete!</h2>
        <p>Storing your Gmail credentials...</p>
        <script>
          try {
            localStorage.setItem('gmail_tokens', '${JSON.stringify(tokenData)}');
            console.log('✅ JARVIS: Tokens stored successfully');
            window.location.href = 'https://mail.google.com';
          } catch (error) {
            console.error('❌ JARVIS: Failed to store tokens:', error);
            alert('Authentication failed. Please try again.');
            window.location.href = 'https://mail.google.com';
          }
        </script>
      </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(new URL('https://mail.google.com?error=callback_error', request.url));
  }
}
