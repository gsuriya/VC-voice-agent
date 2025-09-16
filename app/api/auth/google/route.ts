import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get('returnTo') || '/gmail-sync';

    // Check if we have Google OAuth credentials
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing Google OAuth credentials');
      
      // Return HTML for popup window with error
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Setup Required</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              padding: 40px; 
              text-align: center;
              background: #f9fafb;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .error { color: #dc2626; margin-bottom: 20px; }
            .steps { text-align: left; margin: 20px 0; }
            .step { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 6px; }
            .close-btn {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🔧 Google OAuth Setup Required</h2>
            <div class="error">
              ❌ Google OAuth credentials are not configured
            </div>
            
            <div class="steps">
              <div class="step">
                <strong>1.</strong> Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a>
              </div>
              <div class="step">
                <strong>2.</strong> Create/select project → Enable Gmail API
              </div>
              <div class="step">
                <strong>3.</strong> Create OAuth 2.0 credentials (Web application)
              </div>
              <div class="step">
                <strong>4.</strong> Add redirect URI: <code>http://localhost:3000/api/auth/google/callback</code>
              </div>
              <div class="step">
                <strong>5.</strong> Add to .env.local:<br>
                <code>GOOGLE_CLIENT_ID=your_client_id</code><br>
                <code>GOOGLE_CLIENT_SECRET=your_client_secret</code>
              </div>
              <div class="step">
                <strong>6.</strong> Restart your dev server
              </div>
            </div>
            
            <button class="close-btn" onclick="window.close()">Close</button>
          </div>
          
          <script>
            // Send error message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'Google OAuth credentials not configured. Please set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local'
              }, window.location.origin);
            }
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );

    // Generate the authorization URL
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: returnTo,
    });

    console.log('🔐 Generated OAuth URL:', authUrl);

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);

  } catch (error: any) {
    console.error('❌ OAuth route error:', error);
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head><title>OAuth Error</title></head>
      <body>
        <h2>OAuth Error</h2>
        <p>Error: ${error.message}</p>
        <button onclick="window.close()">Close</button>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: '${error.message}'
            }, window.location.origin);
          }
        </script>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}