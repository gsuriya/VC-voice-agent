// JARVIS Popup Script
// Handles popup interactions and status updates

document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 JARVIS: Popup loaded');
    
    // Initialize popup
    initializePopup();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start status updates
    startStatusUpdates();
});

function initializePopup() {
    // Check if we're on Gmail
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('mail.google.com')) {
            document.getElementById('connectionText').textContent = 'Connected to Gmail';
            document.getElementById('connectionStatus').className = 'connection-status connection-online';
        } else {
            document.getElementById('connectionText').textContent = 'Not on Gmail';
            document.getElementById('connectionStatus').className = 'connection-status connection-offline';
        }
    });
}

function setupEventListeners() {
    // Open Gmail button
    document.getElementById('openGmail').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://mail.google.com' });
        window.close();
    });

    // Toggle overlay button
    document.getElementById('toggleOverlay').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('mail.google.com')) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleOverlay' });
            } else {
                chrome.tabs.create({ url: 'https://mail.google.com' });
            }
        });
    });

    // Check status button
    document.getElementById('checkStatus').addEventListener('click', () => {
        updateStatus();
    });
}

async function updateStatus() {
    try {
        const response = await fetch('http://localhost:3000/api/email-agent');
        const data = await response.json();
        
        document.getElementById('emailsProcessed').textContent = data.processed || 0;
        document.getElementById('responsesSent').textContent = data.responsesSent || 0;
        
        if (data.schedulerRunning) {
            document.getElementById('emailAgentStatus').textContent = 'Active';
            document.getElementById('emailAgentStatus').className = 'status-value status-active';
        } else {
            document.getElementById('emailAgentStatus').textContent = 'Inactive';
            document.getElementById('emailAgentStatus').className = 'status-value status-inactive';
        }
        
        // Update connection status
        document.getElementById('connectionText').textContent = 'Connected to API';
        document.getElementById('connectionStatus').className = 'connection-status connection-online';
        
    } catch (error) {
        console.error('Status update failed:', error);
        document.getElementById('connectionText').textContent = 'API Offline';
        document.getElementById('connectionStatus').className = 'connection-status connection-offline';
    }
}

function startStatusUpdates() {
    // Update status immediately
    updateStatus();
    
    // Update every 5 seconds
    setInterval(updateStatus, 5000);
}
