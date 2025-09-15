# AI Email Agent for Gmail

A powerful Chrome extension that brings AI-powered email responses directly to Gmail. Automatically generate intelligent replies, enable auto-responses, and streamline your email workflow with OpenAI integration.

## 🚀 Features

- 🤖 **AI-Powered Responses** - Generate contextual email replies using OpenAI GPT-3.5-turbo
- 📧 **Gmail Integration** - Beautiful sidebar overlay directly in Gmail interface
- 🔄 **Auto-Response** - Automatically reply to emails with intelligent AI responses
- 🔐 **Secure OAuth** - Uses Chrome's identity API for secure Google authentication
- 📱 **Modern UI** - Clean, professional interface with smooth animations
- 🎯 **Smart Processing** - Prevents duplicate responses and spam
- 🔔 **Notifications** - Chrome notifications for sent responses
- ⚡ **Real-time** - Instant email processing and response generation

## 📦 Installation

### Option 1: Load Unpacked (Development)
1. **Download** this extension folder
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"**
5. **Select** the `gmail-venture-extension` folder
6. **Pin the extension** to your toolbar for easy access

### Option 2: Chrome Web Store (Coming Soon)
*Extension will be available on Chrome Web Store after review*

## 🔧 Setup

1. **Install the extension** following the installation steps above
2. **Open Gmail** (https://mail.google.com)
3. **Click the AI Email Agent button** in Gmail's toolbar (🤖 AI Email Agent)
4. **Authenticate** with your Google account when prompted
5. **Grant permissions** for Gmail access
6. **Start using AI responses!**

## 🎯 Usage

### Manual AI Responses
1. **Open the AI sidebar** by clicking the "🤖 AI Email Agent" button in Gmail
2. **Click "Refresh Emails"** to load your unread emails
3. **Click "🤖 AI Reply"** on any email to generate and send an intelligent response

### Auto-Response Mode
1. **Toggle "Auto-Response"** in the sidebar or extension popup
2. **The extension will automatically:**
   - Monitor for new unread emails
   - Generate contextual AI responses
   - Send replies automatically
   - Show notifications for sent responses

### Extension Popup
- **Click the extension icon** in Chrome toolbar for quick controls
- **View status** and authentication state
- **Toggle auto-response** on/off
- **Open Gmail** directly
- **Refresh emails** manually

## 📁 File Structure

```
gmail-venture-extension/
├── manifest.json          # Extension configuration with permissions
├── background.js          # Service worker for Gmail API and OpenAI
├── content.js            # Gmail integration and sidebar UI
├── popup.html           # Extension popup interface
├── popup.js            # Popup functionality and controls
├── styles.css          # Beautiful sidebar and UI styling
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
└── README.md          # This documentation
```

## 🔒 Permissions

- **identity**: For secure Google OAuth authentication
- **storage**: To save settings and processed email IDs
- **activeTab**: To interact with Gmail
- **notifications**: To show response notifications
- **host_permissions**: Access to Gmail and Google APIs

## 🛠️ Development

### Local Development
1. **Clone the repository**
2. **Make your changes** to the extension files
3. **Go to `chrome://extensions/`**
4. **Click the refresh icon** for the extension
5. **Test in Gmail**

### API Integration
- **Gmail API**: For reading emails and sending responses
- **OpenAI API**: For generating intelligent email responses
- **Chrome Identity API**: For secure OAuth authentication

## 🔧 Troubleshooting

### Common Issues
- **Authentication failed**: Check Google Cloud Console OAuth setup
- **No emails loading**: Verify Gmail API permissions
- **Extension not visible**: Refresh Gmail page after installing
- **Auto-response not working**: Check if toggle is enabled and authentication is successful

### Debug Mode
1. **Open Chrome DevTools** on Gmail page
2. **Check Console tab** for extension logs
3. **Look for** 🤖 AI Email Agent messages

## 🚀 Publishing to Chrome Web Store

1. **Zip the extension folder** (excluding node_modules, .git, etc.)
2. **Go to Chrome Web Store Developer Dashboard**
3. **Upload the zip file**
4. **Fill out store listing** with screenshots and description
5. **Submit for review**

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 📄 License

MIT License - Feel free to use, modify, and distribute!

---

**🤖 AI Email Agent** - Revolutionizing email productivity with artificial intelligence!