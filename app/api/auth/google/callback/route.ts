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

    // For popup auth flow, we'll create a page that stores tokens and closes
    const tokenString = encodeURIComponent(JSON.stringify(tokens));
    const emailString = encodeURIComponent(userEmail);
    
    // Create a simple HTML page that stores tokens and closes the popup
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authentication Success</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                padding: 40px; 
                text-align: center; 
                background: #f5f5f5;
            }
            .success { 
                background: #e7f5e7; 
                border: 1px solid #4caf50; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 20px auto; 
                max-width: 400px;
            }
        </style>
    </head>
    <body>
        <div class="success">
            <h2>✅ Authentication Successful!</h2>
            <p>Gmail account connected: <strong>${userEmail}</strong></p>
            <p>You can now close this window and sync your emails.</p>
        </div>
        
        <script>
            // Simple approach - just redirect with tokens in URL
            const redirectUrl = 'http://localhost:3000/auth-success?tokens=' + 
                              encodeURIComponent('${JSON.stringify(tokens)}') + 
                              '&email=' + encodeURIComponent('${userEmail}');
            
            // Redirect after showing success
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        </script>
    </body>
    </html>`;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/email-agent?error=callback_failed`
    );
  }
}
