# Quick Start - Demo Drop (5 Minutes)

## Prerequisites
✅ Already have:
- Next.js 14 project scaffolded
- Supabase credentials configured
- Resend API key configured
- Dev server running on port 3000

## 5-Minute Setup

### 1. Get Required API Keys (2 min)

**Claude API Key** (for chat):
1. Go to https://console.anthropic.com
2. Click "API Keys" → "Create Key"
3. Copy and add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk_ant_xxxxx
   ```

**Vapi API Key** (for voice):
1. Go to https://dashboard.vapi.ai
2. Sign up and get API key
3. Add to `.env.local`:
   ```
   VAPI_API_KEY=xxxxx
   ```

**Slack Webhook** (for alerts):
1. Go to https://api.slack.com/apps
2. Create app → "From scratch"
3. Add to workspace → Copy webhook URL
4. Add to `.env.local`:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
   ```

### 2. Update Supabase (2 min)

Go to Supabase SQL Editor and run:

```sql
-- Email tracking
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Demo interactions
CREATE TABLE demo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX email_events_lead_idx ON email_events(lead_id);
CREATE INDEX demo_events_lead_idx ON demo_events(lead_id);
```

### 3. Test It! (1 min)

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Go to homepage:**
   ```
   http://localhost:3000
   ```

3. **Login:**
   - Create account at `/login`

4. **Scrape a website:**
   - Enter: `https://example.com`
   - Prospect email: `test@example.com`
   - Click "Scrape & Analyze"

5. **Watch the magic:**
   - Email sent automatically (check Resend dashboard)
   - Lead appears in dashboard
   - Check Slack for alerts when you click the demo link

---

## What Just Happened?

```
Scraped website
    ↓
Extracted: Name, services, contact info
    ↓
Built knowledge base JSON
    ↓
Created lead in Supabase
    ↓
AUTOMATICALLY sent personalized email
    ↓
Included tracking pixel + demo link
    ↓
When prospect opens: Slack alert "🔥 They opened it!"
    ↓
When prospect clicks: Demo page with AI widget
    ↓
Prospect can chat or voice with Emma
    ↓
Emma gathers their info
    ↓
Lead booked → Slack alert "✅ Booked!"
```

---

## Next: Customize Emma

Edit `src/lib/emma-prompt.ts`:

```typescript
// Change Emma's voice
voice: {
  provider: 'playht',
  voiceId: 'jennifer',  // or 'michael', 'emily', etc.
  speed: 1.0,
}
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/lib/emma-prompt.ts` | Emma's personality & behavior |
| `src/lib/email-automation.ts` | Auto-email templates |
| `src/components/DemoLandingPage.tsx` | What prospects see |
| `src/app/api/scrape/route.ts` | Scraping entry point |
| `SLACK_WEBHOOK_URL` | Real-time alerts |

---

## Test Checklist

- [ ] Email sent after scrape
- [ ] Email tracking pixel loads (check Supabase `email_events`)
- [ ] Slack alert appears
- [ ] Demo page loads with iframe preview
- [ ] Chat demo works (messages to Claude)
- [ ] Voice demo initializes (Vapi call)
- [ ] Lead status updates in dashboard

---

## Common Issues

**Email not sending?**
```
Check: RESEND_API_KEY in .env.local
Test: https://resend.com/dashboard
```

**No Slack alert?**
```
Check: SLACK_WEBHOOK_URL in .env.local
Test: curl -X POST [webhook] (paste webhook URL)
```

**Demo page blank?**
```
Check: Demo token exists in Supabase leads table
Check: Website URL is valid (starts with https://)
```

**Chat not responding?**
```
Check: ANTHROPIC_API_KEY in .env.local
Check: Claude API quota at console.anthropic.com
```

---

## You're Live! 🚀

Your system is now:
- ✅ Scraping websites
- ✅ Building AI agents
- ✅ Sending personalized emails
- ✅ Tracking opens & clicks
- ✅ Running voice demos
- ✅ Alerting you on Slack

**Go make some sales!**

---

## Need Help?

1. Check `COMPLETE_SYSTEM_SUMMARY.md` for full details
2. Review `SETUP.md`, `EMMA_SETUP.md`, `FINAL_SETUP.md`
3. Check logs in browser console
4. Test endpoints with curl

---

## Next Steps

1. Customize Emma's personality
2. Test with 5-10 real websites
3. Monitor Slack alerts
4. Track which prospects are most engaged
5. Follow up with hottest leads (emoji indicators)
6. Deploy to production (Vercel)

**You have a complete B2B sales AI system. Use it! 💪**
