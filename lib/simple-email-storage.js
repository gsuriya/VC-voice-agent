// Simple in-memory email storage
// This will store emails in memory for now (can be upgraded to database later)

class SimpleEmailStorage {
    constructor() {
        this.emails = [];
        this.lastSync = null;
    }

    // Store emails
    storeEmails(newEmails) {
        console.log(`📧 Storing ${newEmails.length} emails...`);
        
        // Add unique emails only
        for (const email of newEmails) {
            if (!this.emails.find(e => e.id === email.id)) {
                this.emails.push({
                    ...email,
                    storedAt: new Date().toISOString()
                });
            }
        }
        
        this.lastSync = new Date().toISOString();
        console.log(`✅ Total emails stored: ${this.emails.length}`);
    }

    // Get all emails
    getAllEmails() {
        return this.emails.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Search emails by text
    searchEmails(query) {
        const lowerQuery = query.toLowerCase();
        return this.emails.filter(email => 
            email.subject.toLowerCase().includes(lowerQuery) ||
            email.from.toLowerCase().includes(lowerQuery) ||
            email.body.toLowerCase().includes(lowerQuery)
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Get emails from specific sender
    getEmailsFrom(sender) {
        return this.emails.filter(email => 
            email.from.toLowerCase().includes(sender.toLowerCase())
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Get latest emails
    getLatestEmails(count = 10) {
        return this.getAllEmails().slice(0, count);
    }

    // Get stats
    getStats() {
        return {
            totalEmails: this.emails.length,
            lastSync: this.lastSync,
            latestEmail: this.emails.length > 0 ? this.emails[0].date : null
        };
    }
}

export default SimpleEmailStorage;
