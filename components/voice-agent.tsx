"use client";

import { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';

// Import VAPI directly from the npm package
import Vapi from '@vapi-ai/web';

// Define types for VAPI
interface VapiInstance {
  start: (assistantId?: string) => Promise<void>;
  stop: () => void;
  isMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

interface CallData {
  status: string;
  assistantId?: string;
  call?: any;
}

export default function VoiceAgent() {
  const [vapi, setVapi] = useState<VapiInstance | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'loading' | 'active' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number | null>(null);

  // Initialize VAPI
  useEffect(() => {
    const initializeVapi = () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        console.log('Environment variables check:');
        console.log('NEXT_PUBLIC_VAPI_PUBLIC_KEY:', publicKey ? `${publicKey.substring(0, 8)}...` : 'NOT FOUND');
        
        if (!publicKey) {
          setError('VAPI public key not found. Please ensure NEXT_PUBLIC_VAPI_PUBLIC_KEY is set in your .env.local file.');
          setIsLoading(false);
          return;
        }

        console.log('Initializing VAPI with public key:', publicKey.substring(0, 8) + '...');
        
        const vapiInstance = new Vapi(publicKey);
        setVapi(vapiInstance);

        // Set up event listeners
        vapiInstance.on('call-start', handleCallStart);
        vapiInstance.on('call-end', handleCallEnd);
        vapiInstance.on('speech-start', handleSpeechStart);
        vapiInstance.on('speech-end', handleSpeechEnd);
        vapiInstance.on('message', handleMessage);
        vapiInstance.on('error', handleError);

        console.log('VAPI initialized successfully');
        
        // Create or get an assistant
        createAssistant(vapiInstance);
      } catch (err) {
        console.error('Error initializing VAPI:', err);
        setError(`Failed to initialize VAPI client: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    const createAssistant = async (vapiInstance: VapiInstance) => {
      try {
        // Use your existing "Riley" assistant instead of creating new ones
        const rileyAssistantId = "689ee057-17d1-4ab0-81ba-c8f9a21a7783"; // Your Riley assistant ID
        
        console.log('Using existing Riley assistant:', rileyAssistantId);
        
        setAssistantId(rileyAssistantId);
        setIsLoading(false);
      } catch (err) {
        console.error('Error setting up assistant:', err);
        setError(`Failed to setup assistant: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    initializeVapi();

    return () => {
      if (vapi) {
        vapi.off('call-start', handleCallStart);
        vapi.off('call-end', handleCallEnd);
        vapi.off('speech-start', handleSpeechStart);
        vapi.off('speech-end', handleSpeechEnd);
        vapi.off('message', handleMessage);
        vapi.off('error', handleError);
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  const handleCallStart = (callData: CallData) => {
    console.log('Call started:', callData);
    setCallStatus('active');
    setError(null);
    startTime.current = Date.now();
    setCallDuration(0);
    
    // Start duration timer
    durationInterval.current = setInterval(() => {
      if (startTime.current) {
        setCallDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }
    }, 1000);
  };

  const handleCallEnd = (callData: CallData) => {
    console.log('Call ended:', callData);
    setCallStatus('ended');
    setIsMuted(false);
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    startTime.current = null;
    
    // Reset to idle after a short delay
    setTimeout(() => {
      setCallStatus('idle');
      setCallDuration(0);
      setTranscript('');
    }, 3000);
  };

  const handleSpeechStart = () => {
    console.log('User started speaking');
  };

  const handleSpeechEnd = () => {
    console.log('User stopped speaking');
  };

  const handleMessage = (message: any) => {
    console.log('Message received:', message);
    if (message.type === 'transcript' && message.transcript) {
      setTranscript(message.transcript);
    }
  };

  const handleError = (error: any) => {
    console.error('VAPI Error:', error);
    setError(error.message || 'An error occurred during the call');
    setCallStatus('idle');
  };

  const startCall = async () => {
    if (!vapi) {
      setError('VAPI not initialized');
      return;
    }

    if (!assistantId) {
      setError('Assistant not ready');
      return;
    }

    try {
      setCallStatus('loading');
      setError(null);
      
      console.log('Starting call with assistant ID:', assistantId);
      
      // Use the assistant ID directly
      await vapi.start(assistantId);
    } catch (err: any) {
      console.error('Error starting call:', err);
      setError(err.message || 'Failed to start call');
      setCallStatus('idle');
    }
  };

  const endCall = () => {
    if (!vapi) return;
    
    try {
      vapi.stop();
    } catch (err: any) {
      console.error('Error ending call:', err);
      setError(err.message || 'Failed to end call');
    }
  };

  const toggleMute = () => {
    if (!vapi) return;
    
    try {
      const newMutedState = !isMuted;
      vapi.setMuted(newMutedState);
      setIsMuted(newMutedState);
    } catch (err: any) {
      console.error('Error toggling mute:', err);
      setError(err.message || 'Failed to toggle mute');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (callStatus) {
      case 'idle':
        return <Badge variant="secondary">Ready</Badge>;
      case 'loading':
        return <Badge variant="outline">Connecting...</Badge>;
      case 'active':
        return <Badge variant="default">Active Call</Badge>;
      case 'ended':
        return <Badge variant="destructive">Call Ended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Voice Agent</CardTitle>
          <CardDescription>
            {assistantId ? 'Initializing...' : 'Creating AI assistant...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">
            {assistantId ? 'Almost ready!' : 'Setting up your voice assistant...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Voice Agent
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Click start to begin talking with Riley, your appointment scheduling assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {callStatus === 'active' && (
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              Call Duration: {formatDuration(callDuration)}
            </div>
            {transcript && (
              <div className="text-xs bg-gray-50 p-2 rounded-md">
                <strong>Transcript:</strong> {transcript}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {callStatus === 'idle' && (
            <Button 
              onClick={startCall} 
              className="flex items-center gap-2"
              size="lg"
            >
              <Phone className="h-4 w-4" />
              Start Call
            </Button>
          )}

          {callStatus === 'loading' && (
            <Button disabled size="lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </Button>
          )}

          {callStatus === 'active' && (
            <>
              <Button 
                onClick={endCall} 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
              
              <Button 
                onClick={toggleMute} 
                variant={isMuted ? "secondary" : "outline"}
                className="flex items-center gap-2"
              >
                {isMuted ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Mute
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          {callStatus === 'idle' && 'Ready to start your conversation'}
          {callStatus === 'loading' && 'Establishing connection...'}
          {callStatus === 'active' && 'Speak naturally to interact with the AI'}
          {callStatus === 'ended' && 'Call completed successfully'}
        </div>
      </CardContent>
    </Card>
  );
}
