// JARVIS Background Service Worker
// Handles extension lifecycle and communication

chrome.runtime.onInstalled.addListener(() => {
    console.log('🤖 JARVIS: Extension installed successfully');
});

chrome.runtime.onStartup.addListener(() => {
    console.log('🤖 JARVIS: Extension started');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStatus') {
        // Handle status requests
        sendResponse({ status: 'active' });
    }
    
    if (request.action === 'toggleOverlay') {
        // Handle overlay toggle requests
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url.includes('mail.google.com')) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleOverlay' });
            }
        });
    }
});

// Handle tab updates to inject on Gmail
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('mail.google.com')) {
        console.log('🤖 JARVIS: Gmail tab detected, ready for injection');
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    if (tab.url && tab.url.includes('mail.google.com')) {
        // Toggle overlay visibility
        chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
    } else {
        // Open Gmail in new tab
        chrome.tabs.create({ url: 'https://mail.google.com' });
    }
});
