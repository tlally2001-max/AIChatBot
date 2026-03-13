import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface AnalyticsEvent {
  demoToken: string
  event: string
  userMessage?: string
  assistantReply?: string
  demoType?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json()

    const supabase = await createClient()

    // Log to demo_analytics table
    const { error } = await supabase.from('demo_analytics').insert({
      demo_token: event.demoToken,
      event_type: event.event,
      event_data: {
        userMessage: event.userMessage,
        assistantReply: event.assistantReply,
        demoType: event.demoType,
      },
      timestamp: event.timestamp,
    })

    if (error) {
      console.error('Analytics error:', error)
      // Don't fail the request for analytics errors
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics endpoint error:', error)
    // Return success even if analytics fails
    return NextResponse.json({ success: true })
  }
}
