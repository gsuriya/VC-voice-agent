// AI Email Agent - Clean Minimalist Design
console.log('🤖 AI Email Agent loaded');

let sidebarVisible = false;
let isAuthenticated = false;
let userEmail = '';
let accessToken = null;
let totalEmailsSynced = 0;
let isSearching = false;

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
              Smart Gmail Responses
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div id="status-bar" style="
      padding: 16px 20px;
      background: ${isAuthenticated ? '#d4edda' : '#f8d7da'};
      border-bottom: 1px solid ${isAuthenticated ? '#c3e6cb' : '#f5c6cb'};
    ">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 14px; color: ${isAuthenticated ? '#155724' : '#721c24'};">
          ${isAuthenticated ? `✓ Connected: ${userEmail}` : '⚡ Not authenticated'}
        </div>
        ${isAuthenticated ? `
          <span style="
            background: #28a745;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
          ">${totalEmailsSynced} synced</span>
        ` : ''}
      </div>
    </div>

    <!-- Main Content -->
    <div style="flex: 1; overflow-y: auto;">
      ${!isAuthenticated ? `
        <!-- Auth Section -->
        <div style="padding: 20px;">
          <div style="
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
          ">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937;">
              Connect Your Gmail
            </h3>
            <input type="email" id="email-input" placeholder="your.email@gmail.com" style="
              width: 100%;
              padding: 10px 12px;
              border: 1px solid #ced4da;
              border-radius: 4px;
              font-size: 14px;
              margin-bottom: 12px;
              box-sizing: border-box;
            "/>
            <button id="auth-btn" style="
              width: 100%;
              padding: 10px;
              background: #1f2937;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
            ">🔐 Connect Gmail Account</button>
          </div>
        </div>
      ` : `
        <!-- Controls Section -->
        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
          <button id="sync-btn" style="
            width: 100%;
            padding: 12px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 12px;
          ">🚀 Sync Gmail to Vector DB</button>
          
          <div id="sync-progress" style="display: none;">
            <div style="
              background: #e5e7eb;
              height: 4px;
              border-radius: 2px;
              overflow: hidden;
              margin-bottom: 8px;
            ">
              <div id="progress-bar" style="
                background: #4f46e5;
                height: 100%;
                width: 0%;
                transition: width 0.3s ease;
              "></div>
            </div>
            <p id="sync-status" style="
              margin: 0;
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
              border: 1px solid #ced4da;
              border-radius: 4px;
              font-size: 14px;
              box-sizing: border-box;
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
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
            <button class="quick-search" data-query="recent emails" style="
              padding: 6px 12px;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
            ">Recent</button>
            <button class="quick-search" data-query="important emails" style="
              padding: 6px 12px;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
            ">Important</button>
            <button class="quick-search" data-query="unread emails" style="
              padding: 6px 12px;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
            ">Unread</button>
            <button class="quick-search" data-query="emails from today" style="
              padding: 6px 12px;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
            ">Today</button>
          </div>

          <!-- Search Results -->
          <div id="search-results" style="
            max-height: calc(100vh - 400px);
            overflow-y: auto;
          ">
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              Search results will appear here...
            </p>
          </div>
        </div>
      `}
    </div>

    <!-- Footer -->
    <div style="
      padding: 12px 20px;
      background: #f8f9fa;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    ">
      ${isAuthenticated ? `
        <button id="disconnect-btn" style="
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          font-size: 12px;
          text-decoration: underline;
        ">Disconnect</button>
      ` : 'Secure & Private'}
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

  // Disconnect button
  const disconnectBtn = document.getElementById('disconnect-btn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', handleDisconnect);
  }

  // Sync button
  const syncBtn = document.getElementById('sync-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', handleSync);
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
  authBtn.textContent = '🔄 Connecting...';
  authBtn.disabled = true;

  try {
    const response = await fetch('http://localhost:3000/api/demo-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail: email }),
    });

    const data = await response.json();
    
    if (data.success) {
      isAuthenticated = true;
      userEmail = email;
      accessToken = data.tokens.access_token;
      
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
    }
  } catch (error) {
    console.error('Auth error:', error);
    alert('Authentication failed. Please try again.');
  } finally {
    authBtn.textContent = '🔐 Connect Gmail Account';
    authBtn.disabled = false;
  }
}

// Handle disconnect
function handleDisconnect() {
  isAuthenticated = false;
  userEmail = '';
  accessToken = null;
  totalEmailsSynced = 0;
  
  chrome.storage.local.clear();
  createSidebar();
}

// Handle sync
async function handleSync() {
  const syncBtn = document.getElementById('sync-btn');
  const syncProgress = document.getElementById('sync-progress');
  const progressBar = document.getElementById('progress-bar');
  const syncStatus = document.getElementById('sync-status');
  
  syncBtn.style.display = 'none';
  syncProgress.style.display = 'block';
  
  try {
    // Show progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        progressBar.style.width = progress + '%';
        syncStatus.textContent = `Syncing... ${progress}%`;
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
        maxResults: 50,
      }),
    });

    const data = await response.json();
    
    clearInterval(progressInterval);
    
    if (data.success) {
      progressBar.style.width = '100%';
      syncStatus.textContent = '✅ Sync complete!';
      totalEmailsSynced = data.totalEmails;
      
      // Refresh UI after delay
      setTimeout(() => {
        createSidebar();
      }, 1500);
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
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
      cursor: pointer;
    " onmouseover="this.style.background='#f1f3f4'" onmouseout="this.style.background='#f8f9fa'">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; flex: 1;">
          ${result.metadata.subject || 'No subject'}
        </h4>
        <span style="font-size: 11px; color: #6b7280;">
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
  chrome.storage.local.get(['isAuthenticated', 'userEmail', 'accessToken'], async (result) => {
    if (result.isAuthenticated) {
      isAuthenticated = true;
      userEmail = result.userEmail;
      accessToken = result.accessToken;
      
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
`;
document.head.appendChild(style);
