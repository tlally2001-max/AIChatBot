# Demo Drop - Setup Guide

## Project Status
✅ **Core implementation complete** - All 12 implementation steps completed

## What's Included

### 1. **Project Structure**
- ✅ Next.js 14 (App Router) with TypeScript and Tailwind CSS
- ✅ `src/app/` - Pages and API routes
- ✅ `src/components/` - React components (ScrapeForm, PipelineBoard, etc.)
- ✅ `src/lib/` - Business logic (scraper, knowledge-base builder, email service)
- ✅ `src/types/` - Shared TypeScript types
- ✅ `supabase/` - Database schema with RLS policies

### 2. **Core Features Implemented**

#### API Routes
- `POST /api/scrape` - Scrapes business website, generates knowledge base, saves lead, optionally sends demo email
- `GET /api/leads` - Lists all leads for authenticated user
- `PATCH /api/leads` - Updates lead status (for drag-and-drop pipeline)
- `POST /api/send-demo` - Sends demo email to prospect

#### UI Components
- **ScrapeForm** - URL input form with optional prospect email
- **PipelineBoard** - Kanban board with drag-and-drop using @dnd-kit
- **PipelineColumn** - Individual pipeline column (New Lead, Scraped, Demo Sent, Demo Opened)
- **LeadCard** - Individual lead card with status badge

#### Business Logic
- **scraper.ts** - Cheerio-based HTML scraper (extracts title, headings, contact info, address)
- **knowledge-base.ts** - Transforms scraped data into structured BusinessProfile JSON
- **email.ts** - Resend email client for sending personalized demo invitations
- **Supabase Integration** - Authentication, database, RLS policies

### 3. **Authentication**
- Email/password signup and login via Supabase
- Protected `/dashboard` route with middleware
- Session management using `@supabase/ssr`

## Setup Instructions

### 1. **Environment Variables**
Create a `.env.local` file with your actual credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. **Supabase Setup**
1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run the script in `supabase/schema.sql`
3. This creates:
   - `leads` table with all required columns
   - RLS policies for user isolation
   - Indexes for performance
   - Auto-update timestamp trigger

### 3. **Resend Setup**
1. Get API key from https://resend.com
2. Verify sender email domain (or use default Resend subdomain for testing)
3. Add key to `.env.local`

### 4. **Run Development Server**
```bash
npm run dev
```

Visit http://localhost:3000

## User Flow

### 1. **Sign Up / Login**
- User creates account at `/login`
- Authenticated via Supabase

### 2. **Enter Business URL**
- On homepage `/`, user enters website URL
- Optionally adds prospect email
- Submits scrape form

### 3. **Scraping & Lead Creation**
- `/api/scrape` fetches and parses HTML with Cheerio
- Extracts: title, headings, contact info, address
- Builds BusinessProfile JSON
- Saves lead to `leads` table
- If prospect email provided, sends demo email via Resend

### 4. **Pipeline Management**
- User views all leads at `/dashboard`
- Kanban board shows 4 columns: New Lead → Scraped → Demo Sent → Demo Opened
- Drag-and-drop lead cards to update status (calls `PATCH /api/leads`)
- Status updates are persisted to Supabase

### 5. **Email Delivery**
- Prospect receives email with personalized demo link
- Link includes unique `demo_token` UUID
- Can check demo open status by implementing page at `/demo/[token]`

## Database Schema

### `leads` Table
- `id` - UUID primary key
- `user_id` - References auth.users (for row-level security)
- `url` - Business website URL
- `business_name` - Extracted from page title
- `business_profile` - JSONB with structured knowledge base
- `status` - One of: new_lead, scraped, demo_sent, demo_opened
- `prospect_email` - Email of lead
- `demo_token` - Unique UUID for demo link
- `created_at`, `updated_at` - Timestamps

### RLS Policies
- Users can only view/edit/delete their own leads
- Triggered on all operations (SELECT, INSERT, UPDATE, DELETE)

## Key Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Scraping | Cheerio |
| Email | Resend |
| Drag-Drop | @dnd-kit |

## Next Steps (Optional Enhancements)

1. **Demo Page** - Create `/demo/[token]` page to display knowledge base
2. **Analytics** - Track demo email opens using pixel tracking
3. **Team Sharing** - Allow users to invite team members
4. **Advanced Scraping** - Use Puppeteer for JavaScript-heavy sites
5. **AI Integration** - Generate FAQ answers using Claude API
6. **Scheduling** - Queue scraping jobs with Bull/BullMQ
7. **Webhooks** - Listen for Resend delivery/bounce events

## Troubleshooting

### Build Error: "Missing API key"
- Make sure `.env.local` has `RESEND_API_KEY` before building

### Middleware Warning
- Next.js suggests using "proxy" instead of "middleware" file convention
- Current setup works but can be updated in `next.config.ts` if needed

### Scraping Fails
- Check if the target website allows scraping
- Add custom headers or use headless browser if site requires JavaScript

### RLS Policy Errors
- Ensure user is logged in (check `auth.uid()` in Supabase)
- Verify RLS policies in `supabase/schema.sql` are correctly applied

## File Size & Performance

- Bundle size kept minimal (no unnecessary dependencies)
- Cheerio for server-side HTML parsing (no browser overhead)
- Supabase indexes on `user_id`, `demo_token`, and `status` for fast queries
- Tailwind CSS purged to only used classes

---

**Ready to launch!** Run `npm run dev` and start scraping business websites.
