import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONTACTS_FILE = path.join(process.cwd(), 'data', 'contacts.json');

interface Contact {
  id: string;
  name: string;
  phone: string;
  company?: string;
  createdAt: string;
  lastCalled?: string;
  callCount: number;
}

async function readContacts(): Promise<Contact[]> {
  try {
    const data = await fs.readFile(CONTACTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

async function writeContacts(contacts: Contact[]): Promise<void> {
  await fs.mkdir(path.dirname(CONTACTS_FILE), { recursive: true });
  await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

export async function GET() {
  try {
    const contacts = await readContacts();
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error reading contacts:', error);
    return NextResponse.json({ error: 'Failed to read contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, company } = await request.json();
    
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const contacts = await readContacts();
    
    // Check if phone number already exists
    const existingContact = contacts.find(c => c.phone === phone);
    if (existingContact) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      phone,
      company: company || '',
      createdAt: new Date().toISOString(),
      callCount: 0,
    };

    contacts.push(newContact);
    await writeContacts(contacts);

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const contacts = await readContacts();
    const filteredContacts = contacts.filter(c => c.id !== id);
    
    if (contacts.length === filteredContacts.length) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    await writeContacts(filteredContacts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
