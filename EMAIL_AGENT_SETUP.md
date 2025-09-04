# Email Agent Setup Guide

This guide will help you set up the AI-powered email agent that can automatically respond to emails and manage your calendar.

## Features

- **Gmail Integration**: Read and send emails automatically
- **Google Calendar Integration**: Check availability and schedule meetings
- **AI-Powered Responses**: Intelligent email parsing and response generation
- **Automatic Scheduling**: Find available time slots and send calendar invites
- **Dashboard Interface**: Monitor and manage the email agent

## Prerequisites

1. **Google Cloud Console Project**
2. **OpenAI API Key**
3. **Node.js and npm installed**

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Gmail API
   - Google Calendar API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)

### 2. Environment Variables

1. Copy `env.example` to `.env.local`
2. Fill in the following variables:

```env
# Google API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add the key to your `.env.local` file

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## How to Use

### 1. Connect Google Services

1. Navigate to `/email-agent` in your browser
2. Click "Connect Gmail & Calendar"
3. Authorize the application to access your Gmail and Calendar
4. The agent will now be connected and ready to use

### 2. Configure the Agent

The email agent can handle several types of emails:

- **Schedule Meeting Requests**: Automatically finds available time slots
- **Availability Requests**: Responds with your available times
- **General Inquiries**: Sends appropriate responses based on content

### 3. Monitor Activity

Use the dashboard to:
- View agent status and statistics
- See recent emails processed
- Send test emails
- Monitor response activity

## Email Agent Capabilities

### Automatic Email Processing

The agent analyzes incoming emails to determine:
- **Intent**: What the sender wants (meeting, information, etc.)
- **Urgency**: How quickly a response is needed
- **Context**: Company, sender name, meeting type, etc.

### Smart Scheduling

When someone requests a meeting:
1. Analyzes the email for preferred dates/times
2. Checks your Google Calendar for availability
3. Finds suitable time slots
4. Responds with available options
5. Can automatically create calendar events

### Response Generation

The AI generates contextually appropriate responses:
- Professional and concise
- Matches your communication style
- Includes relevant information
- Handles different types of requests appropriately

## API Endpoints

### Authentication
- `GET /api/auth/google` - Get Google OAuth URL
- `POST /api/auth/google` - Exchange code for tokens

### Email Agent
- `POST /api/email-agent` - Process emails or send test emails
- `GET /api/email-agent` - Get agent status

## Security Considerations

1. **Token Storage**: In production, store OAuth tokens securely in a database
2. **API Keys**: Never commit API keys to version control
3. **Permissions**: The agent only requests necessary Gmail and Calendar permissions
4. **Rate Limiting**: Implement rate limiting for API calls

## Troubleshooting

### Common Issues

1. **"Command not found: pnpm"**
   - Use `npm install` and `npm run dev` instead

2. **Google API Errors**
   - Verify your OAuth credentials are correct
   - Check that required APIs are enabled
   - Ensure redirect URI matches exactly

3. **OpenAI API Errors**
   - Verify your API key is valid
   - Check your OpenAI account has sufficient credits

4. **Permission Errors**
   - Make sure you've granted all necessary permissions during OAuth flow
   - Try disconnecting and reconnecting

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure all required APIs are enabled in Google Cloud Console
4. Check that your OpenAI API key has sufficient credits

## Production Deployment

For production deployment:

1. Update redirect URIs in Google Cloud Console
2. Set production environment variables
3. Use a secure database for token storage
4. Implement proper error handling and logging
5. Set up monitoring and alerts

## Customization

You can customize the email agent by:

1. **Modifying Response Templates**: Edit the response generation logic in `lib/email-agent.ts`
2. **Adding New Intent Types**: Extend the email analysis to handle new types of requests
3. **Customizing Scheduling Logic**: Modify availability checking and meeting creation
4. **UI Customization**: Update the dashboard components to match your preferences

## Support

For additional help or feature requests, please refer to the project documentation or create an issue in the repository.

