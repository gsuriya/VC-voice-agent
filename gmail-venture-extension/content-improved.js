// AI Email Agent - Improved UI with Account Management
console.log('🤖 AI Email Agent loaded');

let sidebarVisible = false;
let isAuthenticated = false;
let userEmail = '';
let accessToken = null;
let totalEmailsSynced = 0;
let isSearching = false;
let lastSyncTime = null;

// Create toggle button
function createToggleButton() {
  const existingBtn = document.getElementById('ai-email-toggle-btn');
  if (existingBtn) return;

  const button = document.createElement('div');
  button.id = 'ai-email-toggle-btn';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2a7 7 0 1 0 0 14 7 7 0 1 0 0-14"></path>
      <path d="M12 8v8"></path>
      <path d="M8 12h8"></path>
    </svg>
  `;
  button.style.cssText = `
    position: fixed;
    right: ${sidebarVisible ? '420px' : '20px'};
    top: 80px;
    width: 40px;
    height: 40px;
    background: #1f2937;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    z-index: 9999;
  `;
  
  button.addEventListener('click', toggleSidebar);
  document.body.appendChild(button);
}

// Create sidebar
function createSidebar() {
  const existingSidebar = document.getElementById('ai-email-sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'ai-email-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    right: ${sidebarVisible ? '0' : '-400px'};
    top: 0;
    width: 400px;
    height: 100vh;
    background: #ffffff;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
    transition: right 0.3s ease;
    z-index: 9998;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  sidebar.innerHTML = `
    <!-- Header -->
    <div style="
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 40px;
            height: 40px;
            background: #1f2937;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
          ">🤖</div>
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">
              AI Email Agent
            </h2>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Semantic Search & Smart Sync
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Section -->
    <div style="
      padding: 16px 20px;
      background: ${isAuthenticated ? '#f0f9ff' : '#fef3c7'};
      border-bottom: 1px solid ${isAuthenticated ? '#bae6fd' : '#fcd34d'};
    ">
      ${!isAuthenticated ? `
        <!-- Not Authenticated -->
        <div>
          <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #92400e;">
            Connect Gmail Account
          </h3>
          <div style="display: flex; gap: 8px;">
            <input type="email" id="email-input" placeholder="your.email@gmail.com" style="
              flex: 1;
              padding: 8px 12px;
              border: 1px solid #fbbf24;
              border-radius: 6px;
              font-size: 14px;
            "/>
            <button id="auth-btn" style="
              padding: 8px 16px;
              background: #f59e0b;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
            ">Connect</button>
          </div>
        </div>
      ` : `
        <!-- Authenticated -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="color: #10b981; font-size: 16px;">✓</span>
                <span style="font-weight: 600; color: #065f46;">${userEmail}</span>
              </div>
              <div style="font-size: 13px; color: #047857;">
                ${totalEmailsSynced} emails indexed
                ${lastSyncTime ? ` • Last sync: ${new Date(lastSyncTime).toLocaleTimeString()}` : ''}
              </div>
            </div>
            <button id="account-menu-btn" style="
              background: white;
              border: 1px solid #d1fae5;
              color: #065f46;
              padding: 4px 12px;
              border-radius: 6px;
              font-size: 13px;
              cursor: pointer;
            ">⚙️</button>
          </div>
          
          <!-- Account Menu (hidden by default) -->
          <div id="account-menu" style="
            display: none;
            position: absolute;
            right: 20px;
            top: 60px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10;
          ">
            <button id="switch-account-btn" style="
              display: block;
              width: 100%;
              padding: 10px 16px;
              background: none;
              border: none;
              text-align: left;
              cursor: pointer;
              font-size: 14px;
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
            ">🔄 Switch Account</button>
            <button id="resync-btn" style="
              display: block;
              width: 100%;
              padding: 10px 16px;
              background: none;
              border: none;
              text-align: left;
              cursor: pointer;
              font-size: 14px;
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
            ">🔄 Re-sync Emails</button>
            <button id="disconnect-btn" style="
              display: block;
              width: 100%;
              padding: 10px 16px;
              background: none;
              border: none;
              text-align: left;
              cursor: pointer;
              font-size: 14px;
              color: #dc2626;
            ">🚪 Disconnect</button>
          </div>
        </div>
      `}
    </div>

    <!-- Main Content -->
    <div style="flex: 1; overflow-y: auto;">
      ${isAuthenticated ? `
        <!-- Quick Actions -->
        <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button id="sync-new-btn" style="
              padding: 10px;
              background: #4f46e5;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            ">
              <span>🔄</span>
              <span>Sync New</span>
            </button>
            <button id="sync-all-btn" style="
              padding: 10px;
              background: #7c3aed;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            ">
              <span>🚀</span>
              <span>Full Sync</span>
            </button>
          </div>
          
          <div id="sync-progress" style="display: none; margin-top: 12px;">
            <div style="
              background: #e5e7eb;
              height: 4px;
              border-radius: 2px;
              overflow: hidden;
            ">
              <div id="progress-bar" style="
                background: #4f46e5;
                height: 100%;
                width: 0%;
                transition: width 0.3s ease;
              "></div>
            </div>
            <p id="sync-status" style="
              margin: 8px 0 0 0;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            ">Syncing...</p>
          </div>
        </div>

        <!-- Search Section -->
        <div style="padding: 20px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
            🔍 Semantic Search
          </h3>
          
          <div style="position: relative; margin-bottom: 12px;">
            <input type="text" id="search-input" placeholder="Search emails naturally..." style="
              width: 100%;
              padding: 10px 40px 10px 12px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              font-size: 14px;
              box-sizing: border-box;
              transition: all 0.2s;
            "/>
            <button id="search-btn" style="
              position: absolute;
              right: 4px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              color: #6b7280;
              cursor: pointer;
              padding: 6px;
            ">🔍</button>
          </div>

          <!-- Quick Searches -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
            <button class="quick-search" data-query="recent emails" style="
              padding: 5px 12px;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            ">Recent</button>
            <button class="quick-search" data-query="important emails" style="
              padding: 5px 12px;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            ">Important</button>
            <button class="quick-search" data-query="unread emails" style="
              padding: 5px 12px;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            ">Unread</button>
            <button class="quick-search" data-query="emails from today" style="
              padding: 5px 12px;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            ">Today</button>
            <button class="quick-search" data-query="job applications" style="
              padding: 5px 12px;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
            ">Jobs</button>
          </div>

          <!-- Search Results -->
          <div id="search-results" style="
            max-height: calc(100vh - 450px);
            overflow-y: auto;
          ">
            <p style="text-align: center; color: #9ca3af; font-size: 14px;">
              Search your ${totalEmailsSynced} indexed emails...
            </p>
          </div>
        </div>
      ` : `
        <!-- Not Authenticated State -->
        <div style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        ">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
            <p style="color: #6b7280; font-size: 16px;">Connect your Gmail to start</p>
          </div>
        </div>
      `}
    </div>

    <!-- Footer -->
    <div style="
      padding: 12px 20px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    ">
      Secure • Private • AI-Powered
    </div>
  `;
  
  document.body.appendChild(sidebar);
  setupEventListeners();
}

// Toggle sidebar
function toggleSidebar() {
  sidebarVisible = !sidebarVisible;
  const sidebar = document.getElementById('ai-email-sidebar');
  const toggleBtn = document.getElementById('ai-email-toggle-btn');
  
  if (sidebar) {
    sidebar.style.right = sidebarVisible ? '0' : '-400px';
  }
  
  if (toggleBtn) {
    toggleBtn.style.right = sidebarVisible ? '420px' : '20px';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Auth button
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', handleAuth);
  }

  // Account menu button
  const accountMenuBtn = document.getElementById('account-menu-btn');
  if (accountMenuBtn) {
    accountMenuBtn.addEventListener('click', () => {
      const menu = document.getElementById('account-menu');
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
  }

  // Switch account button
  const switchAccountBtn = document.getElementById('switch-account-btn');
  if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', handleSwitchAccount);
  }

  // Resync button
  const resyncBtn = document.getElementById('resync-btn');
  if (resyncBtn) {
    resyncBtn.addEventListener('click', () => {
      document.getElementById('account-menu').style.display = 'none';
      handleSync(false); // Sync new emails only
    });
  }

  // Disconnect button
  const disconnectBtn = document.getElementById('disconnect-btn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', handleDisconnect);
  }

  // Sync buttons
  const syncNewBtn = document.getElementById('sync-new-btn');
  if (syncNewBtn) {
    syncNewBtn.addEventListener('click', () => handleSync(false));
  }

  const syncAllBtn = document.getElementById('sync-all-btn');
  if (syncAllBtn) {
    syncAllBtn.addEventListener('click', () => handleSync(true));
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

  // Quick search buttons
  const quickSearchBtns = document.querySelectorAll('.quick-search');
  quickSearchBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const query = e.target.getAttribute('data-query');
      document.getElementById('search-input').value = query;
      handleSearch();
    });
  });

  // Click outside to close account menu
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('account-menu');
    const menuBtn = document.getElementById('account-menu-btn');
    if (menu && !menu.contains(e.target) && e.target !== menuBtn) {
      menu.style.display = 'none';
    }
  });
}

// Handle authentication
async function handleAuth() {
  const emailInput = document.getElementById('email-input');
  const email = emailInput.value.trim();
  
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  const authBtn = document.getElementById('auth-btn');
  authBtn.textContent = '⏳';
  authBtn.disabled = true;

  try {
    // Send message to background script to open auth window
    chrome.runtime.sendMessage({
      action: 'open_auth_window',
      userEmail: email
    }, async (response) => {
      if (response && response.success) {
        isAuthenticated = true;
        userEmail = email;
        accessToken = response.accessToken;
        
        // Store in Chrome storage
        chrome.storage.local.set({
          isAuthenticated: true,
          userEmail: email,
          accessToken: accessToken,
        });

        // Check sync status
        await checkSyncStatus();
        
        // Refresh UI
        createSidebar();
      } else {
        alert('Authentication failed. Please try again.');
      }
      
      authBtn.textContent = 'Connect';
      authBtn.disabled = false;
    });
  } catch (error) {
    console.error('Auth error:', error);
    alert('Authentication failed. Please try again.');
    authBtn.textContent = 'Connect';
    authBtn.disabled = false;
  }
}

// Handle switch account
function handleSwitchAccount() {
  // Clear current auth
  isAuthenticated = false;
  userEmail = '';
  accessToken = null;
  totalEmailsSynced = 0;
  lastSyncTime = null;
  
  chrome.storage.local.clear();
  
  // Close menu and refresh UI
  document.getElementById('account-menu').style.display = 'none';
  createSidebar();
}

// Handle disconnect
function handleDisconnect() {
  if (confirm('Are you sure you want to disconnect? Your synced emails will remain in the database.')) {
    handleSwitchAccount();
  }
}

// Handle sync
async function handleSync(fullSync = false) {
  const syncProgress = document.getElementById('sync-progress');
  const progressBar = document.getElementById('progress-bar');
  const syncStatus = document.getElementById('sync-status');
  
  syncProgress.style.display = 'block';
  
  try {
    // Show progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        progressBar.style.width = progress + '%';
        syncStatus.textContent = fullSync ? `Full sync... ${progress}%` : `Syncing new emails... ${progress}%`;
      }
    }, 500);

    // Call sync API
    const response = await fetch('http://localhost:3000/api/sync-gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: { access_token: accessToken },
        userEmail: userEmail,
        maxResults: fullSync ? 200 : 50,
        syncType: fullSync ? 'full' : 'incremental',
      }),
    });

    const data = await response.json();
    
    clearInterval(progressInterval);
    
    if (data.success) {
      progressBar.style.width = '100%';
      syncStatus.textContent = `✅ Synced ${data.totalEmails} emails!`;
      totalEmailsSynced += data.totalEmails;
      lastSyncTime = new Date().toISOString();
      
      // Store updated count
      chrome.storage.local.set({
        totalEmailsSynced: totalEmailsSynced,
        lastSyncTime: lastSyncTime,
      });
      
      // Hide progress after delay
      setTimeout(() => {
        syncProgress.style.display = 'none';
        progressBar.style.width = '0%';
        createSidebar(); // Refresh to show new count
      }, 2000);
    }
  } catch (error) {
    console.error('Sync error:', error);
    syncStatus.textContent = '❌ Sync failed';
  }
}

// Handle search
async function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();
  
  if (!query || isSearching) return;

  isSearching = true;
  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = '<p style="text-align: center; color: #6b7280;">Searching...</p>';

  try {
    const response = await fetch('http://localhost:3000/api/test-pinecone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search_emails',
        query: query,
      }),
    });

    const data = await response.json();
    
    if (data.success && data.results.length > 0) {
      displayResults(data.results);
    } else {
      resultsDiv.innerHTML = '<p style="text-align: center; color: #6b7280; font-size: 14px;">No emails found</p>';
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsDiv.innerHTML = '<p style="text-align: center; color: #dc3545; font-size: 14px;">Search failed</p>';
  } finally {
    isSearching = false;
  }
}

// Display search results
function displayResults(results) {
  const resultsDiv = document.getElementById('search-results');
  
  resultsDiv.innerHTML = results.map(result => `
    <div style="
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
    " onmouseover="this.style.borderColor='#d1d5db'; this.style.background='#f3f4f6'" 
       onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='#f9fafb'">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; flex: 1;">
          ${result.metadata.subject || 'No subject'}
        </h4>
        <span style="font-size: 11px; color: #9ca3af;">
          ${Math.round(result.score * 100)}%
        </span>
      </div>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: #4b5563;">
        ${result.metadata.fromName || result.metadata.from}
      </p>
      ${result.metadata.snippet ? `
        <p style="margin: 0; font-size: 12px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
          ${result.metadata.snippet}
        </p>
      ` : ''}
      <div style="margin-top: 6px; font-size: 11px; color: #9ca3af;">
        ${new Date(result.metadata.date).toLocaleDateString()}
      </div>
    </div>
  `).join('');
}

// Check sync status
async function checkSyncStatus() {
  try {
    const response = await fetch('http://localhost:3000/api/test-pinecone');
    const data = await response.json();
    
    if (data.success && data.indexStats) {
      totalEmailsSynced = data.indexStats.totalRecordCount || 0;
    }
  } catch (error) {
    console.error('Failed to check sync status:', error);
  }
}

// Check stored auth state
async function checkAuthState() {
  chrome.storage.local.get(['isAuthenticated', 'userEmail', 'accessToken', 'totalEmailsSynced', 'lastSyncTime'], async (result) => {
    if (result.isAuthenticated) {
      isAuthenticated = true;
      userEmail = result.userEmail;
      accessToken = result.accessToken;
      totalEmailsSynced = result.totalEmailsSynced || 0;
      lastSyncTime = result.lastSyncTime;
      
      await checkSyncStatus();
      createSidebar();
    }
  });
}

// Initialize
function initialize() {
  console.log('🚀 Initializing AI Email Agent...');
  
  if (!window.location.hostname.includes('mail.google.com')) {
    console.log('❌ Not on Gmail, skipping initialization');
    return;
  }

  createToggleButton();
  createSidebar();
  checkAuthState();
}

// Wait for page to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Minimal styles
const style = document.createElement('style');
style.textContent = `
  #ai-email-toggle-btn:hover {
    background: #374151 !important;
  }

  #email-input:focus,
  #search-input:focus {
    outline: none;
    border-color: #4f46e5 !important;
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .quick-search:hover {
    background: #e5e7eb !important;
  }

  #search-results::-webkit-scrollbar {
    width: 6px;
  }

  #search-results::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  #search-results::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  #account-menu button:hover {
    background: #f3f4f6 !important;
  }
`;
document.head.appendChild(style);
