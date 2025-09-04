import { EmailAgent } from './email-agent';

export class EmailScheduler {
  private emailAgent: EmailAgent;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private checkInterval: number = 1000; // 1 second

  constructor() {
    this.emailAgent = new EmailAgent();
  }

  start(tokens: any) {
    if (this.isRunning) {
      console.log('Email scheduler is already running');
      return;
    }

    this.emailAgent.setGoogleCredentials(tokens);
    this.emailAgent.resetStartTime(); // Reset tracker and start time when scheduler starts

    this.isRunning = true;
    console.log('🚀 Email scheduler started - checking every 1 second for new .edu emails');

    // Immediately process emails once, then set interval
    this.processEmails();
    this.intervalId = setInterval(() => this.processEmails(), this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Email scheduler stopped');
  }

  async processEmails() {
    console.log('Processing emails...');
    try {
      await this.emailAgent.processEmails();
      console.log('Email processing completed');
    } catch (error) {
      console.error('Error in scheduled email processing:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval / 1000, // in seconds
      nextCheck: this.intervalId ? new Date(Date.now() + this.checkInterval).toISOString() : 'N/A'
    };
  }
}

// Global scheduler instance
let globalScheduler: EmailScheduler | null = null;

export function getEmailScheduler(): EmailScheduler {
  if (!globalScheduler) {
    globalScheduler = new EmailScheduler();
  }
  return globalScheduler;
}