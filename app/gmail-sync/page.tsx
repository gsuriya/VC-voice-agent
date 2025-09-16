'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SyncStatus {
  isLoading: boolean;
  isComplete: boolean;
  totalEmails: number;
  error: string | null;
  sampleEmails: any[];
}

export default function GmailSyncPage() {
  const [tokens, setTokens] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    isComplete: false,
    totalEmails: 0,
    error: null,
    sampleEmails: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Check for OAuth tokens and listen for popup messages
  useEffect(() => {
    // Check URL for OAuth callback tokens (fallback)
    const urlParams = new URLSearchParams(window.location.search);
    const tokensParam = urlParams.get('tokens');
    const emailParam = urlParams.get('email');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setSyncStatus(prev => ({
        ...prev,
        error: `OAuth Error: ${errorParam}`,
      }));
    }

    if (tokensParam && emailParam) {
      try {
        const parsedTokens = JSON.parse(decodeURIComponent(tokensParam));
        setTokens(parsedTokens);
        setUserEmail(decodeURIComponent(emailParam));
        console.log('✅ OAuth tokens received from URL:', { email: emailParam });
      } catch (error) {
        console.error('Error parsing tokens:', error);
        setSyncStatus(prev => ({
          ...prev,
          error: 'Failed to parse OAuth tokens',
        }));
      }
    }

    // Check localStorage for stored tokens
    const storedTokens = localStorage.getItem('gmail_tokens');
    const storedEmail = localStorage.getItem('gmail_user_email');
    
    if (storedTokens && storedEmail && !tokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
        setUserEmail(storedEmail);
        console.log('✅ OAuth tokens loaded from storage:', { email: storedEmail });
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
      }
    }

    // Listen for postMessage from OAuth popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
        console.log('✅ OAuth success message received from popup');
        setTokens(event.data.tokens);
        setUserEmail(event.data.userEmail);
        
        // Store in localStorage as backup
        localStorage.setItem('gmail_tokens', JSON.stringify(event.data.tokens));
        localStorage.setItem('gmail_user_email', event.data.userEmail);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [tokens]);

  const handleGoogleAuth = async () => {
    try {
      console.log('🚀 Starting Google OAuth...');
      
      // Open Google OAuth in a new window
      const authWindow = window.open(
        '/api/auth/google',
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!authWindow) {
        setSyncStatus(prev => ({
          ...prev,
          error: 'Could not open authentication window. Please check popup blocker.',
        }));
        return;
      }
      
      // Monitor the auth window
      const checkClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkClosed);
          console.log('🔐 Auth window closed');
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Auth error:', error);
      setSyncStatus(prev => ({
        ...prev,
        error: 'Authentication failed',
      }));
    }
  };

  const handleSyncEmails = async () => {
    if (!tokens || !userEmail) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Please authenticate with Google first',
      }));
      return;
    }

    setSyncStatus({
      isLoading: true,
      isComplete: false,
      totalEmails: 0,
      error: null,
      sampleEmails: [],
    });

    try {
      console.log('🚀 Starting email sync...');
      
      const response = await fetch('/api/sync-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens,
          userEmail,
          maxResults: 1000, // Sync up to 1000 emails
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSyncStatus({
          isLoading: false,
          isComplete: true,
          totalEmails: result.totalEmails,
          error: null,
          sampleEmails: result.sampleEmails || [],
        });
        console.log('✅ Email sync complete:', result);
      } else {
        setSyncStatus(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Sync failed',
        }));
      }
    } catch (error: any) {
      console.error('❌ Sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Network error',
      }));
    }
  };

  const handleEmailSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/test-pinecone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search_emails',
          query: searchQuery,
        }),
      });

      const result = await response.json();
      console.log('🔍 Search results:', result);
      
      if (result.success) {
        setSearchResults(result.results || []);
      } else {
        console.error('Search failed:', result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Gmail Vector Sync</h1>
          <p className="text-gray-600 mt-2">
            Sync your Gmail emails to vector database for semantic search
          </p>
        </div>

        {/* Authentication Card */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Step 1: Authenticate with Google</CardTitle>
            <CardDescription>
              Connect your Gmail account to sync emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!tokens ? (
              <Button onClick={handleGoogleAuth} size="lg" className="w-full">
                🔐 Connect Gmail Account
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-green-50">
                    ✅ Connected
                  </Badge>
                  <span className="text-sm text-gray-600">{userEmail}</span>
                </div>
                <Button 
                  onClick={handleGoogleAuth} 
                  variant="outline" 
                  size="sm"
                >
                  🔄 Re-authenticate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Card */}
        <Card>
          <CardHeader>
            <CardTitle>📧 Step 2: Sync Your Emails</CardTitle>
            <CardDescription>
              Import your emails into the vector database for AI search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleSyncEmails}
                disabled={!tokens || syncStatus.isLoading}
                size="lg"
                className="w-full"
              >
                {syncStatus.isLoading ? (
                  <>
                    ⏳ Syncing Emails...
                  </>
                ) : (
                  <>
                    🚀 Sync Gmail to Vector DB
                  </>
                )}
              </Button>

              {syncStatus.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  ❌ {syncStatus.error}
                </div>
              )}

              {syncStatus.isComplete && (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-green-600">✅ Sync Complete</Badge>
                    <span className="text-sm text-gray-600">
                      {syncStatus.totalEmails} emails synced
                    </span>
                  </div>
                  
                  {syncStatus.sampleEmails.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Sample emails:</p>
                      <div className="space-y-1">
                        {syncStatus.sampleEmails.map((email, index) => (
                          <div key={index} className="text-xs text-gray-600 p-2 bg-white rounded">
                            <div className="font-medium">{email.subject}</div>
                            <div>From: {email.from}</div>
                            <div>Date: {new Date(email.date).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Search Card - Always Show */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Search Your Emails</CardTitle>
            <CardDescription>
              Search your synced emails with natural language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="What emails are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEmailSearch();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSearching}
                />
                <Button 
                  onClick={handleEmailSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? '🔄 Searching...' : '🔍 Search'}
                </Button>
              </div>

              {/* Quick Search Suggestions */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Quick searches:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "find my recent emails",
                    "emails from today",
                    "important emails",
                    "unread emails",
                    "job applications",
                    "internships",
                    "meeting invites",
                    "newsletters"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setTimeout(() => handleEmailSearch(), 100);
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700">
                    Found {searchResults.length} emails:
                  </p>
                  {searchResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {result.metadata.subject || 'No subject'}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            From: {result.metadata.fromName || result.metadata.from}
                          </p>
                          {result.metadata.snippet && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {result.metadata.snippet}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {(result.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasSearched && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No emails found. Try a different search term.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {syncStatus.isComplete && (
          <Card>
            <CardHeader>
              <CardTitle>🚀 What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span>Your emails are now searchable with AI!</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>🔄</span>
                  <span>Next: Integrate with Chrome extension</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>🤖</span>
                  <span>Next: Add AI email drafting & responses</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>📊</span>
                  <span>Next: Build analytics dashboard</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
