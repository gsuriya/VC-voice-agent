// Background script for AI Email Agent - Professional Gmail Extension
console.log('AI Email Agent background script loaded');

// Track auth windows
let authWindowId = null;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  try {
    switch (message.action) {
      case 'authenticate':
        handleAuthenticate(sendResponse);
        return true; // Keep the message channel open for async response
        
      case 'open_auth_window':
        openAuthWindow(sendResponse);
        return true; // Keep the message channel open for async response
        
      case 'auth_complete':
        handleAuthComplete(message, sendResponse);
        return true;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
        return false;
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ success: false, error: error.message });
    return false;
  }
});

function handleAuthenticate(sendResponse) {
  console.log('Opening auth popup window...');
  
  // Simple popup window
  chrome.windows.create({
    url: 'http://localhost:3000/api/auth/google',
    type: 'popup',
    width: 500,
    height: 700
  }, (window) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to create popup:', chrome.runtime.lastError);
      sendResponse({ success: false, error: 'Failed to open auth window' });
      return;
    }
    
    authWindowId = window.id;
    console.log('Auth popup created, monitoring for completion...');
    
    // Only monitor using the new monitoring function
    monitorAuthWindow(window.id);
    
    sendResponse({ success: true, message: 'Auth window opened' });
  });
}


function openAuthWindow(sendResponse) {
  try {
    // Create auth popup window with Google OAuth
    const authUrl = 'http://localhost:3000/api/auth/google';
    
    console.log('Creating auth window with URL:', authUrl);
    
    // Get current window to center the popup
    chrome.windows.getCurrent((currentWindow) => {
      const left = currentWindow.left + Math.round((currentWindow.width - 500) / 2);
      const top = currentWindow.top + Math.round((currentWindow.height - 700) / 2);
      
      chrome.windows.create({
        url: authUrl,
        type: 'popup',
        width: 500,
        height: 700,
        focused: true,
        left: Math.max(0, left),
        top: Math.max(0, top)
      }, (window) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to create auth window:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      if (window && window.id) {
        authWindowId = window.id;
        console.log('Auth window created successfully:', window.id);
        
        // Listen for the window to close
        const windowRemovedListener = (windowId) => {
          if (windowId === authWindowId) {
            chrome.windows.onRemoved.removeListener(windowRemovedListener);
            authWindowId = null;
            console.log('Auth window closed');
          }
        };
        
        chrome.windows.onRemoved.addListener(windowRemovedListener);
        
        // Monitor the auth window for completion
        monitorAuthWindow(window.id);
        
        sendResponse({ success: true, message: 'Auth window opened successfully' });
      } else {
        console.error('Window creation returned null or invalid window');
        sendResponse({ success: false, error: 'Failed to create auth window - no window object returned' });
      }
    });
    });
  } catch (error) {
    console.error('Error in openAuthWindow:', error);
    sendResponse({ success: false, error: error.message });
  }
}

function monitorAuthWindow(windowId) {
  console.log('Starting to monitor auth window:', windowId);
  
  const checkInterval = setInterval(() => {
    chrome.windows.get(windowId, { populate: true }, (window) => {
      if (chrome.runtime.lastError) {
        // Window was closed
        console.log('Auth window closed or error:', chrome.runtime.lastError);
        clearInterval(checkInterval);
        return;
      }
      
      if (window && window.tabs && window.tabs[0]) {
        const tab = window.tabs[0];
        const url = tab.url;
        console.log('Current auth window URL:', url);
        
        // Check if we reached the auth success page (after server redirect)
        if (url && url.includes('localhost:3000/auth-success')) {
          console.log('Auth success page detected!');
          clearInterval(checkInterval);
          
          // Extract tokens from URL
          const urlObj = new URL(url);
          const tokensStr = urlObj.searchParams.get('tokens');
          const email = urlObj.searchParams.get('email');
          
          if (tokensStr && email) {
            try {
              const tokens = JSON.parse(decodeURIComponent(tokensStr));
              
              // Close popup
              chrome.windows.remove(authWindowId);
              authWindowId = null;
              
              // Send success to content script (only once!)
              chrome.tabs.query({ url: '*://mail.google.com/*' }, (tabs) => {
                tabs.forEach(tab => {
                  chrome.tabs.sendMessage(tab.id, {
                    action: 'auth_success',
                    tokens: tokens,
                    userEmail: email
                  });
                });
              });
              
              console.log('Auth successful, tokens forwarded to content script');
            } catch (error) {
              console.error('Error parsing tokens:', error);
            }
          }
        }
      }
    });
  }, 1000);
  
  // Stop monitoring after 5 minutes
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 300000);
}

// Removed exchangeCodeForTokens - now we just monitor for the final auth-success page

function handleAuthComplete(message, sendResponse) {
  console.log('Auth complete message received');
  
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
}

// Listen for messages from web pages (OAuth callback)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('External message received:', message);
  
  if (message.action === 'auth_complete') {
    handleAuthComplete(message, sendResponse);
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details);
  
  if (details.reason === 'install') {
    // Open Gmail on first install
    chrome.tabs.create({
      url: 'https://mail.google.com'
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});

// Clean up on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension suspending');
  
  if (authWindowId) {
    chrome.windows.remove(authWindowId);
    authWindowId = null;
  }
});