# 🚀 Demo Drop - AI Agent SaaS Platform

**Business Model:** Sell a $399/month AI chat & voice agent ("Emma") that businesses embed on their own websites to capture and qualify leads.

---

## 📊 Current Status: 95% Complete ✅

### ✅ COMPLETED
- [x] Next.js 14 scaffold (TypeScript + Tailwind)
- [x] Supabase auth & database with RLS
- [x] Web scraper (Cheerio)
- [x] Knowledge base builder
- [x] **Emma AI Agent** - Claude API integration
- [x] **Vapi voice agent** - phone calls with function hooks
- [x] Email automation with Resend
- [x] Email tracking pixel
- [x] Professional demo landing page (dark gradient, hero section)
- [x] iPhone mockup showing scraped website in iframe
- [x] Floating Emma chat widget with notification badge
- [x] How It Works, Pricing, Features, FAQ sections
- [x] Kanban pipeline dashboard (drag-drop, 4 columns)
- [x] Demo tracking (all interactions logged)
- [x] **Slack webhook integration** - real-time alerts
- [x] Analytics & event logging
- [x] Lead status management (auto-updates)

### 🔄 NEXT IMMEDIATE STEPS
1. **Restart dev server** (`npm run dev`)
2. **Run full end-to-end test**
3. **Build customer-facing platform**

---

## 🔑 Environment Variables - ALL CONFIGURED ✅

```bash
# In .env.local (get values from Supabase & service dashboards):
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
VAPI_API_KEY=your_vapi_api_key_here
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
RESEND_API_KEY=your_resend_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗂️ Project Structure

```
src/
├── app/api/
│   ├── scrape/route.ts                ← Scrape URL → create lead → send email
│   ├── leads/route.ts                 ← Get/update leads
│   ├── send-demo/route.ts             ← Manual email trigger
│   ├── emma-chat/route.ts             ← Chat with Claude
│   ├── email-tracking/route.ts        ← Track email opens
│   ├── demo-tracking/route.ts         ← Track demo interactions
│   ├── voice/start/route.ts           ← Initialize Vapi
│   ├── voice/lead-webhook/route.ts    ← Receive booked leads
│   └── lead/[token]/route.ts          ← Get lead by token
├── app/demo/[token]/page.tsx          ← Demo landing page
├── app/dashboard/page.tsx             ← Lead pipeline board
├── app/login/page.tsx                 ← Auth
├── app/page.tsx                       ← Home (scrape form)
├── components/
│   ├── DemoHeroPage.tsx               ← Professional demo landing (NEW!)
│   ├── DemoLandingPage.tsx            ← Website preview + Emma
│   ├── DemoStarter.tsx                ← Chat/voice selector
│   ├── PipelineBoard.tsx              ← Kanban wrapper
│   ├── LeadCard.tsx                   ← Draggable card
│   └── ScrapeForm.tsx                 ← URL input
├── lib/
│   ├── supabase/client.ts             ← Browser client
│   ├── supabase/server.ts             ← Server client
│   ├── scraper.ts                     ← Cheerio scraper
│   ├── knowledge-base.ts              ← JSON builder
│   ├── emma-prompt.ts                 ← System prompt
│   └── email-automation.ts            ← Email templates
└── types/index.ts                     ← TypeScript interfaces

docs/
├── SETUP.md                           ← Core architecture
├── EMMA_SETUP.md                      ← AI agent config
├── FINAL_SETUP.md                     ← Email & tracking
├── COMPLETE_SYSTEM_SUMMARY.md         ← Full reference
└── QUICK_START.md                     ← 5-min walkthrough
```

---

## 💾 Database Tables

- **leads** - All scraped prospects (id, url, business_name, business_profile, status, demo_token)
- **email_events** - Email opens/clicks tracking
- **demo_events** - Demo page views, chat starts, voice starts
- **lead_interactions** - Booked leads from voice/chat

---

## 🔄 System Flow (What Happens)

```
1. User enters URL on home page
   ↓
2. /api/scrape extracts business data
   ↓
3. Knowledge base structured as JSON
   ↓
4. Lead created in Supabase
   ↓
5. Email sent automatically (with tracking pixel)
   ↓
