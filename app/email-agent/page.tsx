'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Send, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

export default function EmailAgentPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tokens, setTokens] = useState<any>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email form
  const [sendTo, setSendTo] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Check for tokens from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const tokensParam = urlParams.get('tokens');
    const emailParam = urlParams.get('email');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
    } else if (tokensParam && emailParam) {
      try {
        const parsedTokens = JSON.parse(decodeURIComponent(tokensParam));
        setTokens(parsedTokens);
        setUserEmail(decodeURIComponent(emailParam));
        setIsAuthenticated(true);
        setSuccess('Successfully authenticated with Google!');
        
        // Clean URL
        window.history.replaceState({}, '', '/email-agent');
      } catch (err) {
        setError('Failed to parse authentication tokens');
      }
    }
  }, []);

  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  const fetchEmails = async () => {
    if (!tokens) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/email-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_emails',
          tokens
        }),
      });

      const data = await response.json();
      if (data.emails) {
        setEmails(data.emails);
        setSuccess(`Fetched ${data.emails.length} unread emails`);
      }
    } catch (err) {
      setError('Failed to fetch emails');
    }
    setLoading(false);
  };

  const sendEmail = async () => {
    if (!tokens || !sendTo || !sendSubject || !sendBody) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/email-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_email',
          tokens,
          to: sendTo,
          subject: sendSubject,
          body: sendBody
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Email sent successfully!');
        setSendTo('');
        setSendSubject('');
        setSendBody('');
      } else {
        setError(data.error || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    }
    setSending(false);
  };

  const autoRespond = async (email: Email) => {
    if (!tokens) return;
    
    try {
      const response = await fetch('/api/email-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'auto_respond',
          tokens,
          emailId: email.id,
          originalEmail: email
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`AI response sent to ${email.from}`);
      } else {
        setError(data.error || 'Failed to send auto response');
      }
    } catch (err) {
      setError('Failed to send auto response');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Agent</h1>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <UserCheck className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">{userEmail}</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700">
            <span>✅ {success}</span>
          </div>
        </Card>
      )}

      {!isAuthenticated ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Mail className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Connect Your Gmail</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sign in with your Google account to send emails and enable automatic AI responses.
            </p>
            <Button onClick={handleGoogleAuth} size="lg">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Inbox */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Inbox</h2>
              <Button 
                onClick={fetchEmails} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {emails.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No unread emails. Click refresh to check for new messages.
                </p>
              ) : (
                emails.map((email) => (
                  <Card key={email.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{email.from}</span>
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mt-1">{email.subject}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {email.snippet}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => autoRespond(email)}
                          size="sm"
                          variant="default"
                        >
                          AI Reply
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>

          {/* Send Email */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send Email</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">To</label>
                <Input
                  type="email"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  className="w-full p-3 border rounded-md resize-none"
                  rows={6}
                  value={sendBody}
                  onChange={(e) => setSendBody(e.target.value)}
                  placeholder="Type your message here..."
                />
              </div>
              <Button 
                onClick={sendEmail}
                disabled={sending || !sendTo || !sendSubject || !sendBody}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
