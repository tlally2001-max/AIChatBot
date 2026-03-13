# Demo Drop - Final Setup: Email, Landing Pages & Tracking

## 🎯 The Complete System Flow

```
1. USER SCRAPES WEBSITE
   ↓
2. BUSINESS PROFILE CREATED
   ↓
3. EMAIL SENT AUTOMATICALLY (with tracking pixel)
   ↓
4. PROSPECT OPENS EMAIL
   ↓
5. TRACKING UPDATED → SLACK NOTIFICATION
   ↓
6. PROSPECT CLICKS DEMO LINK
   ↓
7. PERSONALIZED LANDING PAGE LOADS (with iframe preview)
   ↓
8. PROSPECT TESTS AI DEMO (chat or voice)
   ↓
9. REAL-TIME SLACK ALERTS
   ↓
10. AGENCY OWNER FOLLOWS UP IMMEDIATELY
```

## Components Built

### 1. **Personalized Demo Landing Page** (`src/components/DemoLandingPage.tsx`)

**Features:**
- Full-screen iframe showing prospect's website
- Floating welcome header with personalized greeting
- Overlaid chat/voice widget on top of website
- "Start Free Trial" and "Schedule Call" CTAs
- Responsive design

**What Prospects See:**
```
┌─────────────────────────────────────────┐
│ Hey John, meet your AI employee for ... │
│                                         │
│  [Website Preview (iframe)]             │
│                                         │
│              [Chat/Voice Widget]    💬  │
│         "Ask Emma a question..."        │
│                                         │
├─────────────────────────────────────────┤
│  Love what you see?    [Schedule Call →]│
└─────────────────────────────────────────┘
```

### 2. **Email Automation with Tracking** (`src/lib/email-automation.ts`)

**Features:**
- Personalized HTML emails sent via Resend
- Automatically triggered after scrape
- Tracking pixel embedded in email
- Click tracking via demo link
- Customizable email templates

**Email Flow:**
```
Scrape successful
    ↓
Lead created in Supabase
    ↓
triggerDemoEmailAfterScrape() called
    ↓
Personalized email sent to prospect
    ↓
Email contains:
   - Demo link with demo_token parameter
   - Tracking pixel (invisible, 1x1 GIF)
   - Call-to-action buttons
    ↓
Prospect receives email
```

**Email Subject:**
```
"As promised: Your new AI demo for [BusinessName]"
```

**Email Body Includes:**
- Personalized greeting
- What the AI agent can do
- How it was trained on their business
- Expected results (40-60% lead increase)
- Big "See Your AI Demo" button
- Call-to-action for strategy call

### 3. **Email Tracking Pixel** (`src/app/api/email-tracking/route.ts`)

**What It Does:**
- Returns a 1x1 transparent GIF when email is opened
- Logs "email_open" event to Supabase
- Updates lead status to "demo_opened"
- Sends Slack notification immediately

**How It Works:**
```
Email sent to prospect with pixel:
<img src="/api/email-tracking?token=UUID&event=open" />
    ↓
Prospect opens email (Gmail loads pixel)
    ↓
Request sent to /api/email-tracking
    ↓
System identifies which lead it is by token
    ↓
Status updated in Supabase
    ↓
Slack notification sent
    ↓
Agency owner sees: "🔥 ABC Business just opened their demo!"
```

### 4. **Demo Tracking Webhook** (`src/app/api/demo-tracking/route.ts`)

**Tracks These Events:**
- `page_view` - Prospect opened demo link
- `chat_start` - Started chat with Emma
- `voice_start` - Initiated voice call
- `demo_interaction` - Actively testing
- `demo_completed` - Finished session

**Each Event Triggers:**
1. Database log entry
2. Lead status update
3. Slack notification with details
4. Color-coded alerts (blue=page, green=chat, orange=voice, etc.)

### 5. **Slack Integration**

**Real-Time Alerts:**
- 👁️ "Demo Page Opened" - They clicked the link
- 💬 "Chat Demo Started" - They're chatting with Emma
- 🎤 "Voice Demo Started" - They initiated a call
- ✅ "Demo Completed" - They finished testing

