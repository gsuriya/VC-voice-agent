// AI Email Agent - Professional Gmail Extension
console.log('🎯 AI Email Agent content script loaded!');
console.log('Current page:', window.location.href);

// Debug: Check if we're on the right page
if (window.location.hostname.includes('mail.google.com')) {
  console.log('✅ We are on Gmail!');
} else {
  console.log('❌ Not on Gmail:', window.location.hostname);
}

// State management
let sidebarExpanded = false;
let isAuthenticated = false;
let userEmail = '';
let accessToken = null;
let syncProgress = 0;
let totalEmailsToSync = 1000;
let emailsSynced = 0;
let isSyncing = false;
let isSearching = false;
let searchResults = [];

// Create and manage sidebar
function createSidebar() {
  // Remove existing sidebar if any
  const existingSidebar = document.getElementById('ai-sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'ai-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: ${sidebarExpanded ? '0' : '-400px'};
    width: 400px;
    height: 100vh;
    background: #ffffff;
    border-left: 1px solid #000000;
    transition: right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  `;

  sidebar.innerHTML = generateSidebarContent();
  document.body.appendChild(sidebar);
  
  // Adjust Gmail layout
  adjustGmailLayout();
  
  // Setup event listeners
  setupEventListeners();
}

function generateSidebarContent() {
  if (!isAuthenticated) {
    return `
      <div style="
        padding: 32px 24px;
        text-align: center;
        background: #000000;
        color: #ffffff;
        border-bottom: 1px solid #333333;
      ">
        <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">
          Gmail Assistant
        </div>
        <div style="font-size: 14px; opacity: 0.8;">
          Intelligent Email Management
        </div>
      </div>

      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px 24px;
      ">
        <div style="
          width: 80px;
          height: 80px;
          border: 2px solid #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 32px;
        ">
          G
        </div>
        
        <div style="
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #000000;
        ">
          Connect Your Gmail
        </div>
        
        <div style="
          font-size: 14px;
          color: #666666;
          margin-bottom: 32px;
          text-align: center;
          line-height: 1.5;
        ">
          Securely authenticate with Google to sync your emails and enable intelligent search
        </div>
        
        <button id="auth-button" style="
          width: 100%;
          max-width: 280px;
          padding: 16px 24px;
          background: #000000;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          Sign in with Google
        </button>
      </div>

      <div style="
        padding: 16px 24px;
        background: #f8f9fa;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #666666;
        text-align: center;
      ">
        Secure • Private • Professional
      </div>
    `;
  }

  if (isSyncing) {
    return `
      <div style="
        padding: 32px 24px;
        text-align: center;
        background: #000000;
        color: #ffffff;
        border-bottom: 1px solid #333333;
      ">
        <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">
          Gmail Assistant
        </div>
        <div style="font-size: 14px; opacity: 0.8;">
          ${userEmail}
        </div>
      </div>

      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px 24px;
      ">
        <div style="
          width: 80px;
          height: 80px;
          border: 2px solid #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 16px;
          font-weight: 600;
        ">
          ${Math.round((emailsSynced / totalEmailsToSync) * 100)}%
        </div>
        
        <div style="
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #000000;
        ">
          Syncing Emails
        </div>
        
        <div style="
          font-size: 14px;
          color: #666666;
          margin-bottom: 32px;
          text-align: center;
        ">
          ${emailsSynced} of ${totalEmailsToSync} emails processed
        </div>
        
        <div style="
          width: 100%;
          max-width: 280px;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        ">
          <div style="
            height: 100%;
            background: #000000;
            width: ${(emailsSynced / totalEmailsToSync) * 100}%;
            transition: width 0.3s ease;
          "></div>
        </div>
        
        <div style="
          font-size: 12px;
          color: #999999;
        ">
          This may take a few minutes...
        </div>
      </div>

      <div style="
        padding: 16px 24px;
        background: #f8f9fa;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #666666;
        text-align: center;
      ">
        Building vector database for intelligent search
      </div>
    `;
  }

  return `
    <div style="
      padding: 24px;
      background: #000000;
      color: #ffffff;
      border-bottom: 1px solid #333333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
          Gmail Assistant
        </div>
        <div style="font-size: 12px; opacity: 0.8;">
          ${userEmail}
        </div>
      </div>
      <div style="position: relative;">
        <button id="account-menu-btn" style="
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">⚙</button>
        
        <div id="account-menu" style="
          position: absolute;
          top: 40px;
          right: 0;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          min-width: 180px;
          display: none;
          z-index: 1000;
        ">
          <button id="switch-account-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: none;
            border: none;
            text-align: left;
            font-size: 14px;
            color: #374151;
            cursor: pointer;
            border-bottom: 1px solid #f3f4f6;
          ">
            Switch Account
          </button>
          <button id="resync-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: none;
            border: none;
            text-align: left;
            font-size: 14px;
            color: #374151;
            cursor: pointer;
          ">
            Resync Emails
          </button>
        </div>
      </div>
    </div>

    <div style="
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    ">
      <div style="
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #000000;
      ">
        AI Assistant
      </div>
      
      <div id="chat-messages" style="
        height: 300px;
        overflow-y: auto;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        background: #f9fafb;
        font-size: 11px;
        line-height: 1.4;
      ">
      </div>
      
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <input 
          type="text" 
          id="chat-input" 
          placeholder="Ask me anything about your emails..."
          style="
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            background: #ffffff;
            box-sizing: border-box;
          "
        />
        <button 
          id="chat-send" 
          style="
            padding: 12px 20px;
            background: #000000;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          "
        >
          Send
        </button>
      </div>

      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 16px;
      ">
        <button class="quick-chat" data-query="Find my latest unread emails" style="
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          color: #374151;
        ">
          Latest Unread
        </button>
        <button class="quick-chat" data-query="Show me today's important emails" style="
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          color: #374151;
        ">
          Today's Important
        </button>
        <button class="quick-chat" data-query="Find meeting invitations" style="
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          color: #374151;
        ">
          Meeting Invites
        </button>
        <button class="quick-chat" data-query="Draft a new email" style="
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          color: #374151;
        ">
          Draft Email
        </button>
      </div>
      
      <div style="
        font-size: 12px;
        color: #666666;
        text-align: center;
      ">
        ${emailsSynced} emails indexed • AI-powered
      </div>
    </div>

    <div id="search-results" style="
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    ">
      <div style="
        text-align: center;
        color: #999999;
        font-size: 14px;
        margin-top: 40px;
      ">
        Enter a search query to find relevant emails
      </div>
    </div>


    <div style="
      padding: 16px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #666666;
      text-align: center;
    ">
      Professional Email Intelligence
    </div>
  `;
}

function createToggleButton() {
  console.log('📍 Creating toggle button...');
  
  const existingBtn = document.getElementById('sidebar-toggle');
  if (existingBtn) {
    console.log('🔄 Removing existing toggle button');
    existingBtn.remove();
  }

  if (!document.body) {
    console.error('❌ Document body not available, cannot create toggle button');
    return;
  }

  const button = document.createElement('button');
  button.id = 'sidebar-toggle';
  button.innerHTML = sidebarExpanded ? '→' : '←';
  button.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: ${sidebarExpanded ? '420px' : '20px'} !important;
    width: 40px !important;
    height: 40px !important;
    background: #000000 !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
    z-index: 999998 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  `;

  button.addEventListener('click', toggleSidebar);
  button.addEventListener('mouseover', () => {
    button.style.background = '#333333';
  });
  button.addEventListener('mouseout', () => {
    button.style.background = '#000000';
  });

  try {
    document.body.appendChild(button);
    console.log('✅ Toggle button created and added to DOM');
    
    // Verify it's actually in the DOM
    const verifyBtn = document.getElementById('sidebar-toggle');
    if (verifyBtn) {
      console.log('✅ Toggle button verified in DOM');
    } else {
      console.error('❌ Toggle button not found in DOM after creation');
    }
  } catch (error) {
    console.error('❌ Error adding toggle button to DOM:', error);
  }
}

function toggleSidebar() {
  sidebarExpanded = !sidebarExpanded;
  
  const sidebar = document.getElementById('ai-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  
  if (sidebar) {
    sidebar.style.right = sidebarExpanded ? '0' : '-400px';
  }
  
  if (toggleBtn) {
    toggleBtn.style.right = sidebarExpanded ? '420px' : '20px';
    toggleBtn.innerHTML = sidebarExpanded ? '→' : '←';
  }
  
  adjustGmailLayout();
}

function adjustGmailLayout() {
  const gmailMain = document.querySelector('[role="main"]') || document.querySelector('.nH');
  if (gmailMain) {
    gmailMain.style.transition = 'margin-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    gmailMain.style.marginRight = sidebarExpanded ? '400px' : '0';
  }
}

function setupEventListeners() {
  // Auth button
  const authBtn = document.getElementById('auth-button');
  if (authBtn) {
    authBtn.addEventListener('click', handleGoogleAuth);
    authBtn.addEventListener('mouseover', () => {
      authBtn.style.background = '#333333';
    });
    authBtn.addEventListener('mouseout', () => {
      authBtn.style.background = '#000000';
    });
  }

  // Account menu
  const accountMenuBtn = document.getElementById('account-menu-btn');
  const accountMenu = document.getElementById('account-menu');
  if (accountMenuBtn && accountMenu) {
    accountMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accountMenu.style.display = accountMenu.style.display === 'none' ? 'block' : 'none';
    });
    
    document.addEventListener('click', () => {
      accountMenu.style.display = 'none';
    });
  }

  // Switch account and resync buttons (click and hover events)
  const switchAccountBtn = document.getElementById('switch-account-btn');
  const resyncBtn = document.getElementById('resync-btn');
  
  if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', handleSwitchAccount);
    // Add hover effects
    switchAccountBtn.addEventListener('mouseover', () => {
      switchAccountBtn.style.background = '#f9fafb';
    });
    switchAccountBtn.addEventListener('mouseout', () => {
      switchAccountBtn.style.background = 'none';
    });
  }

  if (resyncBtn) {
    resyncBtn.addEventListener('click', handleResync);
    // Add hover effects
    resyncBtn.addEventListener('mouseover', () => {
      resyncBtn.style.background = '#f9fafb';
    });
    resyncBtn.addEventListener('mouseout', () => {
      resyncBtn.style.background = 'none';
    });
  }

  // Search functionality
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  // Quick chat buttons
  const quickChatBtns = document.querySelectorAll('.quick-chat');
  quickChatBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const query = e.target.getAttribute('data-query');
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.value = query;
        handleChatSend();
      }
    });
    
    // Add hover effects
    btn.addEventListener('mouseover', () => {
      btn.style.background = '#f3f4f6';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = '#f8f9fa';
    });
  });

  // Chat functionality
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  
  if (chatInput && chatSend) {
    // Send button click
    chatSend.addEventListener('click', handleChatSend);
    
    // Enter key in input
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatSend();
      }
    });
    
    // Button hover effects
    chatSend.addEventListener('mouseover', () => {
      chatSend.style.background = '#333333';
    });
    chatSend.addEventListener('mouseout', () => {
      chatSend.style.background = '#000000';
    });
  }
}

