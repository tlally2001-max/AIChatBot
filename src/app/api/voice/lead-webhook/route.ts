import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface LeadData {
  firstName: string
  lastName: string
  phone: string
  address: string
  callbackTime: string
  businessName: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const leadData: LeadData = body.functionCall?.arguments || body

    if (!leadData.firstName || !leadData.phone) {
      return NextResponse.json(
        { error: 'Missing required lead data' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Log the lead interaction/booking
    const { error } = await supabase.from('lead_interactions').insert({
      lead_data: {
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        phone: leadData.phone,
        address: leadData.address,
        preferredCallback: leadData.callbackTime,
        source: 'voice_demo',
        timestamp: new Date().toISOString(),
      },
      interaction_type: 'booking',
      notes: `Voice demo booking for ${leadData.firstName} ${leadData.lastName}`,
    })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to log lead' }, { status: 500 })
    }

    // Optionally: Send confirmation email, update CRM, etc.
    // This is where you'd integrate with Make.com or GoHighLevel

    return NextResponse.json({
      success: true,
      message: `Lead ${leadData.firstName} ${leadData.lastName} booked successfully`,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