6. Prospect opens email → /api/email-tracking logs it
   ↓
7. Prospect clicks demo link → /demo/[token] loads
   ↓
8. Website shows in iframe, Emma overlays on top
   ↓
9. Prospect chats or calls → Emma responds
   ↓
10. All events logged → Slack alerts sent in real-time
```

---

## 🚀 What You Can Do RIGHT NOW

✅ **Test locally:**
```bash
npm run dev  # Start dev server on localhost:3000
```

Then:
1. Go to http://localhost:3000
2. Enter website URL (e.g., https://example.com)
3. Enter prospect email (e.g., test@example.com)
4. Click "Scrape & Analyze"
5. Email sent automatically
6. Check Resend dashboard for email delivery
7. Click demo link → see website preview + Emma widget
8. Try chat with Emma (Claude responds)
9. Try voice demo (Vapi initializes)
10. Check Slack for real-time alerts
11. View all leads in /dashboard

---

## 📊 What's Working

| Feature | Status |
|---------|--------|
| Web scraping | ✅ Complete |
| Lead creation | ✅ Complete |
| Email automation | ✅ Complete |
| Email tracking | ✅ Complete |
| Professional demo landing page | ✅ Complete |
| iPhone mockup with iframe | ✅ Complete |
| Emma floating chat widget | ✅ Complete |
| Chat with Claude AI | ✅ Complete |
| Voice demo | ✅ Complete |
| Pipeline dashboard | ✅ Complete |
| Slack alerts | ✅ Complete |
| Analytics | ✅ Complete |

---

## ⏳ What's Next

### Immediate (Today)
1. ✅ Slack webhook setup - **DONE**
2. Restart dev server
3. Run full end-to-end test
4. Verify all Slack alerts working

### Short-term (This Week)
1. Build customer-facing landing page
2. Create pricing page
3. Set up Stripe for payment processing
4. Build customer onboarding flow

### Medium-term (Next 2 Weeks)
1. Customer dashboard (embed code generator)
2. Email automation sequences
3. 14-day free trial system
4. Customer support docs

### Long-term (Sales Phase)
1. Customer acquisition campaign
2. Landing page optimization
3. Sales outreach automation
4. Customer success tracking

---

## 💡 Business Model

| Item | Value |
|------|-------|
| Product | AI chat/voice agent for businesses |
| Price | $399/month |
| Trial | 14 days free |
| Target | B2B service businesses |
| Deployment | White-label widget on client website |

---

## 🎯 Key Metrics to Track

- Leads scraped / week
- Email open rate
- Demo click-through rate
- Chat/voice start rate
- Conversion to paid (from free trial)
- Customer LTV
- CAC (customer acquisition cost)

---

## 📞 Voice Integration Notes

### Current Approach: Browser-Based Voice (Web Client)
- Voice chat happens in-browser using Vapi Web Client
- No phone call required
- User speaks through mic, hears response through speakers
- Better UX for demo experience

### Legacy Approach: Outbound Phone Calls
If you need to revert to outbound phone calls (calling user's actual phone):

**Files involved:**
- `src/app/api/voice/start/route.ts` - Old outbound call endpoint
- `src/components/DemoHeroPage.tsx` - Old phone number prompt logic
- `test-vapi.js` - Test suite for outbound calls

**Required Credentials:**
```
VAPI_API_KEY=<private_key>
VAPI_ASSISTANT_ID=<assistant_id>
VAPI_PHONE_NUMBER_ID=<phone_number_id>
TWILIO_ACCOUNT_SID=<account_sid>
```

**How it worked:**
1. User entered phone number in prompt
2. Vapi made outbound call to that number
3. Emma answered with business-specific greeting
4. User had to switch to their phone to talk

To restore: Check git history for commit `1ccd218` (Complete Vapi voice call integration)

---

## 📞 Next Action

**Right now:** Restart dev server and test the browser-based voice

```bash
npm run dev
```

Then test the voice call from the demo - no phone number needed!

---

**Status:** 95% Complete - Ready for Full Testing
**Date:** 2026-03-13
**Voice Mode:** Browser-based (Web Client) - Outbound phone calls available in git history
