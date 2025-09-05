// Jarvis Gmail Injector
// This script injects the Jarvis overlay into Gmail

(function() {
    'use strict';

    // Check if we're on Gmail
    if (!window.location.hostname.includes('mail.google.com')) {
        console.log('Jarvis: Not on Gmail, skipping injection');
        return;
    }

    // Check if already injected
    if (document.getElementById('jarvis-overlay')) {
        console.log('Jarvis: Already injected, skipping');
        return;
    }

    console.log('Jarvis: Injecting overlay into Gmail...');

    // Create iframe for the overlay
    const jarvisFrame = document.createElement('iframe');
    jarvisFrame.id = 'jarvis-overlay';
    jarvisFrame.src = chrome.runtime ? chrome.runtime.getURL('jarvis-overlay.html') : 'jarvis-overlay.html';
    jarvisFrame.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: 400px !important;
        height: 100vh !important;
        border: none !important;
        z-index: 999999 !important;
        background: transparent !important;
        pointer-events: auto !important;
    `;

    // Add to page
    document.body.appendChild(jarvisFrame);

    // Adjust Gmail layout to accommodate overlay
    function adjustGmailLayout() {
        const gmailContent = document.querySelector('[role="main"]') || 
                           document.querySelector('.nH') || 
                           document.querySelector('#\\:2');
        
        if (gmailContent) {
            gmailContent.style.marginRight = '400px';
            gmailContent.style.transition = 'margin-right 0.3s ease';
        }

        // Also adjust the main Gmail container
        const gmailContainer = document.querySelector('.nH') || 
                              document.querySelector('#\\:2') ||
                              document.querySelector('[role="main"]');
        
        if (gmailContainer) {
            gmailContainer.style.maxWidth = 'calc(100% - 400px)';
        }
    }

    // Wait for Gmail to load and adjust layout
    setTimeout(adjustGmailLayout, 1000);
    
    // Also adjust when Gmail content changes
    const observer = new MutationObserver(() => {
        adjustGmailLayout();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Handle messages from the overlay
    window.addEventListener('message', (event) => {
        if (event.data.type === 'jarvis-command') {
            console.log('Jarvis command received:', event.data.command);
            // Handle commands here if needed
        }
    });

    console.log('Jarvis: Overlay injected successfully!');

    // Add toggle button to show/hide Jarvis
    const toggleButton = document.createElement('div');
    toggleButton.id = 'jarvis-toggle';
    toggleButton.innerHTML = '🤖';
    toggleButton.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 50px !important;
        height: 50px !important;
        background: linear-gradient(45deg, #00ffff, #0088ff) !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 24px !important;
        cursor: pointer !important;
        z-index: 1000000 !important;
        box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3) !important;
        transition: all 0.3s ease !important;
    `;

    toggleButton.addEventListener('mouseenter', () => {
        toggleButton.style.transform = 'scale(1.1)';
        toggleButton.style.boxShadow = '0 6px 20px rgba(0, 255, 255, 0.5)';
    });

    toggleButton.addEventListener('mouseleave', () => {
        toggleButton.style.transform = 'scale(1)';
        toggleButton.style.boxShadow = '0 4px 15px rgba(0, 255, 255, 0.3)';
    });

    let jarvisVisible = true;
    toggleButton.addEventListener('click', () => {
        jarvisVisible = !jarvisVisible;
        jarvisFrame.style.display = jarvisVisible ? 'block' : 'none';
        
        if (jarvisVisible) {
            adjustGmailLayout();
        } else {
            // Reset Gmail layout
            const gmailContent = document.querySelector('[role="main"]') || 
                               document.querySelector('.nH') || 
                               document.querySelector('#\\:2');
            
            if (gmailContent) {
                gmailContent.style.marginRight = '0';
            }

            const gmailContainer = document.querySelector('.nH') || 
                                  document.querySelector('#\\:2') ||
                                  document.querySelector('[role="main"]');
            
            if (gmailContainer) {
                gmailContainer.style.maxWidth = '100%';
            }
        }
    });

    document.body.appendChild(toggleButton);

})();
