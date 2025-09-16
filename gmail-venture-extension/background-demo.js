// AI Email Agent background script - handles auth windows
console.log('🚀 AI Email Agent background script loaded');

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message);
  
  (async () => {
    try {
      switch (message.action) {
        case 'open_auth_window':
          console.log('🔐 Opening authentication window...');
          
          const email = message.userEmail;
          
          // Create a small popup window for auth
          const authWindow = await chrome.windows.create({
            url: 'http://localhost:3000/gmail-sync?popup=true',
            type: 'popup',
            width: 500,
            height: 700,
            focused: true,
            left: 100,
            top: 100
          });
          
        // Open Google OAuth window instead of demo auth
        const authUrl = `http://localhost:3000/api/auth/google?userEmail=${encodeURIComponent(email)}`;
        
        chrome.windows.create({
          url: authUrl,
          type: 'popup',
          width: 500,
          height: 700,
          focused: true
        }, (window) => {
          if (window) {
            console.log('Auth window created:', window.id);
            // Listen for auth completion
            // The OAuth callback page will handle storing tokens
          }
        });

              const data = await response.json();
              
              if (data.success) {
                // Close the auth window
                chrome.windows.remove(authWindow.id);
                
                // Send success response
                sendResponse({
                  success: true,
                  accessToken: data.tokens.access_token,
                  userEmail: email
                });
              } else {
                sendResponse({ success: false, error: 'Auth failed' });
              }
            } catch (error) {
              console.error('Auth error:', error);
              sendResponse({ success: false, error: error.message });
            }
          }, 2000);
          
          break;

        case 'sync_all_emails':
          console.log('🌐 Opening web sync interface...');
          chrome.tabs.create({
            url: 'http://localhost:3000/gmail-sync'
          });
          sendResponse({ success: true, message: 'Opened web sync interface' });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep message channel open for async response
});

// Listen for tab updates to detect when auth is complete
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes('localhost:3000/gmail-sync?auth=success')) {
    console.log('✅ Auth success detected, closing tab');
    chrome.tabs.remove(tabId);
  }
});
