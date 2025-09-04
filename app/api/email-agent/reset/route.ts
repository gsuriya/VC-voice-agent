import { NextRequest, NextResponse } from 'next/server';
import { getEmailTracker } from '@/lib/email-tracker';

export async function POST(request: NextRequest) {
  try {
    const tracker = getEmailTracker();
    tracker.reset();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email tracker reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting email tracker:', error);
    return NextResponse.json(
      { error: 'Failed to reset email tracker' },
      { status: 500 }
    );
  }
}
