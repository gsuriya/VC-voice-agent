#!/bin/bash

# Gmail Email AI Assistant - Installation Script
echo "🤖 Installing Gmail Email AI Assistant..."

# Check if Chrome is installed
if ! command -v google-chrome &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    echo "❌ Chrome browser not found. Please install Chrome first."
    exit 1
fi

# Create extension directory
EXTENSION_DIR="$HOME/Downloads/gmail-ai-assistant"
mkdir -p "$EXTENSION_DIR"

# Copy extension files
echo "📁 Copying extension files..."
cp manifest.json "$EXTENSION_DIR/"
cp content.js "$EXTENSION_DIR/"
cp background.js "$EXTENSION_DIR/"
cp popup.html "$EXTENSION_DIR/"
cp popup.js "$EXTENSION_DIR/"
cp styles.css "$EXTENSION_DIR/"

echo "✅ Extension files copied to: $EXTENSION_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked' and select: $EXTENSION_DIR"
echo "4. Click the extension icon to configure API keys"
echo ""
echo "📖 For detailed instructions, see: INSTALLATION.md"
echo "🎉 Enjoy your new AI email assistant!"

