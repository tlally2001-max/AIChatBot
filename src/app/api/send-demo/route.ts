import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendDemoEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId, prospectEmail } = await request.json()

    if (!leadId || !prospectEmail) {
      return NextResponse.json(
        { error: 'leadId and prospectEmail are required' },
        { status: 400 }
      )
    }

    // Fetch the lead
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Send demo email
    try {
      await sendDemoEmail(prospectEmail, lead.business_name || 'Business', lead.demo_token)

      // Update lead status
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({ status: 'demo_sent', prospect_email: prospectEmail })
        .eq('id', leadId)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
      }

      return NextResponse.json(updatedLead)
    } catch (emailError) {
      console.error('Email send failed:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
