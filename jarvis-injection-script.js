// JARVIS Gmail Injection Script
// Copy and paste this entire script into your browser console while on Gmail

(function() {
    'use strict';

    console.log('🤖 JARVIS: Initializing Gmail overlay...');

    // Check if we're on Gmail
    if (!window.location.hostname.includes('mail.google.com')) {
        console.log('❌ JARVIS: Not on Gmail. Please navigate to Gmail first.');
        return;
    }

    // Check if already injected
    if (document.getElementById('jarvis-overlay-container')) {
        console.log('⚠️ JARVIS: Already active. Removing existing overlay...');
        document.getElementById('jarvis-overlay-container').remove();
    }

    // Create the overlay container
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'jarvis-overlay-container';
    overlayContainer.innerHTML = `
        <div class="jarvis-overlay">
            <div class="jarvis-header">
                <div class="jarvis-title">J.A.R.V.I.S</div>
                <div class="jarvis-subtitle">Just A Rather Very Intelligent System</div>
            </div>

            <div class="jarvis-status">
                <div class="status-item">
                    <span class="status-label">System Status:</span>
                    <span class="status-value status-active" id="systemStatus">ONLINE</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Email Agent:</span>
                    <span class="status-value status-active" id="emailStatus">ACTIVE</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Emails Processed:</span>
                    <span class="status-value" id="emailsProcessed">0</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Responses Sent:</span>
                    <span class="status-value" id="responsesSent">0</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Last Check:</span>
                    <span class="status-value" id="lastCheck">Just now</span>
                </div>
            </div>

            <div class="jarvis-chat" id="chatContainer">
                <div class="chat-message">
                    <div class="chat-assistant">JARVIS:</div>
                    <div class="chat-content">Good day, sir. I'm online and ready to assist with your email management. How may I be of service?</div>
                </div>
            </div>

            <div class="quick-actions">
                <h4>Quick Actions</h4>
                <div class="action-buttons">
                    <button class="action-btn" onclick="jarvisSendCommand('summarize latest emails')">Summarize Latest</button>
                    <button class="action-btn" onclick="jarvisSendCommand('check calendar availability')">Check Calendar</button>
                    <button class="action-btn" onclick="jarvisSendCommand('draft follow-up to latest email')">Draft Follow-up</button>
                    <button class="action-btn" onclick="jarvisSendCommand('show recent .edu emails')">Show .edu Emails</button>
                </div>
            </div>

            <div class="jarvis-input">
                <div class="input-container">
                    <input type="text" class="jarvis-input-field" id="userInput" placeholder="Ask me anything about your emails..." onkeypress="jarvisHandleKeyPress(event)">
                    <button class="jarvis-send-btn" onclick="jarvisSendMessage()">SEND</button>
                </div>
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .jarvis-overlay {
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            width: 400px !important;
            height: 100vh !important;
            background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 40, 80, 0.95)) !important;
            backdrop-filter: blur(10px) !important;
            border-left: 2px solid #00ffff !important;
            box-shadow: -5px 0 20px rgba(0, 255, 255, 0.3) !important;
            z-index: 999999 !important;
            display: flex !important;
            flex-direction: column !important;
            color: #ffffff !important;
            font-family: 'Courier New', monospace !important;
        }

        .jarvis-header {
            background: linear-gradient(90deg, #001122, #003366) !important;
            padding: 20px !important;
            border-bottom: 1px solid #00ffff !important;
            text-align: center !important;
        }

        .jarvis-title {
            font-size: 24px !important;
            font-weight: bold !important;
            color: #00ffff !important;
            text-shadow: 0 0 10px #00ffff !important;
            margin-bottom: 10px !important;
        }

        .jarvis-subtitle {
            font-size: 12px !important;
            color: #88ccff !important;
            opacity: 0.8 !important;
        }

        .jarvis-status {
            padding: 15px 20px !important;
            background: rgba(0, 255, 255, 0.1) !important;
            border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
        }

        .status-item {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 8px !important;
            font-size: 14px !important;
        }

        .status-label {
            color: #88ccff !important;
        }

        .status-value {
            color: #00ffff !important;
            font-weight: bold !important;
        }

        .status-active {
            color: #00ff00 !important;
            text-shadow: 0 0 5px #00ff00 !important;
        }

        .status-inactive {
            color: #ff4444 !important;
        }

        .jarvis-chat {
            flex: 1 !important;
            padding: 20px !important;
            overflow-y: auto !important;
            background: rgba(0, 0, 0, 0.3) !important;
        }

        .chat-message {
            margin-bottom: 15px !important;
            padding: 10px !important;
            border-radius: 8px !important;
            border-left: 3px solid #00ffff !important;
            background: rgba(0, 255, 255, 0.05) !important;
        }

        .chat-user {
            color: #00ffff !important;
            font-weight: bold !important;
            margin-bottom: 5px !important;
        }

        .chat-assistant {
            color: #88ccff !important;
            font-weight: bold !important;
            margin-bottom: 5px !important;
        }

        .chat-content {
            color: #ffffff !important;
            line-height: 1.4 !important;
            white-space: pre-wrap !important;
        }

        .jarvis-input {
            padding: 20px !important;
            background: rgba(0, 0, 0, 0.5) !important;
            border-top: 1px solid #00ffff !important;
        }

        .input-container {
            display: flex !important;
            gap: 10px !important;
        }

        .jarvis-input-field {
            flex: 1 !important;
            padding: 12px !important;
            background: rgba(0, 0, 0, 0.7) !important;
            border: 1px solid #00ffff !important;
            border-radius: 6px !important;
            color: #ffffff !important;
            font-family: 'Courier New', monospace !important;
            font-size: 14px !important;
        }

        .jarvis-input-field:focus {
            outline: none !important;
            border-color: #00ff00 !important;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.3) !important;
        }

        .jarvis-send-btn {
            padding: 12px 20px !important;
            background: linear-gradient(45deg, #00ffff, #0088ff) !important;
            border: none !important;
            border-radius: 6px !important;
            color: #000000 !important;
            font-weight: bold !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }

        .jarvis-send-btn:hover {
            background: linear-gradient(45deg, #00ff00, #00ffff) !important;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5) !important;
        }

        .quick-actions {
            padding: 15px 20px !important;
            background: rgba(0, 0, 0, 0.3) !important;
            border-top: 1px solid rgba(0, 255, 255, 0.3) !important;
        }

        .quick-actions h4 {
            color: #00ffff !important;
            margin-bottom: 10px !important;
            font-size: 14px !important;
        }

        .action-buttons {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
        }

        .action-btn {
            padding: 6px 12px !important;
            background: rgba(0, 255, 255, 0.1) !important;
            border: 1px solid #00ffff !important;
            border-radius: 4px !important;
            color: #00ffff !important;
            font-size: 12px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }

        .action-btn:hover {
            background: rgba(0, 255, 255, 0.2) !important;
            box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
        }

        .typing-indicator {
            color: #00ffff !important;
            font-style: italic !important;
        }

        .typing-indicator::after {
            content: '...' !important;
            animation: dots 1.5s infinite !important;
        }

        @keyframes dots {
            0%, 20% { content: '' !important; }
            40% { content: '.' !important; }
            60% { content: '..' !important; }
            80%, 100% { content: '...' !important; }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlayContainer);

    // Adjust Gmail layout
    function adjustGmailLayout() {
        const gmailContent = document.querySelector('[role="main"]') || 
                           document.querySelector('.nH') || 
                           document.querySelector('#\\:2');
        
        if (gmailContent) {
            gmailContent.style.marginRight = '400px';
            gmailContent.style.transition = 'margin-right 0.3s ease';
        }
    }

    // Wait for Gmail to load and adjust layout
    setTimeout(adjustGmailLayout, 1000);

    // JARVIS Functions
    window.jarvisSendMessage = function() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        jarvisAddChatMessage('user', message);
        jarvisAddChatMessage('assistant', 'Processing your request...', true);
        
        // Simulate processing
        setTimeout(() => {
            jarvisProcessCommand(message);
        }, 1000);
    };

    window.jarvisSendCommand = function(command) {
        document.getElementById('userInput').value = command;
        jarvisSendMessage();
    };

    window.jarvisHandleKeyPress = function(event) {
        if (event.key === 'Enter') {
            jarvisSendMessage();
        }
    };

    window.jarvisAddChatMessage = function(sender, content, isTyping = false) {
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
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    window.jarvisProcessCommand = async function(command) {
        const lowerCommand = command.toLowerCase();
        
        try {
            let response = '';
            
            if (lowerCommand.includes('summarize') && lowerCommand.includes('email')) {
                response = await jarvisSummarizeEmails(command);
            } else if (lowerCommand.includes('calendar') || lowerCommand.includes('availability')) {
                response = await jarvisCheckCalendar(command);
            } else if (lowerCommand.includes('draft') || lowerCommand.includes('follow-up')) {
                response = await jarvisDraftEmail(command);
            } else if (lowerCommand.includes('show') && lowerCommand.includes('edu')) {
                response = await jarvisShowEduEmails();
            } else if (lowerCommand.includes('status') || lowerCommand.includes('how are you')) {
                response = await jarvisGetSystemStatus();
            } else {
                response = jarvisHandleGeneralQuery(command);
            }
            
            jarvisAddChatMessage('assistant', response);
        } catch (error) {
            jarvisAddChatMessage('assistant', `I apologize, sir. I encountered an error: ${error.message}`);
        }
    };

    // API Functions
    window.jarvisSummarizeEmails = async function(command) {
        try {
            const response = await fetch('http://localhost:3000/api/email-agent/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            const data = await response.json();
            return data.summary || 'No recent emails to summarize.';
        } catch (error) {
            return 'Unable to summarize emails at this time.';
        }
    };

    window.jarvisCheckCalendar = async function(command) {
        try {
            const response = await fetch('http://localhost:3000/api/email-agent/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            const data = await response.json();
            return data.availability || 'Calendar data unavailable.';
        } catch (error) {
            return 'Unable to access calendar at this time.';
        }
    };

    window.jarvisDraftEmail = async function(command) {
        try {
            const response = await fetch('http://localhost:3000/api/email-agent/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            const data = await response.json();
            return data.draft || 'Unable to draft email at this time.';
        } catch (error) {
            return 'Unable to draft email at this time.';
        }
    };

    window.jarvisShowEduEmails = async function() {
        try {
            const response = await fetch('http://localhost:3000/api/email-agent/edu-emails');
            const data = await response.json();
            
            if (data.emails && data.emails.length > 0) {
                let result = 'Recent .edu emails:\n\n';
                data.emails.forEach(email => {
                    result += `From: ${email.from}\n`;
                    result += `Subject: ${email.subject}\n`;
                    result += `Preview: ${email.snippet}\n\n`;
                });
                return result;
            } else {
                return 'No recent .edu emails found.';
            }
        } catch (error) {
            return 'Unable to retrieve .edu emails at this time.';
        }
    };

    window.jarvisGetSystemStatus = async function() {
        try {
            const response = await fetch('http://localhost:3000/api/email-agent');
            const data = await response.json();
            
            return `System Status Report:\n\n` +
                   `Email Agent: ${data.schedulerRunning ? 'ACTIVE' : 'INACTIVE'}\n` +
                   `Emails Processed: ${data.processed || 0}\n` +
                   `Responses Sent: ${data.responsesSent || 0}\n` +
                   `Next Check: ${data.nextCheck || 'Unknown'}\n\n` +
                   `All systems operational, sir.`;
        } catch (error) {
            return 'Unable to retrieve system status.';
        }
    };

    window.jarvisHandleGeneralQuery = function(query) {
        return `I understand you're asking about "${query}". I can help you with:\n\n` +
               `• Summarizing recent emails\n` +
               `• Checking calendar availability\n` +
               `• Drafting follow-up emails\n` +
               `• Showing .edu emails\n` +
               `• System status updates\n\n` +
               `Please be more specific about what you'd like me to do.`;
    };

    // Update status every 2 seconds
    setInterval(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/email-agent');
            const data = await response.json();
            
            document.getElementById('emailsProcessed').textContent = data.processed || 0;
            document.getElementById('responsesSent').textContent = data.responsesSent || 0;
            document.getElementById('lastCheck').textContent = 'Just now';
            
            if (data.schedulerRunning) {
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

    console.log('✅ JARVIS: Overlay injected successfully!');
    console.log('🎯 JARVIS: Ready to assist with your email management.');

})();
