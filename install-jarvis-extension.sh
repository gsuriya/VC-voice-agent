#!/bin/bash

# JARVIS Gmail Assistant Extension Installer
# This script installs the Chrome extension for automatic Gmail overlay

echo "🤖 JARVIS: Installing Gmail Assistant Extension..."

# Create extension directory
EXTENSION_DIR="$HOME/Downloads/jarvis-gmail-assistant"
mkdir -p "$EXTENSION_DIR"

# Copy extension files
echo "📁 Copying extension files..."
cp chrome-extension/manifest.json "$EXTENSION_DIR/"
cp chrome-extension/content.js "$EXTENSION_DIR/"
cp chrome-extension/styles.css "$EXTENSION_DIR/"
cp chrome-extension/background.js "$EXTENSION_DIR/"
cp chrome-extension/popup.html "$EXTENSION_DIR/"
cp chrome-extension/popup.js "$EXTENSION_DIR/"

echo "✅ Extension files copied to: $EXTENSION_DIR"

# Open the extension directory
open "$EXTENSION_DIR"

echo ""
echo "🎯 Installation Instructions:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select the folder: $EXTENSION_DIR"
echo "5. The JARVIS extension will be installed!"
echo ""
echo "🚀 After installation:"
echo "1. Go to Gmail (mail.google.com)"
echo "2. The JARVIS overlay will automatically appear"
echo "3. Start chatting with your AI assistant!"
echo ""
echo "💡 Make sure your Next.js server is running (npm run dev)"
echo "   so the extension can connect to your email agent API."

echo ""
echo "✨ JARVIS is ready to assist with your emails!"
