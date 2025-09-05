// JARVIS Email Assistant - Gmail Injection Script
// This script injects the JARVIS overlay into Gmail

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.jarvisInjected) {
        return;
    }
    window.jarvisInjected = true;

    console.log('🤖 JARVIS Email Assistant initializing...');

    // Configuration
    const CONFIG = {
        openaiApiKey: null,
        googleTokens: null,
        autoRespondEnabled: true,
        checkInterval: 2000, // 2 seconds
        maxResults: 10
    };

    // Load configuration from your existing system
    function loadConfig() {
        // Try to get from your existing .env or localStorage
        const savedConfig = localStorage.getItem('jarvisConfig');
        if (savedConfig) {
            Object.assign(CONFIG, JSON.parse(savedConfig));
        }
        
        // You can also set these directly here for testing
        // CONFIG.openaiApiKey = 'your-openai-key-here';
    }

    // JARVIS Email Agent (integrated with your existing logic)
    class JarvisEmailAgent {
        constructor() {
            this.processedEmails = new Set();
            this.startTime = new Date();
            this.emailCount = 0;
            this.responsesSent = 0;
            this.googleAPI = null;
            this.openai = null;
            
            this.init();
        }

        async init() {
            loadConfig();
            await this.setupAPIs();
            this.startEmailMonitoring();
        }

        async setupAPIs() {
            // Setup OpenAI
            if (CONFIG.openaiApiKey) {
                this.openai = {
                    apiKey: CONFIG.openaiApiKey,
                    async chat(messages) {
                        const response = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${this.apiKey}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                model: 'gpt-4',
                                messages: messages,
                                temperature: 0.7,
                                max_tokens: 1000
                            })
                        });
                        return await response.json();
                    }
                };
            }

            // Setup Google API (simplified version)
            this.googleAPI = {
                async getRecentEmails() {
                    // This would use your existing Google API setup
                    // For now, return mock data
                    return [
                        {
                            id: 'mock1',
                            from: 'professor@university.edu',
                            subject: 'Assignment Due Date',
                            body: 'Your assignment is due next week.',
                            date: new Date().toISOString()
                        }
                    ];
                },
                
                async sendEmail(to, subject, body) {
                    // This would use your existing email sending
                    console.log(`📧 Sending email to ${to}: ${subject}`);
                    return { success: true };
                },

                async getCalendarAvailability() {
                    // This would use your existing calendar API
                    return {
                        available: ['Monday 9-12', 'Tuesday 2-5', 'Wednesday 10-3']
                    };
                }
            };
        }

        async processEmails() {
            try {
                const emails = await this.googleAPI.getRecentEmails();
                
                for (const email of emails) {
                    if (this.shouldProcessEmail(email)) {
                        await this.processEmail(email);
                    }
                }
                
                this.emailCount += emails.length;
                this.updateJarvisStatus();
                
            } catch (error) {
                console.error('JARVIS Email processing error:', error);
            }
        }

        shouldProcessEmail(email) {
            // Only process .edu emails that are new
            const isEduEmail = email.from.toLowerCase().includes('.edu');
            const isNew = new Date(email.date) >= this.startTime;
            const notProcessed = !this.processedEmails.has(email.id);
            
            return isEduEmail && isNew && notProcessed;
        }

        async processEmail(email) {
            this.processedEmails.add(email.id);
            
            if (!CONFIG.autoRespondEnabled) {
                return;
            }

            try {
                // Use AI to determine if response is needed
                const shouldRespond = await this.shouldRespondToEmail(email);
                
                if (shouldRespond) {
                    const response = await this.generateResponse(email);
                    await this.googleAPI.sendEmail(email.from, `Re: ${email.subject}`, response);
                    this.responsesSent++;
                    console.log(`✅ JARVIS sent response to ${email.from}`);
                }
                
            } catch (error) {
                console.error('Error processing email:', error);
            }
        }

        async shouldRespondToEmail(email) {
            if (!this.openai) return false;
            
            const prompt = `You are helping Pranav, a student at NYU Stern, manage emails.

Should this email get a response? Respond with ONLY "YES" or "NO":

From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Only say YES if it clearly needs a response from a student.`;

            try {
                const response = await this.openai.chat([
                    { role: 'user', content: prompt }
                ]);
                
                return response.choices[0].message.content.trim().toUpperCase() === 'YES';
            } catch (error) {
                console.error('AI analysis error:', error);
                return false;
            }
        }

        async generateResponse(email) {
            if (!this.openai) {
                return 'Thank you for your email. I will get back to you soon.\n\nBest, Pranav';
            }

            const prompt = `You are Pranav, a student at NYU Stern. Generate a professional response to this email:

From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Respond professionally as a student at NYU Stern. Be helpful and concise.
Always end with "Best, Pranav"`;

            try {
                const response = await this.openai.chat([
                    { role: 'user', content: prompt }
                ]);
                
                let responseText = response.choices[0].message.content;
                
                // Ensure it ends with "Best, Pranav"
                if (!responseText.includes('Best, Pranav')) {
                    responseText += '\n\nBest, Pranav';
                }
                
                return responseText;
            } catch (error) {
                console.error('Response generation error:', error);
                return 'Thank you for your email. I will get back to you soon.\n\nBest, Pranav';
            }
        }

        startEmailMonitoring() {
            // Start monitoring emails every 2 seconds
            setInterval(() => {
                this.processEmails();
            }, CONFIG.checkInterval);
            
            console.log('🔄 JARVIS email monitoring started');
        }

        updateJarvisStatus() {
            // Update JARVIS UI with current status
            if (window.jarvis && window.jarvis.updateStatus) {
                window.jarvis.updateStatus({
                    emailCount: this.emailCount,
                    responsesSent: this.responsesSent,
                    autoRespondEnabled: CONFIG.autoRespondEnabled
                });
            }
        }

        // Public methods for JARVIS UI
        async summarizeEmails(person = null) {
            const emails = await this.googleAPI.getRecentEmails();
            let filteredEmails = emails;
            
            if (person) {
                filteredEmails = emails.filter(email => 
                    email.from.toLowerCase().includes(person.toLowerCase())
                );
            }
            
            if (filteredEmails.length === 0) {
                return person 
                    ? `No recent emails found from ${person}.`
                    : "No recent emails found.";
            }
            
            // Generate summary using AI
            if (this.openai) {
                const emailTexts = filteredEmails.slice(0, 5).map(email => 
                    `From: ${email.from}\nSubject: ${email.subject}\nBody: ${email.body.substring(0, 200)}...`
                ).join('\n\n');
                
                const prompt = `Summarize these emails for Pranav, a student at NYU Stern:

${emailTexts}

Provide a concise summary highlighting key topics, deadlines, and action items.`;

                try {
                    const response = await this.openai.chat([
                        { role: 'user', content: prompt }
                    ]);
                    return response.choices[0].message.content;
                } catch (error) {
                    console.error('Summary error:', error);
                }
            }
            
            // Fallback summary
            return `Found ${filteredEmails.length} recent emails${person ? ` from ${person}` : ''}. Key topics include assignments, meetings, and general correspondence.`;
        }

        async draftEmail(context, recipient = null) {
            if (!this.openai) {
                return 'I need OpenAI API access to draft emails. Please configure your API key.';
            }

            const prompt = `You are Pranav, a student at NYU Stern. Draft a professional email response.

Context: ${context}
${recipient ? `Recipient: ${recipient}` : ''}

Draft a professional response that:
1. Is appropriate for the context
2. Maintains a professional tone
3. Ends with "Best, Pranav"
4. Is concise but complete

Just provide the email content.`;

            try {
                const response = await this.openai.chat([
                    { role: 'user', content: prompt }
                ]);
                
                let draft = response.choices[0].message.content;
                
                if (!draft.includes('Best, Pranav')) {
                    draft += '\n\nBest, Pranav';
                }
                
                return draft;
            } catch (error) {
                console.error('Draft error:', error);
                return 'I encountered an error drafting the email. Please try again.';
            }
        }

        async checkAvailability(timeRange = 'week') {
            try {
                const availability = await this.googleAPI.getCalendarAvailability();
                
                if (availability.available.length === 0) {
                    return "You're completely booked! No available time slots found.";
                }
                
                return `📅 **Your Availability for Next ${timeRange}:**\n\n` +
                       availability.available.map(slot => `• ${slot}`).join('\n') +
                       `\n\n🎯 **Best Meeting Times:**\n` +
                       availability.available.slice(0, 3).map(slot => `• ${slot}`).join('\n');
                       
            } catch (error) {
                console.error('Availability error:', error);
                return "I couldn't access your calendar. Please make sure you're authenticated.";
            }
        }

        toggleAutoRespond(enabled) {
            CONFIG.autoRespondEnabled = enabled;
            localStorage.setItem('jarvisConfig', JSON.stringify(CONFIG));
            this.updateJarvisStatus();
            
            return enabled 
                ? '✅ Auto-respond enabled. I will automatically respond to new .edu emails.'
                : '❌ Auto-respond disabled. I will not send automatic responses.';
        }
    }

    // Inject JARVIS overlay into Gmail
    function injectJarvisOverlay() {
        // Create iframe to load JARVIS overlay
        const jarvisFrame = document.createElement('iframe');
        jarvisFrame.id = 'jarvis-overlay-frame';
        jarvisFrame.src = chrome.runtime.getURL('jarvis-overlay.html');
        jarvisFrame.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border: none;
            z-index: 999999;
            display: none;
        `;
        
        document.body.appendChild(jarvisFrame);
        
        // Make JARVIS accessible globally
        window.jarvisFrame = jarvisFrame;
        
        console.log('🤖 JARVIS overlay injected into Gmail');
    }

    // Initialize everything
    function initJarvis() {
        // Wait for Gmail to load
        const checkGmail = () => {
            if (document.querySelector('[role="main"]')) {
                injectJarvisOverlay();
                window.jarvisAgent = new JarvisEmailAgent();
                console.log('✅ JARVIS Email Assistant ready!');
            } else {
                setTimeout(checkGmail, 1000);
            }
        };
        
        checkGmail();
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initJarvis);
    } else {
        initJarvis();
    }

})();
