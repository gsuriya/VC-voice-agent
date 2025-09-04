// Simple in-memory tracker for processed emails
// In production, this should be stored in a database

class EmailTracker {
  private processedEmails: Set<string> = new Set();
  private sentResponses: Set<string> = new Set();
  private startTime: Date = new Date();

  // Mark an email as processed
  markProcessed(emailId: string): void {
    this.processedEmails.add(emailId);
  }

  // Check if an email has been processed
  isProcessed(emailId: string): boolean {
    return this.processedEmails.has(emailId);
  }

  // Mark a response as sent
  markResponseSent(emailId: string): void {
    this.sentResponses.add(emailId);
  }

  // Check if a response has been sent
  hasResponseBeenSent(emailId: string): boolean {
    return this.sentResponses.has(emailId);
  }

  // Reset tracker (clear all processed emails)
  reset() {
    this.processedEmails.clear();
    this.sentResponses.clear();
    this.startTime = new Date();
    console.log('Email tracker reset - all emails can be processed again');
  }

  // Get stats
  getStats() {
    return {
      processedCount: this.processedEmails.size,
      sentCount: this.sentResponses.size,
      startTime: this.startTime
    };
  }
}

// Global tracker instance
let globalTracker: EmailTracker | null = null;

export function getEmailTracker(): EmailTracker {
  if (!globalTracker) {
    globalTracker = new EmailTracker();
  }
  return globalTracker;
}

