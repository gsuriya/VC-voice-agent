'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function RealGmailSyncPage() {
  const [status, setStatus] = useState('Ready to test Chrome extension sync');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Real Gmail Sync Test</h1>
          <p className="text-gray-600 mt-2">
            Test syncing your actual Gmail emails through the Chrome extension
          </p>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 How to Sync Your Real Gmail Emails</CardTitle>
            <CardDescription>
              Follow these steps to sync your actual Gmail to the vector database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Step 1: Load the Chrome Extension</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Open Chrome and go to <code>chrome://extensions/</code></li>
                  <li>Enable "Developer mode" (toggle in top right)</li>
                  <li>Click "Load unpacked" and select the <code>gmail-venture-extension</code> folder</li>
                  <li>The extension should now appear in your extensions list</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900 mb-2">Step 2: Open Gmail and Authenticate</h3>
                <ol className="list-decimal list-inside space-y-1 text-green-800">
                  <li>Go to <a href="https://mail.google.com" target="_blank" className="underline">mail.google.com</a></li>
                  <li>Click the extension icon (AI Email Agent) in the top right</li>
                  <li>Click "Authenticate with Google" in the extension popup</li>
                  <li>Grant the necessary permissions</li>
                </ol>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-900 mb-2">Step 3: Sync to Vector Database</h3>
                <ol className="list-decimal list-inside space-y-1 text-purple-800">
                  <li>In Gmail, look for the AI sidebar (click the › button if not visible)</li>
                  <li>Click "💾 Sync Real Gmail to Vector DB"</li>
                  <li>Wait for the sync to complete</li>
                  <li>Your real emails will now be searchable with AI!</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-900 mb-2">Step 4: Test Semantic Search</h3>
                <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                  <li>Go back to the <a href="/test-sync" className="underline">Test Sync page</a></li>
                  <li>Try searching for real people/topics from your emails</li>
                  <li>Use natural language like "emails from John" or "meeting invites"</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Vector Database: Ready</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>API Endpoints: Ready</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Chrome Extension: {status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extension Files */}
        <Card>
          <CardHeader>
            <CardTitle>📁 Extension Files Updated</CardTitle>
            <CardDescription>
              These files were just updated to support real Gmail sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">✅</Badge>
                <span>gmail-venture-extension/background.js - OAuth & Gmail API</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">✅</Badge>
                <span>gmail-venture-extension/manifest.json - Identity permission</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">✅</Badge>
                <span>gmail-venture-extension/content.js - UI updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">✅</Badge>
                <span>api/simple-gmail-sync/route.ts - Real email handling</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What This Enables */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 What This Enables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Real Email Search:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• "Find emails from my boss"</li>
                  <li>• "Show me meeting invites from last week"</li>
                  <li>• "Important emails about the project"</li>
                  <li>• "Messages mentioning deadlines"</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">AI Context Awareness:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Understands email relationships</li>
                  <li>• Recognizes conversation threads</li>
                  <li>• Identifies key contacts</li>
                  <li>• Categorizes email types</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>⏭️ After Sync: Next Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span>🤖</span>
                <span><strong>Smart Query Processing:</strong> "Draft a reply to John's proposal"</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>✍️</span>
                <span><strong>AI Email Drafting:</strong> Context-aware email composition</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>🔄</span>
                <span><strong>Auto Responses:</strong> Intelligent email automation</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>📊</span>
                <span><strong>Email Analytics:</strong> Insights and patterns</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
