import { NextRequest, NextResponse } from 'next/server';
import { GoogleAPIService } from '@/lib/google-apis';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tokens, to, subject, body: emailBody, emailId, originalEmail } = body;
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Google API tokens are required' },
        { status: 400 }
      );
    }

    const googleAPI = new GoogleAPIService();
    googleAPI.setCredentials(tokens);

    switch (action) {
      case 'get_emails':
        const emails = await googleAPI.getUnreadEmails(10);
        return NextResponse.json({ emails });

      case 'send_email':
        if (!to || !subject || !emailBody) {
          return NextResponse.json(
            { error: 'to, subject, and body are required' },
            { status: 400 }
          );
        }
        
        const result = await googleAPI.sendEmail(to, subject, emailBody);
        return NextResponse.json({ 
          success: true, 
          messageId: result.id 
        });

      case 'auto_respond':
        
        // Generate AI response
        const aiResponse = await generateAIResponse(originalEmail);
        
        // Send response
        const responseResult = await googleAPI.sendEmail(
          originalEmail.from,
          `Re: ${originalEmail.subject}`,
          aiResponse
        );
        
        return NextResponse.json({
          success: true,
          response: aiResponse,
          messageId: responseResult.id
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in email agent API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateAIResponse(email: any): Promise<string> {
  try {
    const prompt = `
You are an intelligent email assistant. Generate a professional and contextually appropriate response to the following email:

From: ${email.from}
Subject: ${email.subject}
Content: ${email.snippet}

Generate a helpful, professional response that:
1. Acknowledges the sender's message
2. Provides relevant information or next steps
3. Maintains a professional but friendly tone
4. Is concise but complete

Response:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional email assistant. Generate concise, helpful email responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || "Thank you for your email. I'll get back to you soon.";
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "Thank you for your email. I'll get back to you soon.";
  }
}