**Slack Message Includes:**
```
🎉 Chat Demo Started

Business: Cooper Homes
Activity: Actively testing the demo
Email: john@cooperhomes.com
Time: 2:45 PM

⚡ This is the perfect time to reach out!
```

**Pro Tips in Slack Messages:**
- Email opened → "Follow up within the next hour for best results"
- Chat/voice started → "This is prime time to reach out"
- Demo completed → "Consider reaching out to discuss next steps"

## Setup Instructions

### Step 1: Add Environment Variables

Update `.env.local`:
```bash
# Slack webhook for real-time notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**How to get Slack webhook:**
1. Go to https://api.slack.com/apps
2. Create new app → "From scratch"
3. Go to "Incoming Webhooks" → Activate
4. Click "Add New Webhook to Workspace"
5. Select channel (e.g., #sales-alerts)
6. Copy webhook URL
7. Add to `.env.local`

### Step 2: Create Supabase Tables

Run in Supabase SQL Editor:

```sql
-- Email tracking table
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demo interaction events
CREATE TABLE demo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX email_events_lead_idx ON email_events(lead_id);
CREATE INDEX demo_events_lead_idx ON demo_events(lead_id);
CREATE INDEX email_events_timestamp_idx ON email_events(timestamp DESC);
CREATE INDEX demo_events_timestamp_idx ON demo_events(timestamp DESC);
```

### Step 3: Update Your Demo Page

The existing `/demo/[token]` page now automatically:
1. Loads the DemoLandingPage component
2. Shows iframe preview of their website
3. Embeds floating chat/voice widget
4. Tracks all interactions
5. Sends Slack alerts

**No additional changes needed!**

### Step 4: Test the Full Flow

1. **Create a Lead:**
   ```
   Go to http://localhost:3000
   Enter: https://example.com
   Enter prospect email: test@example.com
   Click "Scrape & Analyze"
   ```

2. **Check Email Sent:**
   - Email should be sent via Resend automatically
   - Check Resend dashboard for delivery status

3. **View Email (Test Mode):**
   - Open `/demo/[demo_token]` manually
   - Or check Resend email preview

4. **Test Tracking:**
   - In the email, click the demo link
   - Slack notification should appear instantly
   - Check Supabase `email_events` table

5. **Test Demo Interactions:**
   - Start chat or voice demo
   - Check Slack for instant notifications
   - Verify `demo_events` table updated

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        DEMO DROP SYSTEM                              │
└──────────────────────────────────────────────────────────────────────┘

AGENCY OWNER CREATES LEAD:
┌─────────────────┐
│  Scrape Form    │
│  Enter URL +    │
│  Prospect Email │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  /api/scrape    │ ← Web scraper extracts data
│  Creates lead   │
│  in Supabase    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  triggerDemoEmailAfterScrape│ ← Email automation
│  Calls Resend API           │
│  Sends personalized email   │
└────────┬────────────────────┘
         │
         ▼
    [EMAIL SENT]
    ├─ Subject: "Your AI demo is ready..."
    ├─ Body: Personalized content
    ├─ CTA: Demo link with demo_token
    └─ Tracking: Pixel for open tracking


PROSPECT RECEIVES EMAIL:
         │
         ▼
    [EMAIL OPENED]
         │
         ├─ Tracking pixel loaded
         ├─ /api/email-tracking called
         ├─ Event logged to Supabase
         ├─ Lead status updated to "demo_opened"
         │
         └─ SLACK ALERT:
            "🔥 ABC Company opened their demo!"


PROSPECT CLICKS DEMO LINK:
         │
         ▼
    /demo/[token]
         │
         ├─ Loads DemoLandingPage
         ├─ Shows iframe of their website
         ├─ Displays chat/voice overlay
         └─ Tracks page_view event


PROSPECT TESTS DEMO:
         │
         ├─ Clicks "Start Chat Demo"
         │   │
         │   ├─ /api/demo-tracking (event: chat_start)
         │   ├─ /api/emma-chat (messages)
         │   │
         │   └─ SLACK ALERT:
         │      "💬 Chat Demo Started"
         │
         └─ OR Clicks "Start Voice Demo"
            │
            ├─ /api/voice/start
            ├─ /api/demo-tracking (event: voice_start)
            │
            └─ SLACK ALERT:
               "🎤 Voice Demo Started"


REAL-TIME NOTIFICATIONS:
                         ┌─────────────────────┐
                         │  SLACK WORKSPACE    │
                         │  #sales-alerts      │
                         ├─────────────────────┤
                         │ 👁️ Page opened      │
                         │ 💬 Chat started     │
                         │ 🎤 Voice started    │
                         │ ✅ Demo completed   │
                         └─────────────────────┘
                              ▲
                              │
                    ┌─────────┴──────────┐
                    │                    │
              EMAIL TRACKING      DEMO TRACKING
              /api/email-tracking /api/demo-tracking
```

