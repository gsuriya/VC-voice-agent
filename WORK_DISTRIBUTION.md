# 🤝 Email Agent Pair Programming Work Distribution

## 📋 **Overview**
We need to implement the missing tool call handlers in the enhanced email agent. The work is split to avoid merge conflicts.

---

## 🎯 **YOUR WORK (voice-agent-working branch)**

### **1. EMAIL SENDING & EXECUTION**
**Files to modify:**
- `app/api/enhanced-email-agent/route.ts`
- `lib/google-apis.ts` (if needed)

**Tasks:**
- ✅ Implement actual email sending in `handleReply()`
- ✅ Implement actual email sending in `handleCompose()`
- ✅ Add email validation and error handling
- ✅ Add confirmation steps before sending

**Functions to implement:**
```typescript
// In enhanced-email-agent/route.ts
async function sendEmail(draft: any, googleAPI: GoogleAPIService): Promise<any>
async function validateEmailRecipients(recipients: string[]): Promise<boolean>
```

---

## 🎯 **COLLEAGUE'S WORK (voice-agent-2 branch)**

### **1. EMAIL MANAGEMENT & FORWARDING**
**Files to modify:**
- `app/api/enhanced-email-agent/route.ts`
- `lib/google-apis.ts` (if needed)

**Tasks:**
- ✅ Implement `handleManage()` function
  - Mark emails as read/unread
  - Star/unstar emails
  - Archive emails
  - Delete emails
  - Add labels
- ✅ Implement `handleForward()` function
  - Find original email to forward
  - Add forwarding content
  - Handle multiple recipients

**Functions to implement:**
```typescript
// In enhanced-email-agent/route.ts
async function handleManage(action: EmailAction, googleAPI: GoogleAPIService, userEmail: string)
async function handleForward(action: EmailAction, googleAPI: GoogleAPIService, userEmail: string)
async function manageEmail(emailId: string, action: string, googleAPI: GoogleAPIService): Promise<any>
```

---

## 🔧 **SHARED UTILITIES (Both can work on)**

### **Google APIs Extensions**
**File:** `lib/google-apis.ts`

**Your additions:**
```typescript
async sendEmail(to: string, subject: string, body: string, cc?: string[], bcc?: string[])
async validateEmail(email: string): Promise<boolean>
```

**Pranav's additions:**
```typescript
async markEmailAsRead(messageId: string): Promise<any>
async starEmail(messageId: string): Promise<any>
async archiveEmail(messageId: string): Promise<any>
async deleteEmail(messageId: string): Promise<any>
async forwardEmail(messageId: string, to: string[], body: string): Promise<any>
```

---

## 🚀 **IMPLEMENTATION STRATEGY**

### **Phase 1: Setup (Both)**
1. ✅ Create branches and sync latest code
2. ✅ Understand current codebase structure
3. ✅ Plan API integrations

### **Phase 2: Core Implementation**
**You (voice-agent-working):**
- Focus on SENDING emails (reply/compose)
- Add validation and confirmation flows
- Test with real Gmail API

**Pranav (pranav branch):**
- Focus on MANAGING emails (mark read, star, etc.)
- Implement FORWARDING functionality  
- Test with Gmail API management operations

### **Phase 3: Integration & Testing**
1. Merge `pranav` → `voice-agent-working`
2. Test all functionality together
3. Fix any conflicts or integration issues

---

## 📁 **FILE OWNERSHIP TO AVOID CONFLICTS**

### **Your Files:**
- Lines 276-414 in `enhanced-email-agent/route.ts` (handleReply, handleCompose)
- New functions for email sending/validation
- Email sending utilities in `google-apis.ts`

### **Colleague's Files:**  
- Lines 416-432 in `enhanced-email-agent/route.ts` (handleForward, handleManage)
- New email management functions
- Email management utilities in `google-apis.ts`

### **Shared (Coordinate Changes):**
- EmailAction interface (if new parameters needed)
- parseEmailCommand() function (if new intents needed)

---

## 🔀 **MERGE STRATEGY**

1. **Regular syncing**: Pull from main branch daily
2. **Communication**: Coordinate any shared file changes
3. **Testing**: Test your features before merging
4. **Final merge**: Colleague merges voice-agent-2 to voice-agent-working when both are done

---

## ✅ **SUCCESS CRITERIA**

**Your Success:**
- Can send actual emails via "reply" and "compose" commands
- Proper error handling and validation
- Confirmation flows work

**Pranav's Success:**
- Can manage emails (mark read, star, archive, delete)
- Can forward emails to recipients
- All management operations work with Gmail API

**Combined Success:**
- Full email agent with all 6 action types working
- No merge conflicts
- Comprehensive email workflow coverage