async function handleGoogleAuth() {
  try {
    console.log('🔐 Authentication button clicked');
    const authBtn = document.getElementById('auth-button');
    if (authBtn) {
      authBtn.textContent = 'Authenticating...';
      authBtn.disabled = true;
    }
    
    // Add a test to check if background script is available
    if (!chrome.runtime?.id) {
      console.error('❌ Extension context invalidated - reloading page');
      // Reload the page to get fresh extension context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    console.log('📡 Sending message to background script...');
    const response = await chrome.runtime.sendMessage({ action: 'authenticate' });
    console.log('📨 Response from background:', response);
    
    if (response && response.success) {
      if (response.message === 'Auth window opened') {
        if (authBtn) {
          authBtn.textContent = 'Complete authentication in popup...';
        }
        // Just wait - don't do anything until we get auth_success message
        console.log('Waiting for auth to complete in popup window...');
      }
    } else {
      if (authBtn) {
        authBtn.textContent = 'Sign in with Google';
        authBtn.disabled = false;
      }
      console.error('❌ Auth failed:', response);
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    const authBtn = document.getElementById('auth-button');
    if (authBtn) {
      authBtn.textContent = 'Sign in with Google';
      authBtn.disabled = false;
    }
    if (error.message?.includes('port closed')) {
      alert('Extension needs reload - please refresh the page');
    } else {
      alert('Authentication error - please try again');
    }
  }
}

function handleSwitchAccount() {
  // Clear authentication state
  isAuthenticated = false;
  userEmail = '';
  accessToken = null;
  emailsSynced = 0;
  isSyncing = false;
  
  // Clear storage
  chrome.storage.local.clear();
  
  // Refresh UI
  createSidebar();
}

async function handleResync() {
  if (isSyncing) return;
  
  const menu = document.getElementById('account-menu');
  if (menu) {
    menu.style.display = 'none';
  }
  
  await startSync();
}

async function startSync() {
  // Check if already syncing
  if (isSyncing) {
    console.log('Sync already in progress, skipping duplicate sync');
    return;
  }
  
  isSyncing = true;
  emailsSynced = 0;
  syncProgress = 0;
  
  createSidebar(); // Refresh to show sync UI
  
  try {
    console.log('Starting real email sync for user:', userEmail);
    
    // Use the streaming endpoint for real-time progress
    const response = await fetch('http://localhost:3000/api/sync-gmail-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: { access_token: accessToken },
        userEmail: userEmail,
        maxResults: totalEmailsToSync,
        namespace: userEmail // IMPORTANT: Use email as namespace to separate users
      }),
    });

    if (!response.ok) {
      throw new Error('Sync failed: ' + response.statusText);
    }

    // Read the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            console.log('Sync update:', data);
            
            switch (data.type) {
              case 'start':
              case 'status':
                console.log(data.message);
                break;
                
              case 'progress':
                emailsSynced = data.progress;
                totalEmailsToSync = data.total || totalEmailsToSync;
                createSidebar(); // Update progress UI
                console.log(`Synced ${emailsSynced} of ${totalEmailsToSync} emails (${data.percentage}%)`);
                break;
                
              case 'complete':
                emailsSynced = data.total;
                console.log('Email sync completed!', data.message);
                break;
                
              case 'error':
                throw new Error(data.error);
            }
          } catch (e) {
            if (line.includes('error')) {
              console.error('Sync error:', e);
            }
          }
        }
      }
    }

    // Sync complete
    isSyncing = false;
    
    // Store sync state
    chrome.storage.local.set({
      emailsSynced: emailsSynced,
      lastSyncTime: new Date().toISOString()
    });
    
    createSidebar(); // Show final UI
    
  } catch (error) {
    console.error('Sync error:', error);
    isSyncing = false;
    emailsSynced = 0;
    createSidebar();
    alert('Failed to sync emails. Please try again.');
  }
}

