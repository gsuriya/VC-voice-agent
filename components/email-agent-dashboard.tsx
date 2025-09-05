'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mail, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

interface EmailAgentStatus {
  isConnected: boolean;
  schedulerRunning: boolean;
  nextCheck: string;
  checkInterval: number;
  emailsReceived: number;
  emailsSent: number;
  lastActivity: string;
}

export default function EmailAgentDashboard() {
  const [status, setStatus] = useState<EmailAgentStatus>({
    isConnected: false,
    schedulerRunning: false,
    nextCheck: 'N/A',
    checkInterval: 0,
    emailsReceived: 0,
    emailsSent: 0,
    lastActivity: 'Never'
  });

  const [isConnecting, setIsConnecting] = useState(false);

  // Check for OAuth callback and auto-start
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const tokens = urlParams.get('tokens');

    if (success === 'true' && tokens) {
      try {
        const tokenData = JSON.parse(decodeURIComponent(tokens));
        localStorage.setItem('googleTokens', JSON.stringify(tokenData));
        setStatus(prev => ({ ...prev, isConnected: true }));
        autoStartScheduler(tokenData);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing tokens:', error);
      }
    } else {
      // Check if we have stored tokens
      const storedTokens = localStorage.getItem('googleTokens');
      if (storedTokens) {
        try {
          const tokenData = JSON.parse(storedTokens);
          setStatus(prev => ({ ...prev, isConnected: true }));
          autoStartScheduler(tokenData);
        } catch (error) {
          console.error('Error loading stored tokens:', error);
        }
      }
    }
  }, []);

  // Auto-start scheduler
  const autoStartScheduler = async (tokenData: any) => {
    try {
      console.log('Auto-starting email scheduler...');
      const response = await fetch('/api/email-agent/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start',
          tokens: tokenData,
          interval: 2000 // 2 seconds
        })
      });

      if (response.ok) {
        setStatus(prev => ({ ...prev, schedulerRunning: true }));
        console.log('Email scheduler started successfully');
      }
    } catch (error) {
      console.error('Error auto-starting scheduler:', error);
    }
  };

  // Connect to Google
  const connectGoogle = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Check scheduler status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/email-agent/scheduler');
        if (response.ok) {
          const data = await response.json();
          setStatus(prev => ({
            ...prev,
            schedulerRunning: data.isRunning,
            nextCheck: data.nextCheck,
            checkInterval: data.checkInterval
          }));
        }
      } catch (error) {
        console.error('Error checking scheduler status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (!status.isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Email Agent</CardTitle>
            <p className="text-gray-600">Connect your Google account to start</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={connectGoogle} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Gmail & Calendar'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Email Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">Automatically monitoring and responding to .edu emails</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {status.schedulerRunning ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">Status</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {status.schedulerRunning ? 'Active' : 'Inactive'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Check Interval</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {status.checkInterval} seconds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-green-500" />
                <span className="font-medium">Emails Received</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {status.emailsReceived}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Responses Sent</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {status.emailsSent}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🤖 Email Agent is ACTIVE</h3>
              <p className="text-green-700">
                Automatically processing new .edu emails every 2 seconds
              </p>
              <p className="text-sm text-green-600 mt-1">
                Only responds to emails received after program started
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Next Check</h4>
                <p className="text-sm text-gray-600">{status.nextCheck}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Last Activity</h4>
                <p className="text-sm text-gray-600">{status.lastActivity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}