# 🚀 Demo Drop - AI Agent SaaS Platform

**Business Model:** Sell a $399/month AI chat & voice agent ("Emma") that businesses embed on their own websites to capture and qualify leads.

---

## 📊 Current Status: 100% Complete - MVP FULLY FUNCTIONAL ✅

### ✅ COMPLETED - CORE DEMO FUNCTIONALITY
- [x] Next.js 14 scaffold (TypeScript + Tailwind)
- [x] Supabase auth & database with RLS
- [x] **Deep website scraper** - Crawls property pages for detailed info
  - Finds up to 8 property/cabin/listing links
  - Extracts bedrooms, bathrooms, capacity, amenities, pricing
  - Multiple extraction strategies for different HTML structures
  - Scrapes up to 5 property detail pages per business
- [x] **Knowledge base builder** - Structured data from all scraped pages
- [x] **Emma AI Agent** - Claude Opus integration for chat
- [x] **Vapi voice agent** - Browser-based voice using Claude Anthropic
  - Voice responses include full business context & FAQ data
  - Same knowledge level as chat (bedrooms, amenities, pricing, etc.)
  - No phone number required - works in-browser
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

### 🎯 MVP WORKS - DEMO COMPLETE
- Voice agent answers detailed questions (cabins, amenities, pricing)
- Chat and voice have equal knowledge depth
- Both use scraped website data + FAQ knowledge
- Full business context in both modalities

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

## 🚀 Quick Start - Test the MVP

**Prerequisites:**
- All environment variables configured in `.env.local`
- Vapi account with credentials (NEXT_PUBLIC_VAPI_API_KEY, VAPI_ASSISTANT_ID)
- Supabase database set up with leads table

**Start the server:**
```bash
npm run dev  # Start on http://localhost:3011
```

**Test the full flow:**

1. **Home Page** - http://localhost:3011
   - Enter website URL (e.g., `hthva.com`)
   - Enter prospect email
   - Click "Scrape & Analyze"
   - System crawls main page + up to 5 property detail pages

2. **Get Demo Token**
   - Email sent automatically (check Resend dashboard)
   - Demo link in email contains unique demo token
   - Or find token in Supabase `leads` table

3. **Test Demo Page** - http://localhost:3011/demo/[token]
   - Website preview loads in iPhone mockup
   - Emma chat widget floating on right
   - Click "💬 Chat" to test text conversation
   - Click "🎤 Voice" to test voice call
   - **Both should respond with detailed business info**

4. **Voice Testing - Full Capabilities**
   - "How many cabins?" → Emma responds with exact count
   - "What amenities?" → Lists hot tubs, internet, massage, etc.
   - "Are pets allowed?" → Answers about dog-friendly policies
   - "What's the price?" → Provides pricing information
   - Voice uses same knowledge base as chat

5. **Monitor in Real-time**
   - Check Slack for instant notifications
   - View `/dashboard` for Kanban pipeline of leads
   - All interactions logged (chat starts, voice starts, etc.)

**Key Files to Understand:**
- `src/lib/scraper.ts` - Deep crawling logic for property pages
- `src/components/DemoHeroPage.tsx` - Voice + chat UI & initialization
- `src/app/api/voice/start/route.ts` - Vapi configuration endpoint

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

## ⏳ What's Next - Beyond MVP

### Phase 1: Platform Features (Next)
1. **Embed Code Generator** - Customers copy embed code to their site
2. **Custom Branding** - Logo, colors, welcome messages
3. **Analytics Dashboard** - Real-time metrics for customers
4. **Lead Exports** - CSV/JSON downloads of qualified leads

### Phase 2: Monetization
1. **Stripe Integration** - $399/month subscription billing
2. **Free Trial System** - 14-day trial flow in app
3. **Customer Onboarding** - Step-by-step setup wizard
4. **Usage Limits** - Trial vs paid tier restrictions

### Phase 3: Enterprise Features
1. **Custom Knowledge Injection** - Admin adds info beyond scrape
2. **Conversation Routing** - Route complex calls to humans
3. **Multi-language Support** - Emma in Spanish, French, etc.
4. **API Access** - Third-party integrations

### Phase 4: Go-to-Market
1. **Customer Landing Page** - Product marketing site
2. **Sales Outreach** - Identify and reach target businesses
3. **Case Studies** - Document customer success stories
4. **Partner Program** - Affiliate sales model

### Immediate Maintenance
1. Test with more websites (validate scraper quality)
2. Monitor Vapi API costs
3. Track email deliverability rates
4. Gather customer feedback on voice quality

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

## 🎬 Latest Session Summary (2026-03-13)

**What Was Done:**
- ✅ Fixed Vapi integration to use @vapi-ai/web npm package (vs CDN)
- ✅ Integrated Claude Anthropic as voice AI backbone
- ✅ Enhanced website scraper to crawl property detail pages
- ✅ Implemented deep data extraction (bedrooms, bathrooms, amenities, pricing)
- ✅ Voice agent now answers detailed questions with full business context
- ✅ Both chat and voice use same FAQ/property knowledge base
- ✅ Tested end-to-end - fully functional demo!
- ✅ Pushed to GitHub (commit: 74c30ca)

**Current Abilities:**
- Emma answers "How many cabins?" with specifics
- Voice provides amenities, pricing, capacity details
- All scraped data available to both chat & voice
- No phone number needed - all in-browser

**Quick Resume:**
```bash
npm run dev  # Start dev server on http://localhost:3011
# Go to home page, scrape a website, get demo token, test voice + chat
```

**Key Test URLs:**
- Home: http://localhost:3011
- Example demo: http://localhost:3011/demo/5b7f7d6e-0d0c-4eb0-845a-6fb77b2d6cb0
- Dashboard: http://localhost:3011/dashboard

**Files Changed (Latest):**
- `src/components/DemoHeroPage.tsx` - Enhanced system prompt with FAQ data
- `src/lib/scraper.ts` - Deep property page crawling
- `src/app/api/voice/start/route.ts` - Voice initialization logic
- `package.json` - Added @vapi-ai/web dependency

**Known Limitations:**
- WebRTC transport disconnect warning (harmless, doesn't block functionality)
- Some websites may need custom selectors for property page detection
- Voice quality depends on Vapi service quality in user's region

---

**MVP Status:** 🎉 COMPLETE & WORKING
**Date:** 2026-03-13
**Voice Mode:** Browser-based (Vapi Web Client + Claude Anthropic)
**Ready for:** Customer testing, feature expansion, monetization setup
