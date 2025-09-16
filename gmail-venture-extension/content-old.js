// AI Email Agent - Simple Right Sidebar
console.log('🤖 AI Email Agent loaded');

let isAuthenticated = false;
let currentEmails = [];
let sidebarVisible = false;

// Wait for Gmail to load
function waitForGmail() {
  return new Promise((resolve) => {
    const checkGmail = () => {
      const gmailBody = document.querySelector('[role="main"]') || document.querySelector('.nH');
      if (gmailBody) {
        resolve();
      } else {
        setTimeout(checkGmail, 500);
      }
    };
    checkGmail();
  });
}

// Create simple right sidebar
function createSidebar() {
  // Remove existing sidebar
  const existing = document.getElementById('ai-email-sidebar');
  if (existing) existing.remove();

  const sidebar = document.createElement('div');
  sidebar.id = 'ai-email-sidebar';
  sidebar.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      right: 0;
      width: 350px;
      height: 100vh;
      background: #ffffff;
      border-left: 1px solid #e5e7eb;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      flex-direction: column;
    ">
      <!-- Header -->
      <div style="
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <div style="
              width: 32px;
              height: 32px;
              background: #1f2937;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              font-size: 16px;
            ">🤖</div>
            <div>
              <h2 style="
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
              ">AI Email Agent</h2>
              <p style="
                margin: 0;
                font-size: 14px;
                color: #6b7280;
              ">Smart Gmail Responses</p>
            </div>
          </div>
          <button id="close-btn" style="
            background: none;
            border: none;
            color: #6b7280;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
          ">×</button>
        </div>
      </div>

      <!-- Status -->
      <div style="
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
        background: #ffffff;
      ">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <div id="status-dot" style="
            width: 8px;
            height: 8px;
            background: #ef4444;
            border-radius: 50%;
            margin-right: 8px;
          "></div>
          <span style="font-size: 14px; color: #374151; font-weight: 500;">Status</span>
        </div>
        <div id="status-text" style="
          font-size: 13px;
          color: #6b7280;
        ">Not authenticated</div>
      </div>

          <!-- Controls -->
          <div style="
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            background: #ffffff;
          ">
            <button id="auth-btn" style="
              width: 100%;
              padding: 12px;
              background: #1f2937;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 12px;
            ">🌐 Open Gmail Sync (Web)</button>
            
            <button id="refresh-btn" style="
              width: 100%;
              padding: 12px;
              background: #ffffff;
              color: #374151;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 12px;
            ">🔄 Refresh Emails</button>
            
            <button id="sync-db-btn" style="
              width: 100%;
              padding: 12px;
              background: #4f46e5;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 12px;
            ">🌐 Open Sync Interface</button>

            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px;
              background: #f9fafb;
              border-radius: 8px;
              margin-bottom: 16px;
            ">
              <span style="font-size: 14px; color: #374151; font-weight: 500;">Auto-Response</span>
              <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                <input type="checkbox" id="auto-toggle" style="opacity: 0; width: 0; height: 0;">
                <span style="
                  position: absolute;
                  cursor: pointer;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background-color: #d1d5db;
                  transition: .3s;
                  border-radius: 24px;
                "></span>
                <span style="
                  position: absolute;
                  content: '';
                  height: 18px;
                  width: 18px;
                  left: 3px;
                  bottom: 3px;
                  background-color: white;
                  transition: .3s;
                  border-radius: 50%;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                "></span>
              </label>
            </div>
            
            <!-- AI Q&A Section -->
            <div style="
              background: #f3f4f6;
              border-radius: 8px;
              padding: 12px;
            ">
              <label style="
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
                display: block;
                margin-bottom: 8px;
              ">🤖 Ask anything about your emails</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="ai-query-input" placeholder="e.g. 'What are my last 5 emails from John?'" style="
                  flex: 1;
                  padding: 10px 12px;
                  background: #ffffff;
                  border: 1px solid #d1d5db;
                  border-radius: 6px;
                  font-size: 14px;
                  outline: none;
                " />
                <button id="ai-query-btn" style="
                  padding: 10px 16px;
                  background: #1f2937;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                  white-space: nowrap;
                ">Ask</button>
              </div>
            </div>
          </div>

      <!-- AI Response Area -->
      <div id="ai-response-area" style="
        display: none;
        padding: 16px;
        background: #e0f2fe;
        border-bottom: 2px solid #0284c7;
        max-height: 200px;
        overflow-y: auto;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 8px;
        ">
          <h4 style="margin: 0; font-size: 14px; color: #0369a1; font-weight: 600;">🤖 AI Response</h4>
          <button id="close-ai-response" style="
            background: none;
            border: none;
            color: #0369a1;
            cursor: pointer;
            font-size: 18px;
            padding: 0;
            line-height: 1;
          ">×</button>
        </div>
        <div id="ai-response-content" style="
          font-size: 14px;
          color: #0c4a6e;
          line-height: 1.5;
        "></div>
      </div>

      <!-- Email List -->
      <div style="
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #ffffff;
      ">
        <div id="email-list">
          <div style="
            text-align: center;
            color: #6b7280;
            padding: 40px 20px;
          ">
            <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">📧</div>
            <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px; color: #374151;">
              No emails loaded
            </div>
            <div style="font-size: 14px;">
              Authenticate and refresh to get started
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(sidebar);
  adjustGmailLayout();
  
  // Add event listeners (CSP-compliant)
  const authBtn = sidebar.querySelector('#auth-btn');
  const refreshBtn = sidebar.querySelector('#refresh-btn');
  const closeBtn = sidebar.querySelector('#close-btn');
  const autoToggle = sidebar.querySelector('#auto-toggle');
  const aiQueryInput = sidebar.querySelector('#ai-query-input');
  const aiQueryBtn = sidebar.querySelector('#ai-query-btn');
  const closeAiResponse = sidebar.querySelector('#close-ai-response');
  const syncDbBtn = sidebar.querySelector('#sync-db-btn');
  
  if (authBtn) {
    authBtn.addEventListener('click', authenticate);
  }
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshEmails);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', hideSidebar);
  }
  
  if (autoToggle) {
    autoToggle.addEventListener('change', (e) => toggleAutoResponse(e.target));
  }
  
  if (aiQueryBtn) {
    aiQueryBtn.addEventListener('click', handleAIQuery);
  }
  
  if (aiQueryInput) {
    aiQueryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAIQuery();
      }
    });
  }
  
  if (closeAiResponse) {
    closeAiResponse.addEventListener('click', () => {
      document.getElementById('ai-response-area').style.display = 'none';
    });
  }
  
  if (syncDbBtn) {
    syncDbBtn.addEventListener('click', syncEmailDatabase);
  }
}