async function handleChatSend() {
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  
  if (!chatInput || !chatMessages) return;
  
  const message = chatInput.value.trim();
  if (!message || isSearching) return;

  // Add user message to chat
  addChatMessage('user', message);
  chatInput.value = '';
  
  // Show thinking state
  addChatMessage('assistant', 'Let me help you with that...', 'thinking');
  
  isSearching = true;

  try {
    // Use enhanced email agent
    const response = await fetch('http://localhost:3000/api/enhanced-email-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message,
        tokens: { access_token: accessToken },
        userEmail: userEmail
      }),
    });

    const data = await response.json();

    // Remove thinking message
    removeChatMessage('thinking');

    if (data.success) {
      // Add the AI response
      addChatMessage('assistant', data.response);
      
      // Handle different response types
      if (data.intent === 'search' && data.emails && data.emails.length > 0) {
        // Display search results in the search area
        displaySearchResults(data.emails.map(email => ({
          metadata: {
            subject: email.subject,
            from: email.from,
            fromName: email.fromName,
            snippet: email.snippet,
            date: email.sentAt
          },
          score: 0.9 // Default score for database results
        })));
      } else if (data.intent === 'reply' && data.draft) {
        // Show reply draft
        addChatMessage('assistant', `**Draft Reply:**\n**To:** ${data.draft.to}\n${data.draft.cc.length > 0 ? `**CC:** ${data.draft.cc.join(', ')}\n` : ''}${data.draft.bcc.length > 0 ? `**BCC:** ${data.draft.bcc.length} recipient(s)\n` : ''}**Subject:** ${data.draft.subject}\n\n${data.draft.body}\n\n*Would you like me to send this or make changes?*`);
      } else if (data.intent === 'compose' && data.draft) {
        // Show compose draft
        addChatMessage('assistant', `**Draft Email:**\n**To:** ${data.draft.to.join(', ')}\n${data.draft.cc.length > 0 ? `**CC:** ${data.draft.cc.join(', ')}\n` : ''}**Subject:** ${data.draft.subject}\n\n${data.draft.body}\n\n*Would you like me to send this or make changes?*`);
      }
      
      // Show confidence if low
      if (data.confidence && data.confidence < 0.7) {
        addChatMessage('assistant', `*I'm ${Math.round(data.confidence * 100)}% confident about this interpretation. If this isn't what you meant, please try rephrasing.*`, 'confidence-warning');
      }
      
    } else {
      // Handle errors gracefully
      let errorMessage = data.response || data.error || "I couldn't process your request right now.";
      
      if (data.needsMoreInfo && data.suggestions) {
        errorMessage += "\n\nTry one of these instead:\n" + data.suggestions.map(s => `• ${s}`).join('\n');
      }
      
      addChatMessage('assistant', errorMessage);
    }
    
  } catch (error) {
    console.error('Enhanced agent error:', error);
    removeChatMessage('thinking');
    addChatMessage('assistant', "Sorry, I encountered an error while processing your request. Please try again.");
  } finally {
    isSearching = false;
  }
}

