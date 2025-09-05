// Simple wrapper for Google APIs that works with our sync system
export class SimpleGoogleAPIService {
    constructor() {
        // No complex initialization needed for mock data
    }

    async getRecentEmails(maxResults = 50) {
        try {
            // For now, return mock data to test the system
            console.log('📧 Fetching emails... (using mock data for testing)');
            
            const mockEmails = [
                {
                    id: 'mock1',
                    threadId: 'thread1',
                    from: 'spotify@spotify.com',
                    to: 'pranav@example.com',
                    subject: 'Your Weekly Music Summary',
                    body: 'Here are your top tracks this week: Song 1, Song 2, Song 3. Keep listening!',
                    snippet: 'Here are your top tracks this week...',
                    date: new Date().toISOString()
                },
                {
                    id: 'mock2',
                    threadId: 'thread2',
                    from: 'noreply@nyu.edu',
                    to: 'pranav@example.com',
                    subject: 'Class Schedule Update',
                    body: 'Your class schedule has been updated. Please check the new times.',
                    snippet: 'Your class schedule has been updated...',
                    date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                },
                {
                    id: 'mock3',
                    threadId: 'thread3',
                    from: 'professor@stern.nyu.edu',
                    to: 'pranav@example.com',
                    subject: 'Assignment Due Tomorrow',
                    body: 'Don\'t forget your assignment is due tomorrow at 11:59 PM.',
                    snippet: 'Don\'t forget your assignment...',
                    date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
                }
            ];

            return mockEmails;
        } catch (error) {
            console.error('Error fetching emails:', error);
            return [];
        }
    }

    setCredentials(tokens) {
        // Mock credentials for testing
        console.log('🔑 Setting credentials (mock)');
    }
}
