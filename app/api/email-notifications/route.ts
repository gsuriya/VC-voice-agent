import { NextRequest, NextResponse } from 'next/server';

// Endpoint for extension to check for new email notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lastCheck = searchParams.get('lastCheck');
    
    // Get the latest notification from global storage
    const notification = global.latestEmailNotification;
    
    if (!notification) {
      return NextResponse.json({ hasNotification: false });
    }
    
    // If lastCheck is provided, only return notifications newer than that
    if (lastCheck && notification.timestamp <= parseInt(lastCheck)) {
      return NextResponse.json({ hasNotification: false });
    }
    
    return NextResponse.json({
      hasNotification: true,
      notification: {
        emailAddress: notification.emailAddress,
        historyId: notification.historyId,
        timestamp: notification.timestamp
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking email notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Clear notification after extension has processed it
export async function DELETE(request: NextRequest) {
  try {
    global.latestEmailNotification = null;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error clearing notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
