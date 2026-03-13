# Emma AI Agent Setup Guide

## Overview
Emma is an AI receptionist agent that handles inbound leads through voice or chat interfaces. She's integrated into the Demo Drop system to provide personalized demos of business services.

## Components Built

### 1. **Emma System Prompt** (`src/lib/emma-prompt.ts`)
- Dynamic system prompt generation based on business data
- Personality: Friendly, professional, conversational
- Information gathering: Name, phone, address, callback time
- Knowledge base integration from scraped business data
- Vapi agent configuration with function calling

### 2. **Voice Agent Integration** (`src/app/api/voice/`)
- **`/api/voice/start`** - Initializes voice session with Vapi API
- **`/api/voice/lead-webhook`** - Receives booked lead data from voice agent
- High-quality female voice with interruption detection
- Function calling for `bookLead` trigger

### 3. **Chat Interface** (`src/components/DemoStarter.tsx` + `src/app/demo/[token]/page.tsx`)
- Real-time chat with Emma using Claude API
- Demo starter modal with Chat/Voice toggle
- Business info display
- Message logging for transcript review

### 4. **Demo Page** (`src/app/demo/[token]/page.tsx`)
- Dynamic demo experience based on `demo_token`
- Loads business profile from scraped data
- Initializes chat or voice session
- Tracks demo interaction analytics

### 5. **Enhanced Knowledge Base** (`src/lib/knowledge-base.ts`)
- Extracts services, service areas, unique selling points
- Generates structured BusinessProfile for Emma
- FAQ generation from business data
- Office hours extraction

### 6. **API Routes**
- `/api/lead/[token]` - Get lead data and update status
- `/api/emma-chat` - Chat messages via Claude
- `/api/demo-analytics` - Log demo interactions
- `/api/voice/start` - Initialize voice session
- `/api/voice/lead-webhook` - Receive booked leads

## Environment Variables

Add to `.env.local`:

```
# Already configured
NEXT_PUBLIC_SUPABASE_URL=https://onjmlumumomohmvsavjq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rY6iuZABAdG8rQlT9HpkVg_tHHOFGw_
RESEND_API_KEY=re_4Cr9rzJu_D4WW4zhScwtvY4XvGGoBEJpa
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Need to add
ANTHROPIC_API_KEY=sk_ant_xxxxx  # Get from https://console.anthropic.com
VAPI_API_KEY=xxxxx               # Get from https://dashboard.vapi.ai
```

## Database Schema Updates

Add these tables to your Supabase project:

### `demo_sessions` Table
```sql
CREATE TABLE demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('chat', 'voice')),
  vapi_session_id TEXT,
  status TEXT DEFAULT 'started',
  transcript TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `demo_analytics` Table
```sql
CREATE TABLE demo_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_token UUID,
  event_type TEXT,
  event_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX demo_analytics_token_idx ON demo_analytics(demo_token);
```

### `lead_interactions` Table
```sql
CREATE TABLE lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_data JSONB,
  interaction_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Setup Instructions

### Step 1: Get API Keys

**Claude (Anthropic):**
1. Go to https://console.anthropic.com
2. Create API key in Settings
3. Add to `.env.local` as `ANTHROPIC_API_KEY`

**Vapi (Voice Agent):**
1. Go to https://dashboard.vapi.ai
2. Create account and get API key
3. Add to `.env.local` as `VAPI_API_KEY`

### Step 2: Update Supabase

Run the SQL above in Supabase SQL Editor to create:
- `demo_sessions` table
- `demo_analytics` table
- `lead_interactions` table

### Step 3: Test Emma

1. **Create a lead** via the scrape form
2. **Get the demo link** - The lead will have a unique `demo_token`
3. **Visit demo page** - `http://localhost:3000/demo/[demo_token]`
4. **Start Emma demo** - Choose Chat or Voice
5. **Chat with Emma** - Ask questions about the business
6. **Review interactions** - Check `demo_analytics` table

## How Emma Works

### Chat Mode
1. User clicks "Start Chat Demo"
2. Emma greets with business-specific message
3. User messages sent to Claude API
4. Claude responds as Emma using system prompt
5. Conversation logged to `demo_analytics`

### Voice Mode
1. User clicks "Start Voice Demo"
2. `/api/voice/start` calls Vapi API
3. Vapi initiates outbound call to prospect
4. Emma (voice) greets and collects information
5. When all info gathered, `bookLead` function triggers
6. Lead data sent to webhook (`/api/voice/lead-webhook`)
7. Interaction logged to `lead_interactions`

## Emma's Information Gathering

Emma naturally collects:
- **First & Last Name** - "Can I start with your name?"
- **Best Phone Number** - "What's the best number to reach you?"
- **Project/Service Address** - "Where is the project located?"
- **Preferred Callback Time** - "When would be a good time for follow up?"

## Customization

### Change Emma's Voice
Edit `src/lib/emma-prompt.ts`:
```typescript
voice: {
  provider: 'playht',
  voiceId: 'jennifer',  // Change to different voice
  speed: 1.0,
}
```

### Customize System Prompt
The prompt dynamically uses business data from `BusinessProfile`:
- Business name, services, unique selling points
- Contact info, location, office hours
- Generated FAQ from website data

### Add More Functions
Add to `createVapiAgentConfig()` in `emma-prompt.ts`:
```typescript
functions: [
  // ... existing bookLead function
  {
    name: 'scheduleCallback',
    // ... new function definition
  }
]
```

## Demo Link Format

Share demo links like:
```
http://localhost:3000/demo/[demo_token]?name=John&email=john@example.com
```

Query parameters:
- `name` - Prospect name (optional, for personalization)
- `email` - Prospect email (optional, for contact)

## Troubleshooting

**"Lead not found" error:**
- Make sure the demo_token is valid
- Check that lead exists in Supabase

**Chat responses are slow:**
- Claude API takes 1-2 seconds per response
- Voice agents are real-time via Vapi

**Voice call not connecting:**
- Verify VAPI_API_KEY is correct
- Check Vapi dashboard for errors
- Ensure business has phone number for fallback

**Emma not using business data:**
- Verify `business_profile` is saved in Supabase
- Check that `generateEmmaSystemPrompt()` receives correct data
- Review system prompt in Emma's response

## Next Steps

1. ✅ Get API keys (Anthropic, Vapi)
2. ✅ Run database schema updates
3. ✅ Update `.env.local`
4. ✅ Test chat demo
5. ✅ Test voice demo
6. 📊 Review analytics and transcripts
7. 🚀 Deploy to production

## Features Coming Soon

- [ ] Sentiment analysis on conversations
- [ ] Auto-scheduling with calendar integration
- [ ] Multi-language support
- [ ] CRM integration (GoHighLevel, Make.com)
- [ ] Performance analytics dashboard
- [ ] A/B testing different Emma personas
- [ ] SMS follow-up sequences
- [ ] Demo recording/playback

---

**Emma is ready to take your business to the next level!** 🎯
