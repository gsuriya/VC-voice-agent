import { NextRequest, NextResponse } from 'next/server';

// Gmail push notification webhook endpoint
export async function POST(request: NextRequest) {
  try {
    // For development, we'll accept requests without strict auth
    // In production, you'd verify the request is from Google
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()));

    const body = await request.json();
    console.log('📧 Gmail push notification received:', body);

    // Extract notification data
    const { message } = body;
    if (!message) {
      return NextResponse.json({ error: 'No message data' }, { status: 400 });
    }

    // Decode the Pub/Sub message
    const data = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : {};
    
    console.log('📬 Gmail notification data:', data);

    // Extract email details
    const { emailAddress, historyId } = data;

    if (emailAddress && historyId) {
      console.log(`📨 New email activity for ${emailAddress}, historyId: ${historyId}`);
      
      // Store notification for extension to pick up
      // In production, you'd use Redis or a database
      // For now, we'll use in-memory storage
      global.latestEmailNotification = {
        emailAddress,
        historyId,
        timestamp: Date.now()
      };
      
      console.log('📬 Email notification stored for extension pickup');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error processing Gmail webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  
  if (challenge) {
    console.log('✅ Gmail webhook verification challenge:', challenge);
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ status: 'Gmail webhook endpoint active' });
}