function addChatMessage(sender, text, className = '') {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = className;
  
  let styles = `
    margin-bottom: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 11px;
    line-height: 1.4;
  `;
  
  if (sender === 'user') {
    styles += 'background: #000000; color: #ffffff; margin-left: 20px; text-align: right;';
  } else if (className === 'confidence-warning') {
    styles += 'background: #fef3c7; color: #92400e; margin-right: 20px; border-left: 3px solid #f59e0b;';
  } else {
    styles += 'background: #f3f4f6; color: #374151; margin-right: 20px;';
  }
  
  messageDiv.style.cssText = styles;
  
  // Convert simple markdown to HTML
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>'); // Add italic support
  
  messageDiv.innerHTML = formattedText;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeChatMessage(className) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  const thinkingMsg = chatMessages.querySelector(`.${className}`);
  if (thinkingMsg) {
    thinkingMsg.remove();
  }
}

async function handleSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  
  const query = searchInput.value.trim();
  if (!query) return;

  const resultsDiv = document.getElementById('search-results');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = `
    <div style="
      text-align: center;
      color: #666666;
      font-size: 14px;
      margin-top: 40px;
    ">
      Searching emails...
    </div>
  `;

  try {
    const response = await fetch('http://localhost:3000/api/test-pinecone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search_emails',
        query: query,
        namespace: userEmail, // IMPORTANT: Only search in current user's namespace
        filter: {
          userEmail: userEmail // Additional filter to ensure we only get current user's emails
        }
      }),
    });

    const data = await response.json();
    
    if (data.success && data.results && data.results.length > 0) {
      displaySearchResults(data.results);
    } else {
      resultsDiv.innerHTML = `
        <div style="
          text-align: center;
          color: #999999;
          font-size: 14px;
          margin-top: 40px;
        ">
          No emails found for "${query}"
        </div>
      `;
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsDiv.innerHTML = `
      <div style="
        text-align: center;
        color: #dc3545;
        font-size: 14px;
        margin-top: 40px;
      ">
        Search failed. Please try again.
      </div>
    `;
  }
}

