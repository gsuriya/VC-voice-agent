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

  // Check if we have tokens in localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      const tokens = localStorage.getItem('google_tokens');
      if (tokens) {
        setStatus(prev => ({ ...prev, isConnected: true }));
        // Auto-start the scheduler
        autoStartScheduler(JSON.parse(tokens));
      }
    };

    checkAuthStatus();
    
    // Check scheduler status every 5 seconds
    const statusInterval = setInterval(checkSchedulerStatus, 5000);
    
    return () => clearInterval(statusInterval);
  }, []);

  const checkSchedulerStatus = async () => {
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

  const autoStartScheduler = async (tokenData: any) => {
    try {
      console.log('Auto-starting email scheduler...');
      const response = await fetch('/api/email-agent/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start',
          tokens: tokenData,
          interval: 1000 // 1 second
        })
      });

      if (response.ok) {
        console.log('Email scheduler started successfully');
        setStatus(prev => ({ ...prev, schedulerRunning: true }));
      }
    } catch (error) {
      console.error('Error auto-starting scheduler:', error);
    }
  };

  const connectGoogle = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/auth/google');
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const resetEmailTracker = async () => {
    try {
      const response = await fetch('/api/email-agent/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('Email tracker reset! All emails can now be processed again.');
        console.log('Email tracker reset successfully');
      }
    } catch (error) {
      console.error('Error resetting tracker:', error);
      alert('Error resetting tracker');
    }
  };

  if (!status.isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🤖 Email Agent Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Connect your Google account to start the email agent
            </p>
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
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🤖 Email Agent Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {status.schedulerRunning ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <h3 className="font-semibold text-green-800">Agent Status</h3>
                <p className="text-sm text-green-600">
                  {status.schedulerRunning ? 'ACTIVE' : 'INACTIVE'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">Emails Received</h3>
                <p className="text-2xl font-bold text-blue-600">{status.emailsReceived}</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Send className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-800">Responses Sent</h3>
                <p className="text-2xl font-bold text-purple-600">{status.emailsSent}</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Status */}
          <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              🚀 Email Agent is ACTIVE
            </h3>
            <p className="text-green-700 mb-2">
              Automatically processing new .edu emails every second
            </p>
            <p className="text-sm text-green-600">
              Only responds to emails received after program started
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-green-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Next check: {status.nextCheck === 'N/A' ? 'N/A' : new Date(status.nextCheck).toLocaleTimeString()}
              </div>
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-1" />
                Interval: {status.checkInterval}s
              </div>
            </div>
          </div>

          {/* Live Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Live Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Last Activity:</span>
                  <span className="text-sm font-medium">{status.lastActivity}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Processing Status:</span>
                  <Badge variant={status.schedulerRunning ? "default" : "secondary"}>
                    {status.schedulerRunning ? "Running" : "Stopped"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Email Filter:</span>
                  <Badge variant="outline">.edu emails only</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Reset */}
          <div className="text-center">
            <Button 
              onClick={resetEmailTracker} 
              variant="destructive"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Tracker (Emergency)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}