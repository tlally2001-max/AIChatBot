import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Voice session request received')
    const supabase = await createClient()
    const { demoToken, prospectName } = await request.json()

    if (!demoToken) {
      return NextResponse.json({ error: 'Demo token required' }, { status: 400 })
    }

    // Fetch the lead with business profile
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('demo_token', demoToken)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const businessProfile = lead.business_profile || {}

    // For browser-based voice, we just need to return the assistant ID
    // The frontend will use Vapi Web Client to handle the voice conversation
    console.log('✅ Voice session initialized for:', businessProfile.businessName)

    // Log the voice session start
    await supabase.from('demo_events').insert({
      lead_id: lead.id,
      event_type: 'voice_session_started',
      metadata: {
        prospectName: prospectName || 'Guest',
        businessName: businessProfile.businessName,
        timestamp: new Date().toISOString(),
      },
    }).catch(err => console.log('Log error:', err))

    return NextResponse.json({
      assistantId: process.env.VAPI_ASSISTANT_ID,
      businessName: businessProfile.businessName,
      prospectName: prospectName || 'Guest',
      message: '🎤 Voice session ready. Click to start speaking!',
    })
  } catch (error) {
    console.error('Voice start error:', error)
    return NextResponse.json({ error: 'Failed to start voice session' }, { status: 500 })
  }
}
