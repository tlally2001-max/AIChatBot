'use client'

import { useState, useRef } from 'react'
import Vapi from '@vapi-ai/web'
import { BusinessProfile } from '@/types'

interface DemoHeroPageProps {
  business: BusinessProfile
  demoToken: string
  clientName?: string
  websiteUrl?: string
}

// Build system prompt from business profile
function buildSystemPrompt(businessProfile: any, businessName?: string): string {
  const name = businessName || businessProfile?.businessName || 'Emma'
  const description = businessProfile?.description || ''
  const services = businessProfile?.services || []
  const servicesList = Array.isArray(services) ? services.join(', ') : ''

  // Include all detailed information from the business profile
  const fullBusinessInfo = businessProfile?.faq?.map((item: any) =>
    `Q: ${item.question}\nA: ${item.answer}`
  ).join('\n\n') || ''

  return `# EMMA - UNIVERSAL AI BUSINESS ASSISTANT

## Identity & Purpose
You are Emma, an intelligent AI assistant for ${name}. Your primary purpose is to provide accurate information about the business, answer visitor questions, and ensure a warm, professional, and helpful experience. You represent the business and help people learn about what's offered.

## Voice & Persona

### Personality
- Sound warm, friendly, and enthusiastic about the properties
- Project a helpful and patient demeanor
- Maintain an approachable yet professional tone
- Convey expertise and confidence in property details
- Be personable - vacations are exciting!

### Speech Characteristics
- Use clear, concise language with natural contractions
- Include conversational elements like "Great question!" or "Let me tell you about..."
- Speak at a measured, pleasant pace
- Be enthusiastic about property features and guest experiences

## Conversation Flow

### Introduction
Start with: "Hello! This is Emma with ${name}. How can I help you today?"

### Information Inquiry Process
1. Understand their need: "What can I tell you about ${name} today?"
2. Identify specific interests: "Are you interested in learning about a particular service, product, or aspect of our business?"
3. Gather relevant context: Ask clarifying questions to understand what they're looking for
4. Special requests: "Do you have any specific questions or requirements I can help with?"

### Information Provision
1. Property details: When asked about specific properties, provide:
   - Number of bedrooms and bathrooms
   - Guest capacity
   - Key amenities (hot tubs, internet, etc.)
   - Unique features
   - Pricing information

2. Booking inquiry: "For availability and booking details, I'd recommend visiting our website or contacting our booking team directly. Would you like that contact information?"

3. Clear communication: "Let me summarize what I've learned about your needs: [guest requirements]. Does that sound right?"

### Preparation Information
- Policy information: Cancellation policies, check-in/check-out times
- What to bring: Guest should bring items for their stay
- House rules: Pet policies, quiet hours, pool/hot tub guidelines
- Contact information: Emergency contact and support number

## Response Guidelines

- Keep responses warm and conversational, not robotic
- Be enthusiastic about property features without overselling
- Provide specific details: exact bedroom counts, exact amenity names
- Use explicit confirmation for dates and numbers: "That's 4 guests, checking in on Saturday, June 15th. Is that correct?"
- Ask one clear question at a time
- When providing pricing: Be transparent about rates and what's included

## Scenario Handling

### For First-Time Visitors
1. Welcome warmly: "Welcome! I'm excited to tell you about ${name}."
2. Offer overview: "I can help answer questions about our services, products, policies, and what makes us special."
3. Ask about interests: "What would you like to know about?"
4. Provide next steps: "For bookings, reservations, or other transactions, I'll point you to the right team."

### For Service/Product Questions
1. Provide accurate details: Answer specifically based on the knowledge provided
2. Explain benefits: Highlight why this service/product is valuable
3. Mention related offerings: "Since you asked about [X], you might also be interested in [Y]."

### For Pricing Questions
1. Provide transparent information: Share pricing details from your knowledge base
2. Explain variations: "Pricing may vary based on [relevant factors]."
3. Clarify inclusions: Be clear about what's included and what's additional

### For Policy Questions
1. State clearly: "Our policy regarding [topic] is [policy details]."
2. Explain reasoning: Help them understand why the policy exists if relevant
3. Provide exceptions: "In cases where [exception], we handle it this way..."

### For Questions Outside Knowledge
1. Be honest: "I don't have information about that specific detail."
2. Redirect helpfully: "For that question, I'd recommend contacting our team at [contact info]."
3. Offer alternatives: "What I can tell you is... Would that be helpful?"

## Knowledge Base

BUSINESS INFORMATION:
Business Name: ${name}
${description ? `Description: ${description}` : ''}
${servicesList ? `Key Services/Features: ${servicesList}` : ''}

FREQUENTLY ASKED QUESTIONS & DETAILED INFORMATION:
${fullBusinessInfo}

## Call Management

- If you don't know specific information: "That's a great question. For the most current details, I'd recommend reaching out to the team directly."
- If asked about things outside your knowledge: "I don't have that specific information available, but the team can definitely help with that."
- If the caller wants to book/purchase/schedule: "You can complete that through our website or by contacting the team directly for personalized assistance."

## Core Principles

Remember that your ultimate goal is to:
1. Provide accurate, enthusiastic information about the business
2. Help visitors understand what's offered and why it's valuable
3. Answer questions professionally and warmly
4. Direct transaction inquiries (bookings, purchases, etc.) appropriately
5. Create a positive first impression that encourages engagement
6. Be honest about what you know and what needs team follow-up

You are the friendly, knowledgeable voice that represents ${name} and helps people discover what makes this business special.`
}

