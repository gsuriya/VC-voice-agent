import VoiceAgent from '@/components/voice-agent';
import { PageHeader } from '@/components/page-header';

export default function VoicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Voice Agent - Riley"
        description="Talk to Riley, your AI-powered appointment scheduling assistant. Perfect for booking, rescheduling, or canceling appointments."
      />
      
      <div className="mt-8 flex justify-center">
        <VoiceAgent />
      </div>
      
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to use the Voice Agent
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              Click the "Start Call" button to begin
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              Allow microphone access when prompted
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              Speak naturally to the AI assistant
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              Use the mute button to temporarily disable your microphone
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">5.</span>
              Click "End Call" when you're finished
            </li>
          </ul>
        </div>
        
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">
            Tips for best experience
          </h3>
          <ul className="space-y-2 text-amber-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Ensure you're in a quiet environment for better voice recognition
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Speak clearly and at a normal pace
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Wait for the AI to finish speaking before responding
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Check your internet connection for optimal performance
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
