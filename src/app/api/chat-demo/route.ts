import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch the latest lead with business profile
    const { data: leads } = await supabase
      .from('leads')
      .select('business_profile, business_name, url')
      .not('business_profile', 'is', null)
      .limit(1)

    const businessData = leads?.[0]?.business_profile || {
      businessName: 'Your Business',
      description: 'A local business',
      services: [],
      contactPhone: '(555) 123-4567',
    }

    console.log('📊 Business Data Fetched:', JSON.stringify(businessData, null, 2))

    // Build context about the business
    const businessContext = `
Business Name: ${businessData.businessName || 'Unknown'}
Description: ${businessData.description || 'No description available'}
Services: ${businessData.services?.join(', ') || 'Not specified'}
Phone: ${businessData.contactPhone || 'Not available'}
Email: ${businessData.contactEmail || 'Not available'}
Address: ${businessData.address || 'Not provided'}
`

    console.log('💬 Business Context:', businessContext)
    console.log('❓ User Question:', question)

    // Call Claude API to generate a response
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `You are Emma, a friendly AI receptionist for this business:

${businessContext}

Answer the customer's question naturally and helpfully based on the business information above. Keep responses concise (1-2 sentences). If you don't know the answer, suggest they call or ask for more info.

Customer Question: ${question}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Claude API error:', errorText)
      // Fallback response
      return NextResponse.json({
        response: `Thanks for your question! I'd be happy to help. What else would you like to know?`,
      })
    }

    const data = await response.json()
    const emmaResponse = data.content[0]?.text || 'Thanks for your question!'

    console.log('✅ Emma Response:', emmaResponse)

    return NextResponse.json({ response: emmaResponse })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { response: 'Sorry, I had trouble understanding. Can you rephrase that?' },
      { status: 200 }
    )
  }
}
