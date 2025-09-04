import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // In a real application, you'd save these to a database
    // For now, we'll just return success
    console.log('Settings saved:', settings);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real application, you'd fetch from a database
    // For now, return default settings
    const defaultSettings = {
      autoRespondToEdu: false,
      eduResponseTemplate: `Hi there,

Thank you for reaching out! I'm currently focused on my startup and have limited availability for new opportunities.

If this is regarding a potential collaboration or investment opportunity, please feel free to schedule a brief call using my calendar link: [CALENDAR_LINK]

For other inquiries, I'll do my best to respond when time permits.

Best regards,
[YOUR_NAME]`,
      autoProcessEmails: false,
      checkInterval: 15,
      enabledDomains: ['.edu'],
      customResponseTemplates: {
        '.edu': `Hi there,

Thank you for reaching out! I'm currently focused on my startup and have limited availability for new opportunities.

If this is regarding a potential collaboration or investment opportunity, please feel free to schedule a brief call using my calendar link: [CALENDAR_LINK]

For other inquiries, I'll do my best to respond when time permits.

Best regards,
[YOUR_NAME]`
      }
    };
    
    return NextResponse.json({ settings: defaultSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

