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
            // Store tokens in localStorage for the parent window
            localStorage.setItem('gmail_tokens', '${JSON.stringify(tokens).replace(/'/g, "\\'")}');
            localStorage.setItem('gmail_user_email', '${userEmail}');
            
            // Send message to Chrome extension via extension messaging
            if (chrome && chrome.runtime) {
                // This is inside a Chrome extension context
                chrome.runtime.sendMessage({
                    action: 'auth_complete',
                    tokens: ${JSON.stringify(tokens)},
                    userEmail: '${userEmail}'
                });
            } else {
                // Fallback: Try to communicate with parent window
                if (window.opener) {
                    try {
                        window.opener.postMessage({
                            type: 'GMAIL_AUTH_SUCCESS',
                            tokens: ${JSON.stringify(tokens)},
                            userEmail: '${userEmail}'
                        }, '*');
                    } catch (error) {
                        console.log('Could not communicate with parent window:', error);
                    }
                }
            }
            
            // Auto-close after 2 seconds
            setTimeout(() => {
                window.close();
            }, 2000);
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
