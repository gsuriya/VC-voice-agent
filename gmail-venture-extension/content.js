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
        ">🔐 Authenticate with Google</button>
        
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

        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
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
      console.error('❌ Extension context invalidated');
      updateStatus('Extension error - please reload', 'error');
      return;
    }

    console.log('📡 Sending message to background script...');
    const response = await chrome.runtime.sendMessage({ action: 'authenticate' });
    console.log('📨 Response from background:', response);
    
    if (response && response.success) {
      isAuthenticated = true;
      updateStatus('Connected to Gmail', 'success');
      setTimeout(refreshEmails, 1000);
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
  if (!isAuthenticated) {
    authenticate();
    return;
  }

  try {
    updateStatus('Loading emails...', 'loading');
    
    const response = await chrome.runtime.sendMessage({ 
      action: 'getEmails',
      maxResults: 10 
    });
    
    if (response && response.success) {
      currentEmails = response.emails;
      displayEmails(response.emails);
      updateStatus(`${response.emails.length} unread emails`, 'success');
    } else {
      updateStatus('Failed to load emails', 'error');
    }
  } catch (error) {
    console.error('Error loading emails:', error);
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
window.hideSidebar = hideSidebar;
window.authenticate = authenticate;
window.refreshEmails = refreshEmails;
window.sendAIResponse = sendAIResponse;
window.toggleAutoResponse = toggleAutoResponse;

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

// Start
  init();