import { NextRequest, NextResponse } from 'next/server';
import { VapiClient } from '@vapi-ai/server-sdk';
import fs from 'fs/promises';
import path from 'path';

const CONTACTS_FILE = path.join(process.cwd(), 'data', 'contacts.json');

interface Contact {
  id: string;
  name: string;
  phone: string;
  company?: string;
  createdAt: string;
  lastCalled?: string;
  callCount: number;
}

async function updateContactCallInfo(contactId: string): Promise<void> {
  try {
    const data = await fs.readFile(CONTACTS_FILE, 'utf8');
    const contacts: Contact[] = JSON.parse(data);
    
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      contacts[contactIndex].lastCalled = new Date().toISOString();
      contacts[contactIndex].callCount += 1;
      
      await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    }
  } catch (error) {
    console.error('Error updating contact call info:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, contactId, contactName } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Format phone number to E.164 format for VAPI
    let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
    
    // If it's a 10-digit US number, add +1
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } 
    // If it's 11 digits starting with 1, add +
    else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = `+${formattedPhone}`;
    }
    // If it doesn't start with +, add it
    else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    console.log(`Original: ${phoneNumber}, Formatted: ${formattedPhone}`);

    const privateKey = process.env.VAPI_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: 'VAPI private key not configured' }, { status: 500 });
    }

    // Initialize VAPI client
    const vapi = new VapiClient({
      token: privateKey,
    });

    console.log(`Making call to ${formattedPhone} (${contactName || 'Unknown'})...`);

    // Make the real outbound call using your VAPI phone number
    const call = await vapi.calls.create({
      type: 'outboundPhoneCall',
      phoneNumberId: 'd032e66a-1f42-4836-9115-24e8a8b2c8e1', // Your VAPI phone number ID
      customer: {
        number: formattedPhone,
        name: contactName || 'Contact',
      },
      assistantId: '689ee057-17d1-4ab0-81ba-c8f9a21a7783', // Riley assistant ID
    });

    console.log('Real call initiated:', call.id);

    // Update contact call information
    if (contactId) {
      await updateContactCallInfo(contactId);
    }

          return NextResponse.json({ 
        success: true,
        callId: call.id,
        message: `Real call initiated to ${formattedPhone}! Riley will ask: "Hi! What college do you go to?"`,
        call: call
      });

  } catch (error: any) {
    console.error('Error making call:', error);
    
    // Handle specific VAPI errors
    if (error.statusCode === 400) {
      return NextResponse.json({ 
        error: 'Bad request - check phone number format or configuration',
        details: error.body || error.message 
      }, { status: 400 });
    }
    
    if (error.statusCode === 401) {
      return NextResponse.json({ 
        error: 'Unauthorized - check VAPI credentials' 
      }, { status: 401 });
    }

    return NextResponse.json({
      error: 'Failed to make call',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
