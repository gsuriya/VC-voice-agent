import ContactManager from '@/components/contact-manager';
import { PageHeader } from '@/components/page-header';

export default function VoicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Voice Agent Outbound Calls"
        description="Manage your startup contacts and make outbound calls with Riley, your AI assistant that asks about college info."
      />
      
      <div className="mt-8">
        <ContactManager />
      </div>
    </div>
  );
}
