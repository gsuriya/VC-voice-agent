// Background service worker for AI Email Agent
console.log('🤖 AI Email Agent background worker started at', new Date().toLocaleTimeString());

// Global variables
let authToken = null;
let isProcessing = false;

// Configuration - Get from environment or storage
const OPENAI_API_KEY = 'sk-proj-vHJrcKFoNUGJ5HDhvTe9d3k8dmtElNFIJpTKWBdg1fCEHv5bQ8kOvJqwMdT3BlbkFJl1aLJpMKrMPK3UEz9cFuuApOoA';
const CHECK_INTERVAL = 60000; // Check every minute

// OAuth and Gmail API functions - Using popup approach
async function authenticate() {
  try {
    console.log('🔐 Starting authentication with popup...');
    
    // Create auth popup that uses the web app
    const authUrl = 'http://localhost:3000/api/auth/google';
    console.log('🌐 Opening popup to:', authUrl);
    
    // Open popup for authentication
    const authWindow = await chrome.windows.create({
      url: authUrl,
      type: 'popup',
      width: 500,
      height: 600,
      focused: true
    });
    
    console.log('🪟 Popup window created:', authWindow.id);
    
    return new Promise((resolve, reject) => {
      // Listen for tab updates to detect successful auth
      const checkAuth = (tabId, changeInfo, tab) => {
        if (tab.windowId === authWindow.id && changeInfo.url) {
          console.log('Tab URL changed:', changeInfo.url);
          
          // Check if we got redirected to email-agent with tokens
          if (changeInfo.url.includes('/email-agent?tokens=')) {
            console.log('✅ Authentication successful!');
            
            // Extract tokens from URL
            const url = new URL(changeInfo.url);
            const tokensParam = url.searchParams.get('tokens');
            
            if (tokensParam) {
              try {
                const tokens = JSON.parse(decodeURIComponent(tokensParam));
        authToken = tokens.access_token;
        
        // Store tokens for later use
        chrome.storage.local.set({ authTokens: tokens });
        
        // Setup Gmail push notifications
        setupGmailPushNotifications(tokens);
        
        // Close the popup
        chrome.windows.remove(authWindow.id);
        chrome.tabs.onUpdated.removeListener(checkAuth);
        
        resolve(tokens.access_token);
              } catch (parseError) {
                console.error('Error parsing tokens:', parseError);
                reject(parseError);
              }
            }
          }
        }
      };
      
      // Listen for window being closed (user cancelled)
      const onWindowRemoved = (windowId) => {
        if (windowId === authWindow.id) {
          chrome.tabs.onUpdated.removeListener(checkAuth);
          chrome.windows.onRemoved.removeListener(onWindowRemoved);
          reject(new Error('Authentication cancelled by user'));
        }
      };
      
      chrome.tabs.onUpdated.addListener(checkAuth);
      chrome.windows.onRemoved.addListener(onWindowRemoved);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(checkAuth);
        chrome.windows.onRemoved.removeListener(onWindowRemoved);
        try {
          chrome.windows.remove(authWindow.id);
        } catch (e) {
          // Window might already be closed
        }
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
}

async function fetchWithAuth(url, options = {}) {
  if (!authToken) {
    // Try to get stored token first
    const stored = await chrome.storage.local.get(['authTokens']);
    if (stored.authTokens && stored.authTokens.access_token) {
      authToken = stored.authTokens.access_token;
    } else {
      await authenticate();
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Token expired, clear stored tokens and re-authenticate
    authToken = null;
    await chrome.storage.local.remove(['authTokens']);
    await authenticate();
    return fetchWithAuth(url, options);
  }
  
  return response;
}

async function getUnreadEmails(maxResults = 10) {
  try {
    const response = await fetchWithAuth(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=${maxResults}`
    );
    
    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.messages) return [];
    
    const emails = [];
    for (const message of data.messages) {
      const emailResponse = await fetchWithAuth(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`
      );
      
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        const headers = emailData.payload.headers;
        
        const fromHeader = headers.find(h => h.name === 'From');
        const subjectHeader = headers.find(h => h.name === 'Subject');
        const dateHeader = headers.find(h => h.name === 'Date');
        
        emails.push({
          id: message.id,
          from: fromHeader?.value || 'Unknown',
          subject: subjectHeader?.value || 'No Subject',
          snippet: emailData.snippet,
          date: dateHeader?.value || new Date().toISOString()
        });
      }
    }
    
    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

async function generateAIResponse(email) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional email assistant. Generate concise, helpful email responses.'
          },
          {
            role: 'user',
            content: `Generate a professional response to this email:
            
From: ${email.from}
Subject: ${email.subject}
Content: ${email.snippet}

Generate a helpful, professional response that:
1. Acknowledges the sender's message
2. Provides relevant information or next steps
3. Maintains a professional but friendly tone
4. Is concise but complete`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'Thank you for your email. I will get back to you soon.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Thank you for your email. I will get back to you soon.';
  }
}

async function sendEmail(to, subject, body) {
  try {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    const encodedMessage = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetchWithAuth(
      'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        body: JSON.stringify({
          raw: encodedMessage
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Send email error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result.id);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Auto-response functionality
async function processEmailsForAutoResponse() {
  if (isProcessing) return;
  
  try {
    isProcessing = true;
    console.log('🔍 Checking for new emails...');
    
    const settings = await chrome.storage.local.get(['autoResponseEnabled', 'processedEmails']);
    if (!settings.autoResponseEnabled) {
      console.log('Auto-response disabled');
      return;
    }
    
    const processedEmails = new Set(settings.processedEmails || []);
    const emails = await getUnreadEmails(5);
    
    console.log(`📧 Found ${emails.length} unread emails`);
    
    for (const email of emails) {
      if (processedEmails.has(email.id)) {
        continue;
      }
      
      console.log(`🤖 Processing email from ${email.from}: "${email.subject}"`);
      
      // Mark as processed first
      processedEmails.add(email.id);
      await chrome.storage.local.set({ 
        processedEmails: Array.from(processedEmails) 
      });
      
      // Generate and send AI response
      const aiResponse = await generateAIResponse(email);
      const fromEmail = email.from.match(/<(.+)>/) || email.from.match(/([^\s]+@[^\s]+)/);
      const senderEmail = fromEmail ? fromEmail[1] || fromEmail[0] : email.from;
      
      await sendEmail(
        senderEmail,
        `Re: ${email.subject}`,
        aiResponse
      );
      
      console.log(`✅ AI response sent to ${senderEmail}`);
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'AI Email Agent',
        message: `Auto-replied to ${senderEmail}`
      });
    }
  } catch (error) {
    console.error('❌ Error processing emails:', error);
  } finally {
    isProcessing = false;
  }
}

// Message handling from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.action);
  console.log('📋 Request details:', request);
  console.log('👤 Sender:', sender);
  
  switch (request.action) {
    case 'authenticate':
      console.log('🔐 Starting authentication process...');
      authenticate()
        .then(token => {
          console.log('✅ Authentication successful, sending response');
          sendResponse({ success: true, token });
        })
        .catch(error => {
          console.error('❌ Authentication failed:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep message channel open for async response
      
    case 'getEmails':
      getUnreadEmails(request.maxResults || 10)
        .then(emails => sendResponse({ success: true, emails }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'sendAIResponse':
      generateAIResponse(request.email)
        .then(response => {
          const fromEmail = request.email.from.match(/<(.+)>/) || request.email.from.match(/([^\s]+@[^\s]+)/);
          const senderEmail = fromEmail ? fromEmail[1] || fromEmail[0] : request.email.from;
          
          return sendEmail(
            senderEmail,
            `Re: ${request.email.subject}`,
            response
          );
        })
        .then(result => sendResponse({ success: true, messageId: result.id }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    case 'toggleAutoResponse':
      chrome.storage.local.set({ 
        autoResponseEnabled: request.enabled 
      })
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
  }
});

// Gmail Push Notifications
async function setupGmailPushNotifications(tokens) {
  try {
    console.log('🔔 Setting up Gmail push notifications...');
    
    const response = await fetch('http://localhost:3000/api/gmail-watch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: tokens,
        action: 'setup_watch',
        topicName: 'projects/vc-voice-agent/topics/gmail-notifications'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Gmail push notifications enabled:', result.data);
      
      // Store the historyId for future reference
      chrome.storage.local.set({ 
        gmailHistoryId: result.data.historyId,
        pushNotificationsEnabled: true 
      });
      
      // Push notifications are now active - no polling needed!
    } else {
      console.error('❌ Failed to setup push notifications:', result.error);
      throw new Error('Push notifications setup failed: ' + result.error);
    }
  } catch (error) {
    console.error('❌ Error setting up push notifications:', error);
    throw error;
  }
}

async function stopGmailPushNotifications() {
  try {
    const stored = await chrome.storage.local.get(['authTokens']);
    if (!stored.authTokens) return;
    
    const response = await fetch('http://localhost:3000/api/gmail-watch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: stored.authTokens,
        action: 'stop_watch'
      })
    });
    
    const result = await response.json();
    console.log('🛑 Gmail push notifications stopped:', result);
    
    chrome.storage.local.set({ pushNotificationsEnabled: false });
  } catch (error) {
    console.error('❌ Error stopping push notifications:', error);
  }
}

// Real-time notification handler (triggered by webhook)
async function handleNewEmailNotification(emailData) {
  try {
    console.log('📬 Real-time email notification received:', emailData);
    
    // Trigger auto-response if enabled
    const settings = await chrome.storage.local.get(['autoResponseEnabled']);
    if (settings.autoResponseEnabled) {
      console.log('🤖 Auto-response enabled, processing new emails...');
      processEmailsForAutoResponse();
    }
    
    // Show desktop notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'New Email Received',
      message: emailData.snippet || 'You have a new email'
    });
    
    // Refresh sidebar if it's open
    chrome.tabs.query({url: "https://mail.google.com/*"}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'new_email_notification',
          data: emailData
        }).catch(() => {
          // Ignore if content script not loaded
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error handling email notification:', error);
  }
}

// Message listener for real-time notifications from webhook
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'webhook_notification') {
    handleNewEmailNotification(request.data);
    sendResponse({ success: true });
  }
  return false;
});

// Initial authentication attempt
chrome.runtime.onInstalled.addListener(() => {
  console.log('🚀 AI Email Agent installed');
  chrome.storage.local.set({ 
    autoResponseEnabled: false,
    processedEmails: [] 
  });
});

console.log('🎯 AI Email Agent background worker ready at', new Date().toLocaleTimeString());

// Test to ensure message listener is registered
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🔔 Test listener received:', request);
  return false;
});
