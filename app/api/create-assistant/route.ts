import { NextRequest, NextResponse } from 'next/server';
import { VapiClient } from '@vapi-ai/server-sdk';

export async function POST(request: NextRequest) {
  try {
    const privateKey = process.env.VAPI_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'VAPI private key not configured' },
        { status: 500 }
      );
    }

    const vapi = new VapiClient({
      token: privateKey,
    });

    console.log('Creating assistant with VAPI server SDK...');

    const assistant = await vapi.assistants.create({
      name: "Voice Agent Assistant",
      firstMessage: "Hello! I'm your AI voice assistant. How can I help you today?",
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant. Keep your responses conversational and concise. Ask follow-up questions to better understand how you can help the user."
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
    });

    console.log('Assistant created:', assistant.id);

    return NextResponse.json({ 
      assistantId: assistant.id,
      success: true 
    });

  } catch (error: any) {
    console.error('Error creating assistant:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create assistant',
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
