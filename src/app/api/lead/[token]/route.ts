import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Use anon client for public demo access (no auth required)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch lead by demo token (public access)
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('demo_token', token)
      .single()

    if (error || !lead) {
      console.log('Lead not found for token:', token)
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Update demo_opened status
    await supabase
      .from('leads')
      .update({ status: 'demo_opened', updated_at: new Date().toISOString() })
      .eq('id', lead.id)

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}
