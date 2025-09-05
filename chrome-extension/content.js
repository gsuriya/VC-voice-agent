// JARVIS Gmail Content Script
// Automatically injects the overlay into Gmail

(function() {
    'use strict';

    console.log('🤖 JARVIS: Initializing Gmail integration...');

    // Check if already injected
    if (document.getElementById('jarvis-overlay-container')) {
        console.log('⚠️ JARVIS: Already active, skipping injection');
        return;
    }

    // Wait for Gmail to fully load
    function waitForGmail() {
        const gmailContainer = document.querySelector('[role="main"]') || 
                              document.querySelector('.nH') || 
                              document.querySelector('#\\:2');
        
        if (gmailContainer) {
            injectJarvisOverlay();
        } else {
            setTimeout(waitForGmail, 1000);
        }
    }

    function injectJarvisOverlay() {
        console.log('🚀 JARVIS: Injecting overlay into Gmail...');

        // Create the overlay container
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'jarvis-overlay-container';
        overlayContainer.innerHTML = `
            <div class="jarvis-overlay">
                <div class="jarvis-header">
                    <div class="jarvis-title">J.A.R.V.I.S</div>
                    <div class="jarvis-subtitle">Just A Rather Very Intelligent System</div>
                    <div class="jarvis-controls">
                        <button class="jarvis-minimize" id="jarvisMinimize">−</button>
                        <button class="jarvis-close" id="jarvisClose">×</button>
                    </div>
                </div>

                <div class="jarvis-status">
                    <div class="status-grid">
                        <div class="status-item">
                            <span class="status-label">System</span>
                            <span class="status-value status-active" id="systemStatus">ONLINE</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Agent</span>
                            <span class="status-value status-active" id="emailStatus">ACTIVE</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Processed</span>
                            <span class="status-value" id="emailsProcessed">0</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Responses</span>
                            <span class="status-value" id="responsesSent">0</span>
                        </div>
                    </div>
                </div>

                <div class="jarvis-chat" id="chatContainer">
                    <div class="chat-message">
                        <div class="chat-assistant">JARVIS:</div>
                        <div class="chat-content">Good day, sir. I'm online and ready to assist with your email management. How may I be of service?</div>
                    </div>
                </div>

                <div class="jarvis-quick-actions">
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" data-command="summarize latest emails">
                            <span class="action-icon">📊</span>
                            <span class="action-text">Summarize</span>
                        </button>
                        <button class="quick-action-btn" data-command="check calendar availability">
                            <span class="action-icon">📅</span>
                            <span class="action-text">Calendar</span>
                        </button>
                        <button class="quick-action-btn" data-command="draft follow-up to latest email">
                            <span class="action-icon">✍️</span>
                            <span class="action-text">Draft</span>
                        </button>
                        <button class="quick-action-btn" data-command="show recent emails">
                            <span class="action-icon">📧</span>
                            <span class="action-text">Recent</span>
                        </button>
                    </div>
                </div>

                <div class="jarvis-input">
                    <div class="input-container">
                        <input type="text" class="jarvis-input-field" id="userInput" placeholder="Ask me anything about your emails..." autocomplete="off">
                        <button class="jarvis-send-btn" id="sendBtn">
                            <span class="send-icon">→</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(overlayContainer);

        // Adjust Gmail layout
        adjustGmailLayout();

        // Initialize event listeners
        initializeEventListeners();

        // Start status updates
        startStatusUpdates();

        console.log('✅ JARVIS: Overlay injected successfully!');
    }

    function adjustGmailLayout() {
        const gmailContent = document.querySelector('[role="main"]') || 
                           document.querySelector('.nH') || 
                           document.querySelector('#\\:2');
        
        if (gmailContent) {
            gmailContent.style.marginRight = '420px';
            gmailContent.style.transition = 'margin-right 0.3s ease';
        }

        // Also adjust the main Gmail container
        const gmailContainer = document.querySelector('.nH') || 
                              document.querySelector('#\\:2') ||
                              document.querySelector('[role="main"]');
        
        if (gmailContainer) {
            gmailContainer.style.maxWidth = 'calc(100% - 420px)';
        }
    }

    function initializeEventListeners() {
        // Send button
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');

        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.getAttribute('data-command');
                userInput.value = command;
                sendMessage();
            });
        });

        // Minimize/Close buttons
        document.getElementById('jarvisMinimize').addEventListener('click', toggleMinimize);
        document.getElementById('jarvisClose').addEventListener('click', toggleClose);

        // Auto-focus input
        userInput.focus();
    }

    function sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        addChatMessage('user', message);
        addChatMessage('assistant', 'Processing your request...', true);
        
        // Process command
        setTimeout(() => {
            processCommand(message);
        }, 1000);
    }

    function addChatMessage(sender, content, isTyping = false) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const senderDiv = document.createElement('div');
        senderDiv.className = sender === 'user' ? 'chat-user' : 'chat-assistant';
        senderDiv.textContent = sender === 'user' ? 'YOU:' : 'JARVIS:';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'chat-content';
        if (isTyping) {
            contentDiv.className += ' typing-indicator';
            contentDiv.textContent = content;
        } else {
            contentDiv.textContent = content;
        }
        
        messageDiv.appendChild(senderDiv);
        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        
        // Auto-scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function processCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        try {
            let response = '';
            
            if (lowerCommand.includes('sync') && lowerCommand.includes('email')) {
                response = await syncEmails();
            } else if (lowerCommand.startsWith('auth ')) {
                const code = command.substring(5).trim();
                response = await handleAuthCommand(code);
            } else if (lowerCommand.includes('summarize') && lowerCommand.includes('email')) {
                response = await summarizeEmails(command);
            } else if (lowerCommand.includes('calendar') || lowerCommand.includes('availability')) {
                response = await checkCalendar(command);
            } else if (lowerCommand.includes('draft') || lowerCommand.includes('follow-up')) {
                response = await draftEmail(command);
            } else if (lowerCommand.includes('show') && lowerCommand.includes('edu')) {
                response = await showEduEmails();
            } else if (lowerCommand.includes('status') || lowerCommand.includes('how are you')) {
                response = await getSystemStatus();
            } else {
                response = await handleGeneralQuery(command);
            }
            
            addChatMessage('assistant', response);
        } catch (error) {
            addChatMessage('assistant', `I apologize, sir. I encountered an error: ${error.message}`);
        }
    }

    // API Functions - Using real Gmail integration
    async function syncEmails() {
        try {
            addChatMessage('assistant', 'Connecting to your Gmail account...', true);
            
            // Check if we have stored tokens
            let tokens = localStorage.getItem('gmail_tokens');
            
            if (!tokens) {
                // Get auth URL
                const authResponse = await fetch('http://localhost:3000/api/gmail-auth');
                const authData = await authResponse.json();
                
                if (authData.success) {
                    addChatMessage('assistant', 'Please authorize JARVIS to access your Gmail. Click the link below:', true);
                    addChatMessage('assistant', `🔗 ${authData.authUrl}`, true);
                    addChatMessage('assistant', 'After authorizing, copy the code from the URL and type: "auth [code]"', true);
                    return 'Please complete Gmail authorization first.';
                } else {
                    return `❌ Auth failed: ${authData.error}`;
                }
            }
            
            // Use stored tokens to sync
            tokens = JSON.parse(tokens);
            
            const response = await fetch('http://localhost:3000/api/sync-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokens: tokens })
            });
            const data = await response.json();
            
            if (data.success) {
                return `✅ Email sync complete! Stored ${data.stats.totalEmails} emails from ${data.gmailInfo.email}. You can now ask me questions about your emails.`;
            } else {
                return `❌ Sync failed: ${data.error}`;
            }
        } catch (error) {
            return `❌ Sync failed: ${error.message}`;
        }
    }

    async function handleAuthCommand(code) {
        try {
            addChatMessage('assistant', 'Exchanging authorization code for tokens...', true);
            
            const response = await fetch('http://localhost:3000/api/gmail-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });
            const data = await response.json();
            
            if (data.success) {
                // Store tokens for future use
                localStorage.setItem('gmail_tokens', JSON.stringify(data.tokens));
                return `✅ Gmail connected successfully! Connected to ${data.email} (${data.messagesTotal} total messages). You can now sync your emails.`;
            } else {
                return `❌ Auth failed: ${data.error}`;
            }
        } catch (error) {
            return `❌ Auth failed: ${error.message}`;
        }
    }

    async function summarizeEmails(command) {
        try {
            const response = await fetch('http://localhost:3000/api/query-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: command
                })
            });
            const data = await response.json();
            return data.result || 'No recent emails to summarize.';
        } catch (error) {
            return 'Unable to summarize emails at this time.';
        }
    }

    async function checkCalendar(command) {
        try {
            const response = await fetch('http://localhost:3000/api/query-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: command })
            });
            const data = await response.json();
            return data.result || 'Calendar data unavailable.';
        } catch (error) {
            return 'Unable to access calendar at this time.';
        }
    }

    async function draftEmail(command) {
        try {
            const response = await fetch('http://localhost:3000/api/query-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: command })
            });
            const data = await response.json();
            return data.result || 'Unable to draft email at this time.';
        } catch (error) {
            return 'Unable to draft email at this time.';
        }
    }

    async function showEduEmails() {
        try {
            const response = await fetch('http://localhost:3000/api/query-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'show .edu emails' })
            });
            const data = await response.json();
            return data.result || 'No recent .edu emails found.';
        } catch (error) {
            return 'Unable to retrieve .edu emails at this time.';
        }
    }

    async function getSystemStatus() {
        try {
            const response = await fetch('http://localhost:3000/api/sync-emails');
            const data = await response.json();
            
            return `System Status Report:\n\n` +
                   `JARVIS: ONLINE\n` +
                   `Emails Stored: ${data.stats?.totalEmails || 0}\n` +
                   `Last Sync: ${data.stats?.lastSync || 'Never'}\n` +
                   `Latest Email: ${data.stats?.latestEmail || 'None'}\n\n` +
                   `All systems operational, sir.`;
        } catch (error) {
            return 'Unable to retrieve system status.';
        }
    }

    async function handleGeneralQuery(query) {
        try {
            const response = await fetch('http://localhost:3000/api/query-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            const data = await response.json();
            return data.result || 'I understand you\'re asking about "' + query + '". I can help you with:\n\n' +
                   '• Summarizing recent emails\n' +
                   '• Searching for specific emails\n' +
                   '• Finding emails from specific people\n' +
                   '• Drafting responses\n' +
                   '• Answering questions about your email content\n\n' +
                   'Please be more specific about what you\'d like me to do.';
        } catch (error) {
            return 'I understand you\'re asking about "' + query + '". I can help you with:\n\n' +
                   '• Summarizing recent emails\n' +
                   '• Searching for specific emails\n' +
                   '• Finding emails from specific people\n' +
                   '• Drafting responses\n' +
                   '• Answering questions about your email content\n\n' +
                   'Please be more specific about what you\'d like me to do.';
        }
    }

    // Auto-sync emails when Gmail loads
    async function autoSyncEmails() {
        try {
            console.log('🔄 JARVIS: Starting auto-sync...');
            
            // Check if we have tokens stored
            let tokens = localStorage.getItem('gmail_tokens');
            if (!tokens) {
                console.log('🔐 JARVIS: No tokens found, starting OAuth flow...');
                
                // Get auth URL
                const authResponse = await fetch('http://localhost:3000/api/gmail-auth');
                const authData = await authResponse.json();
                
                if (authData.authUrl) {
                    // Open auth window
                    const authWindow = window.open(authData.authUrl, 'gmail-auth', 'width=500,height=600');
                    
                    // Listen for auth completion
                    const checkAuth = setInterval(() => {
                        if (authWindow.closed) {
                            clearInterval(checkAuth);
                            // Check if tokens were stored
                            tokens = localStorage.getItem('gmail_tokens');
                            if (tokens) {
                                console.log('✅ JARVIS: Auth completed, starting sync...');
                                performEmailSync(JSON.parse(tokens));
                            }
                        }
                    }, 1000);
                }
            } else {
                console.log('✅ JARVIS: Tokens found, starting sync...');
                performEmailSync(JSON.parse(tokens));
            }
        } catch (error) {
            console.error('❌ JARVIS: Auto-sync failed:', error);
        }
    }

    // Perform the actual email sync
    async function performEmailSync(tokens) {
        try {
            const response = await fetch('http://localhost:3000/api/sync-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokens: tokens })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ JARVIS: Email sync completed successfully');
                addMessage('JARVIS:', `Successfully synced ${data.stats?.totalEmails || 0} emails!`);
            } else {
                console.error('❌ JARVIS: Sync failed:', data.error);
                addMessage('JARVIS:', `Sync failed: ${data.error}`);
            }
        } catch (error) {
            console.error('❌ JARVIS: Sync request failed:', error);
            addMessage('JARVIS:', 'Sync failed. Please try again.');
        }
    }

    function startStatusUpdates() {
        setInterval(async () => {
            try {
                const response = await fetch('http://localhost:3000/api/sync-emails');
                const data = await response.json();
                
                document.getElementById('emailsProcessed').textContent = data.stats?.totalEmails || '0';
                document.getElementById('responsesSent').textContent = '0';
                
                if (data.stats?.totalEmails > 0) {
                    document.getElementById('emailStatus').textContent = 'ACTIVE';
                    document.getElementById('emailStatus').className = 'status-value status-active';
                } else {
                    document.getElementById('emailStatus').textContent = 'INACTIVE';
                    document.getElementById('emailStatus').className = 'status-value status-inactive';
                }
            } catch (error) {
                console.error('Status update failed:', error);
            }
        }, 2000);
    }

    function toggleMinimize() {
        const overlay = document.querySelector('.jarvis-overlay');
        const chatContainer = document.getElementById('chatContainer');
        const quickActions = document.querySelector('.jarvis-quick-actions');
        
        if (overlay.classList.contains('minimized')) {
            overlay.classList.remove('minimized');
            chatContainer.style.display = 'block';
            quickActions.style.display = 'block';
        } else {
            overlay.classList.add('minimized');
            chatContainer.style.display = 'none';
            quickActions.style.display = 'none';
        }
    }

    function toggleClose() {
        const overlayContainer = document.getElementById('jarvis-overlay-container');
        if (overlayContainer) {
            overlayContainer.style.display = 'none';
            
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
    }

    // Start the injection process
    waitForGmail();
    
    // Auto-sync when Gmail loads
    setTimeout(() => {
        autoSyncEmails();
        startStatusUpdates();
    }, 3000);

})();
