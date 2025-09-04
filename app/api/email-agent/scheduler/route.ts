import { NextRequest, NextResponse } from 'next/server';
import { getEmailScheduler } from '@/lib/email-scheduler';

export async function POST(request: NextRequest) {
  try {
    const { action, interval, tokens } = await request.json();
    const scheduler = getEmailScheduler();

    switch (action) {
      case 'start':
        if (!tokens) {
          return NextResponse.json(
            { error: 'Google API tokens are required' },
            { status: 400 }
          );
        }
        
        scheduler.setCredentials(tokens);
        scheduler.start(interval || 1);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Email scheduler started',
          status: scheduler.getStatus()
        });

      case 'stop':
        scheduler.stop();
        return NextResponse.json({ 
          success: true, 
          message: 'Email scheduler stopped',
          status: scheduler.getStatus()
        });

      case 'update_interval':
        if (!interval) {
          return NextResponse.json(
            { error: 'Interval is required' },
            { status: 400 }
          );
        }
        
        scheduler.updateInterval(interval);
        return NextResponse.json({ 
          success: true, 
          message: 'Interval updated',
          status: scheduler.getStatus()
        });

      case 'process_now':
        if (!tokens) {
          return NextResponse.json(
            { error: 'Google API tokens are required' },
            { status: 400 }
          );
        }
        
        scheduler.setCredentials(tokens);
        await scheduler.processEmails();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Emails processed successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
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

export async function GET(request: NextRequest) {
  try {
    const scheduler = getEmailScheduler();
    const status = scheduler.getStatus();
    
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
