"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Phone, Plus, Trash2, PhoneCall, Building2, Calendar, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  company?: string;
  createdAt: string;
  lastCalled?: string;
  callCount: number;
}

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingContact, setAddingContact] = useState(false);
  const [makingCall, setMakingCall] = useState<string | null>(null);
  
  // Form state
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    company: ''
  });

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      alert('Name and phone number are required');
      return;
    }

    setAddingContact(true);
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });

      if (response.ok) {
        const contact = await response.json();
        setContacts([...contacts, contact]);
        setNewContact({ name: '', phone: '', company: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    } finally {
      setAddingContact(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/contacts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== id));
      } else {
        alert('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const makeCall = async (contact: Contact) => {
    setMakingCall(contact.id);
    
    try {
      const response = await fetch('/api/make-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: contact.phone,
          contactId: contact.id,
          contactName: contact.name,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Call initiated to ${contact.name} (${contact.phone})`);
        // Reload contacts to update call count
        loadContacts();
      } else {
        alert(result.error || 'Failed to make call');
      }
    } catch (error) {
      console.error('Error making call:', error);
      alert('Failed to make call');
    } finally {
      setMakingCall(null);
    }
  };

  const formatPhone = (phone: string) => {
    // Simple phone formatting - you can enhance this
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Startup Contact
          </CardTitle>
          <CardDescription>
            Add a startup contact to call with Riley who will ask about their college
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addContact} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  placeholder="Contact name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <Input
                  placeholder="9255772134 (US format auto-converted)"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 10-digit US number (like 9255772134) - will be auto-formatted to +1 format
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input
                  placeholder="Startup name"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={addingContact}>
              {addingContact ? 'Adding...' : 'Add Contact'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Startup Contacts ({contacts.length})
          </CardTitle>
          <CardDescription>
            Click "Call" to have Riley ask them about their college
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contacts yet. Add your first startup contact above!
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      {contact.company && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {contact.company}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {formatPhone(contact.phone)}
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <PhoneCall className="h-4 w-4" />
                        {contact.callCount} calls
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Added {formatDate(contact.createdAt)}
                      </span>
                      
                      {contact.lastCalled && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Last called {formatDate(contact.lastCalled)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => makeCall(contact)}
                      disabled={makingCall === contact.id}
                      className="flex items-center gap-2"
                    >
                      {makingCall === contact.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Calling...
                        </>
                      ) : (
                        <>
                          <PhoneCall className="h-4 w-4" />
                          Call
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContact(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ol className="space-y-2">
            <li><strong>1.</strong> Add startup contacts using the form above</li>
            <li><strong>2.</strong> Click "Call" next to any contact to initiate an outbound call</li>
            <li><strong>3.</strong> Riley will call them and immediately ask "Hi! What college do you go to?"</li>
            <li><strong>4.</strong> The call will be logged and tracked in your dashboard</li>
          </ol>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">⚠️ Phone Provider Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <p className="mb-3">To make outbound calls, you need to set up a phone number provider:</p>
          <ol className="space-y-2 mb-4">
            <li><strong>1.</strong> Go to your <a href="https://dashboard.vapi.ai" target="_blank" className="underline">VAPI Dashboard</a></li>
            <li><strong>2.</strong> Navigate to "Phone Numbers" and create a new number</li>
            <li><strong>3.</strong> Choose a provider like Twilio, Vonage, or Telnyx</li>
            <li><strong>4.</strong> Follow the setup instructions for your chosen provider</li>
            <li><strong>5.</strong> Assign Riley assistant to your phone number</li>
          </ol>
          <p className="text-sm">
            <strong>Note:</strong> VAPI's own numbers can't make outbound calls yet. You need a third-party provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
