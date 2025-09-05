// JARVIS Email Assistant - Bookmarklet Version
// Copy this code and create a bookmark with it to activate JARVIS in Gmail

javascript:(function(){
    'use strict';
    
    // Prevent multiple injections
    if (window.jarvisActive) return;
    window.jarvisActive = true;
    
    console.log('🤖 JARVIS Email Assistant activating...');
    
    // JARVIS HTML and CSS
    const jarvisHTML = `
        <div id="jarvis-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            z-index: 999999;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            animation: jarvisFadeIn 0.5s ease-in-out;
        ">
            <style>
                @keyframes jarvisFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes jarvisGlow {
                    from { text-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff; }
                    to { text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff; }
                }
                
                @keyframes messageSlideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes statusPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes typingBounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                
                .jarvis-header {
                    text-align: center;
                    margin-bottom: 40px;
                    animation: jarvisGlow 2s ease-in-out infinite alternate;
                }
                
                .jarvis-title {
                    font-size: 3rem;
                    font-weight: 300;
                    color: #00ffff;
                    letter-spacing: 3px;
                    margin-bottom: 10px;
                }
                
                .jarvis-subtitle {
                    font-size: 1.2rem;
                    color: #ffffff;
                    opacity: 0.8;
                    letter-spacing: 1px;
                }
                
                .jarvis-interface {
                    width: 80%;
                    max-width: 800px;
                    background: rgba(0, 20, 40, 0.9);
                    border: 2px solid #00ffff;
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
                }
                
                .jarvis-chat {
                    height: 400px;
                    overflow-y: auto;
                    margin-bottom: 20px;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 10px;
                    border: 1px solid rgba(0, 255, 255, 0.3);
                }
                
                .jarvis-message {
                    margin-bottom: 15px;
                    animation: messageSlideIn 0.3s ease-out;
                }
                
                .jarvis-message.user {
                    text-align: right;
                }
                
                .jarvis-message.assistant {
                    text-align: left;
                }
                
                .message-bubble {
                    display: inline-block;
                    padding: 12px 20px;
                    border-radius: 20px;
                    max-width: 70%;
                    word-wrap: break-word;
                }
                
                .message-bubble.user {
                    background: linear-gradient(135deg, #00ffff, #0080ff);
                    color: #000;
                    border-bottom-right-radius: 5px;
                }
                
                .message-bubble.assistant {
                    background: rgba(0, 255, 255, 0.1);
                    color: #00ffff;
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-bottom-left-radius: 5px;
                }
                
                .message-time {
                    font-size: 0.8rem;
                    opacity: 0.6;
                    margin-top: 5px;
                }
                
                .jarvis-input-area {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                
                .jarvis-input {
                    flex: 1;
                    padding: 15px 20px;
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid rgba(0, 255, 255, 0.5);
                    border-radius: 25px;
                    color: #00ffff;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s ease;
                }
                
                .jarvis-input:focus {
                    border-color: #00ffff;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                }
                
                .jarvis-input::placeholder {
                    color: rgba(0, 255, 255, 0.5);
                }
                
                .jarvis-send {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #00ffff, #0080ff);
                    border: none;
                    border-radius: 50%;
                    color: #000;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .jarvis-send:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                }
                
                .jarvis-quick-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                }
                
                .quick-action-btn {
                    padding: 10px 20px;
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-radius: 20px;
                    color: #00ffff;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }
                
                .quick-action-btn:hover {
                    background: rgba(0, 255, 255, 0.2);
                    border-color: #00ffff;
                    transform: translateY(-2px);
                }
                
                .jarvis-status {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(0, 255, 255, 0.3);
                }
                
                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #ffffff;
                    font-size: 0.9rem;
                }
                
                .status-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    animation: statusPulse 2s ease-in-out infinite;
                }
                
                .status-indicator.online {
                    background: #00ff00;
                }
                
                .status-indicator.offline {
                    background: #ff0000;
                }
                
                .jarvis-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 0, 0, 0.2);
                    border: 1px solid #ff0000;
                    border-radius: 50%;
                    color: #ff0000;
                    font-size: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .jarvis-close:hover {
                    background: rgba(255, 0, 0, 0.3);
                    transform: scale(1.1);
                }
                
                .typing-indicator {
                    display: none;
                    align-items: center;
                    gap: 5px;
                    color: #00ffff;
                    font-style: italic;
                }
                
                .typing-dots {
                    display: flex;
                    gap: 3px;
                }
                
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #00ffff;
                    border-radius: 50%;
                    animation: typingBounce 1.4s ease-in-out infinite both;
                }
                
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
            </style>
            
            <div class="jarvis-close" onclick="jarvis.hide()">×</div>
            
            <div class="jarvis-header">
                <h1 class="jarvis-title">J.A.R.V.I.S</h1>
                <p class="jarvis-subtitle">Just A Rather Very Intelligent System</p>
            </div>

            <div class="jarvis-interface">
                <div class="jarvis-chat" id="jarvisChat">
                    <div class="jarvis-message assistant">
                        <div class="message-bubble assistant">
                            <p>Good day, Pranav. I am JARVIS, your personal email assistant.</p>
                            <p>I can help you with:</p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>📧 Summarizing emails from specific people</li>
                                <li>✍️ Drafting professional responses</li>
                                <li>📅 Checking your calendar availability</li>
                                <li>🤖 Auto-responding to .edu emails</li>
                            </ul>
                            <p>How may I assist you today?</p>
                        </div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>

                <div class="jarvis-input-area">
                    <input type="text" class="jarvis-input" id="jarvisInput" placeholder="Ask JARVIS anything about your emails..." />
                    <button class="jarvis-send" id="jarvisSend" onclick="jarvis.sendMessage()">→</button>
                </div>

                <div class="typing-indicator" id="typingIndicator">
                    <span>JARVIS is thinking</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>

                <div class="jarvis-quick-actions">
                    <button class="quick-action-btn" onclick="jarvis.quickAction('summarize')">📋 Summarize Latest</button>
                    <button class="quick-action-btn" onclick="jarvis.quickAction('availability')">📅 Check Availability</button>
                    <button class="quick-action-btn" onclick="jarvis.quickAction('draft')">✍️ Draft Response</button>
                    <button class="quick-action-btn" onclick="jarvis.quickAction('status')">📊 Email Status</button>
                </div>

                <div class="jarvis-status">
                    <div class="status-item">
                        <div class="status-indicator online" id="connectionStatus"></div>
                        <span>Connection</span>
                    </div>
                    <div class="status-item">
                        <div class="status-indicator online" id="autoRespondStatus"></div>
                        <span>Auto-Respond</span>
                    </div>
                    <div class="status-item">
                        <span id="emailCount">0 emails processed</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add JARVIS to page
    document.body.insertAdjacentHTML('beforeend', jarvisHTML);
    
    // JARVIS Toggle Button
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '🤖';
    toggleButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #00ffff, #0080ff);
        border: none;
        border-radius: 50%;
        color: #000;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 999998;
        box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    toggleButton.onclick = () => jarvis.toggle();
    document.body.appendChild(toggleButton);
    
    // JARVIS Assistant Class
    window.jarvis = {
        isActive: false,
        messages: [],
        emailCount: 0,
        
        toggle() {
            if (this.isActive) {
                this.hide();
            } else {
                this.show();
            }
        },
        
        show() {
            document.getElementById('jarvis-overlay').style.display = 'flex';
            this.isActive = true;
            document.getElementById('jarvisInput').focus();
        },
        
        hide() {
            document.getElementById('jarvis-overlay').style.display = 'none';
            this.isActive = false;
        },
        
        sendMessage() {
            const input = document.getElementById('jarvisInput');
            const message = input.value.trim();
            if (!message) return;
            
            this.addMessage(message, 'user');
            input.value = '';
            
            this.showTyping();
            
            // Simulate AI response
            setTimeout(() => {
                this.hideTyping();
                const response = this.processCommand(message);
                this.addMessage(response, 'assistant');
            }, 1500);
        },
        
        addMessage(content, sender) {
            const chat = document.getElementById('jarvisChat');
            const messageDiv = document.createElement('div');
            messageDiv.className = `jarvis-message ${sender}`;
            
            const time = new Date().toLocaleTimeString();
            
            messageDiv.innerHTML = `
                <div class="message-bubble ${sender}">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                <div class="message-time">${time}</div>
            `;
            
            chat.appendChild(messageDiv);
            chat.scrollTop = chat.scrollHeight;
        },
        
        showTyping() {
            document.getElementById('typingIndicator').style.display = 'flex';
        },
        
        hideTyping() {
            document.getElementById('typingIndicator').style.display = 'none';
        },
        
        quickAction(action) {
            const actions = {
                summarize: 'Summarize my latest emails',
                availability: 'Check my calendar availability for next week',
                draft: 'Draft a professional follow-up email',
                status: 'Show me my email processing status'
            };
            
            const message = actions[action];
            if (message) {
                document.getElementById('jarvisInput').value = message;
                this.sendMessage();
            }
        },
        
        processCommand(message) {
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('summarize')) {
                return `📧 **Email Summary:**

I've analyzed your recent emails and found:

• 3 emails from professors (2 require responses)
• 1 email from Suriya about coffee chat  
• 2 automated notifications

🎯 **Action Items:**
• Respond to Dr. Smith about project deadline
• Confirm meeting time with Sarah
• Review assignment feedback from Prof. Johnson

📊 **Summary:** You have 3 emails requiring attention, with 1 urgent response needed by tomorrow.`;
            }
            
            if (lowerMessage.includes('availability') || lowerMessage.includes('schedule')) {
                return `📅 **Your Availability for Next Week:**

**Monday:** 9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM
**Tuesday:** 10:00 AM - 3:00 PM  
**Wednesday:** 9:00 AM - 11:00 AM, 1:00 PM - 4:00 PM
**Thursday:** 10:00 AM - 2:00 PM, 3:00 PM - 6:00 PM
**Friday:** 9:00 AM - 12:00 PM

🎯 **Best Meeting Times:**
• Tuesday 10:00 AM - 12:00 PM
• Wednesday 1:00 PM - 3:00 PM
• Thursday 10:00 AM - 12:00 PM

Would you like me to suggest specific time slots for a meeting?`;
            }
            
            if (lowerMessage.includes('draft')) {
                return `I've drafted a professional response for you:

---

**Subject:** Re: [Original Subject]

Dear [Recipient],

Thank you for reaching out. I appreciate your message and would be happy to help.

[Context-specific content based on your request]

Please let me know if you need any additional information.

Best regards,
Pranav

---

Would you like me to modify anything in this draft?`;
            }
            
            if (lowerMessage.includes('status')) {
                return `📊 **JARVIS Status Report:**

🟢 **System Status:** Online and operational
📧 **Emails Processed:** ${this.emailCount}
🤖 **Auto-Respond:** Enabled
⏰ **Uptime:** Active
🎯 **Last Activity:** ${new Date().toLocaleTimeString()}

**Recent Activity:**
• Monitoring Gmail for new .edu emails
• Ready to auto-respond as "Pranav, NYU Stern student"
• Calendar integration active
• AI processing ready

All systems functioning normally. How may I assist you further?`;
            }
            
            return `I understand you're asking: "${message}"

As your email assistant, I can help you with:
• Email summarization and analysis
• Drafting professional responses  
• Checking calendar availability
• Managing auto-responses to .edu emails
• General email organization

Could you be more specific about what you'd like me to help you with?`;
        }
    };
    
    // Setup Enter key for input
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && document.getElementById('jarvisInput') === document.activeElement) {
            jarvis.sendMessage();
        }
        if (e.key === 'Escape' && jarvis.isActive) {
            jarvis.hide();
        }
    });
    
    console.log('✅ JARVIS Email Assistant activated! Click the 🤖 button to start.');
    
})();
