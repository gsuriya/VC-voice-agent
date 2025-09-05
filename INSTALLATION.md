# 🚀 Installation Guide - Gmail Email AI Assistant

## Quick Start (5 minutes)

### 1. Download Extension Files
All files are already in your project directory. You need:
- `manifest.json`
- `content.js`
- `background.js`
- `popup.html`
- `popup.js`
- `styles.css`

### 2. Install in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right corner)
3. Click **"Load unpacked"**
4. Select the folder containing all the extension files
5. The extension should now appear in your extensions list

### 3. Configure API Keys
1. Click the extension icon in Chrome toolbar (🤖)
2. Enter your **OpenAI API Key**:
   - Get it from: https://platform.openai.com/api-keys
   - Format: `sk-...` (starts with "sk-")
3. Click **"Connect Google Account"**
4. Authorize Gmail and Calendar access
5. Click **"Test AI Connection"** to verify

### 4. Start Using!
1. Go to **Gmail** (mail.google.com)
2. Look for the **"🤖 AI Assistant"** button (top right)
3. Click it to open your AI assistant
4. Start chatting with commands like:
   - "Summarize latest emails from John"
   - "Check my availability next week"
   - "Draft a follow-up email"

## 🔧 Configuration Details

### OpenAI API Key Setup
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Paste in extension popup

### Google Account Setup
The extension will automatically request permissions for:
- **Gmail**: Read and send emails
- **Google Calendar**: Check availability and events

### Auto-Respond Settings
- Toggle on/off in extension popup
- Only responds to `.edu` email addresses
- Maintains "Pranav, NYU Stern student" persona

## 🎯 First Commands to Try

### Email Commands
```
"Summarize my latest emails"
"What emails do I have from Sarah?"
"Draft a response to John about the meeting"
"Show me urgent emails from today"
```

### Calendar Commands
```
"Check my availability tomorrow"
"Am I free next Tuesday?"
"What's my schedule this week?"
"Find time for a 1-hour meeting"
```

### General Commands
```
"Help me organize my inbox"
"What needs my attention?"
"Summarize my email activity"
```

## 🛠️ Troubleshooting

### Extension Not Loading
- Make sure Developer mode is enabled
- Check that all files are in the same folder
- Try refreshing the extensions page

### API Connection Issues
- Verify OpenAI API key is correct
- Check Google account is connected
- Test connection in extension popup

### Gmail Integration Issues
- Refresh Gmail page
- Check if extension is enabled
- Look for AI Assistant button in top right

### No AI Responses
- Check internet connection
- Verify API keys are saved
- Try "Test AI Connection" button

## 📱 Mobile Support

The extension works on:
- ✅ Chrome Desktop (Windows, Mac, Linux)
- ✅ Chrome on Android (with limitations)
- ❌ Safari (Chrome extension only)
- ❌ Firefox (different extension format)

## 🔒 Security Notes

- All API keys are stored locally in Chrome
- No email data is stored permanently
- Uses official Google and OpenAI APIs
- OAuth2 authentication for Google services

## 🎉 You're Ready!

Your Gmail Email AI Assistant is now installed and ready to help manage your emails intelligently. Start with simple commands and explore the full range of features!

---

*Need help? Check the main README.md for detailed usage instructions.*

