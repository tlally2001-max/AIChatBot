import { NextRequest, NextResponse } from 'next/server'
import { BusinessProfile } from '@/types'
import { generateEmmaSystemPrompt } from '@/lib/emma-prompt'

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      business,
      conversationHistory,
      demoToken,
    } = await request.json()

    console.log('📨 Chat request received:', { message, businessName: business?.businessName })

    if (!message || !business) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build system prompt
    const systemPrompt = generateEmmaSystemPrompt(business as BusinessProfile)
    console.log('📝 System prompt generated')

    // Call Claude API for chat response
    console.log('🔄 Calling Claude API...')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        // Limit to last 6 messages (3 exchanges) to reduce payload and latency
        messages: conversationHistory.slice(-6).map(
          (msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })
        ),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Claude API error:', error)
      throw new Error(`Claude API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    console.log('✅ Claude API response received')
    const reply =
      data.content[0].type === 'text'
        ? data.content[0].text
        : 'I apologize, I had trouble responding. Please try again.'

    return NextResponse.json({ reply, demoToken })
  } catch (error) {
    console.error('❌ Chat error:', error)
    return NextResponse.json({ error: `Failed to process chat message: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 })
  }
}
