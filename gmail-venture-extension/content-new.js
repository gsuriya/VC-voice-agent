// AI Email Agent - Advanced Gmail Integration
console.log('🤖 AI Email Agent loaded');

let isAuthenticated = false;
let userEmail = '';
let accessToken = null;
let totalEmailsSynced = 0;
let sidebarVisible = false;

// Create floating button
function createFloatingButton() {
  const button = document.createElement('div');
  button.id = 'ai-email-floating-btn';
  button.innerHTML = '🤖';
  button.style.cssText = `
    position: fixed;
    right: 30px;
    bottom: 30px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    z-index: 9999;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
  });
  
  button.addEventListener('click', toggleSidebar);
  document.body.appendChild(button);
}

// Create modern sidebar
function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.id = 'ai-email-sidebar';
  sidebar.innerHTML = `
    <div style="
      position: fixed;
      right: ${sidebarVisible ? '0' : '-400px'};
      top: 0;
      width: 400px;
      height: 100vh;
      background: #ffffff;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <!-- Header -->
      <div style="
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="margin: 0; font-size: 24px; font-weight: 700;">AI Email Agent</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Semantic Search & Smart Compose</p>
          </div>
          <button id="close-sidebar" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
          ">✕</button>
        </div>
      </div>

      <!-- Auth Section -->
      <div id="auth-section" style="
        padding: 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
      ">
        <div id="auth-content">
          ${!isAuthenticated ? `
            <div style="
              background: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            ">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1f2937;">Connect Your Gmail</h3>
              <input type="email" id="email-input" placeholder="your.email@gmail.com" style="
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                margin-bottom: 12px;
                box-sizing: border-box;
                transition: border-color 0.3s;
              " />
              <button id="connect-btn" style="
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.3s;
              ">🔐 Connect Gmail Account</button>
            </div>
          ` : `
            <div style="
              background: #d4edda;
              padding: 15px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            ">
              <div>
                <div style="font-weight: 600; color: #155724;">✓ Connected</div>
                <div style="font-size: 14px; color: #155724; margin-top: 4px;">${userEmail}</div>
              </div>
              <button id="disconnect-btn" style="
                background: white;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
              ">Disconnect</button>
            </div>
          `}
        </div>
      </div>

      <!-- Main Content Area -->
      <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
        ${isAuthenticated ? `
          <!-- Sync Section -->
          <div id="sync-section" style="
            padding: 20px;
            background: white;
            border-bottom: 1px solid #e9ecef;
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;
            ">
              <h3 style="margin: 0; font-size: 16px; color: #1f2937;">Email Sync Status</h3>
              <span id="sync-count" style="
                background: #e0e7ff;
                color: #4338ca;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
              ">${totalEmailsSynced} emails</span>
            </div>
            
            <button id="sync-btn" style="
              width: 100%;
              padding: 12px;
              background: #4f46e5;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              <span>🚀</span>
              <span>Sync Gmail to Vector DB</span>
            </button>
            
            <div id="sync-progress" style="
              margin-top: 12px;
              display: none;
            ">
              <div style="
                background: #e5e7eb;
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
              ">
                <div id="progress-bar" style="
                  background: linear-gradient(90deg, #4f46e5, #667eea);
                  height: 100%;
                  width: 0%;
                  transition: width 0.3s ease;
                "></div>
              </div>
              <p id="sync-status" style="
                margin: 8px 0 0 0;
                font-size: 14px;
                color: #6b7280;
                text-align: center;
              ">Syncing...</p>
            </div>
          </div>

          <!-- Search Section -->
          <div id="search-section" style="
            padding: 20px;
            background: #f8f9fa;
            flex: 1;
            display: flex;
            flex-direction: column;
          ">
            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1f2937;">🔍 Semantic Email Search</h3>
            
            <!-- Search Input -->
            <div style="
              display: flex;
              gap: 8px;
              margin-bottom: 12px;
            ">
              <input type="text" id="search-input" placeholder="Search emails naturally..." style="
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.3s;
              " />
              <button id="search-btn" style="
                padding: 12px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
              ">Search</button>
            </div>

            <!-- Quick Search Chips -->
            <div style="
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-bottom: 16px;
            ">
              <button class="quick-search" data-query="find my recent emails" style="
                padding: 6px 14px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              ">Recent emails</button>
              <button class="quick-search" data-query="important emails" style="
                padding: 6px 14px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              ">Important</button>
              <button class="quick-search" data-query="unread emails" style="
                padding: 6px 14px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              ">Unread</button>
              <button class="quick-search" data-query="emails from today" style="
                padding: 6px 14px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
              ">Today</button>
            </div>

            <!-- Search Results -->
            <div id="search-results" style="
              flex: 1;
              overflow-y: auto;
              background: white;
              border-radius: 8px;
              padding: 12px;
              min-height: 200px;
            ">
              <p style="
                text-align: center;
                color: #9ca3af;
                font-size: 14px;
                margin-top: 40px;
              ">Search results will appear here...</p>
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
              <p style="color: #6b7280; font-size: 16px;">Connect your Gmail to start using AI search</p>
            </div>
          </div>
        `}
      </div>

      <!-- Footer -->
      <div style="
        padding: 16px 20px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        text-align: center;
      ">
        <p style="
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        ">Powered by AI • Secure & Private</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  
  // Add event listeners
  setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
  // Close button
  const closeBtn = document.getElementById('close-sidebar');
  if (closeBtn) {
    closeBtn.addEventListener('click', toggleSidebar);
  }

  // Auth buttons
  const connectBtn = document.getElementById('connect-btn');
  if (connectBtn) {
    connectBtn.addEventListener('click', handleAuth);
  }

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

    // Hover effects
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#e0e7ff';
      btn.style.borderColor = '#c7d2fe';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'white';
      btn.style.borderColor = '#e5e7eb';
    });
  });
}