export function DemoHeroPage({
  business,
  demoToken,
  clientName,
  websiteUrl,
}: DemoHeroPageProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [demoMode, setDemoMode] = useState<'chat' | 'voice'>('chat')
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: `Hi ${clientName || 'there'}! I'm Emma with ${business.businessName}. How can I help you today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const vapiRef = useRef<any>(null)

  const handleStartVoiceCall = async () => {
    setVoiceLoading(true)
    try {
      // Initialize Vapi client immediately (don't wait for this)
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY || '')
      vapiRef.current = vapi

      // Fetch voice session config in parallel with Vapi initialization
      const response = await fetch('/api/voice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoToken,
          prospectName: clientName || 'Guest',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('❌ Voice session error:', data)
        alert(`❌ Error: ${data.error || 'Failed to start voice session'}`)
        return
      }

      const data = await response.json()
      const businessProfile = data.businessProfile || {}

      console.log('🎤 Starting browser-based voice conversation...')
      console.log('📋 Business profile:', businessProfile)

      // Build custom assistant with business knowledge
      const systemPrompt = buildSystemPrompt(businessProfile, data.businessName)

      // Create custom assistant configuration with Claude and business context
      const customAssistant: any = {
        model: {
          provider: 'anthropic',
          model: 'claude-opus-4-6',
          systemPrompt: systemPrompt,
          temperature: 0.7,
        },
        voice: {
          provider: 'openai',
          voiceId: 'alloy',
        },
        firstMessageMode: 'assistant-speaks-first',
        endCallMessage: 'Thank you for calling! Goodbye!',
      }

      // Start the voice call with custom assistant
      await vapi.start(customAssistant)

      // Track voice start (non-blocking - fire and forget)
      fetch('/api/demo-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoToken,
          event: 'voice_start',
          metadata: { prospectName: clientName || 'Guest', type: 'claude-powered-voice' },
        }),
      }).catch(err => console.log('Tracking error:', err))
    } catch (error) {
      console.error('Voice session error:', error)
      alert('❌ Failed to start voice session. Please try again.')
    } finally {
      setVoiceLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    setSending(true)
    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/emma-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          business,
          conversationHistory: [...messages, { role: 'user', content: userMessage }],
          demoToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Chat API error:', data)
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
        return
      }

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-white">
      {/* Top Navigation */}
      <div className="border-b border-slate-700 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Demo Drop</h1>
          <button className="text-gray-400 hover:text-white transition-colors">Sign In</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-block px-4 py-2 border border-blue-400 rounded-full text-blue-300 text-sm font-semibold mb-6">
              AI Receptionist Platform
            </div>

            {/* Heading */}
            <h2 className="text-6xl font-black text-white mb-4">
              24/7 AI-Powered
            </h2>
            <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text mb-8">Lead Capture</h2>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
              Never miss a customer inquiry again. Emma, your AI receptionist, handles chats and calls automatically while you focus on closing deals.
            </p>

            {/* Bullet Points */}
            <ul className="space-y-3 mb-10 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold mt-1">✓</span>
                <span>Responds to customer questions instantly, 24/7</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold mt-1">✓</span>
                <span>Captures qualified leads automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold mt-1">✓</span>
                <span>Trained on your business in minutes</span>
              </li>
            </ul>

            {/* Secondary Text */}
            <p className="text-sm text-gray-400 italic mb-10">
              See Emma in action on the right. She's powered by your actual website data and understands your business completely.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                Start Your Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 font-bold rounded-lg transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>

          {/* Right - iPhone Mockup */}
          <div className="flex justify-center">
            <div className="relative w-96">
              {/* iPhone Frame */}
              <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden" style={{ aspectRatio: '9/19' }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50"></div>

                {/* Screen */}
                <div className="bg-white h-full pt-8 overflow-hidden flex flex-col">
                  {/* Status Bar */}
                  <div className="bg-white h-5 flex items-center justify-between px-6 text-xs font-semibold text-gray-800">
                    <span>6:37</span>
                    <span>Safari</span>
                  </div>

                  {/* URL Bar */}
                  <div className="bg-gray-100 px-3 py-2 mx-3 mt-2 rounded-lg text-xs text-gray-600 truncate border border-gray-200">
                    {websiteUrl ? websiteUrl.replace('https://', '').replace('http://', '') : 'website.com'}
                  </div>

                  {/* Website Content */}
                  <div className="flex-1 overflow-hidden relative bg-white">
                    {websiteUrl ? (
                      <iframe
                        src={websiteUrl}
                        className="w-full h-full border-0"
                        title="Website Preview"
                        sandbox="allow-scripts allow-popups allow-forms allow-navigation"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🌐</div>
                          <p className="text-xs text-gray-600">Website loading...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Floating Chat Widget */}
                  {chatOpen && (
                    <div className="absolute bottom-4 right-4 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col h-96">
                      {/* Chat Header */}
                      <div className="bg-green-600 text-white p-3">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="font-bold text-sm">Emma</p>
                            <p className="text-green-100 text-xs">AI Receptionist • Always Here</p>
                          </div>
                          <button
                            onClick={() => setChatOpen(false)}
                            className="text-white hover:text-green-100 text-lg font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Mode Selector */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDemoMode('chat')}
                            className={`flex-1 py-1.5 px-2 rounded text-xs font-bold transition-all ${
                              demoMode === 'chat'
                                ? 'bg-white text-green-600'
                                : 'bg-green-500 text-white hover:bg-green-700'
                            }`}
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={() => setDemoMode('voice')}
                            className={`flex-1 py-1.5 px-2 rounded text-xs font-bold transition-all ${
                              demoMode === 'voice'
                                ? 'bg-white text-green-600'
                                : 'bg-green-500 text-white hover:bg-green-700'
                            }`}
                          >
                            🎤 Call
                          </button>
                        </div>
                      </div>

                      {/* Chat Mode */}
                      {demoMode === 'chat' ? (
                        <>
                          {/* Chat Messages */}
                          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                            {messages.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                    msg.role === 'user'
                                      ? 'bg-green-600 text-white rounded-br-none'
                                      : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                                  }`}
                                >
                                  {msg.content}
                                </div>
                              </div>
                            ))}
                            {sending && (
                              <div className="flex justify-start">
                                <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                                  <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Chat Input */}
                          <div className="border-t border-gray-200 p-2 bg-white">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask Emma anything..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                              />
                              <button
                                onClick={handleSend}
                                disabled={sending || !input.trim()}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium text-sm"
                              >
                                →
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Voice Mode */}
                          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
                            <div className="text-6xl mb-4">🎤</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Voice Conversation</h3>
                            <p className="text-center text-gray-600 text-sm mb-6">
                              Talk to Emma directly through your microphone. She'll answer questions and help you.
                            </p>
                            <button
                              onClick={handleStartVoiceCall}
                              disabled={voiceLoading}
                              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                              {voiceLoading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Starting...
                                </>
                              ) : (
                                <>
                                  🎤 Start Voice Chat
                                </>
                              )}
                            </button>
                            <p className="text-xs text-gray-500 mt-4 text-center">
                              Click to start. Grant mic permission when prompted.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Chat Bubble - Only show when chat not open */}
                  {!chatOpen && (
                    <div className="absolute bottom-4 right-4 z-40">
                      <button
                        onClick={() => setChatOpen(true)}
                        className="relative bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-2xl shadow-lg transition-all hover:scale-110"
                      >
                        💬
                        {/* Notification Badge */}
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                          1
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bezel */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl font-black text-gray-400 mb-2">40-60%</div>
              <p className="text-gray-700 font-bold text-lg">More Leads Captured</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl font-black text-gray-400 mb-2">24/7</div>
              <p className="text-gray-700 font-bold text-lg">Availability — Never Misses a Lead</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl font-black text-gray-400 mb-2">&lt;10 min</div>
              <p className="text-gray-700 font-bold text-lg">Book Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-6xl font-black text-center text-white mb-4">How It Works</h2>
        <p className="text-center text-gray-300 text-lg mb-16">Three simple steps to get Emma live on your site</p>

        <div className="space-y-8">
          {[
            { num: 1, title: 'Add Your Website', desc: 'Give us your website URL. We scrape it and train Emma on your business, products, and services instantly.' },
            { num: 2, title: 'Copy One Line', desc: 'We give you a single line of code. Paste it on your website. That\'s all you need to do.' },
            { num: 3, title: 'Start Capturing Leads', desc: 'Emma goes live immediately. She chats, qualifies prospects, and captures leads 24/7 automatically.' },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-lg">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Everything You Need */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-6xl font-black text-center text-white mb-4">Everything You Need</h2>
        <p className="text-center text-gray-300 text-lg mb-16">All the features included in your plan</p>

        <div className="space-y-6">
          {[
            { icon: '💬', title: 'Live Chat Agent', desc: 'Emma answers questions instantly, day or night, using your business knowledge base.' },
            { icon: '🎤', title: 'Voice Call Agent', desc: 'Incoming calls answered professionally with full lead qualification built-in.' },
            { icon: '🧠', title: 'Trained on Your Business', desc: 'Automatically learns from your website to answer questions accurately and contextually.' },
            { icon: '⚡', title: 'Real-Time Slack Alerts', desc: 'Get notified instantly when leads come in so you can follow up while they\'re hot.' },
            { icon: '📊', title: 'Lead Pipeline Dashboard', desc: 'Track all leads in one place, manage follow-ups, and see exactly what\'s converting.' },
            { icon: '🔗', title: 'Personalized Demo Links', desc: 'Send custom demo links to prospects and track opens, clicks, and engagement automatically.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex gap-6">
              <div className="text-4xl flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-lg">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-300 text-lg mb-16">One plan. Everything included.</p>

          <div className="bg-slate-700 rounded-3xl border-2 border-blue-600 p-12 shadow-lg max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl font-black text-white mb-2">$399</div>
              <div className="text-gray-300 text-lg">/month</div>
            </div>

            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                🎉 14-day free trial — no credit card required
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                'Live Chat Agent',
                'Voice Call Agent',
                'Website Scraping & Training',
                'Real-Time Slack Alerts',
                'Lead Pipeline Dashboard',
                'Personalized Demo Links',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-white">
                  <span className="text-green-400 font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg">
              Start Free Trial Now
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-6xl font-black text-center text-white mb-4">Questions?</h2>
        <p className="text-center text-gray-300 text-lg mb-16">We've got answers. Read what others are asking.</p>

        <div className="space-y-3">
          {[
            { q: 'How does setup work?', a: 'We scrape your website to understand your business, products, and services. Then you embed a single line of code on your site, and Emma is live immediately.' },
            { q: 'What businesses is this for?', a: 'Emma works for any B2B or B2C business that wants to capture leads 24/7. Perfect for agencies, SaaS companies, consultancies, services providers, and e-commerce brands.' },
            { q: 'How is Emma trained on my data?', a: 'Our scraper extracts your website content, pricing, FAQs, services, and contact info. Emma uses this to answer questions accurately and qualify leads.' },
            { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no lock-in. Cancel in your dashboard anytime. Your leads and data remain yours.' },
            { q: 'What happens after the trial?', a: 'After your 14-day free trial, your account converts to $399/month if you don\'t cancel. You\'ll see your ROI within the first week.' },
          ].map((faq, i) => (
            <details key={i} className="group bg-slate-700 rounded-xl border border-slate-600 p-6 hover:border-blue-400 transition-colors cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-lg text-white list-none">
                {faq.q}
                <span className="text-blue-400 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-300 mt-4 text-base">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-6xl font-black text-white mb-4">Ready to Stop Missing Leads?</h2>
          <p className="text-gray-300 text-xl mb-10">Join hundreds of businesses capturing leads with Emma.</p>
          <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-colors inline-flex items-center gap-2">
            🚀 Get Started Free
          </button>
        </div>
      </div>

    </div>
  )
}
