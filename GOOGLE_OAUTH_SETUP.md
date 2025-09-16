# 🔐 Google OAuth Setup Guide

## Quick Setup Steps

### 1. **Go to Google Cloud Console**
- Visit: https://console.cloud.google.com/
- Create new project or select existing one

### 2. **Enable Gmail API**
- Go to "APIs & Services" → "Library"
- Search "Gmail API" → Click "Enable"

### 3. **Create OAuth Credentials**
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Application type: **Web application**
- Name: `VC Voice Agent`
- **Authorized redirect URIs:** `http://localhost:3000/api/auth/google/callback`
- Click "Create"

### 4. **Copy Credentials**
Copy the Client ID and Client Secret that appear after creation.

### 5. **Add to Environment**
Add these to your `.env.local` file:

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 6. **Restart Dev Server**
```bash
npm run dev
```

## ✅ Test Authentication

1. Go to `http://localhost:3000/gmail-sync`
2. Click "Connect Gmail Account"
3. Complete Google OAuth flow
4. Click "Sync Gmail to Vector DB"
5. Your REAL emails will sync to Pinecone!

## 🔍 What Changed

- **Before:** Demo emails only
- **After:** Real Gmail emails with semantic search
- **Authentication:** Proper Google OAuth flow
- **Data:** Your actual email content stored in Pinecone

## 🚨 Important Notes

- Your emails are stored securely in Pinecone
- Only you can access your email data (multi-tenant isolation)
- OAuth tokens are stored locally in your browser
- The app requests read-only access to Gmail