// Show sidebar
function showSidebar() {
  console.log('showSidebar called');
  if (!sidebarVisible) {
    createSidebar();
    sidebarVisible = true;
    updateToggleButton();
  }
}

// Hide sidebar
function hideSidebar() {
  console.log('hideSidebar called');
  const sidebar = document.getElementById('ai-email-sidebar');
  if (sidebar) {
    sidebar.remove();
  }
  
  // Reset Gmail layout
  const gmailMain = document.querySelector('[role="main"]') || document.querySelector('.nH');
  if (gmailMain) {
    gmailMain.style.marginRight = '0';
  }
  
  sidebarVisible = false;
  updateToggleButton();
}

// Adjust Gmail layout
function adjustGmailLayout() {
  const gmailMain = document.querySelector('[role="main"]') || document.querySelector('.nH');
  if (gmailMain) {
    gmailMain.style.marginRight = '350px';
    gmailMain.style.transition = 'margin-right 0.3s ease';
  }
}

// Create simple toggle button
function createToggleButton() {
  const existing = document.getElementById('ai-toggle-btn');
  if (existing) existing.remove();

  const button = document.createElement('div');
  button.id = 'ai-toggle-btn';
  button.innerHTML = `
    <button id="toggle-button" style="
      position: fixed;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: #ffffff;
      color: #374151;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 10001;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
">
      ›
    </button>
  `;

  // Add click event listener properly
  const toggleBtn = button.querySelector('#toggle-button');
  toggleBtn.addEventListener('click', () => {
    console.log('Toggle button clicked, sidebarVisible:', sidebarVisible);
    toggleSidebar();
  });

  document.body.appendChild(button);
}

