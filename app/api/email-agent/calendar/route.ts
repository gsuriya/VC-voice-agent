import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';

const googleAPI = new GoogleAPIService();

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    // Get calendar availability
    const availability = await googleAPI.getCalendarAvailability();
    
    if (!availability) {
      return NextResponse.json({ 
        availability: "Unable to access calendar. Please ensure you're connected to Google Calendar." 
      });
    }

    // Format the availability response
    let response = "📅 Calendar Availability:\n\n";
    
    if (availability.busy && availability.busy.length > 0) {
      response += "Busy times:\n";
      availability.busy.forEach((busy: any) => {
        const start = new Date(busy.start).toLocaleString();
        const end = new Date(busy.end).toLocaleString();
        response += `• ${start} - ${end}\n`;
      });
    } else {
      response += "No busy times found in the next 7 days.\n";
    }

    if (availability.free && availability.free.length > 0) {
      response += "\nFree times:\n";
      availability.free.forEach((free: any) => {
        const start = new Date(free.start).toLocaleString();
        const end = new Date(free.end).toLocaleString();
        response += `• ${start} - ${end}\n`;
      });
    }

    return NextResponse.json({ 
      availability: response 
    });
    
  } catch (error) {
    console.error('Calendar error:', error);
    return NextResponse.json(
      { error: 'Failed to access calendar' },
      { status: 500 }
    );
  }
}
