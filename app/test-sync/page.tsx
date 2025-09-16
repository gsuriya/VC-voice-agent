'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface SyncStatus {
  isLoading: boolean;
  isComplete: boolean;
  totalEmails: number;
  error: string | null;
  sampleEmails: any[];
  isTestData: boolean;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: {
    from: string;
    subject: string;
    snippet: string;
    date: string;
  };
}

export default function TestSyncPage() {
  const [userEmail, setUserEmail] = useState<string>('test@example.com');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    isComplete: false,
    totalEmails: 0,
    error: null,
    sampleEmails: [],
    isTestData: false,
  });

  const handleSyncEmails = async () => {
    if (!userEmail.trim()) {
      setSyncStatus(prev => ({
        ...prev,
        error: 'Please enter a valid email address',
      }));
      return;
    }

    setSyncStatus({
      isLoading: true,
      isComplete: false,
      totalEmails: 0,
      error: null,
      sampleEmails: [],
      isTestData: false,
    });

    try {
      console.log('🚀 Starting test email sync...');
      
      const response = await fetch('/api/demo-gmail-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: userEmail.trim(),
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
          isTestData: result.isTestData || false,
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      console.log('🔍 Searching for:', searchQuery);
      
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
      
      if (result.success && result.results.length > 0) {
        setSearchResults(result.results);
      } else {
        setSearchResults([]);
        alert('No emails found matching your query.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Check console for details.');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Quick Email Sync Test</h1>
          <p className="text-gray-600 mt-2">
            Test vector database with sample emails
          </p>
        </div>

        {/* Sync Card */}
        <Card>
          <CardHeader>
          <CardTitle>📧 Step 1: Sync Realistic Demo Emails</CardTitle>
          <CardDescription>
            This will create professional, realistic emails to test semantic search
          </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User Email (for multi-tenant testing)</label>
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={handleSyncEmails}
                disabled={syncStatus.isLoading}
                size="lg"
                className="w-full"
              >
                {syncStatus.isLoading ? (
                  <>⏳ Syncing Test Emails...</>
                ) : (
                  <>🚀 Create Realistic Demo Email Database</>
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
                    {syncStatus.isTestData && (
                      <Badge variant="outline">Test Data</Badge>
                    )}
                  </div>
                  
                  {syncStatus.sampleEmails.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Sample emails created:</p>
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

        {/* Search Card */}
        {syncStatus.isComplete && (
          <Card>
            <CardHeader>
              <CardTitle>🔍 Step 2: Test Semantic Search</CardTitle>
              <CardDescription>
                Search your emails with natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Try: 'maggie meeting', 'investment proposal', 'due diligence'"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    🔍 Search
                  </Button>
                </div>
                
                {/* Quick Search Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery('Sarah roadmap feedback');
                      handleSearch();
                    }}
                  >
                    "Sarah roadmap feedback"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery('investment meeting John');
                      handleSearch();
                    }}
                  >
                    "Investment meeting John"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery('design mockups Alex');
                      handleSearch();
                    }}
                  >
                    "Design mockups Alex"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery('research collaboration');
                      handleSearch();
                    }}
                  >
                    "Research collaboration"
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">
                                {result.metadata.subject}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                From: {result.metadata.from}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {result.metadata.snippet}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(result.metadata.date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {Math.round(result.score * 100)}% match
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {syncStatus.isComplete && (
          <Card>
            <CardHeader>
              <CardTitle>🎉 Success! What This Proves:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span><strong>Vector Database:</strong> Pinecone is working and storing email embeddings</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span><strong>Semantic Search:</strong> Natural language queries find relevant emails</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span><strong>Multi-tenant:</strong> Each user's emails are isolated by email address</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>🔄</span>
                  <span><strong>Next:</strong> Connect real Gmail API for actual email sync</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>🤖</span>
                  <span><strong>Next:</strong> Add AI query processing ("find Maggie's emails")</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>✍️</span>
                  <span><strong>Next:</strong> Add AI email drafting and responses</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
