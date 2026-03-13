'use client'

import { useState, useRef, useEffect } from 'react'
import { BusinessProfile } from '@/types'
import { DemoStarter } from './DemoStarter'

interface DemoLandingPageProps {
  business: BusinessProfile
  demoToken: string
  clientName?: string
  websiteUrl?: string
}

export function DemoLandingPage({
  business,
  demoToken,
  clientName,
  websiteUrl,
}: DemoLandingPageProps) {
  const [showDemoStarter, setShowDemoStarter] = useState(false)
  const [demoStarted, setDemoStarted] = useState(false)
  const [chatMode, setChatMode] = useState<'chat' | 'voice' | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Track page view
  useEffect(() => {
    fetch('/api/demo-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demoToken,
        event: 'page_view',
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.log('Tracking error:', err))
  }, [demoToken])

  const handleDemoStart = (type: 'chat' | 'voice') => {
    setChatMode(type)
    setDemoStarted(true)
    setShowDemoStarter(false)
  }

  const displayUrl = websiteUrl || business.websiteUrl || 'https://example.com'
  const displayName = clientName || 'there'

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Website Preview with Iframe */}
      {!demoStarted && (
        <iframe
          ref={iframeRef}
          src={displayUrl}
          className="absolute inset-0 w-full h-full border-none"
          title="Website Preview"
        />
      )}

      {/* Welcome Header (Floating) */}
      {!demoStarted && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">
              Hey {displayName}, meet your new AI employee for {business.businessName}
            </h1>
            <p className="text-blue-100">
              Tap below to see a live demo of how {business.businessName} can handle customer conversations 24/7
            </p>
          </div>
        </div>
      )}

      {/* Floating Demo Widget */}
      <div className="absolute bottom-6 right-6 z-50">
        <button
          onClick={() => setShowDemoStarter(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 w-16 h-16 flex items-center justify-center font-bold text-2xl transition-transform transform hover:scale-110"
        >
          💬
        </button>
        {!showDemoStarter && !demoStarted && (
          <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg p-4 w-64 mb-2">
            <p className="text-gray-800 font-semibold mb-3">
              Ready to see {business.businessName}'s AI in action?
            </p>
            <button
              onClick={() => setShowDemoStarter(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Start Free Demo
            </button>
          </div>
        )}
      </div>

      {/* Demo Starter Modal */}
      {showDemoStarter && !demoStarted && (
        <DemoStarter
          business={business}
          demoToken={demoToken}
          prospectName={clientName}
          onDemoStart={handleDemoStart}
        />
      )}

      {/* Chat Interface */}
      {demoStarted && chatMode === 'chat' && (
        <ChatInterface
          business={business}
          demoToken={demoToken}
          clientName={clientName}
          onClose={() => setDemoStarted(false)}
        />
      )}

      {/* Voice Interface */}
      {demoStarted && chatMode === 'voice' && (
        <VoiceInterface
          business={business}
          demoToken={demoToken}
          onClose={() => setDemoStarted(false)}
        />
      )}

      {/* Conversion Section */}
      {!demoStarted && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Love what you see?
              </h3>
              <p className="text-gray-600">
                Book a strategy call to discuss how {business.businessName} can increase lead capture by 40%+
              </p>
            </div>
            <a
              href="https://cal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg whitespace-nowrap transition-colors"
            >
              Schedule Call →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// Chat Interface Component
function ChatInterface({
  business,
  demoToken,
  clientName,
  onClose,
}: {
  business: BusinessProfile
  demoToken: string
  clientName?: string
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: `Hi ${clientName || 'there'}! I'm Emma with ${business.businessName}. How can I help you today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full h-96 rounded-t-lg shadow-lg flex flex-col">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h3 className="font-bold">Emma - {business.businessName}</h3>
          <button onClick={onClose} className="text-2xl hover:text-blue-100">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

// Voice Interface Component
function VoiceInterface({
  business,
  demoToken,
  onClose,
}: {
  business: BusinessProfile
  demoToken: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Voice Demo Started</h2>
          <p className="text-gray-600 mt-2">
            Emma is ready to talk! Check your phone for an incoming call.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Business:</strong> {business.businessName}
          </p>
          <p className="text-xs text-gray-500">
            The call will connect within 30 seconds. If you don't receive a call, try clicking the button below.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-bold"
        >
          End Demo
        </button>
      </div>
    </div>
  )
}