## Key Features Summary

| Feature | Endpoint | Purpose |
|---------|----------|---------|
| Personalized Landing | `/demo/[token]` | Website preview + AI widget |
| Email Automation | `/api/scrape` triggers email | Auto-send personalized emails |
| Email Tracking | `/api/email-tracking` | Detect when prospect opens email |
| Demo Tracking | `/api/demo-tracking` | Track all demo interactions |
| Real-Time Alerts | Slack webhook | Instant notifications to sales team |
| Lead Status | Supabase | Auto-update based on events |

## Database Tables

**email_events** - Tracks when emails are opened
```
- id (UUID)
- lead_id (FK to leads)
- event_type (string: "open", "click", etc.)
- timestamp (when event occurred)
```

**demo_events** - Tracks demo interactions
```
- id (UUID)
- lead_id (FK to leads)
- event_type (string: "page_view", "chat_start", "voice_start")
- event_data (JSON: extra metadata)
- timestamp
```

## Email Template Variables

The email system automatically fills in:
- `{{clientName}}` - Business owner name
- `{{businessName}}` - Business name
- `{{demoUrl}}` - Unique demo link with token
- `{{businessProfile}}` - Services, areas, USPs

## Conversion Funnel

```
100% - Email Sent
  │
  ├─ ~30-40% - Email Opened (tracked via pixel)
  │
  ├─ ~60-70% of opens - Click Demo Link (tracked)
  │
  ├─ ~40-50% of clicks - Start Chat/Voice (tracked)
  │
  └─ ~80-90% interaction - "Schedule Call" CTA
```

## Troubleshooting

**Email not sending?**
- Check `RESEND_API_KEY` is correct
- Verify Resend API status
- Check prospect email is valid

**Slack alerts not appearing?**
- Verify `SLACK_WEBHOOK_URL` is correct
- Test webhook at https://slack.com/api/webhooks
- Ensure bot has permission to post

**Tracking pixel not loading?**
- Check `/api/email-tracking` endpoint exists
- Verify email includes pixel URL
- Check browser console for errors

**Demo page not loading?**
- Verify demo_token exists in Supabase
- Check website URL is valid/accessible
- Test iframe with direct URL

## Performance Tips

1. **Email Delivery:** Resend typically sends within 1-2 seconds
2. **Tracking:** Pixel loads instantly when email opens
3. **Notifications:** Slack alerts appear within 1-2 seconds
4. **Demo Page:** Loads website preview in iframe (depends on site)

## Security Notes

1. **Tracking Pixel:** Returns 1x1 transparent GIF (no data leakage)
2. **Demo Token:** UUID format, impossible to guess
3. **Email Headers:** Include demo_token for server-side validation
4. **Slack Webhooks:** Only receive data you explicitly send
5. **Lead Status:** Updated via authenticated API routes

## Next Steps

1. ✅ Set up Slack webhook
2. ✅ Create Supabase tables
3. ✅ Test full email flow
4. ✅ Customize email template
5. ✅ Set up team notifications
6. 🚀 Deploy to production

---

**Your Demo Drop system is now complete!** 🎉

From scraping to personalized demos to real-time tracking – everything is automated and real-time.