// Toggle sidebar
function toggleSidebar() {
  console.log('toggleSidebar called, current state:', sidebarVisible);
  if (sidebarVisible) {
    hideSidebar();
  } else {
    showSidebar();
  }
  updateToggleButton();
}

// Update toggle button icon
function updateToggleButton() {
  const toggleBtn = document.querySelector('#toggle-button');
  if (toggleBtn) {
    toggleBtn.innerHTML = sidebarVisible ? '‹' : '›';
  }
}

// Authentication
async function authenticate() {
  try {
    console.log('🔐 Authentication button clicked');
    updateStatus('Authenticating...', 'loading');
    
    // Add a test to check if background script is available
    if (!chrome.runtime?.id) {
      console.error('❌ Extension context invalidated - reloading page');
      updateStatus('Extension updated - reloading...', 'loading');
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
      if (response.message === 'Redirected to web authentication') {
        updateStatus('Opening web authentication...', 'loading');
        // The background script will open the web interface
      } else {
        isAuthenticated = true;
        updateStatus('Connected to Gmail', 'success');
        setTimeout(refreshEmails, 1000);
      }
    } else {
      updateStatus('Authentication failed', 'error');
      console.error('❌ Auth failed:', response);
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    if (error.message?.includes('port closed')) {
      updateStatus('Extension needs reload', 'error');
    } else {
      updateStatus('Authentication error', 'error');
    }
  }
}

// Refresh emails
async function refreshEmails() {
  console.log('🔄 refreshEmails() called, isAuthenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('⚠️ Not authenticated, triggering auth...');
    authenticate();
    return;
  }

  try {
    console.log('🔄 Starting email refresh...');
    updateStatus('Loading emails...', 'loading');
    
    const response = await chrome.runtime.sendMessage({ 
      action: 'getEmails',
      maxResults: 10 
    });
    
    console.log('📧 Email refresh response:', response);
    
    if (response && response.success) {
      currentEmails = response.emails;
      displayEmails(response.emails);
      updateStatus(`${response.emails.length} unread emails`, 'success');
      console.log(`✅ Successfully refreshed ${response.emails.length} emails`);
    } else {
      console.error('❌ Email refresh failed:', response);
      updateStatus('Failed to load emails', 'error');
    }
  } catch (error) {
    console.error('❌ Error refreshing emails:', error);
    updateStatus('Error loading emails', 'error');
  }
}

// Display emails
function displayEmails(emails) {
  const emailList = document.getElementById('email-list');
  if (!emailList) return;

  if (emails.length === 0) {
    emailList.innerHTML = `
      <div style="
        text-align: center;
        color: #6b7280;
        padding: 40px 20px;
      ">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">✅</div>
        <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px; color: #374151;">
          No unread emails
        </div>
        <div style="font-size: 14px;">You're all caught up!</div>
      </div>
    `;
    return;
  }

  emailList.innerHTML = emails.map((email, index) => `
    <div class="email-item" style="
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      background: #ffffff;
      transition: all 0.2s;
    ">
      
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 8px;
      ">
        <div style="
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
          flex: 1;
          margin-right: 8px;
        ">${email.from.replace(/<.*>/, '').trim()}</div>
        <span style="
          background: #f3f4f6;
          color: #374151;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        ">NEW</span>
      </div>
      
      <div style="
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #1f2937;
      ">${email.subject}</div>
      
      <div style="
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 12px;
        line-height: 1.4;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      ">${email.snippet}</div>
      
      <button class="ai-reply-btn" data-index="${index}" style="
        background: #1f2937;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        width: 100%;
        transition: background-color 0.2s;
      ">
        🤖 AI Reply
      </button>
    </div>
  `).join('');
  
  // Add event listeners for email items
  const emailItems = emailList.querySelectorAll('.email-item');
  emailItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.boxShadow = 'none';
    });
  });
  
  // Add event listeners for AI reply buttons
  const replyButtons = emailList.querySelectorAll('.ai-reply-btn');
  replyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      sendAIResponse(index);
    });
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#111827';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#1f2937';
    });
  });
}

