import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '../../../lib/google-apis';

export async function POST(request: NextRequest) {
  try {
    const { tokens, action, topicName } = await request.json();

    if (!tokens) {
      return NextResponse.json(
        { error: 'Google API tokens are required' },
        { status: 400 }
      );
    }

    const googleAPI = new GoogleAPIService();
    googleAPI.setCredentials(tokens);

    switch (action) {
      case 'setup_watch':
        const defaultTopic = topicName || process.env.GMAIL_PUBSUB_TOPIC || 'projects/vc-voice-agent/topics/gmail-notifications';
        const watchResult = await googleAPI.setupGmailWatch(defaultTopic);
        
        return NextResponse.json({
          success: true,
          data: watchResult
        });

      case 'stop_watch':
        const stopResult = await googleAPI.stopGmailWatch();
        
        return NextResponse.json({
          success: true,
          data: stopResult
        });

      case 'get_history':
        const { startHistoryId } = await request.json();
        if (!startHistoryId) {
          return NextResponse.json(
            { error: 'startHistoryId is required for history' },
            { status: 400 }
          );
        }

        const historyResult = await googleAPI.getGmailHistory(startHistoryId);
        
        return NextResponse.json({
          success: true,
          data: historyResult
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Gmail watch API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Get current watch status
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Gmail Watch API endpoint',
    endpoints: {
      'POST /api/gmail-watch': {
        actions: ['setup_watch', 'stop_watch', 'get_history'],
        requires: 'tokens (Google OAuth tokens)'
      }
    }
  });
}
