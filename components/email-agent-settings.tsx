'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  Mail, 
  Clock, 
  Globe,
  Plus,
  X,
  Edit
} from 'lucide-react';

interface EmailAgentSettings {
  autoRespondToEdu: boolean;
  eduResponseTemplate: string;
  autoProcessEmails: boolean;
  checkInterval: number;
  enabledDomains: string[];
  customResponseTemplates: {
    [domain: string]: string;
  };
}

export function EmailAgentSettings() {
  const [settings, setSettings] = useState<EmailAgentSettings>({
    autoRespondToEdu: false,
    eduResponseTemplate: `Hi there,

Thank you for reaching out! I'm currently focused on my startup and have limited availability for new opportunities.

If this is regarding a potential collaboration or investment opportunity, please feel free to schedule a brief call using my calendar link: [CALENDAR_LINK]

For other inquiries, I'll do my best to respond when time permits.

Best regards,
[YOUR_NAME]`,
    autoProcessEmails: false,
    checkInterval: 15,
    enabledDomains: ['.edu'],
    customResponseTemplates: {
      '.edu': `Hi there,

Thank you for reaching out! I'm currently focused on my startup and have limited availability for new opportunities.

If this is regarding a potential collaboration or investment opportunity, please feel free to schedule a brief call using my calendar link: [CALENDAR_LINK]

For other inquiries, I'll do my best to respond when time permits.

Best regards,
[YOUR_NAME]`
    }
  });

  const [newDomain, setNewDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('emailAgentSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('emailAgentSettings', JSON.stringify(settings));
      
      // Also save to server if needed
      const response = await fetch('/api/email-agent/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const addDomain = () => {
    if (newDomain && !settings.enabledDomains.includes(newDomain)) {
      const updatedDomains = [...settings.enabledDomains, newDomain];
      setSettings(prev => ({
        ...prev,
        enabledDomains: updatedDomains,
        customResponseTemplates: {
          ...prev.customResponseTemplates,
          [newDomain]: prev.eduResponseTemplate
        }
      }));
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    if (domain === '.edu') return; // Can't remove .edu
    
    setSettings(prev => {
      const newTemplates = { ...prev.customResponseTemplates };
      delete newTemplates[domain];
      
      return {
        ...prev,
        enabledDomains: prev.enabledDomains.filter(d => d !== domain),
        customResponseTemplates: newTemplates
      };
    });
  };

  const updateTemplate = (domain: string, template: string) => {
    setSettings(prev => ({
      ...prev,
      customResponseTemplates: {
        ...prev.customResponseTemplates,
        [domain]: template
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Agent Settings</h2>
          <p className="text-muted-foreground">
            Configure automatic email responses and processing rules
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Auto-Response Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Auto-Response Settings
            </CardTitle>
            <CardDescription>
              Configure automatic responses for specific email domains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-respond-edu">Auto-respond to .edu emails</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send responses to emails from .edu addresses
                </p>
              </div>
              <Switch
                id="auto-respond-edu"
                checked={settings.autoRespondToEdu}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoRespondToEdu: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-process">Auto-process all emails</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically analyze and respond to all incoming emails
                </p>
              </div>
              <Switch
                id="auto-process"
                checked={settings.autoProcessEmails}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoProcessEmails: checked }))
                }
              />
            </div>

            <div>
              <Label htmlFor="check-interval">Check interval (minutes)</Label>
              <Input
                id="check-interval"
                type="number"
                min="1"
                max="60"
                value={settings.checkInterval}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, checkInterval: parseInt(e.target.value) }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Domain Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Email Domains
            </CardTitle>
            <CardDescription>
              Manage which email domains trigger auto-responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Enabled Domains</Label>
              <div className="flex flex-wrap gap-2">
                {settings.enabledDomains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                    {domain}
                    {domain !== '.edu' && (
                      <button
                        onClick={() => removeDomain(domain)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add domain (e.g., .org, .gov)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              />
              <Button onClick={addDomain} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Response Templates</CardTitle>
          <CardDescription>
            Customize the automatic responses for different email domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.enabledDomains.map((domain) => (
            <div key={domain} className="space-y-2">
              <Label className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Template for {domain} emails
              </Label>
              <Textarea
                value={settings.customResponseTemplates[domain] || settings.eduResponseTemplate}
                onChange={(e) => updateTemplate(domain, e.target.value)}
                rows={8}
                placeholder="Enter your response template..."
              />
              <p className="text-xs text-muted-foreground">
                Available placeholders: [YOUR_NAME], [SENDER_NAME], [CALENDAR_LINK], [SUBJECT]
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

