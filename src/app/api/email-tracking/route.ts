import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Email tracking pixel endpoint
 * Called when email is opened (via tracking pixel)
 * Updates lead status and sends notification
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const event = searchParams.get('event') || 'open'

    if (!token) {
      // Return 1x1 transparent GIF
      return new NextResponse(
        Buffer.from([
          0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
          0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
          0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
          0x00, 0x02, 0x01, 0x44, 0x00, 0x3b,
        ]),
        {
          headers: { 'Content-Type': 'image/gif' },
        }
      )
    }

    const supabase = await createClient()

    // Find lead by demo token
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('demo_token', token)
      .single()

    if (fetchError || !lead) {
      console.warn(`Lead not found for token: ${token}`)
      // Still return pixel to not break the email
      return new NextResponse(
        Buffer.from([
          0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
          0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
          0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
          0x00, 0x02, 0x01, 0x44, 0x00, 0x3b,
        ]),
        {
          headers: { 'Content-Type': 'image/gif' },
        }
      )
    }

    // Log email tracking event
    await supabase.from('email_events').insert({
      lead_id: lead.id,
      event_type: event,
      timestamp: new Date().toISOString(),
    })

    // If this is an open event and status hasn't been updated, update it
    if (event === 'open' && lead.status !== 'demo_opened') {
      await supabase
        .from('leads')
        .update({
          status: 'demo_opened',
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)

      // Send notification to agency owner
      await sendRealTimeNotification(lead, 'email_opened')
    }

    // Return transparent 1x1 GIF for pixel tracking
    return new NextResponse(
      Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x01, 0x44, 0x00, 0x3b,
      ]),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Email tracking error:', error)
    // Return pixel even on error to not break emails
    return new NextResponse(
      Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x01, 0x44, 0x00, 0x3b,
      ]),
      {
        headers: { 'Content-Type': 'image/gif' },
      }
    )
  }
}

async function sendRealTimeNotification(lead: any, eventType: string) {
  try {
    // Send Slack notification if webhook URL is configured
    const slackWebhook = process.env.SLACK_WEBHOOK_URL
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔥 ${lead.business_name} is testing their AI demo!`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🎉 Demo Activity Alert',
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Business:*\n${lead.business_name}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Status:*\nEmail Opened / Testing Demo`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Email:*\n${lead.prospect_email || 'N/A'}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Time:*\n${new Date().toLocaleTimeString()}`,
                },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '⚡ This is the perfect time to reach out and offer a strategy call!',
              },
            },
          ],
        }),
      })
    }
  } catch (error) {
    console.error('Slack notification failed:', error)
  }
}
