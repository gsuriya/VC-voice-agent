'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EmailResult {
  id: string;
  score: number;
  metadata: {
    subject: string;
    from: string;
    fromName?: string;
    to: string;
    date: string;
    snippet?: string;
    labels?: string[];
    isImportant?: boolean;
    isUnread?: boolean;
  };
}

export default function EmailSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EmailResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

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
          query: query,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || []);
      } else {
        console.error('Search failed:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const quickSearches = [
    "find my recent emails",
    "emails from today",
    "important emails this week",
    "unread emails",
    "meeting invites",
    "job applications",
    "newsletters",
    "emails about projects"
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">🔍 AI Email Search</h1>
          <p className="text-gray-600 mt-2">
            Search your Gmail using natural language - powered by AI
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search Your Emails</CardTitle>
            <CardDescription>
              Ask anything: "emails from John about the project" or "important emails from last week"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="What emails are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isSearching}
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? '🔄 Searching...' : '🔍 Search'}
              </Button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Try these searches:</p>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      setTimeout(() => handleSearch(), 100);
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle>
                {results.length > 0 
                  ? `Found ${results.length} emails` 
                  : 'No emails found'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result) => (
                    <div 
                      key={result.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-lg">
                              {result.metadata.subject || 'No subject'}
                            </h3>
                            {result.metadata.isImportant && (
                              <Badge variant="destructive" className="text-xs">Important</Badge>
                            )}
                            {result.metadata.isUnread && (
                              <Badge variant="secondary" className="text-xs">Unread</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{result.metadata.fromName || result.metadata.from}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(result.metadata.date)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {(result.score * 100).toFixed(0)}% match
                        </div>
                      </div>
                      
                      {result.metadata.snippet && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {result.metadata.snippet}
                        </p>
                      )}

                      {result.metadata.labels && result.metadata.labels.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {result.metadata.labels
                            .filter(label => !['UNREAD', 'IMPORTANT', 'STARRED'].includes(label))
                            .slice(0, 3)
                            .map((label, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {label.toLowerCase().replace('_', ' ')}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No emails matched your search.</p>
                  <p className="text-sm mt-2">Try a different search term or check the suggestions above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Email Index Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">1,023</p>
                <p className="text-sm text-gray-600">Total Emails Indexed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">AI</p>
                <p className="text-sm text-gray-600">Semantic Search</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">Real-time</p>
                <p className="text-sm text-gray-600">Search Results</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">Secure</p>
                <p className="text-sm text-gray-600">Your Data Only</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
