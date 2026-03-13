'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { DemoStarter } from '@/components/DemoStarter'
import { BusinessProfile } from '@/types'
import { generateEmmaSystemPrompt } from '@/lib/emma-prompt'

interface DemoSession {
  lead_id: string
  session_type: 'chat' | 'voice'
  vapi_session_id?: string
  transcript?: string
  status: 'started' | 'in_progress' | 'completed'
}

export default function DemoPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const demoToken = params.token as string

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demoStarted, setDemoStarted] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingChat, setSendingChat] = useState(false)

  const prospectName = searchParams.get('name')
  const prospectEmail = searchParams.get('email')

  // Fetch lead data
  useEffect(() => {
    async function fetchLead() {
      try {
        const response = await fetch(`/api/lead/${demoToken}`)
        if (!response.ok) throw new Error('Lead not found')

        const lead = await response.json()
        setBusinessProfile(lead.business_profile)

        // Log demo page view
        await fetch('/api/demo-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            demoToken,
            event: 'page_viewed',
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load demo')
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [demoToken])

  const handleChatMessage = async () => {
    if (!chatInput.trim() || !businessProfile) return

    setSendingChat(true)
    const userMessage = chatInput
    setChatInput('')

    // Add user message to chat
    const updatedMessages = [...chatMessages, { role: 'user', content: userMessage }]
    setChatMessages(updatedMessages)

    try {
      // Call Emma chat API
      const response = await fetch('/api/emma-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          business: businessProfile,
          conversationHistory: updatedMessages,
          demoToken,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setChatMessages([...updatedMessages, { role: 'assistant', content: data.reply }])

      // Log chat interaction
      await fetch('/api/demo-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoToken,
          event: 'chat_message',
          userMessage,
          assistantReply: data.reply,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (err) {
      setChatMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: "I'm having trouble responding. Please try again.",
        },
      ])
    } finally {
      setSendingChat(false)
    }
  }

  const handleDemoStart = (type: 'chat' | 'voice') => {
    setDemoStarted(true)
    setDemoSession({
      lead_id: demoToken,
      session_type: type,
      status: 'started',
    })

    if (type === 'chat') {
      // Initialize chat with Emma's greeting
      setChatMessages([
        {
          role: 'assistant',
          content: `Hi ${prospectName || 'there'}! I'm Emma with ${businessProfile?.businessName || 'the team'}. How can I help you today?`,
        },
      ])
    }

    // Log demo started
    fetch('/api/demo-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demoToken,
        event: 'demo_started',
        demoType: type,
        timestamp: new Date().toISOString(),
      }),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized demo...</p>
        </div>
      </div>
    )
  }

  if (error || !businessProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Demo Not Available</h1>
          <p className="text-gray-700 mb-6">{error || 'Could not load the demo. Please check your link.'}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!demoStarted ? (
        <div className="flex items-center justify-between min-h-screen p-8 gap-8">
          <div className="flex-1 flex items-center justify-center">
            <DemoStarter
              business={businessProfile}
              demoToken={demoToken}
              prospectEmail={prospectEmail || undefined}
              prospectName={prospectName || undefined}
              onDemoStart={handleDemoStart}
            />
          </div>
          <div className="flex-1 hidden lg:flex items-center justify-center">
            {/* iPhone Mockup */}
            <div className="relative w-80">
              <div className="relative bg-black rounded-3xl shadow-2xl overflow-hidden" style={{ aspectRatio: '9/19' }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-44 h-8 bg-black rounded-b-3xl z-50 flex items-center justify-center gap-1">
                  <span className="text-gray-600 text-xs">📶</span>
                  <span className="text-gray-600 text-xs">📡</span>
                  <span className="text-gray-600 text-xs flex-grow"></span>
                  <span className="text-gray-600 text-xs">🔋</span>
                </div>

                {/* Screen Content */}
                <div className="bg-white h-full pt-8 overflow-hidden flex flex-col">
                  {/* Status Bar */}
                  <div className="bg-white h-6 flex items-center justify-between px-6 text-xs font-semibold text-gray-800 border-b border-gray-100">
                    <span>6:37</span>
                    <span>Safari</span>
                  </div>

                  {/* URL Bar */}
                  <div className="bg-gray-100 px-3 py-2 mx-2 mt-2 rounded-lg text-xs text-gray-600 truncate border border-gray-200">
                    {businessProfile.url || 'yourwebsite.com'}
                  </div>

                  {/* Demo Preview Content */}
                  <div className="flex-1 overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-900 mb-2">
                        {businessProfile.businessName}
                      </p>
                      <p className="text-xs text-gray-600 mb-4">
                        Powered by AI Emma
                      </p>
                      <div className="bg-white rounded-lg shadow p-3 mb-4 text-xs">
                        <p className="text-gray-900 mb-2">
                          "Hi! How can I help you today?"
                        </p>
                        <div className="space-y-2">
                          <button className="block w-full text-left text-blue-600 hover:underline text-xs p-1">
                            Tell me about your services
                          </button>
                          <button className="block w-full text-left text-blue-600 hover:underline text-xs p-1">
                            Schedule a demo
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        💬 Start chatting →
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom bezel */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      ) : demoSession?.session_type === 'chat' ? (
        // Chat Interface
        <div className="max-w-2xl mx-auto h-screen flex flex-col p-4">
          <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
              <h1 className="text-2xl font-bold">Emma - {businessProfile.businessName}</h1>
              <p className="text-blue-100">AI Assistant</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-gray-50 rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                  placeholder="Ask Emma a question..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleChatMessage}
                  disabled={sendingChat || !chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Voice Session
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Voice Demo Active</h2>
              <p className="text-gray-600 mt-2">
                Emma is ready to speak with you. Please check your phone for her call.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Session ID:</strong> {demoSession?.vapi_session_id || 'Starting...'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                The call may take a few moments to connect.
              </p>
            </div>

            <button
              onClick={() => setDemoStarted(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              End Demo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
