// Gmail Email AI Assistant - Background Script
class EmailAIBackground {
  constructor() {
    this.openaiApiKey = null;
    this.googleTokens = null;
    this.autoRespondEnabled = true;
    this.processedEmails = new Set();
    this.startTime = new Date();
    
    this.init();
  }

  async init() {
    // Load stored settings
    await this.loadSettings();
    
    // Setup message listeners
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Setup OAuth listener
    chrome.identity.onSignInChanged.addListener((account, signedIn) => {
      if (signedIn) {
        this.handleSignIn(account);
      }
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'openaiApiKey',
        'googleTokens',
        'autoRespondEnabled',
        'processedEmails'
      ]);
      
      this.openaiApiKey = result.openaiApiKey;
      this.googleTokens = result.googleTokens;
      this.autoRespondEnabled = result.autoRespondEnabled ?? true;
      this.processedEmails = new Set(result.processedEmails || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        openaiApiKey: this.openaiApiKey,
        googleTokens: this.googleTokens,
        autoRespondEnabled: this.autoRespondEnabled,
        processedEmails: Array.from(this.processedEmails)
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'processCommand':
          const result = await this.processCommand(request.message, request.emailData);
          sendResponse({ result });
          break;
          
        case 'toggleAutoRespond':
          this.autoRespondEnabled = request.enabled;
          await this.saveSettings();
          sendResponse({ success: true });
          break;
          
        case 'authenticate':
          await this.authenticate();
          sendResponse({ success: true });
          break;
          
        case 'getStatus':
          sendResponse({
            authenticated: !!this.googleTokens,
            autoRespondEnabled: this.autoRespondEnabled,
            openaiConfigured: !!this.openaiApiKey
          });
          break;
          
        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async processCommand(message, emailData) {
    if (!this.openaiApiKey) {
      return "Please configure your OpenAI API key in the extension settings.";
    }

    try {
      // Determine command type and process accordingly
      const commandType = this.analyzeCommand(message);
      
      switch (commandType.type) {
        case 'summarize':
          return await this.summarizeEmails(commandType.params);
          
        case 'draft':
          return await this.draftEmail(commandType.params, emailData);
          
        case 'availability':
          return await this.checkAvailability(commandType.params);
          
        case 'auto_respond':
          return await this.handleAutoRespond(commandType.params);
          
        case 'general':
          return await this.handleGeneralQuery(message, emailData);
          
        default:
          return "I'm not sure how to help with that. Try asking me to summarize emails, draft a response, or check your availability.";
      }
    } catch (error) {
      console.error('Error processing command:', error);
      return "Sorry, I encountered an error processing your request. Please try again.";
    }
  }

  analyzeCommand(message) {
    const lowerMessage = message.toLowerCase();
    
    // Summarize commands
    if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
      const person = this.extractPersonName(message);
      return { type: 'summarize', params: { person } };
    }
    
    // Draft commands
    if (lowerMessage.includes('draft') || lowerMessage.includes('write') || lowerMessage.includes('compose')) {
      const person = this.extractPersonName(message) || emailData?.sender;
      return { type: 'draft', params: { person, context: message } };
    }
    
    // Availability commands
    if (lowerMessage.includes('availability') || lowerMessage.includes('available') || lowerMessage.includes('schedule')) {
      const timeRange = this.extractTimeRange(message);
      return { type: 'availability', params: { timeRange } };
    }
    
    // Auto-respond commands
    if (lowerMessage.includes('auto respond') || lowerMessage.includes('auto-respond')) {
      return { type: 'auto_respond', params: { enabled: !lowerMessage.includes('disable') } };
    }
    
    return { type: 'general', params: { message } };
  }

  extractPersonName(message) {
    // Simple name extraction - could be improved with NLP
    const patterns = [
      /from\s+([a-zA-Z\s]+)/i,
      /to\s+([a-zA-Z\s]+)/i,
      /with\s+([a-zA-Z\s]+)/i,
      /about\s+([a-zA-Z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  extractTimeRange(message) {
    if (message.includes('next week')) return 'week';
    if (message.includes('tomorrow')) return 'tomorrow';
    if (message.includes('today')) return 'today';
    if (message.includes('next month')) return 'month';
    return 'week'; // default
  }

  async summarizeEmails(params) {
    if (!this.googleTokens) {
      return "Please authenticate with Google to access your emails.";
    }

    try {
      // Get recent emails
      const emails = await this.getRecentEmails(20);
      
      // Filter by person if specified
      let filteredEmails = emails;
      if (params.person) {
        filteredEmails = emails.filter(email => 
          email.from.toLowerCase().includes(params.person.toLowerCase())
        );
      }
      
      if (filteredEmails.length === 0) {
        return params.person 
          ? `No recent emails found from ${params.person}.`
          : "No recent emails found.";
      }
      
      // Create summary prompt
      const emailTexts = filteredEmails.slice(0, 5).map(email => 
        `From: ${email.from}\nSubject: ${email.subject}\nDate: ${email.date}\nBody: ${email.body.substring(0, 200)}...`
      ).join('\n\n');
      
      const prompt = `You are Pranav's email assistant. Summarize these recent emails in a helpful way:

${emailTexts}

Provide a concise summary highlighting:
1. Key topics and requests
2. Important dates or deadlines
3. Action items needed
4. Any urgent matters

Keep it professional and actionable.`;

      const summary = await this.callOpenAI(prompt);
      return summary;
      
    } catch (error) {
      console.error('Error summarizing emails:', error);
      return "Sorry, I couldn't access your emails. Please make sure you're authenticated.";
    }
  }

  async draftEmail(params, emailData) {
    const prompt = `You are Pranav, a student at NYU Stern. Draft a professional email response.

Context: ${params.context || 'General follow-up'}

${emailData ? `
Original Email Details:
From: ${emailData.sender}
Subject: ${emailData.subject}
Date: ${emailData.date}
Body: ${emailData.body.substring(0, 500)}...
` : ''}

Draft a professional response that:
1. Is appropriate for the context
2. Maintains a professional tone
3. Ends with "Best, Pranav"
4. Is concise but complete

Just provide the email content, no additional commentary.`;

    const draft = await this.callOpenAI(prompt);
    return `Here's a draft email:\n\n${draft}`;
  }

  async checkAvailability(params) {
    if (!this.googleTokens) {
      return "Please authenticate with Google to access your calendar.";
    }

    try {
      const availability = await this.getCalendarAvailability(params.timeRange);
      return availability;
    } catch (error) {
      console.error('Error checking availability:', error);
      return "Sorry, I couldn't access your calendar. Please make sure you're authenticated.";
    }
  }

  async handleAutoRespond(params) {
    this.autoRespondEnabled = params.enabled;
    await this.saveSettings();
    
    return params.enabled 
      ? "✅ Auto-respond is now enabled. I'll automatically respond to new .edu emails."
      : "❌ Auto-respond is now disabled.";
  }

  async handleGeneralQuery(message, emailData) {
    const prompt = `You are Pranav's email AI assistant. Help with this request:

User Request: ${message}

${emailData ? `
Current Email Context:
From: ${emailData.sender}
Subject: ${emailData.subject}
Body: ${emailData.body.substring(0, 300)}...
` : ''}

Provide a helpful response as Pranav's assistant. Be professional and actionable.`;

    return await this.callOpenAI(prompt);
  }

  async callOpenAI(prompt) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are Pranav\'s personal email AI assistant. You help manage emails, draft responses, and provide calendar information. Always be professional, helpful, and concise.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async getRecentEmails(maxResults = 20) {
    if (!this.googleTokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: {
        'Authorization': `Bearer ${this.googleTokens.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get detailed email data
    const emails = await Promise.all(
      data.messages.slice(0, 10).map(async (message) => {
        const emailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
          headers: {
            'Authorization': `Bearer ${this.googleTokens.access_token}`
          }
        });
        
        const emailData = await emailResponse.json();
        return this.parseEmailData(emailData);
      })
    );

    return emails;
  }

  parseEmailData(emailData) {
    const headers = emailData.payload.headers;
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
    
    return {
      id: emailData.id,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: getHeader('To'),
      date: getHeader('Date'),
      body: this.extractEmailBody(emailData.payload)
    };
  }

  extractEmailBody(payload) {
    if (payload.body && payload.body.data) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
    }
    
    return '';
  }

  async getCalendarAvailability(timeRange) {
    if (!this.googleTokens) {
      throw new Error('Not authenticated');
    }

    const now = new Date();
    const end = new Date();
    
    switch (timeRange) {
      case 'today':
        end.setHours(23, 59, 59, 999);
        break;
      case 'tomorrow':
        now.setDate(now.getDate() + 1);
        now.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        end.setDate(end.getDate() + 7);
        break;
      case 'month':
        end.setMonth(end.getMonth() + 1);
        break;
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/freeBusy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.googleTokens.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: 'primary' }]
      })
    });

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    const busyTimes = data.calendars.primary.busy || [];
    
    return this.formatAvailability(busyTimes, now, end);
  }

  formatAvailability(busyTimes, start, end) {
    if (busyTimes.length === 0) {
      return "🎉 You're completely free! No scheduled events found.";
    }

    let response = "📅 Here's your availability:\n\n";
    
    // Group by day
    const days = {};
    busyTimes.forEach(busy => {
      const startDate = new Date(busy.start);
      const endDate = new Date(busy.end);
      const dayKey = startDate.toDateString();
      
      if (!days[dayKey]) {
        days[dayKey] = [];
      }
      
      days[dayKey].push({
        start: startDate,
        end: endDate
      });
    });

    Object.keys(days).forEach(day => {
      response += `**${day}**\n`;
      days[day].forEach(event => {
        response += `• ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}\n`;
      });
      response += '\n';
    });

    return response;
  }

  async authenticate() {
    try {
      const token = await chrome.identity.getAuthToken({
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      });

      this.googleTokens = { access_token: token };
      await this.saveSettings();
      
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async handleSignIn(account) {
    console.log('User signed in:', account);
    // Handle sign in if needed
  }
}

// Initialize background script
new EmailAIBackground();