// Send AI response
async function sendAIResponse(emailIndex) {
  const email = currentEmails[emailIndex];
  if (!email) return;

  try {
    updateStatus('Generating AI response...', 'loading');
    
    const response = await chrome.runtime.sendMessage({
      action: 'sendAIResponse',
      email: email
    });
    
    if (response && response.success) {
      updateStatus('AI response sent!', 'success');
      setTimeout(refreshEmails, 2000);
    } else {
      updateStatus('Failed to send response', 'error');
    }
  } catch (error) {
    console.error('Error sending response:', error);
    updateStatus('Error sending response', 'error');
  }
}

// Toggle auto-response
async function toggleAutoResponse(checkbox) {
  const enabled = checkbox.checked;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'toggleAutoResponse',
      enabled: enabled
    });
    
    if (response && response.success) {
      updateStatus(enabled ? 'Auto-response ON' : 'Auto-response OFF', 'success');
      
      // Update toggle visual state
      const slider = checkbox.nextElementSibling;
      if (enabled) {
        slider.style.backgroundColor = '#1f2937';
        slider.nextElementSibling.style.transform = 'translateX(20px)';
      } else {
        slider.style.backgroundColor = '#d1d5db';
        slider.nextElementSibling.style.transform = 'translateX(0)';
      }
    } else {
      updateStatus('Failed to toggle auto-response', 'error');
      checkbox.checked = !enabled;
    }
  } catch (error) {
    console.error('Error toggling auto-response:', error);
    updateStatus('Error toggling auto-response', 'error');
    checkbox.checked = !enabled;
  }
}

// Update status
function updateStatus(message, type = 'info') {
  const statusText = document.getElementById('status-text');
  const statusDot = document.getElementById('status-dot');
  
  if (statusText) {
    statusText.textContent = message;
  }
  
  if (statusDot) {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      loading: '#f59e0b',
      info: '#6b7280'
    };
    statusDot.style.background = colors[type] || colors.info;
  }
}

// Make functions global
window.toggleSidebar = toggleSidebar;
// Handle AI Query
async function handleAIQuery() {
  if (!isAuthenticated) {
    updateStatus('Please authenticate first', 'error');
    return;
  }
  
  const input = document.getElementById('ai-query-input');
  const query = input.value.trim();
  
  if (!query) {
    updateStatus('Please enter a question', 'error');
    return;
  }
  
  try {
    console.log('🤖 Processing AI query:', query);
    updateStatus('Processing your question...', 'loading');
    
    // Show AI response area
    const responseArea = document.getElementById('ai-response-area');
    const responseContent = document.getElementById('ai-response-content');
    responseArea.style.display = 'block';
    responseContent.innerHTML = '<div style="color: #6b7280;">Thinking...</div>';
    
    // Send query to background script (no need to send emails, it uses the database)
    const response = await chrome.runtime.sendMessage({
      action: 'process_ai_query',
      query: query
    });
    
    if (response.success) {
      responseContent.innerHTML = response.response;
      updateStatus('Query processed', 'success');
      
      // If the response includes email actions, handle them
      if (response.emailAction) {
        handleEmailAction(response.emailAction);
      }
    } else {
      responseContent.innerHTML = `<div style="color: #dc2626;">Error: ${response.error}</div>`;
      updateStatus('Query failed', 'error');
    }
    
  } catch (error) {
    console.error('❌ Error processing AI query:', error);
    updateStatus('Failed to process query', 'error');
  }
}