function displaySearchResults(results) {
  const resultsDiv = document.getElementById('search-results');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = results.map((result, index) => {
    const similarity = Math.round((result.score || 0) * 100);
    const subject = result.metadata?.subject || 'No subject';
    const from = result.metadata?.fromName || result.metadata?.from || 'Unknown sender';
    const snippet = result.metadata?.snippet || '';
    const date = result.metadata?.date ? new Date(result.metadata.date).toLocaleDateString() : '';

    return `
      <div class="search-result-item" data-index="${index}" style="
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 8px;
        ">
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: #000000;
            flex: 1;
            margin-right: 12px;
            line-height: 1.4;
          ">
            ${subject}
          </div>
          <div style="
            font-size: 12px;
            color: #666666;
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 12px;
            white-space: nowrap;
          ">
            ${similarity}% match
          </div>
        </div>
        
        <div style="
          font-size: 13px;
          color: #666666;
          margin-bottom: 8px;
        ">
          ${from}
        </div>
        
        ${snippet ? `
          <div style="
            font-size: 12px;
            color: #999999;
            line-height: 1.4;
            margin-bottom: 8px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          ">
            ${snippet}
          </div>
        ` : ''}
        
        <div style="
          font-size: 11px;
          color: #cccccc;
        ">
          ${date}
        </div>
      </div>
    `;
  }).join('');

  // Add hover events to search result items
  const searchResultItems = resultsDiv.querySelectorAll('.search-result-item');
  searchResultItems.forEach(item => {
    item.addEventListener('mouseover', () => {
      item.style.borderColor = '#000000';
      item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });
    item.addEventListener('mouseout', () => {
      item.style.borderColor = '#e5e7eb';
      item.style.boxShadow = 'none';
    });
  });
}

