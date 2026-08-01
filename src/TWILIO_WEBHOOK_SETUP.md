# Twilio SMS Status Webhook Setup

## Overview
The `twilioWebhookHandler` function receives real-time updates from Twilio about message delivery, failures, and inbound replies. It automatically syncs these updates to `ListingOwner` and `OwnerOutreachCampaign` entities.

## Setup Steps

1. **Get Your Webhook URL**
   - Go to Dashboard → Code → Functions
   - Find `twilioWebhookHandler`
   - Copy the Supabase Edge Function URL (for example, `https://YOUR_PROJECT.supabase.co/functions/v1/twilioWebhookHandler`)

2. **Configure Twilio Messaging Service**
   - Log in to [Twilio Console](https://console.twilio.com)
   - Go to **Messaging → Services** → Select your Messaging Service
   - Scroll to **Integration** → **Inbound Settings**
     - Set **Request URL** to your webhook URL
     - Set **HTTP Method** to `POST`
   - Click **Save**

3. **Enable Status Callbacks**
   - In the same Messaging Service, go to **Integration** → **Outbound Settings**
   - Set **Status Callback URL** to your webhook URL
   - Check **All** for status events (or at minimum: `delivered`, `failed`, `undelivered`)
   - Click **Save**

## What Gets Tracked

### Inbound SMS (Owner Replies)
- Owner's reply text is logged to `OwnerOutreachCampaign.notes`
- `ListingOwner.contact_status` updates to `in_conversation`
- `OwnerOutreachCampaign.workflow_stage` moves to `response`

### Outbound SMS Status
- **Delivered** → Status logged, `contact_status` stays `contacted`
- **Failed** → Error code & message logged, `contact_status` becomes `not_interested`
- **Read** → Timestamp logged (if supported by carrier)
- **Undelivered** → Warning logged

## Dashboard Visibility
- Check `/admin/owners` to see updated `contact_status` for each owner
- Click into an owner's campaign in `/admin/outreach-campaigns` to see full message history
- `/admin/outreach-pipeline` shows aggregate funnel with real-time counts

## Testing
1. Send a test SMS via the batch function
2. Manually text the Messaging Service number to test inbound
3. Check the admin dashboard to confirm status updates appear within 1-2 seconds

## Notes
- Phone number matching is normalized (10 digits, US format)
- Webhook is stateless—each update is independent
- If no campaign exists yet, inbound SMS will create one automatically
- Error logs appear in function dashboard if there are issues
