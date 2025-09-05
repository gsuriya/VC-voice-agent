// GPT-powered semantic search for emails
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

class GPTSemanticSearch {
    constructor() {
        this.openai = openai;
    }

    // Search emails semantically using GPT
    async searchEmails(emails, query) {
        try {
            console.log(`🔍 Semantic search for: "${query}"`);
            
            // Prepare email context
            const emailContext = emails.slice(0, 20).map(email => 
                `From: ${email.from}\nSubject: ${email.subject}\nDate: ${email.date}\nBody: ${email.body.substring(0, 500)}...\n---`
            ).join('\n');

            const prompt = `
            You are JARVIS, an AI assistant helping Pranav manage his emails.
            
            User Query: "${query}"
            
            Here are Pranav's recent emails:
            ${emailContext}
            
            Please:
            1. Find the most relevant emails that match the query
            2. Provide a summary or answer based on the email content
            3. If looking for a specific sender, find emails from that person
            4. If asking for a summary, provide key insights from the emails
            
            Be helpful and specific. If you can't find relevant emails, say so.
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('GPT search error:', error);
            return `I encountered an error while searching your emails: ${error.message}`;
        }
    }

    // Summarize specific emails
    async summarizeEmails(emails, query = '') {
        try {
            console.log(`📊 Summarizing ${emails.length} emails`);
            
            const emailContext = emails.map(email => 
                `From: ${email.from}\nSubject: ${email.subject}\nDate: ${email.date}\nBody: ${email.body.substring(0, 300)}...\n---`
            ).join('\n');

            const prompt = `
            You are JARVIS, an AI assistant helping Pranav manage his emails.
            
            ${query ? `User Request: "${query}"` : 'Please summarize these emails:'}
            
            Emails to summarize:
            ${emailContext}
            
            Please provide:
            1. A concise summary of the key points
            2. Important dates, deadlines, or action items
            3. Any urgent matters that need attention
            4. Overall themes or patterns
            
            Be helpful and actionable.
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('GPT summarize error:', error);
            return `I encountered an error while summarizing: ${error.message}`;
        }
    }

    // Answer specific questions about emails
    async answerQuestion(emails, question) {
        try {
            console.log(`❓ Answering question: "${question}"`);
            
            const emailContext = emails.slice(0, 15).map(email => 
                `From: ${email.from}\nSubject: ${email.subject}\nDate: ${email.date}\nBody: ${email.body.substring(0, 400)}...\n---`
            ).join('\n');

            const prompt = `
            You are JARVIS, an AI assistant helping Pranav manage his emails.
            
            Question: "${question}"
            
            Here are Pranav's emails that might be relevant:
            ${emailContext}
            
            Please answer the question based on the email content. If you need more specific information, let Pranav know what to search for.
            Be helpful and provide actionable insights.
            `;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('GPT answer error:', error);
            return `I encountered an error while answering your question: ${error.message}`;
        }
    }
}

export default GPTSemanticSearch;