// Handle auth success from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'auth_success') {
    console.log('Auth success received:', message);
    
    // Check if we're already syncing to avoid duplicate syncs
    if (isSyncing) {
      console.log('Already syncing, ignoring duplicate auth_success');
      sendResponse({ success: true });
      return;
    }
    
    isAuthenticated = true;
    userEmail = message.userEmail;
    accessToken = message.tokens.access_token;
    
    // Store auth state
    chrome.storage.local.set({
      isAuthenticated: true,
      userEmail: userEmail,
      accessToken: accessToken,
      tokens: message.tokens
    });
    
    // Start syncing emails
    startSync();
    
    sendResponse({ success: true });
  }
});

// Load stored auth state
function loadAuthState() {
  chrome.storage.local.get(['isAuthenticated', 'userEmail', 'accessToken', 'emailsSynced'], (result) => {
    if (result.isAuthenticated) {
      isAuthenticated = true;
      userEmail = result.userEmail;
      accessToken = result.accessToken;
      emailsSynced = result.emailsSynced || 0;
      createSidebar();
    }
  });
}

// Initialize extension
function initialize() {
  console.log('🚀 Initializing AI Email Agent...');
  console.log('Current URL:', window.location.href);
  console.log('Document ready state:', document.readyState);
  
  if (!window.location.hostname.includes('mail.google.com')) {
    console.log('❌ Not on Gmail, skipping initialization');
    return;
  }

  try {
    console.log('✅ Creating toggle button...');
    createToggleButton();
    
    console.log('✅ Creating sidebar...');
    createSidebar();
    
    console.log('✅ Loading auth state...');
    loadAuthState();
    
    console.log('✅ AI Email Agent initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing AI Email Agent:', error);
  }
}

// Wait for page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initialize, 500); // Delay for Gmail to fully load
  });
} else {
  setTimeout(initialize, 500); // Delay for Gmail to fully load
}

// Also try initializing when window loads
window.addEventListener('load', () => {
  setTimeout(initialize, 1000);
});

// Handle page navigation (Gmail is a SPA)
let currentUrl = location.href;
new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    console.log('🔄 URL changed, reinitializing...', currentUrl);
    setTimeout(initialize, 1000); // Reinitialize after navigation
  }
}).observe(document, { subtree: true, childList: true });

// Force initialization after a longer delay as fallback
setTimeout(() => {
  const existingBtn = document.getElementById('sidebar-toggle');
  if (!existingBtn) {
    console.log('🔄 Toggle button not found, forcing initialization...');
    initialize();
  }
}, 3000);