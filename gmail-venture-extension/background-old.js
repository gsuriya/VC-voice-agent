// Simplified background script - no OAuth, uses web-based auth
console.log('🚀 AI Email Agent background script loaded (simplified)');

// Message handler for web-based authentication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message);
  
  (async () => {
    try {
      switch (message.action) {
        case 'authenticate':
          // For now, redirect to web-based auth
          console.log('🔐 Redirecting to web-based authentication...');
          
          // Open the web app OAuth flow
          chrome.tabs.create({
            url: 'http://localhost:3000/gmail-sync'
          });
          
          sendResponse({ 
            success: true, 
            message: 'Redirected to web authentication' 
          });
          break;
          
        case 'getEmails':
          // For now, return empty - user should use web interface
          sendResponse({ 
            success: false, 
            error: 'Please use web interface for email sync' 
          });
          break;
          
        case 'sync_all_emails':
          // Redirect to web interface
          chrome.tabs.create({
            url: 'http://localhost:3000/real-gmail-sync'
          });
          
          sendResponse({ 
            success: true, 
            message: 'Redirected to web sync interface' 
          });
          break;
          
        case 'process_ai_query':
          // Process AI queries via web API
          const queryResult = await processAIQuery(message.query);
          sendResponse(queryResult);
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Indicates we'll send response asynchronously
});

// Process AI queries via API
async function processAIQuery(query) {
  try {
    console.log('🤖 Processing AI query:', query);
    
    const response = await fetch('http://localhost:3000/api/test-pinecone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search_emails',
        query: query,
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found ${result.results.length} matching emails`);
      
      // Format response for display
      const formattedResults = result.results.map(r => ({
        subject: r.metadata.subject,
        from: r.metadata.from,
        snippet: r.metadata.snippet,
        score: Math.round(r.score * 100),
      }));
      
      return {
        success: true,
        response: `Found ${result.results.length} matching emails`,
        results: formattedResults,
      };
    } else {
      throw new Error(result.error || 'Query failed');
    }
  } catch (error) {
    console.error('❌ Error processing AI query:', error);
    return {
      success: false,
      error: error.message,
      response: 'Sorry, I had trouble processing your request.',
    };
  }
}

console.log('✅ Simplified background script ready');
