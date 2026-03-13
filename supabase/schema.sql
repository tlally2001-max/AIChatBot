-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  business_name TEXT,
  business_profile JSONB,
  status TEXT NOT NULL DEFAULT 'new_lead'
    CHECK (status IN ('new_lead', 'scraped', 'demo_sent', 'demo_opened')),
  prospect_email TEXT,
  demo_token UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
CREATE INDEX IF NOT EXISTS leads_demo_token_idx ON leads(demo_token);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own leads
CREATE POLICY "Users view own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own leads
CREATE POLICY "Users insert own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own leads
CREATE POLICY "Users update own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own leads
CREATE POLICY "Users delete own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_leads_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_update_timestamp
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_timestamp();
