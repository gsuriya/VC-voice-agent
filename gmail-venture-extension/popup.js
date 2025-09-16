// Popup script for Gmail Assistant
console.log('Gmail Assistant popup loaded');

// Update status on popup open
document.addEventListener('DOMContentLoaded', function() {
  updateStatus();
  checkAuthStatus();
});

function updateStatus() {
  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');
  
  if (!statusIcon || !statusText) return;
  
  // Check if we're on Gmail
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
      statusIcon.textContent = '●';
      statusIcon.style.color = '#10b981';
      statusText.textContent = 'Active on Gmail - Sidebar available';
    } else {
      statusIcon.textContent = '●';
      statusIcon.style.color = '#f59e0b';
      statusText.textContent = 'Navigate to Gmail to use the extension';
    }
  });
}

function checkAuthStatus() {
  chrome.storage.local.get(['isAuthenticated', 'userEmail'], function(result) {
    const statusText = document.getElementById('status-text');
    
    if (result.isAuthenticated && result.userEmail) {
      statusText.textContent = `Authenticated as ${result.userEmail}`;
    }
  });
}

function openGmail() {
  chrome.tabs.create({
    url: 'https://mail.google.com'
  }, function() {
    window.close();
  });
}

function refreshStatus() {
  const button = document.getElementById('refresh-status');
  if (!button) return;
  
  const originalText = button.innerHTML;
  
  button.innerHTML = '<span>Refreshing...</span>';
  button.disabled = true;
  
  setTimeout(function() {
    updateStatus();
    checkAuthStatus();
    button.innerHTML = originalText;
    button.disabled = false;
  }, 1000);
}

// Listen for tab updates
if (chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      updateStatus();
    }
  });
}

// Listen for tab activation
if (chrome.tabs && chrome.tabs.onActivated) {
  chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateStatus();
  });
}