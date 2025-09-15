# Google Cloud Pub/Sub Setup for Gmail Push Notifications

## Step 1: Install Google Cloud CLI (if not already installed)

```bash
# macOS
brew install --cask google-cloud-sdk

# Other platforms: https://cloud.google.com/sdk/docs/install
```

## Step 2: Set up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project vc-voice-agent

# Enable required APIs
gcloud services enable pubsub.googleapis.com
gcloud services enable gmail.googleapis.com
```

## Step 3: Create Pub/Sub Topic and Subscription

```bash
# Create the topic for Gmail notifications
gcloud pubsub topics create gmail-notifications

# Create a push subscription to your webhook
gcloud pubsub subscriptions create gmail-webhook \
  --topic=gmail-notifications \
  --push-endpoint=http://localhost:3000/api/gmail-webhook \
  --ack-deadline=60

# Verify the setup
gcloud pubsub topics list
gcloud pubsub subscriptions list
```

## Step 4: Grant Gmail Access to Pub/Sub Topic

```bash
# Get your Gmail service account (this will be shown when you first call the Gmail Watch API)
# The service account is usually: gmail-api-push@system.gserviceaccount.com

# Grant publish permissions to Gmail
gcloud pubsub topics add-iam-policy-binding gmail-notifications \
  --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
  --role="roles/pubsub.publisher"
```

## Step 5: Test the Setup

```bash
# Test publishing a message
gcloud pubsub topics publish gmail-notifications \
  --message='{"emailAddress":"test@example.com","historyId":"12345"}'

# Check if your webhook received it (check your Next.js server logs)
```

## Step 6: For Production Deployment

When you deploy to production (Vercel, etc.), update the push endpoint:

```bash
# Update subscription for production
gcloud pubsub subscriptions modify gmail-webhook \
  --push-endpoint=https://your-production-domain.com/api/gmail-webhook
```

## Troubleshooting

1. **Permission Denied**: Make sure you have proper IAM roles
2. **Webhook Not Receiving**: Check if your endpoint is publicly accessible
3. **Gmail Watch Fails**: Ensure the topic exists and Gmail has publisher permissions

## Environment Variables

Make sure these are set in your `.env` file:

```
GOOGLE_CLOUD_PROJECT_ID=vc-voice-agent
GMAIL_PUBSUB_TOPIC=projects/vc-voice-agent/topics/gmail-notifications
GMAIL_PUBSUB_SUBSCRIPTION=projects/vc-voice-agent/subscriptions/gmail-webhook
WEBHOOK_URL=http://localhost:3000/api/gmail-webhook
```
