import { NextRequest, NextResponse } from 'next/server';
import { getEmailScheduler } from '@/lib/email-scheduler';

export async function POST(request: NextRequest) {
  try {
    const { action, tokens, interval } = await request.json();
    const scheduler = getEmailScheduler();

    if (action === 'start') {
      scheduler.start(tokens);
      return NextResponse.json({ 
        success: true, 
        message: 'Email scheduler started successfully' 
      });
    } else if (action === 'stop') {
      scheduler.stop();
      return NextResponse.json({ 
        success: true, 
        message: 'Email scheduler stopped successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in scheduler API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const scheduler = getEmailScheduler();
    const status = scheduler.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}