# Venture Email Tab - Chrome Extension

A Chrome extension that adds a blue sidebar to Gmail with minimize/maximize functionality.

## Features

- 🔵 **Blue Venture Sidebar** - Clean, professional blue gradient design
- 🔘 **Toolbar Button** - Adds button next to Gmail's settings icon
- ⬅️ **Minimize/Maximize** - Toggle sidebar with + and - buttons  
- 📧 **Gmail Integration** - Seamlessly integrates with Gmail interface
- 🎯 **Non-Overlapping** - Adjusts Gmail layout, doesn't cover content
- ⚡ **Fast & Lightweight** - Minimal performance impact

## Installation

1. **Download** this folder to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** 
5. **Select** the `gmail-venture-extension` folder
6. **Done!** The extension is now installed

## Usage

1. **Navigate to Gmail** (https://mail.google.com)
2. **Look for the Venture button** in the top right toolbar (next to settings)
3. **Click the Venture button** to toggle the blue sidebar on/off
4. **Use the "−" button** in the sidebar to minimize it
5. **Use the "+" button** to maximize it back

## Files Structure

```
gmail-venture-extension/
├── manifest.json       # Extension configuration
├── content.js          # Main sidebar logic
├── styles.css          # Blue sidebar styling
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── icon16.png          # Small icon
├── icon48.png          # Medium icon
├── icon128.png         # Large icon
└── README.md           # This file
```

## Customization

To modify the sidebar:
- **Colors**: Edit the gradient in `styles.css` (`.venture-sidebar` background)
- **Size**: Change the `width` property in `styles.css`
- **Content**: Modify the HTML in `content.js` (`.venture-content`)

## Troubleshooting

- **Sidebar not showing**: Refresh Gmail page after installing
- **Layout issues**: The extension adjusts Gmail's margin automatically
- **Navigation**: Works with Gmail's single-page app navigation

## Version

Current version: 1.0

Perfect for venture capital firms, startups, or anyone who wants a clean email workspace!
