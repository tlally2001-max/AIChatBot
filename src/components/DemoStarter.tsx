'use client'

import { useState } from 'react'
import { BusinessProfile } from '@/types'

interface DemoStarterProps {
  business: BusinessProfile
  demoToken: string
  prospectEmail?: string
  prospectName?: string
  onDemoStart: (type: 'chat' | 'voice') => void
}

export function DemoStarter({
  business,
  demoToken,
  prospectEmail,
  prospectName,
  onDemoStart,
}: DemoStarterProps) {
  const [demoMode, setDemoMode] = useState<'chat' | 'voice'>('chat')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartDemo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (demoMode === 'voice') {
        // Track voice start
        await fetch('/api/demo-tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            demoToken,
            event: 'voice_start',
            metadata: { prospectName, prospectEmail },
          }),
        }).catch(err => console.log('Tracking error:', err))

        // Call voice API
        const response = await fetch('/api/voice/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            demoToken,
            prospectEmail,
            prospectName,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to start voice session')
        }

        const session = await response.json()
        onDemoStart('voice')
        // Handle voice session (show phone number, initiate call, etc.)
      } else {
        // Chat mode - track event
        await fetch('/api/demo-tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            demoToken,
            event: 'chat_start',
            metadata: { prospectName, prospectEmail },
          }),
        }).catch(err => console.log('Tracking error:', err))

        onDemoStart('chat')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to {business.businessName}
          </h2>
          {prospectName && <p className="text-gray-600">Hi {prospectName}!</p>}
          <p className="text-gray-600 mt-2">
            I'm Emma, your AI assistant. Let me show you what {business.businessName} can do.
          </p>
        </div>

        {/* Business Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">About Us</h3>
          <p className="text-sm text-gray-700 mb-3">
            {business.description || `${business.businessName} specializes in ${business.services.join(', ')}`}
          </p>

          {business.uniqueSellingPoints && business.uniqueSellingPoints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">What Makes Us Special:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {business.uniqueSellingPoints.slice(0, 3).map((usp, i) => (
                  <li key={i}>✓ {usp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you like to interact with Emma?
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setDemoMode('chat')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                demoMode === 'chat'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💬 Live Chat
            </button>
            <button
              onClick={() => setDemoMode('voice')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                demoMode === 'voice'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎤 Voice Call
            </button>
          </div>
        </div>

        {/* Demo Mode Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-gray-700">
          {demoMode === 'voice' ? (
            <div>
              <p className="font-medium mb-1">🎤 Voice Demo</p>
              <p>Emma will call you and walk through our services. She'll collect your information so our team can follow up with specifics.</p>
            </div>
          ) : (
            <div>
              <p className="font-medium mb-1">💬 Chat Demo</p>
              <p>Chat directly with Emma about our services. Ask questions and explore what we offer.</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        {/* Start Button */}
        <button
          onClick={handleStartDemo}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-3"
        >
          {isLoading
            ? 'Starting...'
            : demoMode === 'voice'
            ? '📞 Start Voice Demo'
            : '💬 Start Chat Demo'}
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          This demo is personalized based on {business.businessName}'s business profile.
        </p>
      </div>
    </div>
  )
}
