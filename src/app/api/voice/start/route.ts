import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function buildSystemPrompt(businessProfile: any, businessName?: string): string {
  const name = businessName || businessProfile?.businessName || 'our business'
  const description = businessProfile?.description || ''
  const services = businessProfile?.services || []
  const servicesList = Array.isArray(services) ? services.join(', ') : ''
  const phone = businessProfile?.phone || ''
  const email = businessProfile?.email || ''
  const address = businessProfile?.address || ''

  let prompt = `You are Emma, a professional AI receptionist for ${name}. You are helpful, friendly, and knowledgeable about the business.

Business Information:
${description ? `Description: ${description}\n` : ''}${servicesList ? `Services offered: ${servicesList}\n` : ''}${phone ? `Phone: ${phone}\n` : ''}${email ? `Email: ${email}\n` : ''}${address ? `Address: ${address}\n` : ''}

Your responsibilities:
1. Greet callers warmly and professionally
2. Answer questions about ${name} based on the business information above
3. Help with scheduling or gather contact information
4. Be concise and friendly
5. If asked about something you don't know, offer to have someone call back

Keep responses brief and conversational. Always stay in character as Emma.`

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Voice session request received')
    const supabase = await createClient()
    const { demoToken, prospectName } = await request.json()

    if (!demoToken) {
      console.error('❌ No demo token provided')
      return NextResponse.json({ error: 'Demo token required' }, { status: 400 })
    }

    console.log('🔍 Looking for lead with token:', demoToken)

    // Fetch the lead with business profile
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('demo_token', demoToken)
      .single()

    if (fetchError) {
      console.error('❌ Supabase fetch error:', fetchError)
      return NextResponse.json({ error: `Database error: ${fetchError.message}` }, { status: 500 })
    }

    if (!lead) {
      console.error('❌ Lead not found for token:', demoToken)
      return NextResponse.json({ error: `Lead not found for token: ${demoToken}` }, { status: 404 })
    }

    console.log('✅ Lead found:', lead.business_name)

    const businessProfile = lead.business_profile || {}
    const systemPrompt = buildSystemPrompt(businessProfile, lead.business_name)

    // Create a custom assistant with business context using Vapi API
    let assistantId = process.env.VAPI_ASSISTANT_ID || ''

    // For now, use the pre-configured Vapi assistant
    // The system prompt is handled via the Claude backend AI that the user interacts with
    console.log('📋 Using Vapi assistant for voice: ', assistantId)
    console.log('💬 Business context will be provided via chat system prompt')

    console.log('✅ Voice session initialized for:', lead.business_name)

    return NextResponse.json({
      assistantId: assistantId,
      businessName: lead.business_name,
      prospectName: prospectName || 'Guest',
      businessProfile: businessProfile,
      message: '🎤 Voice session ready. Click to start speaking!',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('❌ Voice start error:', errorMessage)
    console.error('Stack:', errorStack)
    return NextResponse.json({
      error: 'Failed to start voice session',
      details: errorMessage
    }, { status: 500 })
  }
}