// Toggle sidebar visibility
function toggleSidebar() {
  sidebarVisible = !sidebarVisible;
  const sidebar = document.getElementById('ai-email-sidebar');
  if (sidebar) {
    sidebar.querySelector('div').style.right = sidebarVisible ? '0' : '-400px';
  }
}

// Handle authentication
async function handleAuth() {
  const emailInput = document.getElementById('email-input');
  const email = emailInput.value.trim();
  
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  const connectBtn = document.getElementById('connect-btn');
  connectBtn.innerHTML = '🔄 Connecting...';
  connectBtn.disabled = true;

  try {
    // For now, we'll use the demo auth
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

      // Refresh UI
      updateUIState();
    }
  } catch (error) {
    console.error('Auth error:', error);
    alert('Authentication failed. Please try again.');
  } finally {
    connectBtn.innerHTML = '🔐 Connect Gmail Account';
    connectBtn.disabled = false;
  }
}

// Handle disconnect
function handleDisconnect() {
  isAuthenticated = false;
  userEmail = '';
  accessToken = null;
  totalEmailsSynced = 0;
  
  chrome.storage.local.clear();
  updateUIState();
}

// Handle sync
async function handleSync() {
  const syncBtn = document.getElementById('sync-btn');
  const syncProgress = document.getElementById('sync-progress');
  const progressBar = document.getElementById('progress-bar');
  const syncStatus = document.getElementById('sync-status');
  
  syncBtn.disabled = true;
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
    }, 200);

    // Call sync API
    const response = await fetch('http://localhost:3000/api/sync-gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: { access_token: accessToken },
        userEmail: userEmail,
        maxResults: 50, // Start with 50 emails
      }),
    });

    const data = await response.json();
    
    clearInterval(progressInterval);
    
    if (data.success) {
      progressBar.style.width = '100%';
      syncStatus.textContent = '✅ Sync complete!';
      totalEmailsSynced = data.totalEmails;
      
      // Update count
      document.getElementById('sync-count').textContent = `${totalEmailsSynced} emails`;
      
      // Hide progress after 2 seconds
      setTimeout(() => {
        syncProgress.style.display = 'none';
        progressBar.style.width = '0%';
      }, 2000);
    } else {
      throw new Error(data.error || 'Sync failed');
    }
  } catch (error) {
    console.error('Sync error:', error);
    syncStatus.textContent = '❌ Sync failed';
    progressBar.style.background = '#ef4444';
  } finally {
    syncBtn.disabled = false;
  }
}

// Handle search
async function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();
  
  if (!query) return;

  const searchBtn = document.getElementById('search-btn');
  const resultsDiv = document.getElementById('search-results');
  
  searchBtn.textContent = '⏳';
  searchBtn.disabled = true;
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
      displaySearchResults(data.results);
    } else {
      resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="color: #6b7280;">No emails found matching your search.</p>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">Try a different search term</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsDiv.innerHTML = '<p style="text-align: center; color: #ef4444;">Search failed. Please try again.</p>';
  } finally {
    searchBtn.textContent = 'Search';
    searchBtn.disabled = false;
  }
}

// Display search results
function displaySearchResults(results) {
  const resultsDiv = document.getElementById('search-results');
  
  resultsDiv.innerHTML = results.map(result => `
    <div style="
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.2s;
    " onmouseover="this.style.borderColor='#c7d2fe'" onmouseout="this.style.borderColor='#e9ecef'">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 8px;
      ">
        <h4 style="
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          flex: 1;
        ">${result.metadata.subject || 'No subject'}</h4>
        <span style="
          background: #e0e7ff;
          color: #4338ca;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        ">${Math.round(result.score * 100)}%</span>
      </div>
      <p style="
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #4b5563;
      ">From: ${result.metadata.fromName || result.metadata.from}</p>
      ${result.metadata.snippet ? `
        <p style="
          margin: 0;
          font-size: 13px;
          color: #6b7280;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        ">${result.metadata.snippet}</p>
      ` : ''}
    </div>
  `).join('');
}

// Update UI based on auth state
function updateUIState() {
  const sidebar = document.getElementById('ai-email-sidebar');
  if (sidebar) {
    document.body.removeChild(sidebar);
  }
  createSidebar();
}

// Check stored auth state on load
async function checkAuthState() {
  chrome.storage.local.get(['isAuthenticated', 'userEmail', 'accessToken'], (result) => {
    if (result.isAuthenticated) {
      isAuthenticated = true;
      userEmail = result.userEmail;
      accessToken = result.accessToken;
      
      // Check total emails synced
      checkSyncStatus();
    }
  });
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

// Initialize when Gmail loads
function initialize() {
  console.log('🚀 Initializing AI Email Agent...');
  
  // Check if we're on Gmail
  if (!window.location.hostname.includes('mail.google.com')) {
    console.log('❌ Not on Gmail, skipping initialization');
    return;
  }

  // Create UI elements
  createFloatingButton();
  createSidebar();
  
  // Check auth state
  checkAuthState();
}

// Wait for page to fully load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Style injection
const style = document.createElement('style');
style.textContent = `
  #ai-email-floating-btn:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }

  #email-input:focus,
  #search-input:focus {
    outline: none;
    border-color: #667eea;
  }

  button {
    transition: all 0.2s ease;
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Scrollbar styling */
  #search-results::-webkit-scrollbar {
    width: 6px;
  }

  #search-results::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  #search-results::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  #search-results::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
document.head.appendChild(style);
