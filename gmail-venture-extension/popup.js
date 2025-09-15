// AI Email Agent Popup Script
console.log('🤖 AI Email Agent popup loaded');

// DOM elements
let statusIcon, statusText, autoResponseToggle;

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  statusIcon = document.getElementById('status-icon');
  statusText = document.getElementById('status-text');
  autoResponseToggle = document.getElementById('auto-response-toggle');
  
  // Load initial state
  loadState();
  
  // Add event listeners
  autoResponseToggle.addEventListener('change', toggleAutoResponse);
  
  // Check if we're on Gmail
  checkGmailStatus();
});

// Load saved state from storage
async function loadState() {
  try {
    const result = await chrome.storage.local.get(['autoResponseEnabled']);
    if (result.autoResponseEnabled) {
      autoResponseToggle.checked = true;
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

// Check if current tab is Gmail
async function checkGmailStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url && tab.url.includes('mail.google.com')) {
      updateStatus('✅', 'Connected to Gmail', 'success');
      
      // Check authentication status
      checkAuthStatus();
    } else {
      updateStatus('📧', 'Open Gmail to use AI features', 'info');
    }
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    updateStatus('❌', 'Error checking status', 'error');
  }
}

// Check authentication status
async function checkAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'authenticate' });
    if (response && response.success) {
      updateStatus('🤖', 'AI Email Agent ready', 'success');
    } else {
      updateStatus('🔐', 'Click authenticate to get started', 'warning');
      showAuthButton();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    updateStatus('🔐', 'Authentication required', 'warning');
    showAuthButton();
  }
}

// Update status display
function updateStatus(icon, text, type = 'info') {
  if (statusIcon) statusIcon.textContent = icon;
  if (statusText) statusText.textContent = text;
  
  // Update status card color based on type
  const statusCard = document.querySelector('.status-card');
  if (statusCard) {
    statusCard.style.background = getStatusColor(type);
  }
}

// Get status color based on type
function getStatusColor(type) {
  switch (type) {
    case 'success': return 'rgba(76, 175, 80, 0.2)';
    case 'warning': return 'rgba(255, 193, 7, 0.2)';
    case 'error': return 'rgba(244, 67, 54, 0.2)';
    default: return 'rgba(255, 255, 255, 0.1)';
  }
}

// Show authenticate button
function showAuthButton() {
  const authButton = document.getElementById('authenticate');
  if (authButton) {
    authButton.style.display = 'block';
  }
}

// Open Gmail in new tab
function openGmail() {
  chrome.tabs.create({ url: 'https://mail.google.com' });
  window.close();
}

// Authenticate with Google
async function authenticate() {
  try {
    updateStatus('🔄', 'Authenticating...', 'info');
    
    const response = await chrome.runtime.sendMessage({ action: 'authenticate' });
    
    if (response && response.success) {
      updateStatus('✅', 'Authentication successful!', 'success');
      hideAuthButton();
      
      // Hide auth button after successful authentication
      setTimeout(() => {
        updateStatus('🤖', 'AI Email Agent ready', 'success');
      }, 2000);
    } else {
      updateStatus('❌', 'Authentication failed', 'error');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    updateStatus('❌', 'Authentication error', 'error');
  }
}

// Hide authenticate button
function hideAuthButton() {
  const authButton = document.getElementById('authenticate');
  if (authButton) {
    authButton.style.display = 'none';
  }
}

// Refresh emails
async function refreshEmails() {
  try {
    updateStatus('🔄', 'Refreshing emails...', 'info');
    
    // Send message to content script via background
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url && tab.url.includes('mail.google.com')) {
      const response = await chrome.runtime.sendMessage({ 
        action: 'getEmails',
        maxResults: 10 
      });
      
      if (response && response.success) {
        const count = response.emails.length;
        updateStatus('📧', `Found ${count} unread emails`, 'success');
        
        // Reset status after a few seconds
        setTimeout(() => {
          updateStatus('🤖', 'AI Email Agent ready', 'success');
        }, 3000);
      } else {
        updateStatus('❌', 'Failed to refresh emails', 'error');
      }
    } else {
      updateStatus('📧', 'Please open Gmail first', 'warning');
    }
  } catch (error) {
    console.error('Error refreshing emails:', error);
    updateStatus('❌', 'Error refreshing emails', 'error');
  }
}

// Toggle auto-response
async function toggleAutoResponse() {
  const enabled = autoResponseToggle.checked;
  
  try {
    updateStatus('🔄', enabled ? 'Enabling auto-response...' : 'Disabling auto-response...', 'info');
    
    const response = await chrome.runtime.sendMessage({
      action: 'toggleAutoResponse',
      enabled: enabled
    });
    
    if (response && response.success) {
      // Save state
      await chrome.storage.local.set({ autoResponseEnabled: enabled });
      
      updateStatus(
        enabled ? '🔄' : '⏸️', 
        enabled ? 'Auto-response enabled' : 'Auto-response disabled', 
        'success'
      );
      
      // Reset status after a few seconds
      setTimeout(() => {
        updateStatus('🤖', 'AI Email Agent ready', 'success');
      }, 3000);
    } else {
      updateStatus('❌', 'Failed to toggle auto-response', 'error');
      // Revert toggle
      autoResponseToggle.checked = !enabled;
    }
  } catch (error) {
    console.error('Error toggling auto-response:', error);
    updateStatus('❌', 'Error toggling auto-response', 'error');
    // Revert toggle
    autoResponseToggle.checked = !enabled;
  }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Popup received message:', request);
  
  switch (request.action) {
    case 'statusUpdate':
      updateStatus(request.icon, request.text, request.type);
      break;
      
    case 'emailProcessed':
      updateStatus('✅', `AI response sent to ${request.recipient}`, 'success');
      setTimeout(() => {
        updateStatus('🤖', 'AI Email Agent ready', 'success');
      }, 3000);
      break;
  }
});

// Refresh status when popup is opened
window.addEventListener('focus', () => {
  checkGmailStatus();
});