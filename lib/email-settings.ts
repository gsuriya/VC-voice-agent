export interface EmailAgentSettings {
  autoRespondToEdu: boolean;
  eduResponseTemplate: string;
  autoProcessEmails: boolean;
  checkInterval: number; // in minutes
  enabledDomains: string[];
  customResponseTemplates: {
    [domain: string]: string;
  };
}

export const defaultSettings: EmailAgentSettings = {
  autoRespondToEdu: true,
  eduResponseTemplate: `Hi there,

Thank you for reaching out! I'm currently focused on my startup and have limited availability for new opportunities.

If this is regarding a potential collaboration or investment opportunity, please feel free to schedule a brief call using my calendar link: [CALENDAR_LINK]

For other inquiries, I'll do my best to respond when time permits.

Best regards,
[YOUR_NAME]`,
  autoProcessEmails: true,
  checkInterval: 1, // Check every 1 second
  enabledDomains: ['.edu'],
  customResponseTemplates: {
    '.edu': `Hi there,

Thank you for reaching out! I'm currently focused on my startup and have limited availability for new opportunities.

If this is regarding a potential collaboration or investment opportunity, please feel free to schedule a brief call using my calendar link: [CALENDAR_LINK]

For other inquiries, I'll do my best to respond when time permits.

Best regards,
[YOUR_NAME]`
  }
};

export class EmailSettingsManager {
  private settings: EmailAgentSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): EmailAgentSettings {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailAgentSettings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    }
    return defaultSettings;
  }

  saveSettings(settings: Partial<EmailAgentSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailAgentSettings', JSON.stringify(this.settings));
    }
  }

  getSettings(): EmailAgentSettings {
    return this.settings;
  }

  isEduEmail(email: string): boolean {
    return email.toLowerCase().endsWith('.edu');
  }

  shouldAutoRespond(email: string): boolean {
    if (!this.settings.autoRespondToEdu) return false;
    
    // Check if email ends with any enabled domain
    return this.settings.enabledDomains.some(domain => 
      email.toLowerCase().endsWith(domain.toLowerCase())
    );
  }

  getResponseTemplate(email: string): string {
    // Find matching domain template
    for (const domain of this.settings.enabledDomains) {
      if (email.toLowerCase().endsWith(domain.toLowerCase())) {
        return this.settings.customResponseTemplates[domain] || this.settings.eduResponseTemplate;
      }
    }
    return this.settings.eduResponseTemplate;
  }
}
