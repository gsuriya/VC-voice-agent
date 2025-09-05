// Gmail Email AI Assistant - Content Script
class EmailAIAssistant {
  constructor() {
    this.sidebar = null;
    this.isVisible = false;
    this.currentEmail = null;
    this.init();
  }

  init() {
    // Wait for Gmail to load
    this.waitForGmail(() => {
      this.createSidebar();
      this.addToggleButton();
      this.setupEmailListeners();
    });
  }

  waitForGmail(callback) {
    const checkGmail = () => {
      if (document.querySelector('[role="main"]')) {
        callback();
      } else {
        setTimeout(checkGmail, 1000);
      }
    };
    checkGmail();
  }

  createSidebar() {
    // Create sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'email-ai-sidebar';
    this.sidebar.innerHTML = `
      <div class="ai-sidebar-header">
        <div class="ai-logo">
          <div class="ai-avatar">🤖</div>
          <div class="ai-title">
            <h3>Email AI</h3>
            <span class="ai-subtitle">Your Personal Assistant</span>
          </div>
        </div>
        <button class="ai-close-btn" id="ai-close-sidebar">×</button>
      </div>
      
      <div class="ai-sidebar-content">
        <div class="ai-chat-container">
          <div class="ai-messages" id="ai-messages">
            <div class="ai-message ai-assistant">
              <div class="ai-message-content">
                <p>👋 Hi! I'm your email AI assistant. I can help you:</p>
                <ul>
                  <li>📧 Summarize emails from specific people</li>
                  <li>✍️ Draft follow-up emails</li>
                  <li>📅 Check your calendar availability</li>
                  <li>🤖 Auto-respond to .edu emails</li>
                </ul>
                <p>Just ask me anything!</p>
              </div>
            </div>
          </div>
          
          <div class="ai-input-container">
            <div class="ai-input-wrapper">
              <input type="text" id="ai-input" placeholder="Ask me anything about your emails..." />
              <button id="ai-send-btn" class="ai-send-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              </button>
            </div>
            <div class="ai-quick-actions">
              <button class="ai-quick-btn" data-action="summarize">📋 Summarize Latest</button>
              <button class="ai-quick-btn" data-action="availability">📅 Check Availability</button>
              <button class="ai-quick-btn" data-action="draft">✍️ Draft Follow-up</button>
            </div>
          </div>
        </div>
        
        <div class="ai-status-bar">
          <div class="ai-status-item">
            <span class="ai-status-label">Auto-respond:</span>
            <label class="ai-toggle">
              <input type="checkbox" id="ai-auto-respond" checked>
              <span class="ai-toggle-slider"></span>
            </label>
          </div>
          <div class="ai-status-item">
            <span class="ai-status-label">Status:</span>
            <span class="ai-status-indicator" id="ai-status">🟢 Active</span>
          </div>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(this.sidebar);

    // Add event listeners
    this.setupSidebarEvents();
  }

  addToggleButton() {
    // Find Gmail's compose button area
    const composeArea = document.querySelector('[role="button"][aria-label*="Compose"]')?.parentElement;
    if (!composeArea) return;

    // Create AI toggle button
    const aiButton = document.createElement('div');
    aiButton.className = 'ai-toggle-button';
    aiButton.innerHTML = `
      <div class="ai-button-content">
        <div class="ai-button-icon">🤖</div>
        <span class="ai-button-text">AI Assistant</span>
      </div>
    `;
    
    aiButton.addEventListener('click', () => this.toggleSidebar());
    
    // Insert after compose button
    composeArea.appendChild(aiButton);
  }

  setupSidebarEvents() {
    // Close button
    document.getElementById('ai-close-sidebar').addEventListener('click', () => {
      this.hideSidebar();
    });

    // Send button
    document.getElementById('ai-send-btn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Enter key
    document.getElementById('ai-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Quick action buttons
    document.querySelectorAll('.ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Auto-respond toggle
    document.getElementById('ai-auto-respond').addEventListener('change', (e) => {
      this.toggleAutoRespond(e.target.checked);
    });
  }

  setupEmailListeners() {
    // Listen for email selection changes
    const observer = new MutationObserver(() => {
      this.updateCurrentEmail();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  updateCurrentEmail() {
    // Get current selected email
    const emailElement = document.querySelector('[role="main"] [data-thread-id]');
    if (emailElement) {
      const threadId = emailElement.getAttribute('data-thread-id');
      if (threadId !== this.currentEmail?.threadId) {
        this.currentEmail = {
          threadId,
          element: emailElement
        };
        this.extractEmailData();
      }
    }
  }

  extractEmailData() {
    if (!this.currentEmail?.element) return;

    const emailData = {
      subject: this.getEmailSubject(),
      sender: this.getEmailSender(),
      body: this.getEmailBody(),
      date: this.getEmailDate()
    };

    this.currentEmail.data = emailData;
  }

  getEmailSubject() {
    const subjectElement = document.querySelector('[data-thread-id] h2, [data-thread-id] .thread-subject');
    return subjectElement?.textContent?.trim() || '';
  }

  getEmailSender() {
    const senderElement = document.querySelector('[data-thread-id] .yW span[email], [data-thread-id] .yW .yP');
    return senderElement?.textContent?.trim() || '';
  }

  getEmailBody() {
    const bodyElement = document.querySelector('[data-thread-id] .y2, [data-thread-id] .email-body');
    return bodyElement?.textContent?.trim() || '';
  }

  getEmailDate() {
    const dateElement = document.querySelector('[data-thread-id] .xW, [data-thread-id] .date');
    return dateElement?.textContent?.trim() || '';
  }

  toggleSidebar() {
    if (this.isVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }

  showSidebar() {
    this.sidebar.classList.add('visible');
    this.isVisible = true;
    document.getElementById('ai-input').focus();
  }

  hideSidebar() {
    this.sidebar.classList.remove('visible');
    this.isVisible = false;
  }

  async sendMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Process the message
      const response = await this.processMessage(message);
      this.hideTypingIndicator();
      this.addMessage(response, 'assistant');
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      console.error('Error processing message:', error);
    }
  }

  async processMessage(message) {
    // Send to background script for processing
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'processCommand',
        message: message,
        emailData: this.currentEmail?.data
      }, (response) => {
        resolve(response?.result || 'I received your message but couldn\'t process it.');
      });
    });
  }

  handleQuickAction(action) {
    const actions = {
      summarize: 'Summarize the latest email from the current sender',
      availability: 'Check my calendar availability for the next week',
      draft: 'Draft a follow-up email to the current sender'
    };

    const message = actions[action];
    if (message) {
      document.getElementById('ai-input').value = message;
      this.sendMessage();
    }
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById('ai-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `ai-message ai-${sender}`;
    
    messageElement.innerHTML = `
      <div class="ai-message-content">
        ${sender === 'user' ? content : this.formatResponse(content)}
      </div>
    `;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatResponse(content) {
    // Format AI responses with proper line breaks and styling
    return content.replace(/\n/g, '<br>');
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('ai-messages');
    const typingElement = document.createElement('div');
    typingElement.className = 'ai-message ai-assistant ai-typing';
    typingElement.id = 'ai-typing-indicator';
    
    typingElement.innerHTML = `
      <div class="ai-message-content">
        <div class="ai-typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingElement = document.getElementById('ai-typing-indicator');
    if (typingElement) {
      typingElement.remove();
    }
  }

  async toggleAutoRespond(enabled) {
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'toggleAutoRespond',
      enabled: enabled
    });
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EmailAIAssistant();
  });
} else {
  new EmailAIAssistant();
}