// Handle email actions from AI responses
async function handleEmailAction(action) {
  switch (action.type) {
    case 'draft':
      // Show draft in compose window
      console.log('📝 Draft email:', action.draft);
      // TODO: Open Gmail compose with draft
      break;
    case 'filter':
      // Apply email filter and refresh display
      console.log('🔍 Applying filter:', action.filter);
      // TODO: Filter emails
      break;
  }
}

// Sync email database
async function syncEmailDatabase() {
  try {
    console.log('🌐 Opening sync interface...');
    updateStatus('Opening sync interface...', 'loading');
    
    const syncBtn = document.getElementById('sync-db-btn');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = '⏳ Opening...';
    }
    
    // Send sync request to background (opens web interface)
    const response = await chrome.runtime.sendMessage({
      action: 'sync_all_emails',
      maxResults: 500
    });
    
    if (response.success) {
      updateStatus('Sync interface opened', 'success');
      if (syncBtn) {
        syncBtn.innerHTML = '✅ Interface Opened';
        setTimeout(() => {
          syncBtn.innerHTML = '🌐 Open Sync Interface';
          syncBtn.disabled = false;
        }, 3000);
      }
    } else {
      updateStatus('Failed to open interface', 'error');
      if (syncBtn) {
        syncBtn.innerHTML = '❌ Failed to Open';
        setTimeout(() => {
          syncBtn.innerHTML = '🌐 Open Sync Interface';
          syncBtn.disabled = false;
        }, 3000);
      }
    }
  } catch (error) {
    console.error('❌ Error opening sync interface:', error);
    updateStatus('Error opening interface', 'error');
    const syncBtn = document.getElementById('sync-db-btn');
    if (syncBtn) {
      syncBtn.innerHTML = '🌐 Open Sync Interface';
      syncBtn.disabled = false;
    }
  }
}

window.hideSidebar = hideSidebar;
window.authenticate = authenticate;
window.refreshEmails = refreshEmails;
window.sendAIResponse = sendAIResponse;
window.toggleAutoResponse = toggleAutoResponse;
window.handleAIQuery = handleAIQuery;

// Initialize
async function init() {
  await waitForGmail();
  console.log('📧 Gmail loaded, creating AI toggle button');
  
  createToggleButton();
  
  // Handle Gmail navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => {
        if (sidebarVisible) adjustGmailLayout();
      }, 500);
    }
  }).observe(document, { subtree: true, childList: true });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'click_refresh_button') {
    // Simply click the refresh button - that's it!
    console.log('🔄 Background script requesting refresh button click');
    const refreshBtn = document.querySelector('#refresh-btn');
    if (refreshBtn && sidebarVisible) {
      console.log('✅ Clicking refresh button automatically');
      refreshBtn.click();
    } else if (!sidebarVisible) {
      console.log('⚠️ Sidebar not visible, skipping refresh');
    } else {
      console.log('⚠️ Refresh button not found');
    }
  }
  
  if (message.action === 'new_email_notification') {
    console.log('📬 Received new email notification:', message.data);
    
    // Auto-refresh the email list if sidebar is visible
    if (sidebarVisible) {
      console.log('🔄 Auto-refreshing email list due to new notification...');
      refreshEmails(); // Immediate refresh
    }
    
    // Show a visual indicator in the sidebar
    if (sidebarVisible) {
      const statusDot = document.querySelector('#status-dot');
      const statusText = document.querySelector('#status-text');
      if (statusDot && statusText) {
        statusDot.style.backgroundColor = '#10b981'; // Green
        statusText.textContent = 'New email detected - refreshing...';
        statusText.style.color = '#10b981';
        
        // Reset status after a few seconds
        setTimeout(() => {
          statusDot.style.backgroundColor = '#10b981';
          statusText.textContent = 'Connected & monitoring';
          statusText.style.color = '#6b7280';
        }, 3000);
      }
    }
  }
});

// Start
  init();