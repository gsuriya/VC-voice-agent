// Background script for AI Email Agent
console.log('🚀 AI Email Agent background script loaded');

// Track auth windows
let authWindowId = null;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message);

  switch (message.action) {
    case 'open_auth_window':
      const email = message.userEmail;
      
      if (!email || !email.includes('@')) {
        sendResponse({ success: false, error: 'Invalid email address' });
        return;
      }

      // Create auth popup window with REAL Google OAuth
      const authUrl = `http://localhost:3000/api/auth/google?userEmail=${encodeURIComponent(email)}`;
      
      chrome.windows.create({
        url: authUrl,
        type: 'popup',
        width: 500,
        height: 700,
        focused: true,
        left: Math.round((screen.width - 500) / 2),
        top: Math.round((screen.height - 700) / 2)
      }, (window) => {
        if (window) {
          authWindowId = window.id;
          console.log('✅ Auth window created:', window.id);
          
          // Listen for the window to close or for a message from the OAuth callback
          chrome.windows.onRemoved.addListener(function windowRemovedListener(windowId) {
            if (windowId === authWindowId) {
              chrome.windows.onRemoved.removeListener(windowRemovedListener);
              authWindowId = null;
            }
          });
          
          sendResponse({ success: true, message: 'Auth window opened' });
        } else {
          sendResponse({ success: false, error: 'Failed to open auth window' });
        }
      });
      
      return true; // Keep the message channel open for async response
      
    case 'auth_complete':
      // This message comes from the OAuth callback page
      console.log('✅ Auth complete message received');
      
      // Close the auth window if it's still open
      if (authWindowId) {
        chrome.windows.remove(authWindowId, () => {
          authWindowId = null;
        });
      }
      
      // Forward the auth success to all Gmail tabs
      chrome.tabs.query({ url: '*://mail.google.com/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'auth_success',
            tokens: message.tokens,
            userEmail: message.userEmail
          });
        });
      });
      
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async responses
});

// Listen for messages from web pages (OAuth callback)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('📨 External message received:', message);
  
  if (message.action === 'auth_complete') {
    // Forward to content scripts
    chrome.tabs.query({ url: '*://mail.google.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'auth_success',
          tokens: message.tokens,
          userEmail: message.userEmail
        });
      });
    });
    
    // Close auth window
    if (authWindowId) {
      chrome.windows.remove(authWindowId);
      authWindowId = null;
    }
    
    sendResponse({ success: true });
  }
});
