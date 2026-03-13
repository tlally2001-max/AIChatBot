import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TrackingEvent {
  demoToken: string
  event: 'page_view' | 'chat_start' | 'voice_start' | 'demo_interaction' | 'demo_completed'
  metadata?: Record<string, any>
}

/**
 * Webhook to track demo engagement
 * - Page view: User opened demo link
 * - Chat/Voice start: User started interacting
 * - Demo completed: User finished or left
 */
export async function POST(request: NextRequest) {
  try {
    const body: TrackingEvent = await request.json()
    const { demoToken, event, metadata } = body

    if (!demoToken || !event) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find lead
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('demo_token', demoToken)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Log event
    const { error: logError } = await supabase
      .from('demo_events')
      .insert({
        lead_id: lead.id,
        event_type: event,
        event_data: metadata,
        timestamp: new Date().toISOString(),
      })

    if (logError) {
      console.error('Event logging error:', logError)
    }

    // Update lead status based on event
    let newStatus = lead.status
    if (event === 'page_view' && lead.status === 'demo_sent') {
      newStatus = 'demo_opened'
    } else if (event === 'chat_start' || event === 'voice_start') {
      newStatus = 'demo_opened'
    }

    if (newStatus !== lead.status) {
      await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id)
    }

    // Send real-time notification
    await sendNotification(lead, event, metadata)

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

async function sendNotification(
  lead: any,
  event: string,
  metadata?: Record<string, any>
) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL

  if (!slackWebhook) return

  const eventMessages: Record<string, { emoji: string; title: string; description: string }> = {
    page_view: {
      emoji: '👁️',
      title: 'Demo Page Opened',
      description: `${lead.business_name} opened their demo link`,
    },
    chat_start: {
      emoji: '💬',
      title: 'Chat Demo Started',
      description: `${lead.business_name} started chatting with Emma`,
    },
    voice_start: {
      emoji: '🎤',
      title: 'Voice Demo Started',
      description: `${lead.business_name} initiated a voice call with Emma`,
    },
    demo_interaction: {
      emoji: '🔄',
      title: 'Demo Interaction',
      description: `${lead.business_name} is actively testing the demo`,
    },
    demo_completed: {
      emoji: '✅',
      title: 'Demo Completed',
      description: `${lead.business_name} finished their demo session`,
    },
  }

  const msg = eventMessages[event] || {
    emoji: '📊',
    title: 'Demo Activity',
    description: `${lead.business_name} interacted with their demo`,
  }

  try {
    await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${msg.emoji} ${msg.title}: ${msg.description}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${msg.emoji} ${msg.title}`,
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
                text: `*Activity:*\n${msg.description}`,
              },
              {
                type: 'mrkdwn',
                text: `*Email:*\n${lead.prospect_email || 'Unknown'}`,
              },
              {
                type: 'mrkdwn',
                text: `*Time:*\n${new Date().toLocaleString()}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: event === 'page_view'
                ? '🔥 *They just opened the email!* Follow up within the next hour for best results.'
                : event === 'chat_start' || event === 'voice_start'
                ? '⚡ *They\'re actively testing!* This is prime time to reach out with a personalized offer.'
                : '💡 *Engaged prospect!* Consider reaching out to discuss next steps.',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_Last updated: ' + new Date().toISOString() + '_',
            },
          },
        ],
        attachments: [
          {
            color: getColorForEvent(event),
            footer: 'Demo Drop Analytics',
          },
        ],
      }),
    })
  } catch (error) {
    console.error('Slack notification error:', error)
  }
}

function getColorForEvent(event: string): string {
  const colors: Record<string, string> = {
    page_view: '#3b82f6',
    chat_start: '#10b981',
    voice_start: '#f59e0b',
    demo_interaction: '#8b5cf6',
    demo_completed: '#6366f1',
  }
  return colors[event] || '#6b7280'
}
