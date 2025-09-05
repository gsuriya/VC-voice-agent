// Gmail Email AI Assistant - Popup Script
class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'openaiApiKey',
        'googleTokens',
        'autoRespondEnabled'
      ]);

      // Load API key
      if (result.openaiApiKey) {
        document.getElementById('openai-key').value = result.openaiApiKey;
      }

      // Load auto-respond setting
      document.getElementById('auto-respond').checked = result.autoRespondEnabled !== false;

      // Update Google status
      this.updateGoogleStatus(!!result.googleTokens);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  setupEventListeners() {
    // Save API key
    document.getElementById('save-api-key').addEventListener('click', () => {
      this.saveApiKey();
    });

    // Connect Google
    document.getElementById('connect-google').addEventListener('click', () => {
      this.connectGoogle();
    });

    // Auto-respond toggle
    document.getElementById('auto-respond').addEventListener('change', (e) => {
      this.toggleAutoRespond(e.target.checked);
    });

    // Test AI
    document.getElementById('test-ai').addEventListener('click', () => {
      this.testAI();
    });
  }

  async saveApiKey() {
    const apiKey = document.getElementById('openai-key').value.trim();
    
    if (!apiKey) {
      this.showMessage('Please enter your OpenAI API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      this.showMessage('Invalid API key format. Should start with "sk-"', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({ openaiApiKey: apiKey });
      this.showMessage('API key saved successfully!', 'success');
      this.updateStatus();
    } catch (error) {
      console.error('Error saving API key:', error);
      this.showMessage('Error saving API key', 'error');
    }
  }

  async connectGoogle() {
    try {
      const button = document.getElementById('connect-google');
      button.textContent = 'Connecting...';
      button.disabled = true;

      // Send message to background script
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'authenticate' }, resolve);
      });

      if (response.success) {
        this.showMessage('Google account connected successfully!', 'success');
        this.updateGoogleStatus(true);
      } else {
        this.showMessage('Failed to connect Google account', 'error');
        this.updateGoogleStatus(false);
      }
    } catch (error) {
      console.error('Error connecting Google:', error);
      this.showMessage('Error connecting Google account', 'error');
      this.updateGoogleStatus(false);
    } finally {
      const button = document.getElementById('connect-google');
      button.textContent = 'Connect Google Account';
      button.disabled = false;
    }
  }

  async toggleAutoRespond(enabled) {
    try {
      await chrome.storage.sync.set({ autoRespondEnabled: enabled });
      this.showMessage(
        enabled ? 'Auto-respond enabled' : 'Auto-respond disabled',
        'success'
      );
    } catch (error) {
      console.error('Error toggling auto-respond:', error);
      this.showMessage('Error updating setting', 'error');
    }
  }

  async testAI() {
    try {
      const button = document.getElementById('test-ai');
      button.textContent = 'Testing...';
      button.disabled = true;

      // Send test message to background script
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'processCommand',
          message: 'Hello, can you help me?'
        }, resolve);
      });

      if (response.result && !response.error) {
        this.showMessage('AI connection successful!', 'success');
        this.updateAIStatus(true);
      } else {
        this.showMessage('AI connection failed: ' + (response.error || 'Unknown error'), 'error');
        this.updateAIStatus(false);
      }
    } catch (error) {
      console.error('Error testing AI:', error);
      this.showMessage('Error testing AI connection', 'error');
      this.updateAIStatus(false);
    } finally {
      const button = document.getElementById('test-ai');
      button.textContent = 'Test AI Connection';
      button.disabled = false;
    }
  }

  updateGoogleStatus(connected) {
    const statusIndicator = document.getElementById('google-status');
    const statusText = document.getElementById('google-status-text');
    const button = document.getElementById('connect-google');

    if (connected) {
      statusIndicator.className = 'status-indicator connected';
      statusText.textContent = 'Connected';
      button.textContent = 'Reconnect Google Account';
    } else {
      statusIndicator.className = 'status-indicator disconnected';
      statusText.textContent = 'Not connected';
      button.textContent = 'Connect Google Account';
    }
  }

  updateAIStatus(working) {
    const statusIndicator = document.getElementById('ai-status');
    const statusText = document.getElementById('ai-status-text');

    if (working) {
      statusIndicator.className = 'status-indicator connected';
      statusText.textContent = 'AI Ready';
    } else {
      statusIndicator.className = 'status-indicator disconnected';
      statusText.textContent = 'AI Not Ready';
    }
  }

  async updateStatus() {
    try {
      // Get current status from background script
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getStatus' }, resolve);
      });

      if (response) {
        this.updateGoogleStatus(response.authenticated);
        this.updateAIStatus(response.openaiConfigured);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  showMessage(message, type) {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      padding: 12px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      text-align: center;
      ${type === 'success' ? 'background: #4caf50;' : 'background: #f44336;'}
    `;
    messageEl.textContent = message;

    document.body.appendChild(messageEl);

    // Remove after 3 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

