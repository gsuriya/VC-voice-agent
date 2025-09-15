// Simple popup script
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a Gmail tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const statusElement = document.getElementById('status');
    
    if (currentTab.url && currentTab.url.includes('mail.google.com')) {
      statusElement.textContent = 'Active on Gmail';
      statusElement.style.color = '#10b981';
    } else {
      statusElement.textContent = 'Visit Gmail';
      statusElement.style.color = '#f59e0b';
    }
  });
});
