import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createVapiAgentConfig } from '@/lib/emma-prompt'

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Voice start request received')
    const supabase = await createClient()
    const { demoToken, prospectEmail, prospectName } = await request.json()

    console.log('🔑 Checking environment variables:')
    console.log('  - VAPI_API_KEY:', process.env.VAPI_API_KEY ? '✅ SET' : '❌ MISSING')
    console.log('  - VAPI_PHONE_NUMBER_ID:', process.env.VAPI_PHONE_NUMBER_ID ? '✅ SET' : '❌ MISSING')
    console.log('  - VAPI_ASSISTANT_ID:', process.env.VAPI_ASSISTANT_ID ? '✅ SET' : '❌ MISSING')
    console.log('  - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

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

    // Create Vapi agent configuration
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/lead-webhook`
    const vapiConfig = createVapiAgentConfig(businessProfile, webhookUrl)

    // Format phone number to E.164 format (e.g., +17253739952)
    let e164Phone = prospectEmail
    if (!e164Phone.startsWith('+')) {
      e164Phone = '+1' + e164Phone.replace(/\D/g, '') // Add +1 for US and remove non-digits
    } else {
      e164Phone = '+' + e164Phone.replace(/\D/g, '') // Keep + and remove non-digits
    }

    console.log('📱 Formatted phone number to E.164:', e164Phone)

    // Call Vapi API to create phone number and start voice session
    // phoneNumber must be an object with Twilio credentials
    const vapiPayload = {
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      assistantId: process.env.VAPI_ASSISTANT_ID,
      customer: {
        name: prospectName || 'Guest',
        number: e164Phone,
      },
      phoneNumber: {
        twilioPhoneNumber: e164Phone,
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || undefined,
      },
      assistantOverrides: {
        firstMessage: `Hi ${prospectName || 'there'}, I'm Emma with ${businessProfile.businessName || 'the team'}. How can I help you today?`,
      },
    }

    console.log('📞 Calling Vapi with:', { phoneNumberId: '...', assistantId: '...', phoneNumber: prospectEmail })

    const vapiResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vapiPayload),
    })

    if (!vapiResponse.ok) {
      const error = await vapiResponse.json()
      console.error('❌ Vapi API error:', error)
      console.error('❌ Vapi response status:', vapiResponse.status)
      console.error('❌ Config sent:', {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || 'MISSING',
        customerNumber: prospectEmail || '+1234567890',
        assistantId: process.env.VAPI_ASSISTANT_ID || 'MISSING',
      })
      return NextResponse.json(
        { error: `Failed to initialize voice agent: ${error.message || JSON.stringify(error)}` },
        { status: 500 }
      )
    }

    const vapiSession = await vapiResponse.json()

    // Log the demo session start
    await supabase.from('demo_sessions').insert({
      lead_id: lead.id,
      session_type: 'voice',
      vapi_session_id: vapiSession.id,
      status: 'started',
      started_at: new Date().toISOString(),
    })

    return NextResponse.json({
      sessionId: vapiSession.id,
      assistantId: vapiSession.assistantId,
      phoneNumber: vapiSession.phoneNumber,
      greeting: `Hi ${prospectName || 'there'}, I'm Emma with ${businessProfile.businessName || 'the team'}. How can I help you today?`,
    })
  } catch (error) {
    console.error('Voice start error:', error)
    return NextResponse.json({ error: 'Failed to start voice session' }, { status: 500 })
  }
}
