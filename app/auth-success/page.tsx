'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get tokens from URL
    const tokensStr = searchParams.get('tokens');
    const email = searchParams.get('email');

    if (tokensStr && email) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensStr));
        
        // Store in localStorage for the extension to pick up
        localStorage.setItem('gmail_auth_completed', 'true');
        localStorage.setItem('gmail_user_email', email);
        localStorage.setItem('gmail_access_token', tokens.access_token);
        
        // Auto close after a moment
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (error) {
        console.error('Error processing auth:', error);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Authentication Complete!</h1>
        <p className="text-gray-600 mb-4">
          This window will close automatically...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
